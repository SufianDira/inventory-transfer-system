const { z } = require("zod");

const transferSchema = z.object({
  productId: z.coerce.number().int().positive("productId must be a positive integer"),
  sourceLocationId: z.coerce.number().int().positive("sourceLocationId must be a positive integer"),
  destinationLocationId: z.coerce.number().int().positive("destinationLocationId must be a positive integer"),
  quantity: z.coerce.number().int().positive("quantity must be a positive integer"),
}).superRefine((data, context) => {
  if (data.sourceLocationId === data.destinationLocationId) {
    ctx.issues.push({
      path: ["destinationLocationId"],
      message: "destinationLocationId must be different from sourceLocationId",
    });
  }
});

module.exports = { transferSchema };
