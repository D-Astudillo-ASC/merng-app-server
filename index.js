const { ApolloServer, PubSub } = require("apollo-server");
const mongoose = require("mongoose");
const { MongoDB } = require("./config.js");
const PORT = process.env.PORT || 8080;
const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers");
const pubsub = new PubSub();
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({ req, pubsub }),
});
mongoose
  .connect(MongoDB, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("MongoDB connected.");
    console.log("PORT: " + PORT);
    return server.listen({ port: PORT });
  })
  .then((res) => {
    console.log(`Server running at ${res.url}`);
  })
  .catch((err) => {
    console.error(err);
  });
