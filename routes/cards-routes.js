const express = require("express");
const router = express.Router();

const cardsController = require("../controllers/cards-controller");
const checkAuth = require("../middleware/check-auth");
const fileUpload = require("../middleware/file-upload");

router.get("/user/:username", cardsController.getUsersCards);

router.use(checkAuth);
router.post("/", cardsController.createCard);
router.patch(
  "/:cardID",
  fileUpload.single("image"),
  cardsController.updateCard
);
router.delete("/user/", cardsController.deleteAllUsersCards);
router.delete("/:cardID", cardsController.deleteCard);

module.exports = router;
