const express = require("express");
const { createTransfer } = require("../controllers/transfer.controller");
const { validateBody } = require("../middlewares/validate.middleware");
const { transferSchema } = require("../schemas/transfer.schema");

const router = express.Router();

router.post("/", validateBody(transferSchema), createTransfer);

module.exports = router;
