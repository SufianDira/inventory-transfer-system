const express = require("express");
const path = require("path");

const router = express.Router();

const publicDirectory = path.resolve(__dirname, "../../public");
router.use(express.static(publicDirectory));

router.get("/", (req, res) => {
  res.sendFile(path.join(publicDirectory, "index.html"));
});

module.exports = router;
