/* eslint-disable no-unused-vars */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import { NoProfile } from "../assets";
import { BiComment, BiLike, BiSolidLike } from "react-icons/bi";
import { MdOutlineDeleteOutline } from "react-icons/md";
import { useForm } from "react-hook-form";
import TextInput from "./TextInput";
import Loading from "./Loading";
import CustomButton from "./CustomButton";
import { postComments } from "../assets/data";
import useRequestRest from "../Hooks/useRequestRest";
import usePostsRest from "../Hooks/usePostsRest";
import usePostCommentsRest from "../Hooks/usePostCommentsRest";




const ReplyCard = ({ reply, user, handleLike }) => {
  return (
    <div className='w-full py-3'>
      <div className='flex gap-3 items-center mb-1'>
        <Link to={"/profile/" + reply?.userId?.id}>
          <img
            src={reply?.userId?.profileUrl ?? NoProfile}
            alt={reply?.userId?.firstName}
            className='w-10 h-10 rounded-full object-cover'
          />
        </Link>

        <div>
          <Link to={"/profile/" + reply?.userId?.id}>
            <p className='font-medium text-base text-ascent-1'>
              {reply?.userId?.firstName} {reply?.userId?.lastName}
            </p>
          </Link>
          <span className='text-ascent-2 text-sm'>
            {moment(reply?.createdAt).fromNow()}
          </span>
        </div>
      </div>

      <div className='ml-12'>
        <p className='text-ascent-2 '>{reply?.comment}</p>
        <div className='mt-2 flex gap-6'>
          <p
            className='flex gap-2 items-center text-base text-ascent-2 cursor-pointer'
            onClick={handleLike}
          >
            {reply?.likes?.includes(user?.id) ? (
              <BiSolidLike size={20} color='blue' />
            ) : (
              <BiLike size={20} />
            )}
            {reply?.likes?.length} Likes
          </p>
        </div>
      </div>
    </div>
  );
};

const CommentForm = ({ user, id, replyAt, getComments }) => {
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    mode: "onChange",
  });

  const onSubmit = async (data) => {};

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className='w-full border-b border-[#66666645]'
    >
      <div className='w-full flex items-center gap-2 py-4'>
        <img
          src={user?.profileUrl ?? NoProfile}
          alt='User'
          className='w-10 h-10 rounded-full object-cover'
        />

        <TextInput
          name='comment'
          styles='w-full rounded-full py-3'
          placeholder={replyAt ? `Reply @${replyAt}` : "Comment this post"}
          register={register("comment", {
            required: "Comment can not be empty",
          })}
          error={errors.comment ? errors.comment.message : ""}
        />
      </div>
      {errMsg?.message && (
        <span
          role='alert'
          className={`text-sm ${
            errMsg?.status === "failed"
              ? "text-[#f64949fe]"
              : "text-[#2ba150fe]"
          } mt-0.5`}
        >
          {errMsg?.message}
        </span>
      )}

      <div className='flex items-end justify-end pb-2'>
        {loading ? (
          <Loading />
        ) : (
          <CustomButton
            title='Submit'
            type='submit'
            containerStyles='bg-[#10993A] text-white py-1 px-3 rounded-full font-semibold text-sm'
          />
        )}
      </div>
    </form>
  );
};

