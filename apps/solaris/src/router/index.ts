import { authCallback, me } from "./auth";
import { createPost, deletePost, getPosts, getUserPosts } from "./posts";
import { searchUsers } from "./search";

export const router = {
  post: {
    get: getPosts,
    create: createPost,
    deletePost: deletePost,
    getUser: getUserPosts,
  },
  search: {
    user: searchUsers,
  },
  auth: {
    me: me,
    callback: authCallback,
  },
};
