# WriteHub - Modern Blogging Platform

A full-stack blogging platform built with React, Hono.js, and Cloudflare Workers.
🔗 **Live Demo**: [writehub-jtvx.vercel.app](https://writehub-jtvx.vercel.app)

## 🚀 Features

- **User Authentication**
  - Secure signup and signin functionality
  - JWT-based authentication
  - Protected routes

- **Blog Management**
  - Create and publish blog posts
  - View all blogs in a clean interface
  - User profiles

- **Modern Tech Stack**
  - React with TypeScript for type safety
  - Vite for lightning-fast development
  - Tailwind CSS for modern styling
  - React Query for efficient data fetching


## 🛠️ Technology Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS

### Backend
- Hono.js
- Cloudflare Workers
- Prisma ORM
- TypeScript
- JWT Authentication

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Cloudflare account (for backend deployment)

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with necessary environment variables:
   ```env
   VITE_API_URL=your_api_url
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables in `wrangler.toml`:
   ```toml
   [vars]
   DATABASE_URL="your_database_url"
   JWT_SECRET="your_jwt_secret"
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## 🌐 Deployment

### Frontend
The frontend is configured for deployment on Vercel. Simply connect your GitHub repository to Vercel and it will automatically deploy your application.

### Backend
The backend is designed to run on Cloudflare Workers:

1. Make sure you have Wrangler CLI installed:
   ```bash
   npm install -g wrangler
   ```

2. Deploy to Cloudflare Workers:
   ```bash
   wrangler deploy
   ```
