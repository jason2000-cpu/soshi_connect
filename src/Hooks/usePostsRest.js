/* eslint-disable no-unused-vars */

import { useState, useEffect } from "react"; 
import axios from "axios";
import { useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
// import REQUEST_STATUS from "./useRequestRest";
import { imageDb } from "../FirebaseStorage/config";
import { getDownloadURL, listAll } from "firebase/storage";



const baseUrl = "http://localhost:3001";

export const REQUEST_STATUS = {
    LOADING: "loading",
    SUCCESS: "success",
    FAILURE: "failure"
}

const generatePostID = () =>{
    const id = uuidv4();
    return id;
}

const getTime = () => {
    const currentDate = new Date();
    const formatDate = currentDate.toISOString()
    return formatDate;
}

function usePostRest(){
    const [posts, setPosts] = useState([]);
    const [requestStatus, setRequestStatus] = useState(REQUEST_STATUS.LOADING);
    const [imgUrl, setImgUrl] = useState(null);
    const user = useSelector((state)=> state.user.user);
    
    const originalRecord = [...posts];


    // useEffect(()=>{
    //     async function getImgUrl(){
    //         try {
    //             const response = await listAll(imageDb, "images");
    //             console.log(response);
    //         } catch(err){
    //             console.log(err)
    //         }
    //     }
    // })

    useEffect(()=>{
       async function getPosts(){
            try {
                const response = await axios.get(`${baseUrl}/posts`);
                setRequestStatus(REQUEST_STATUS.SUCCESS);
                console.log("POSTS:::::", response.data)
                setPosts(response.data);

            } catch(err) {
                console.log(err, "Error while fetching posts")
                setRequestStatus(REQUEST_STATUS.FAILURE);
            }
        }
        getPosts();
    }, [originalRecord.length]);

    function writePost(post){
        console.log("POST IMAGE FROM WRITE POST", post.image);
        const newPost = {
            id: generatePostID(),
            userId: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                profileUrl: user.image,
                loaction:  user.loaction
            },
            description: post.description,
            likes: [],
            comments: [],
            createdAt: getTime(),
            updatedAt: null,
            views: 0,
            image: post.image
        };
        
        setPosts([newPost, ...posts]);

       async function postFunc(){
           let  res = {};
            try{
                const response = await  axios.post(`${baseUrl}/posts`, newPost);
                setRequestStatus(REQUEST_STATUS.SUCCESS);
                console.log(response, "Post Success")
                res = {status: REQUEST_STATUS.SUCCESS, message: "Post Success"};
            
            } catch(err) {
                console.log(err, "Error while posting")
                setRequestStatus(REQUEST_STATUS.FAILURE);
                setPosts(originalRecord);
                res = {status: REQUEST_STATUS.FAILURE, message: err};
            }

            return res;
        }

        return postFunc();
    }



    return {
        posts,
        requestStatus,
        writePost
    }

}


export default usePostRest;