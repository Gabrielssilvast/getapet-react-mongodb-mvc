const router = require("express").Router();

const PetController = require("../controllers/PetController");

//middlewares
const verifyToken = require("../helpers/verifyToken");
const { imageUpload } = require("../helpers/imageUpload");

router.post(
  "/create",
  verifyToken,
  imageUpload.array("images"),
  PetController.create
);

module.exports = router;
