const prisma = require("../db/prisma");

function returnError(status, field, message) {
  return res.status(status).json({
    message,
    errors: [
      field,
      message,
    ]
  });
}

async function getProductOrFail(tx, productId) {
  const product = await tx.product.findUnique({ where: { id: productId } });
  if (!product) returnError(404, "productId", `Product ${productId} not found`);
  return product;
}

async function getLocationOrFail(tx, locationId, field) {
  const location = await tx.location.findUnique({ where: { id: locationId } });
  if (!location) returnError(404, field, `Location ${locationId} not found`);
  return location;
}

async function getLocationTotalQuantity(tx, locationId) {
  const aggregate = await tx.inventory.aggregate({
    where: { locationId },
    _sum: { quantity: true },
  });
  return aggregate._sum.quantity ?? 0;
}

exports.transferStock = async ({ productId, sourceLocationId, destinationLocationId, quantity }) => {
  return prisma.$transaction(async (tx) => {
    const product = await getProductOrFail(tx, productId);
    const sourceLocation = await getLocationOrFail(tx, sourceLocationId, "sourceLocation");
    const destinationLocation = await getLocationOrFail(tx, destinationLocationId, "destinationLocation");
    const productId_sourceLocationId = { productId, locationId: sourceLocationId }
    const productId_destinationLocationId = { productId, locationId: destinationLocationId }

    // Validation 1: source has enough quantity of product
    const sourceInventory = await tx.inventory.findUnique({
      where: { productId_locationId: productId_sourceLocationId },
    });
    const sourceQuantity = sourceInventory?.quantity ?? 0;

    if (sourceQuantity < quantity) {
      returnError(
        400,
        "quantity",
        `Insufficient stock at source. Available ${sourceQty}, requested ${quantity}`
      );
    }

    // Validation 2: destination has enough capacity for products
    const destinationQuantity = await getLocationTotalQuantity(tx, destinationLocationId);
    if (destinationQuantity + quantity > destinationLocation.capacity) {
      returnError(
        400,
        "quantity",
        `Capacity exceeded at destination. Current total ${destinationQuantity}, maximum capacity ${destinationLocation.capacity}, requested additional ${quantity}`
      );
    }

    // Decrease source location quantity of product
    await tx.inventory.update({
      where: { productId_locationId: productId_sourceLocationId },
      data: { quantity: { decrement: quantity } },
    });

    // Increase destination location quantity of product
    await tx.inventory.upsert({
      where: { productId_locationId: productId_destinationLocationId },
      create: { productId, locationId: destinationLocationId, quantity },
      update: { quantity: { increment: quantity } },
    });

    // Cleanup
    const updatedSourceInventory = await tx.inventory.findUnique({
      where: { productId_locationId: productId_sourceLocationId },
    });
    if (updatedSourceInventory && updatedSourceInventory.quantity === 0) {
      await tx.inventory.delete({
        where: { productId_locationId: productId_sourceLocationId },
      });
    }

    // Return response
    const [updatedSourceQuantity, updatedDestinationTotal] = await Promise.all([
      getLocationTotalQuantity(tx, sourceLocationId),
      getLocationTotalQuantity(tx, destinationLocationId),
    ]);

    return {
      message: "Transfer successful",
      product: {
        id: product.id,
        sku: product.sku,
        name: product.name
      },
      sourceLocation: {
        id: sourceLocation.id,
        name: sourceLocation.name,
        type: sourceLocation.type,
        productQuantityBefore: sourceQuantity,
        productQuantityAfter: updatedSourceQuantity,
        capacity: sourceLocation.capacity,
      },
      destinationLocation: {
        id: destinationLocation.id,
        name: destinationLocation.name,
        type: destinationLocation.type,
        totalQuantityBefore: destinationQuantity,
        totalQuantityAfter: updatedDestinationTotal,
        capacity: destinationLocation.capacity,
      },
      transferredQuantity: quantity,
    };
  });
};
