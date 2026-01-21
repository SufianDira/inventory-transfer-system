const express = require("express");
const { getInventoryBreakdown } = require("../controllers/inventory.controller");

const router = express.Router();

router.get("/", getInventoryBreakdown);

module.exports = router;
