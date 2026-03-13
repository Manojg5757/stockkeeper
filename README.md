# R.K PUMPS - Hardware Stock Inventory Management

A full-stack hardware stock inventory management web app built with Next.js 14+, Tailwind CSS, and Firebase Firestore.

## Features

- **Categories Management**: Add, edit, delete categories for organizing products.
- **Product Inventory**: Manage products with details like quantity, description, price, supplier, location, material, grade.
- **Real-time Sync**: All CRUD operations sync in real-time via Firebase Firestore listeners.
- **Stock Alerts**: Low stock alerts for products below reorder level.
- **Search & Filter**: Live search by name/SKU/supplier, filter by stock status.
- **CSV Export**: Export all product data to CSV.
- **Responsive Design**: Dark industrial theme, fully responsive with collapsible sidebar on mobile.

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **Backend**: Firebase Firestore (free tier)
- **Styling**: Tailwind CSS (no external UI libraries)
- **Linting**: ESLint with Prettier

## Setup Instructions

1. **Clone or Download** the project.

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Firebase Setup**:
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/).
   - Enable Firestore Database.
   - Go to Project Settings > General > Your apps > Add Web App.
   - Copy the Firebase config object.

4. **Update Firebase Config**:
   - Open `lib/firebase.ts`.
   - Replace the placeholder `firebaseConfig` with your actual config:
     ```typescript
     const firebaseConfig = {
       apiKey: "your-actual-api-key",
       authDomain: "your-project.firebaseapp.com",
       projectId: "your-actual-project-id",
       storageBucket: "your-project.appspot.com",
       messagingSenderId: "your-actual-sender-id",
       appId: "your-actual-app-id"
     };
     ```

5. **Run the App**:
   ```bash
   npm run dev
   ```
   - Open [http://localhost:3000](http://localhost:3000).
   - The app will seed with default categories and products on first run if Firestore is empty.

6. **Build for Production**:
   ```bash
   npm run build
   npm start
   ```

## Project Structure

- `app/page.tsx`: Main dashboard
- `app/layout.tsx`: Root layout
- `lib/firebase.ts`: Firebase initialization
- `lib/types.ts`: TypeScript interfaces
- `components/`: Reusable components
  - `StatsHeader.tsx`: Header with stats
  - `CategorySidebar.tsx`: Sidebar with categories and alerts
  - `ProductTable.tsx`: Table with products
  - `DetailPanel.tsx`: Product detail panel
  - `CategoryModal.tsx`: Add/edit category modal
  - `ProductModal.tsx`: Add/edit product modal
  - `Toast.tsx`: Notification toast

## Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint
- `npm run format`: Format code with Prettier

## Notes

- Single user, no authentication.
- Prices in AED.
- Firestore collections: `categories` and `products`.
- Seed data: 3 categories (Bolts, Nuts, Pipes) and 5 sample products.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