const PostCard = ({ post, user }) => {
  const [showAll, setShowAll] = useState(0);
  const [showReply, setShowReply] = useState(0);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [replyComments, setReplyComments] = useState(0);
  const [showComments, setShowComments] = useState(0);
  const [like, setLike] = useState(post?.likes?.includes(user?.id));

  const { data } = useRequestRest();
  const { deletePost, likePost } = usePostsRest();
  const { getPostComments, likeComment, writeComment} = usePostCommentsRest();


  const getUser = (post) => {
    const id = post?.userId;
    const postUser = data.find(user=> user.id === id);
    return postUser;
  };

  const postUser = getUser(post);


  const getComments = async (postId) => {
    setReplyComments(0);
    setComments(getPostComments(postId));
    setLoading(false);
  };

  const handleLike = async (postId) => {
    const originalLikes = post.likes;

    if (post.likes.includes(user.id)){
      post.likes = post.likes.filter((id) => id !== user.id);
      console.log(post.likes.length)
      setLike(false);
    } else {
      post.likes.push(user.id);
      setLike(true);
    }

    console.log("From handleLike", post.likes);
    console.log(like);
    setLike(!like);
    let response = await likePost(postId);

    if (response.status === "failure"){
      post.likes = originalLikes
      alert(response.message);
    }
  };

  return (
    <div className='mb-2 bg-primary p-4 rounded-xl'>
      <div className='flex gap-3 items-center mb-2'>
        <Link to={"/profile/" + post?.userId?.id}>
          <img
            src={postUser?.profileUrl ?? NoProfile}
            alt={postUser?.firstName}
            className='w-14 h-14 object-cover rounded-full'
          />
        </Link>

        <div className='w-full flex justify-between'>
          <div className=''>
            <Link to={"/profile/" + postUser?.id}>
              <p className='font-medium text-lg text-ascent-1'>
                {postUser?.firstName} {postUser?.lastName}
              </p>
            </Link>
            <span className='text-ascent-2'>{postUser?.location}</span>
          </div>

          <span className='text-ascent-2'>
            {moment(post?.createdAt ?? "2023-05-25").fromNow()}
          </span>
        </div>
      </div>

      <div>
        <p className='text-ascent-2'>
          {showAll === post?.id
            ? post?.description
            : post?.description.slice(0, 300)}

          {post?.description?.length > 301 &&
            (showAll === post?.id ? (
              <span
                className='text-blue ml-2 font-mediu cursor-pointer'
                onClick={() => setShowAll(0)}
              >
                Show Less
              </span>
            ) : (
              <span
                className='text-blue ml-2 font-medium cursor-pointer'
                onClick={() => setShowAll(post?.id)}
              >
                Show More
              </span>
            ))}
        </p>

        {post.image ?

        (
        <img
          src={post?.image}
          alt="post"
          className='w-full mt-2 rounded-lg'
        />
        ) :
        (post.video?
        <video width="640" height="360" controls>
          <source  src= {post.video} type="video/mp4" />
        </video> :
        <gif></gif>)}

      </div>

      <div
        className='mt-4 flex justify-between items-center px-3 py-2 text-ascent-2
      text-base border-t border-[#66666645]'
      >
        <p className='flex gap-2 items-center text-base cursor-pointer' onClick={()=> handleLike(post.id)}>
          {/* {post?.likes?.includes(user?.id) ? (
            <BiSolidLike size={20} color='green'/>
          ) : (
            <BiLike size={20}  />
          )}
          {post?.likes?.length} Likes */}

          {like ? (<BiSolidLike size={20} color='green'/>) : (<BiLike size={20}  />)}
          {post?.likes?.length} Likes
        </p>

        <p
          className='flex gap-2 items-center text-base cursor-pointer'
          onClick={() => {
            setShowComments(showComments === post.id ? null : post.id);
            getComments(post?.id);
          }}
        >
          <BiComment size={20} />
          {post?.comments?.length} Comments
        </p>

        {user?.id === post?.userId && (
          <div
            className='flex gap-1 items-center text-base text-ascent-1 cursor-pointer'
            onClick={() => deletePost(post?.id)}
          >
            <MdOutlineDeleteOutline size={20} />
            <span>Delete</span>
          </div>
        )}
      </div>

      {/* COMMENTS */}
      {showComments === post?.id && (
        <div className='w-full mt-4 border-t border-[#66666645] pt-4 '>
          <CommentForm
            user={user}
            id={post?.id}
            getComments={() => getComments(post?.id)}
          />

          {loading ? (
            <Loading />
          ) : comments?.length > 0 ? (
            comments?.map((comment) => (
              <div className='w-full py-2' key={comment?.id}>
                <div className='flex gap-3 items-center mb-1'>
                  <Link to={"/profile/" + comment?.userId?.id}>
                    <img
                      src={comment?.userId?.profileUrl ?? NoProfile}
                      alt={comment?.userId?.firstName}
                      className='w-10 h-10 rounded-full object-cover'
                    />
                  </Link>
                  <div>
                    <Link to={"/profile/" + comment?.userId?.id}>
                      <p className='font-medium text-base text-ascent-1'>
                        {comment?.userId?.firstName} {comment?.userId?.lastName}
                      </p>
                    </Link>
                    <span className='text-ascent-2 text-sm'>
                      {moment(comment?.createdAt ?? "2023-05-25").fromNow()}
                    </span>
                  </div>
                </div>

                <div className='ml-12'>
                  <p className='text-ascent-2'>{comment?.comment}</p>

                  <div className='mt-2 flex gap-6'>
                    <p className='flex gap-2 items-center text-base text-ascent-2 cursor-pointer'>
                      {comment?.likes?.includes(user?.id) ? (
                        <BiSolidLike size={20} color='blue' />
                      ) : (
                        <BiLike size={20} />
                      )}
                      {comment?.likes?.length} Likes
                    </p>
                    <span
                      className='text-blue cursor-pointer'
                      onClick={() => setReplyComments(comment?.id)}
                    >
                      Reply
                    </span>
                  </div>

                  {replyComments === comment?.id && (
                    <CommentForm
                      user={user}
                      id={comment?.id}
                      replyAt={comment?.from}
                      getComments={() => getComments(post?.id)}
                    />
                  )}
                </div>

                {/* REPLIES */}

                <div className='py-2 px-8 mt-6'>
                  {comment?.replies?.length > 0 && (
                    <p
                      className='text-base text-ascent-1 cursor-pointer'
                      onClick={() =>
                        setShowReply(
                          showReply === comment?.replies?.id
                            ? 0
                            : comment?.replies?.id
                        )
                      }
                    >
                      Show Replies ({comment?.replies?.length})
                    </p>
                  )}

                  {showReply === comment?.replies?.id &&
                    comment?.replies?.map((reply) => (
                      <ReplyCard
                        reply={reply}
                        user={user}
                        key={reply?.id}
                        handleLike={() =>
                          handleLike(
                            "/posts/like-comment/" +
                              comment?.id +
                              "/" +
                              reply?.id
                          )
                        }
                      />
                    ))}
                </div>
              </div>
            ))
          ) : (
            <span className='flex text-sm py-4 text-ascent-2 text-center'>
              No Comments, be first to comment
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default PostCard;
