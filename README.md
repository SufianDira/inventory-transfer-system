# Inventory Transfer System

Small application to transfer product stock between warehouses and retail stores, enforcing inventory availability and location capacity. Built as a REST API with a simple HTML/JS frontend.

## One-Day Build Story (Summary)

- First Express project — Also my first Node.js framework. I chose it for its minimal and unopinionated design.
- First Prisma project — Connected it to an SQLite database. I chose it because I needed an ORM.
- Designed the schema for products, locations, with an inventory pivot table.
- Implemented a Faker-based seeder with configurable constants.
- Hit Prisma v7 generated client compatibility issues with plain JS, so I downgraded to Prisma v6 to keep CommonJS working.
- Structured the backend with `server.js` (boot), `app.js` (routes), routers -> controllers -> services, and a shared Prisma client for dependency injection.
- Added Zod schemas and a validation middleware to guard request bodies.
- Generated OpenAPI docs and built them into a static HTML file.
- Added npm scripts to speed up day-to-day tasks.

## Architecture
- `src/server.js`: boots the app and listens on a port.
- `src/app.js`: mounts routers and JSON middleware.
- `src/routes/*`: route definitions.
- `src/controllers/*`: request validation + response shaping.
- `src/services/*`: business logic and transaction integrity.
- `src/middlewares/validate.middleware.js`: Zod-based validation middleware.
- `src/schemas/*`: Zod schemas for request bodies.
- `src/db/prisma.js`: single Prisma client instance for dependency injection.
- `prisma/schema.prisma`: database schema definitions.
- `prisma/seed.js`: Faker-based database seeder.
- `openapi.yaml`: API specification.
- `api-documentation.html`: generated API docs.
- `.env`: environment variables.

## Database Design
Relational schema (SQLite):
- `Product`: `id`, `name`, `sku` (unique).
- `Location`: `id`, `name`, `type` (`WAREHOUSE` | `RETAIL_STORE`), `capacity`.
- `Inventory`: join table with `(productId, locationId, quantity)` for many-to-many.

Capacity is stored at the location level and validated during transfers.

## Backend Features
- RESTful transfer endpoint with validations:
  - Source warehouse has enough stock.
  - Destination location does not exceed its total capacity.
- Transactional updates to keep inventory consistent.
- OpenAPI spec in `openapi.yaml` + docs build to `api-documentation.html`.

## Frontend (Low Effort)
- Simple UI in `public/index.html` to view stock and trigger transfers.
- Built with AI due to time constraints, using the OpenAPI docs to understand endpoints.

## Future Work
- Utilize a frontend framework for better UI state management.
- Configure a deployment pipeline.
- Add unit tests.
- Add code documentation.

## Getting Started

### Prereqs
- Node.js
- npm

### Install
```bash
npm install
```

### Configure Environment
Create a `.env` file in the project root:
```bash
DATABASE_URL="file:./prisma/database.sqlite"
PORT=3000
```

### Database
```bash
npm run db:migrate
npm run db:seed
```

### Run the App
```bash
npm run dev
```
Server starts at `http://localhost:3000`.

### Build API Docs
```bash
npm run docs:build
```
Then open `api-documentation.html` in your browser.

## API Summary
- `POST /transfer`: move stock between locations with validation.
- `GET /inventory`: view current inventory per location.

## Scripts
- `npm run start`: start the server.
- `npm run dev`: start with nodemon.
- `npm run db:migrate`: apply Prisma migrations.
- `npm run db:seed`: seed database with Faker.
- `npm run docs:build`: generate static API docs HTML.

## Dependencies
Core runtime:
- `express`
- `@prisma/client`
- `zod`

Dev tooling:
- `prisma`
- `@faker-js/faker`
- `dotenv`
- `@redocly/cli`
- `nodemon`
- `shuffle-array`