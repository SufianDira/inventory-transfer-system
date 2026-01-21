const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');
var shuffle = require('shuffle-array');

const prisma = new PrismaClient();

async function main() {
  const NUMBER_OF_WAREHOUSES = 6;
  const MIN_WAREHOUSE_CAPACITY = 5;
  const MAX_WAREHOUSE_CAPACITY = 25;

  const NUMBER_OF_STORES = 6;
  const MIN_STORE_CAPACITY = 4;
  const MAX_STORE_CAPACITY = 8;

  const NUMBER_OF_PRODUCTS = 50;
  const MIN_PRODUCT_QUANTITY = 1;
  const MAX_PRODUCT_QUANTITY = Math.max(MAX_WAREHOUSE_CAPACITY, MAX_STORE_CAPACITY);

  let warehouses = [];

  await prisma.location.deleteMany({});

  for (let i = 1; i <= NUMBER_OF_WAREHOUSES; i++) {
    const capacity = faker.number.int({ min: MIN_WAREHOUSE_CAPACITY, max: MAX_WAREHOUSE_CAPACITY });

    const location = await prisma.location.create({
      data: {
        name: `Warehouse ${i}`,
        type: 'WAREHOUSE',
        capacity,
      },
    });
    warehouses.push(location);
  }

  for (let i = 1; i <= NUMBER_OF_STORES; i++) {
    const id = NUMBER_OF_WAREHOUSES + i
    const capacity = faker.number.int({ min: MIN_STORE_CAPACITY, max: MAX_STORE_CAPACITY });

    const location = await prisma.location.create({
      data: {
        name: `Retail Store ${i}`,
        type: 'RETAIL_STORE',
        capacity,
      },
    });
  }

  const productRows = [];
  for (let i = 1; i <= NUMBER_OF_PRODUCTS; i++) {
    const sku = `SKU-${String(i).padStart(4, '0')}`;
    const name = faker.commerce.productName();

    productRows.push({
      sku,
      name,
    });
  }
  await prisma.product.deleteMany({});
  await prisma.product.createMany({
    data: productRows,
  });
  const products = await prisma.product.findMany({});

  const inventoryRows = [];
  for (const warehouse of warehouses) {
    let usedQuantity = 0

    shuffle(products)
    for (const product of products) {
      if (usedQuantity >= warehouse.capacity) break;

      const available = faker.datatype.boolean()
      if (!available) continue;

      const quantity = Math.min(
        faker.number.int({ min: MIN_PRODUCT_QUANTITY, max: MAX_PRODUCT_QUANTITY }),
        warehouse.capacity - usedQuantity
      );
      usedQuantity += quantity

      inventoryRows.push({
        productId: product.id,
        locationId: warehouse.id,
        quantity,
      });
    }
  }
  await prisma.inventory.deleteMany({});
  await prisma.inventory.createMany({
    data: inventoryRows,
  });

  console.log(`Database seeded successfully with ${NUMBER_OF_PRODUCTS} products and ${NUMBER_OF_WAREHOUSES + NUMBER_OF_STORES} locations`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
