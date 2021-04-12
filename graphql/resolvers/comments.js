const Post = require("../../post/post.model");
const checkAuth = require("../../util/check-auth");
const { UserInputError, AuthenticationError } = require("apollo-server");
const mongoose = require("mongoose");

module.exports = {
  Mutation: {
    createComment: async (_, { postId, commentBody }, context) => {
      const { userName } = checkAuth(context);
      if (commentBody.trim() === "") {
        throw new UserInputError({
          errors: { commentBody: "Comment body must not be empty" },
        });
      }
      const post = await Post.findById(postId);
      if (post) {
        post.comments.unshift({
          commentBody: commentBody,
          commentOwner: userName,
          createdAt: new Date().toISOString(),
        });
        await post.save();
        return post;
      } else {
        throw new UserInputError("Post not found");
      }
    },
    deleteComment: async (_, { postId, commentId }, context) => {
      const { userName } = checkAuth(context);
      const post = await Post.findById(postId);
      if (post) {
        const commentIndex = post.comments.findIndex((c) => c.id === commentId);
        if (post.comments[commentIndex].commentOwner === userName) {
          post.comments.splice(commentIndex, 1);
          await post.save();
          return post;
        } else {
          throw new AuthenticationError("Action not allowed.");
        }
      } else {
        throw new UserInputError("Post not found.");
      }
    },
  },
};
