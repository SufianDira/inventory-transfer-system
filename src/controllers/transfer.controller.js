const { transferStock } = require("../services/transfer.service");

exports.createTransfer = async (req, res) => {
  try {
    const { productId, sourceLocationId, destinationLocationId, quantity } = req.body;

    const result = await transferStock({
      productId,
      sourceLocationId,
      destinationLocationId,
      quantity,
    });

    return res.status(200).json(result);
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ error: error.message || "Internal server error" });
  }
};
