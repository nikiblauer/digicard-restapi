const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");

const HttpError = require("../models/http-error");
const User = require("../models/user-model");
const Card = require("../models/card-model");

const register = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new HttpError(
      "Invalid inputs passed, please check your data.",
      422
    );
    return next(error);
  }
  const { username, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.find({ username }).exec();
    if (existingUser.length > 0) {
      const error = new HttpError(
        "Signing up failed. Username is already taken.",
        500
      );
      return next(error);
    }
  } catch (err) {
    const error = new HttpError(
      "Signing up failed. Please try again later.",
      500
    );
    return next(error);
  }

  try {
    existingUser = await User.find({ email }).exec();
    if (existingUser.length > 0) {
      const error = new HttpError(
        "Signing up failed. Email is already taken.",
        500
      );
      return next(error);
    }
  } catch (err) {
    const error = new HttpError(
      "Signing up failed. Please try again later.",
      500
    );
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, saltRounds);
  } catch (err) {
    const error = new HttpError(
      "Signing up failed. Please try again later.",
      500
    );
    return next(error);
  }

  const createdUser = new User({
    username,
    email,
    password: hashedPassword,
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError(
      "Signing up failed. Please try again later.",
      500
    );

    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      {
        userId: createdUser.id,
        username,
        email,
      },
      process.env.JWT_KEY
    );
  } catch (err) {
    const error = new HttpError(
      "Signing up failed. Please try again later.",
      500
    );

    return next(error);
  }

  const createdCard = new Card({
    cardName: "",
    image: "",
    name: "",
    profession: "",
    links: {},
    address: "",
    creator: username,
  });

  try {
    await createdCard.save();
  } catch (err) {
    const error = new HttpError(
      "Creating card failed. Please try again later.",
      500
    );

    return next(error);
  }

  res.status(201).json({ userId: createdUser.id, username, email, token });
};

const login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new HttpError(
      "Invalid inputs passed, please check your data.",
      422
    );
    return next(error);
  }

  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email }).exec();
  } catch (err) {
    const error = new HttpError(
      "Signing in failed. Please try again later.",
      500
    );

    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError("Invalid Credentials. Please try again", 403);
    return next(error);
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError(
      "Could not log you in, please check your credentials and try again.",
      500
    );
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError(
      "Invalid credentials, could not log you in.",
      403
    );
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      {
        userId: existingUser.id,
        username: existingUser.username,
        email: existingUser.email,
      },
      process.env.JWT_KEY
    );
  } catch (err) {
    const error = new HttpError(
      "Signing up failed. Please try again later.",
      500
    );
  }

  res.status(201).json({
    userId: existingUser.id,
    username: existingUser.username,
    email: existingUser.email,
    token,
  });
};

const deleteUser = async (req, res, next) => {
  const userData = req.userData;

  let existingUser;
  try {
    existingUser = await User.findById(userData.userId).exec();
  } catch (err) {
    const error = new HttpError(
      "Deleting User failed. Please try again later.",
      500
    );

    return next(error);
  }
  if (!existingUser) {
    const error = new HttpError("This user does not exist", 404);
    return next(error);
  }

  try {
    await existingUser.remove();
  } catch (err) {
    const error = new HttpError(
      "Deleting User failed. Please try again later.",
      500
    );

    return next(error);
  }

  res.status(200).json({ message: "Deleted User" });
};

exports.register = register;
exports.login = login;
exports.deleteUser = deleteUser;
