# Aasapure Customer Module

A clean customer-facing module built with:

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB Atlas via Mongoose

## Implemented Features

- Customer signup
- Customer login
- Customer dashboard
- Shop page with seeded products
- Cart management (add/remove/update quantity)
- Checkout with address and payment method
- Order creation in MongoDB
- Order history page
- Order tracking timeline:
  - Placed
  - Packed
  - Assigned
  - Out for Delivery
  - Delivered

## Project Structure

- server/ -> Express API, models, MongoDB connection
- customer-client/ -> React customer application
- archive-ui-reference/ -> archived legacy stitched UI references

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB Atlas connection string (or use current default fallback in server)

## Environment

Create a root .env file (optional if fallback URI is used in server):

MONGODB_URI=your_mongodb_atlas_connection_string
PORT=5000

For frontend API base URL (optional), create:

customer-client/.env

VITE_API_BASE_URL=http://localhost:5000

## Install

From workspace root:

npm install

From frontend folder:

cd customer-client
npm install

## Run Backend

From workspace root:

npm run server

Server health check:

GET http://localhost:5000/health

## Run Frontend

From customer-client folder:

npm run dev

Open:

http://localhost:5173/customer/login

## Build Frontend

From customer-client folder:

npm run build

## Main Customer API Endpoints

Auth:

- POST /api/customer/signup
- POST /api/customer/login

Dashboard:

- GET /api/customer/dashboard/:userId

Shop/Order:

- GET /api/customer/products
- POST /api/customer/orders
- GET /api/customer/orders/:userId
- GET /api/customer/orders/track/:orderId

## Notes

- Product seed is checked on backend startup (Milk, Curd, Paneer, Butter, Ghee, Lassi).
- Legacy stitched UI pages were archived safely instead of deleted.
- This repo currently focuses on customer module workflows.
