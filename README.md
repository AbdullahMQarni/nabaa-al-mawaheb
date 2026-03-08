# Nabaa Al-Mawaheb Stadium Booking System

A modern, responsive web application designed for Managing Stadium Bookings at Nabaa Al-Mawaheb School. This system replaces manual processes with a streamlined digital experience for both clients and administrators.

## 🚀 Project Overview

The project provides a comprehensive solution for stadium management, featuring user-friendly booking interfaces, real-time availability checks, and a robust admin dashboard for analytics and request management.

### Key Features
- **Client Booking**: Phone-based authentication, interactive stadium selection, and automatic price calculation.
- **Admin Dashboard**: Real-time stats, booking request management (Accept/Reject/Suspend), and sound notifications.
- **Analytics**: Financial metrics (Revenue, Costs, Profit) and stadium performance tracking.
- **Cost Management**: Module for recording and tracking operational expenses.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [Prisma](https://www.prisma.io/) with SQLite
- **Styling**: Vanilla CSS with modern design patterns (Glassmorphism, CSS Variables)
- **Fonts**: IBM Plex Sans Arabic (Primary)

## 🏁 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd nabaa-al-mawaheb
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up the database**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📂 Project Structure

- `src/app/`: Next.js App Router pages and API routes.
  - `src/app/admin/`: Admin dashboard and management tools.
  - `src/app/api/`: Backend API endpoints.
  - `src/app/stadiums/`: Client-facing stadium details and booking.
- `src/components/`: Reusable React components.
- `prisma/`: Database schema and migrations.
- `public/`: Static assets (images, icons).

## 🎨 Design Guidelines

- **Typography**: Always use `IBM Plex Sans Arabic` for text to ensure a premium look for Arabic users.
- **Currency**: Use the custom Saudi Riyal symbol component for all price displays.
- **Responsiveness**: Ensure all features work seamlessly on mobile and desktop.

## 📜 Available Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts the production server.
- `npm run lint`: Runs ESLint for code quality checks.

