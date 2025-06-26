import { authCallback, me } from "./auth.router";
import {
  batchGetPostLikeData,
  checkUserLike,
  createPost,
  deletePost,
  getPosts,
  getUserPosts,
  isPostLiked,
  likePost,
} from "./posts.router";
import { searchUsers } from "./search.router";
import { getCurrentUserProfile, updateCurrentUserProfile } from "./user.router";

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
