# Database Schema

This document summarizes the MongoDB collections used by the Aasapure Customer Module, their important fields, how they relate to one another, and which screens depend on them.

## Collections Overview

- `users`
  Stores customer and admin accounts, saved addresses, preferences, and reward points.
- `products`
  Stores the live product catalog shown in the customer shop and managed in admin.
- `orders`
  Stores checkout snapshots, delivery status, rider details, address snapshot, and timeline updates.
- `subscriptions`
  Stores recurring product delivery plans for customers.

## 1. `users`

### Purpose

Holds both customer and admin accounts.

### Key Fields

- `_id`
- `name`
- `email`
- `passwordHash`
- `role`
  `customer` or `admin`
- `phone`
- `rewardPoints`
- `addresses[]`
  Embedded address records
- `preferences.deliveryNotes`
- `preferences.newsletter`
- `createdAt`
- `updatedAt`

### Embedded Address Fields

- `_id`
- `label`
- `recipientName`
- `phone`
- `line1`
- `line2`
- `city`
- `state`
- `pincode`
- `isDefault`

### Relations

- One user can have many orders through `orders.userId`
- One user can have many subscriptions through `subscriptions.userId`

### Used By

- Customer login and signup
- Customer dashboard
- Checkout address selection
- Profile page
- Rewards page
- Admin customers page

## 2. `products`

### Purpose

Stores the customer-facing dairy catalog and inventory metadata.

### Key Fields

- `_id`
- `name`
- `slug`
- `category`
- `description`
- `imageUrl`
- `price`
- `unit`
- `stock`
- `active`
- `nutritionBadges[]`
- `createdAt`
- `updatedAt`

### Relations

- Referenced by `orders.items[].productId`
- Referenced by `subscriptions.productId`

### Used By

- Shop page
- Product detail page
- Cart and checkout summary
- Customer dashboard featured products
- Admin products page
- Admin dashboard low stock summary

## 3. `orders`

### Purpose

Stores confirmed checkout records and delivery progress history.

### Key Fields

- `_id`
- `userId`
  Reference to `users._id`
- `orderNumber`
- `items[]`
  Snapshot of products at checkout time
- `subtotal`
- `tax`
- `total`
- `paymentMethod`
- `address`
  Embedded address snapshot used for fulfillment history
- `slot`
- `status`
  `Placed`, `Packed`, `Assigned`, `Out for Delivery`, `Delivered`, or `Cancelled`
- `rider.name`
- `rider.phone`
- `timeline[]`
  Status history entries
- `createdAt`
- `updatedAt`

### Order Item Fields

- `productId`
- `name`
- `slug`
- `imageUrl`
- `quantity`
- `unit`
- `price`
- `lineTotal`

### Timeline Fields

- `status`
- `at`
- `note`

### Relations

- Many orders belong to one user through `userId`
- Each order embeds product snapshots instead of relying only on live product data

### Used By

- Customer dashboard
- Cart to checkout flow
- Orders page
- Order detail / tracking page
- Rewards calculation
- Admin dashboard
- Admin orders page

## 4. `subscriptions`

### Purpose

Stores recurring delivery plans for customers.

### Key Fields

- `_id`
- `userId`
  Reference to `users._id`
- `productId`
  Reference to `products._id`
- `productName`
  Snapshot copy for easier rendering
- `imageUrl`
- `unit`
- `quantity`
- `frequency`
  `Daily` or `Weekly`
- `nextDeliveryDate`
- `status`
  `Active`, `Paused`, or `Cancelled`
- `createdAt`
- `updatedAt`

### Relations

- Many subscriptions belong to one user through `userId`
- Many subscriptions reference one product through `productId`

### Used By

- Customer dashboard
- Product detail subscription action
- Subscriptions page
- Admin subscriptions page
- Admin dashboard subscription totals

## 5. Rewards / Points Logic

Reward data is not stored in a separate collection in the current implementation.

### Stored Field

- `users.rewardPoints`

### Derived From

- Calculated from non-cancelled orders
- Backend sync logic recalculates points based on total order value

### Used By

- Customer dashboard
- Rewards page
- Profile context shown in session data

## Relation Summary

- `users._id` -> `orders.userId`
- `users._id` -> `subscriptions.userId`
- `products._id` -> `orders.items[].productId`
- `products._id` -> `subscriptions.productId`

## Page To Collection Mapping

- Login / Signup:
  - `users`
- Customer Dashboard:
  - `users`, `orders`, `subscriptions`, `products`
- Shop:
  - `products`
- Product Detail:
  - `products`, `subscriptions`
- Cart:
  - client-side storage plus `products` data used at checkout
- Checkout:
  - `users`, `products`, `orders`
- Orders:
  - `orders`
- Order Detail / Tracking:
  - `orders`
- Subscriptions:
  - `subscriptions`
- Rewards:
  - `users`, `orders`
- Profile:
  - `users`
- Admin Dashboard:
  - `users`, `products`, `orders`, `subscriptions`
- Admin Orders:
  - `orders`, `users`
- Admin Products:
  - `products`
- Admin Customers:
  - `users`, `orders`
- Admin Subscriptions:
  - `subscriptions`, `users`, `products`
