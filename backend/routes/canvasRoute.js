const express = require("express");
const {
  getAllCanvases,
  createCanvas,
  loadCanvas,
  updateCanvas,
  shareCanvas,
} = require("../controller/canvasController");
const authenticationMiddleware = require("../middleware/authenticationMiddleware");

const router = express.Router();

router.get("/", authenticationMiddleware, getAllCanvases);
router.post("/", authenticationMiddleware, createCanvas);
router.get("/load/:id", authenticationMiddleware, loadCanvas);
router.put("/:id", authenticationMiddleware, updateCanvas);
router.put("/share/:id", authenticationMiddleware, shareCanvas);

module.exports = router;
