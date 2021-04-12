const { model, Schema } = require("mongoose");

const postSchema = new Schema({
  postBody: String,
  postOwner: String,
  postOwnerId: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
  createdAt: String,
  comments: [
    {
      commentBody: String,
      commentOwner: String,
      createdAt: String,
    },
  ],
  likes: [
    {
      likeOwner: String,
      likedAt: String,
    },
  ],
});
module.exports = model("Post", postSchema);
