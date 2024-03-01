import { useState, useEffect } from "react"; 
import axios from "axios";
import { useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";



// const baseUrl = "https://outstanding-outfit-hen.cyclic.app/";
const baseUrl = "http://localhost:3001"
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


async function usePostCommentsRest(){ 
    const [comments, setComments] = useState([]);

    const user = useSelector((state)=> state.user.user);

    let originalComments = [...comments];

    useEffect(()=>{
        async function getComments(){
            try{
                let response = await axios.get(`${baseUrl}/postComments`)
                // .then(response => response.json())
                // .then(data=> setComments(data));
                setComments(response.data);
                console.log("COMMENTS REST:::::", comments)
                return response.data
            } catch(err) {
                console.log("An Error Occured while fetching comments", err);
            }
        }

        getComments();
    }, [originalComments.length])

    async function postComment(comment, postId){

        let newComment = {
            id: generatePostID(),
            user:{
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
            },
            postId: postId,
            comment: comment,
            likes:[],
            replies:[],
            createdAt: getTime(),
            updatedAt: null,
            _v: 0
        }

        originalComments = [...originalComments, newComment];
        let res = {};

        try{
            let response = axios.post(`${baseUrl}/postComments`, newComment);
            if (response.status === 200){
                res = {status: REQUEST_STATUS.SUCCESS, message: "comment added"};
            }
        } catch(err){
            console.log("An error occured while posting comment", err)
            res = {status: REQUEST_STATUS.FAILURE, message: "unkonwn error occured while posting comment"}
        }


        return res;

    }

    async function likeComment(commentId){
        let comment = originalComments.filter((comment)=> comment.id === commentId);

        if (comment.likes.includes(user.id)){
            comment.likes = originalComments.filter((comment)=> comment.id !== user.id)
        } else {
            comment.likes.push(user.id);
        }

        let res = {};

        try{
            axios.patch(`${baseUrl}/postComments/${commentId}`, comment);
            res = {status: REQUEST_STATUS.SUCCESS, message: "Like Success"}
        } catch(err){
            res = {status: REQUEST_STATUS.FAILURE, message: "An Error Occured while liking comment"}
        }

        return res;
    }

    async function getPostComments(postId){
        let postComments = comments.filter((comment)=> comment.postId === postId);
        console.log(postComments);
        return postComments;
    }

    return {
        comments,
        postComment,
        getPostComments,
        likeComment,
    }
}


export default usePostCommentsRest;