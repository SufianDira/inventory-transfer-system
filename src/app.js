const express = require("express");

const webRouter = require("./routes/web.router");
const transferRouter = require("./routes/transfer.router");
const inventoryRouter = require("./routes/inventory.router");

const app = express();

app.use(express.json());

app.use("/", webRouter);
app.use("/transfer", transferRouter);
app.use("/inventory", inventoryRouter);

module.exports = app;
