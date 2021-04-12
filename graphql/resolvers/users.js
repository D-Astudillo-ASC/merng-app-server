const User = require("../../user/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { UserInputError } = require("apollo-server");
const { SECRET_KEY } = require("../../config");
const {
  validateRegisterInput,
  validateLoginInput,
} = require("../../util/validators");

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      userName: user.userName,
    },
    SECRET_KEY,
    { expiresIn: "1h" }
  );
}
module.exports = {
  Mutation: {
    async login(_, { userName, password }) {
      const { errors, valid } = validateLoginInput(userName, password);
      if (!valid) {
        throw new UserInputError("Errors with login.", { errors });
      }
      const user = await User.findOne({ userName });
      if (!user) {
        errors.general = "User does not exist";
        throw new UserInputError("Credentials are incorrect.", { errors });
      }
      const passwordsMatch = await bcrypt.compare(password, user.password);
      if (!passwordsMatch) {
        errors.general = "Credentials are incorrect.";
        throw new UserInputError("Credentials are incorrect.", { errors });
      }
      const token = generateToken(user);
      return {
        ...user._doc,
        id: user._id,
        token,
      };
      //   if (errors) {
      //   }
    },
    async register(
      _,
      { registerInput: { userName, password, confirmPassword, email } },
      context,
      info
    ) {
      //Validate User Data...
      //Make sure user doesn't exist already
      //   console.log({ userName, password, confirmPassword, email });
      const { valid, errors } = validateRegisterInput(
        userName,
        password,
        confirmPassword,
        email
      );
      if (!valid) {
        throw new UserInputError("Invalid Registration Input!", { errors });
      }
      const user = await User.findOne({ userName });
      if (user) {
        throw new UserInputError("Username is taken", {
          errors: {
            userName: "This username is taken",
          },
        });
      }
      //Hash password and create auth token
      password = await bcrypt.hash(password, 12);
      const newUser = new User({
        email,
        userName,
        password,
        createdAt: new Date().toISOString(),
      });
      const res = await newUser.save();
      const token = generateToken(res);
      return {
        ...res._doc,
        id: res._id,
        token,
      };
    },
  },
};
