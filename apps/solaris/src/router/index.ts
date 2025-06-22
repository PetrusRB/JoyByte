import { authCallback, me } from "./auth";
import {
  checkUserLike,
  createPost,
  deletePost,
  getPostLikeCount,
  getPosts,
  getUserPosts,
  isPostLiked,
  likePost,
} from "./posts";
import { searchUsers } from "./search";

export const router = {
  post: {
    get: getPosts,
    create: createPost,
    deletePost: deletePost,
    getUser: getUserPosts,
    like: likePost,
    hasLiked: isPostLiked,
    likeCount: getPostLikeCount,
    checkUserLike: checkUserLike,
  },
  search: {
    user: searchUsers,
  },
  auth: {
    me: me,
    callback: authCallback,
  },
};
