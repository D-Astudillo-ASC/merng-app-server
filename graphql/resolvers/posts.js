const Post = require("../../post/post.model");
const checkAuth = require("../../util/check-auth");
const { AuthenticationError, UserInputError } = require("apollo-server");
module.exports = {
  Query: {
    async getPosts() {
      try {
        const posts = await Post.find();
        return posts;
      } catch (error) {
        console.log("error with getting posts from mongodb: " + error);
      }
    },
    async getPost(_, { postId }) {
      try {
        const post = await Post.findById(postId);
        if (post) {
          return post;
        } else {
          throw new Error("Post not found");
        }
      } catch (error) {
        console.log(
          `error with getting post ${postId}from mongodb: " + ${error}`
        );
      }
    },
  },
  Mutation: {
    async createPost(_, { postBody }, context) {
      const user = checkAuth(context);
      if (postBody.trim() === "") {
        throw new Error("Post body must not be empty.");
      }
      const newPost = new Post({
        postOwner: user.userName,
        postOwnerId: user.id,
        postBody: postBody,
        createdAt: new Date().toISOString(),
      });
      const post = newPost.save();
      context.pubsub.publish("NEW_POST", {
        newPost: post,
      });
      return post;
    },
    async deletePost(_, { postId }, context) {
      const user = checkAuth(context);
      try {
        const post = await Post.findById(postId);
        if (user.userName == post.postOwner && user.id == post.postOwnerId) {
          await post.delete();
          return "Post deleted successfully";
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    async likePost(_, { postId }, context) {
      const { userName } = checkAuth(context);
      const post = await Post.findById(postId);
      if (post) {
        if (post.likes.find((like) => like.likeOwner === userName)) {
          post.likes = post.likes.filter((like) => like.likeOwner !== userName);
        } else {
          post.likes.push({
            likeOwner: userName,
            likedAt: new Date().toISOString(),
          });
        }
        await post.save();
        return post;
      } else {
        throw new UserInputError("Post not found.");
      }
    },
  },
  Subscription: {
    newPost: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator("NEW_POST"),
    },
  },
};
