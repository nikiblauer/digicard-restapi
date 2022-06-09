const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

const usersController = require("../controllers/users-controller");
const checkAuth = require("../middleware/check-auth");

router.post(
  "/register",
  [
    check("username").not().isEmpty(),
    check("email").isEmail(),
    check("password").not().isEmpty(),
  ],
  usersController.register
);
router.post(
  "/login",
  [check("email").isEmail(), check("password").not().isEmpty()],
  usersController.login
);

router.use(checkAuth);
router.delete("/", usersController.deleteUser);

module.exports = router;
