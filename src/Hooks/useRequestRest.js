/* eslint-disable no-unused-vars */

import { useEffect, useState } from "react";
import axios from "axios";
import {v4 as uuidv4} from 'uuid';

const baseUrl = "https://jade-cautious-duck.cyclic.app/";
// const baseUrl = "http://localhost:3001";

export const REQUEST_STATUS = {
    LOADING: "loading",
    SUCCESS: "success",
    FAILURE: "failure"
}


const generateUserID = () =>{
    const id = uuidv4();
    return id;
}

const getTime = () => {
    const currentDate = new Date();
    const formatDate = currentDate.toISOString()
    return formatDate;
}

function useRequestRest(){
    const [requestStatus, setRequestStatus] = useState(REQUEST_STATUS.LOADING);
    const [error, setError] = useState("");
    const [data, setData] = useState([]);
    const originalRecord = [...data];
    
    useEffect(()=>{
        async function getFunc() {
            try {
                const result = await axios.get(`${baseUrl}/users`)
                setRequestStatus(REQUEST_STATUS.SUCCESS);
                console.log(result.data)
                setData(result.data);
            } catch(err) {
                setRequestStatus(REQUEST_STATUS.FAILURE);
                setError(err);
            }
        }
        getFunc();
    }, []);
    
    function registerUser(userDet) {
        const newUserId = generateUserID()
        console.log("GENERATED ID::",newUserId)
         const user ={
            id: newUserId,
            firstName: userDet.firstName,
            lastName: userDet.lastName,
            email: userDet.email,
            friends: [],
            requests: [],
            suggests: [],
            views: 0,
            isPremium: false,
            createdAt: getTime(),
            updatedAt: null,
            profileUrl: null,
            password: userDet.password
         }
         const newUsers = [user, ...data];
         
         const authUser = data.find(user => user.email === userDet.email && user.password === userDet.password);

         if (authUser) {
            return    {status: REQUEST_STATUS.FAILURE, message: "User Already Exists"};
         } 

        async function postFunc() {
            let res = {};
            try {
                setData(newUsers);
                const response = await axios.post(`${baseUrl}/users`, user);
                console.log(response);
                res =  {status: REQUEST_STATUS.SUCCESS, data: response.data}
            } catch(err) {
                res ={status: REQUEST_STATUS.FAILURE, message: "An Error Occured While Registering"}
                console.log(err, "Error thrown while registering user");
                setData(originalRecord);
            }
            return res;
        }

       

        return  postFunc();
         
    }

    function loginUser(userDet) {
        let res = {};
        async function authUser() {
            const authUser = data.find(user => user.email === userDet.email && user.password === userDet.password)

            if (authUser){
                res =  {status:REQUEST_STATUS.SUCCESS,  authUser}
            } else {
                res =  {status:REQUEST_STATUS.FAILURE,  message: "User Not Found"}
            }
        }

        authUser();
        return res;
    }

    function updateUser(userDet) {
        const newUsers = data.map( function(rec){
            return rec.id === userDet.id ? userDet : rec
        })
        console.log("USER INFOR TO EDIT:::::", userDet);
        async function updateFunc(){
            try {
                setData(newUsers);
                const response = await axios.put(`${baseUrl}/users/${userDet.id}`, userDet);
                console.log("The Users::", data);
                return {status: REQUEST_STATUS.SUCCESS, data: response.data}
                
            } catch(err) {
                console.log(err, "Error while updating User Profile");
                setData(originalRecord);
                return {status: REQUEST_STATUS.FAILURE, message:"Error while updating User Profile"};
            }
        }

        return updateFunc();
    }


    return {
        requestStatus,
        error,
        data,
        updateUser,
        registerUser,
        loginUser
    }
}

export default useRequestRest;