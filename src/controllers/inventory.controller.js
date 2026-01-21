const prisma = require("../db/prisma");

exports.getInventoryBreakdown  = async (req, res) => {
  const locations = await prisma.location.findMany({
    orderBy: { id: "asc" },
    include: {
      inventory: {
        include: { product: true },
        orderBy: [{ productId: "asc" }],
      },
    },
  });

  const result = locations.map((location) => {
    const totalQuantity = location.inventory.reduce((sum, row) => sum + row.quantity, 0);
    return {
      id: location.id,
      name: location.name,
      type: location.type,
      totalQuantity,
      capacity: location.capacity,
      products: location.inventory.map((row) => ({
        productId: row.productId,
        sku: row.product.sku,
        name: row.product.name,
        quantity: row.quantity,
      })),
    };
  });

  res.json(result);
};
