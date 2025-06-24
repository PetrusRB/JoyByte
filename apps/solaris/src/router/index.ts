import { authCallback, me } from "./auth";
import {
  batchGetPostLikeData,
  checkUserLike,
  createPost,
  deletePost,
  getPosts,
  getUserPosts,
  isPostLiked,
  likePost,
} from "./posts";
import { searchUsers } from "./search";
import { getCurrentUserProfile, updateCurrentUserProfile } from "./user";

export const router = {
  post: {
    get: getPosts,
    create: createPost,
    deletePost: deletePost,
    getUser: getUserPosts,
    like: likePost,
    hasLiked: isPostLiked,
    batchGetPostLikeData: batchGetPostLikeData,
    checkUserLike: checkUserLike,
  },
  search: {
    user: searchUsers,
  },
  user: {
    me: getCurrentUserProfile,
    updateCurrentProfile: updateCurrentUserProfile,
  },
  auth: {
    me: me,
    callback: authCallback,
  },
};
