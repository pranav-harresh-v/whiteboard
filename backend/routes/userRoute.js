const {
  registerUser,
  loginUser,
  getUserProfile,
} = require("../controllers/userController");

const router = require("express").Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/profile", getUserProfile);

module.exports = router;
