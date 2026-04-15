# E-Commerce MERN Project

A full-stack e-commerce application with three user roles: **Customer**, **Seller**, and **Admin**.

## Features

- **Authentication**: JWT-based registration & login
- **Products**: CRUD with Cloudinary image upload, search, filter, sort, pagination
- **Orders**: Cash on Delivery (COD) with proper status tracking (pending → confirmed → processing → shipped → delivered)
- **Reviews**: Product ratings and reviews
- **Wishlist**: Save favorite products
- **Chat**: Real-time messaging between customers and sellers via Socket.io (initiate from product page)
- **Admin Panel**: Dashboard stats, manage users/sellers/products/orders

## Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account (for image uploads)
- SMTP credentials (for emails)

### Backend

```bash
cd backend
cp .env.example .env    # fill in your credentials
npm install
npm run dev
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

### Default Admin

Create your admin by inserting directly into MongoDB or by modifying the register route temporarily.

## Order Status Flow

```
pending → confirmed → processing → shipped → delivered
   ↓          ↓            ↓
cancelled  cancelled   cancelled
```

Only pending orders can be cancelled by customers. Admins and sellers can advance the status forward.

## Tech Stack

- **Backend**: Express, MongoDB/Mongoose, JWT, Socket.io, Cloudinary, Nodemailer
- **Frontend**: React 18, React Router, Tailwind CSS, Socket.io Client, Axios, Lucide Icons
