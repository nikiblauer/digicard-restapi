const fs = require("fs");

const HttpError = require("../models/http-error");
const Card = require("../models/card-model");

const getUsersCards = async (req, res, next) => {
  const username = req.params.username;

  let foundCards;
  try {
    foundCards = await Card.find({ creator: username }).exec();
  } catch (err) {
    const error = new HttpError(
      "Retrieving users cards failed. Please try again later.",
      500
    );
    return next(error);
  }

  if (foundCards.length === 0) {
    const error = new HttpError(
      "There are no cards associated with this user.",
      500
    );
    return next(error);
  }

  res
    .status(200)
    .json({ foundCards: foundCards.map((c) => c.toObject({ getters: true })) });
};

const createCard = async (req, res, next) => {
  const userData = req.userData;

  const createdCard = new Card({
    cardName: "",
    image: "",
    name: "",
    profession: "",
    links: {},
    address: "",
    creator: userData.username,
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

  res
    .status(300)
    .json({ createdCard: createdCard.toObject({ getters: true }) });
};

const updateCard = async (req, res, next) => {
  const userData = req.userData;

  const cardID = req.params.cardID;
  let { name, profession, links, address } = req.body;
  links = JSON.parse(links);

  let foundCard;
  try {
    foundCard = await Card.findById(cardID);
  } catch (err) {
    const error = new HttpError(
      "Updating card failed. Please try again later. 11111",
      500
    );

    return next(error);
  }
  if (!foundCard) {
    const error = new HttpError(
      "The card with the specified id does not exist",
      404
    );
    return next(error);
  }

  if (foundCard.creator !== userData.username) {
    const error = new HttpError(
      "You are not authorized to delete this card",
      300
    );
    return next(error);
  }

  let oldImagePath = "";
  if (req.file) {
    oldImagePath = foundCard.image;

    foundCard.image = req.file.path;
  }

  foundCard.name = name;
  foundCard.profession = profession;
  foundCard.links = links;
  foundCard.address = address;

  try {
    await foundCard.save();
  } catch (err) {
    const error = new HttpError(
      "Updating card failed. Please try again later. 222222",
      500
    );

    return next(error);
  }

  if (oldImagePath) {
    fs.unlink(oldImagePath, (err) => {
      console.log(err);
    });
  }

  res.status(200).json({ updatedCard: foundCard.toObject({ getters: true }) });
};

const deleteCard = async (req, res, next) => {
  const userData = req.userData;

  const cardID = req.params.cardID;

  let foundCard;
  try {
    foundCard = await Card.findById(cardID);
  } catch (err) {
    const error = new HttpError(
      "Deleting card failed. Please try again later.",
      500
    );

    return next(error);
  }
  if (!foundCard) {
    const error = new HttpError(
      "The card with the specified id does not exist",
      404
    );
    return next(error);
  }

  if (foundCard.creator !== userData.username) {
    const error = new HttpError(
      "You are not authorized to delete this card",
      300
    );
    return next(error);
  }

  try {
    await foundCard.remove();
  } catch (err) {
    const error = new HttpError(
      "Deleting card failed. Please try again later.",
      500
    );

    return next(error);
  }

  res.status(200).json({ message: "Deleted card" });
};

const deleteAllUsersCards = async (req, res, next) => {
  const userData = req.userData;

  let deletionResult;
  try {
    await Card.deleteMany({
      creator: userData.username,
    });
  } catch (err) {
    const error = new HttpError(
      "Deletion of cards failed. Please try again.",
      500
    );
    return next(error);
  }

  res.status(200).json({ message: "Deleted all cards" });
};

exports.getUsersCards = getUsersCards;
exports.updateCard = updateCard;
exports.createCard = createCard;
exports.deleteCard = deleteCard;
exports.deleteAllUsersCards = deleteAllUsersCards;
