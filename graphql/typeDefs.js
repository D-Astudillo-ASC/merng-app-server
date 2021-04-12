const gql = require("graphql-tag");
const typeDefs = gql`
  type Query {
    getPosts: [Post]
    getPost(postId: ID!): Post
  }
  type User {
    id: ID!
    email: String!
    token: String!
    userName: String!
    createdAt: String!
  }
  input RegisterInput {
    userName: String!
    password: String!
    confirmPassword: String!
    email: String!
  }
  type Comment {
    id: ID!
    commentBody: String!
    commentOwner: String!
    createdAt: String!
  }
  type Like {
    id: ID!
    likeOwner: String!
    likedAt: String!
  }
  type Post {
    id: ID!
    postBody: String!
    postOwner: String!
    postOwnerId: ID!
    createdAt: String!
    comments: [Comment]!
    commentsCount: Int!
    likes: [Like]!
    likesCount: Int!
  }
  type Mutation {
    register(registerInput: RegisterInput): User!
    login(userName: String!, password: String!): User!
    createPost(postBody: String!): Post!
    deletePost(postId: ID!): String!
    createComment(postId: ID!, commentBody: String!): Post!
    deleteComment(postId: ID!, commentId: ID!): Post!
    likePost(postId: ID!): Post!
  }
  type Subscription {
    newPost: Post!
  }
`;

module.exports = typeDefs;
