
# Ashesi Dwa – Frontend

_A modern frontend application for the Ashesi Dwa project, built with React, TypeScript, Vite, and Tailwind CSS._

 Ashesi DWA is an e-commerce platform designed to connect student vendors with buyers within Ashesi University. It provides a simple and accessible way for the campus community to discover and purchase products or services offered by fellow students.
 This is the frontend aspect, which serves as the user interface layer of the platform, allowing users to navigate the marketplace, manage their accounts, and interact with key features such as product listings, purchasing items, authentication, form submissions, and more. The frontend is built with a focus on modularity, performance, and maintainability to ensure a smooth user experience and easier future development.



---

## 🌐 Overview

This repository contains the **frontend** source code for the Ashesi Dwa software engineering project. It connects to backend APIs and delivers a responsive, accessible, and scalable user experience across devices.

---

## 🚀 Tech Stack

| Layer        | Technology                       |
|--------------|----------------------------------|
| Framework    | [React 18](https://reactjs.org/) |
| Language     | [TypeScript](https://www.typescriptlang.org/) |
| Styling      | [Tailwind CSS](https://tailwindcss.com/) |
| Routing      | [React Router DOM](https://reactrouter.com/en/main) |
| Forms        | [TanStack React Form](https://tanstack.com/form) |
| HTTP Client  | [Axios](https://axios-http.com/) |
| State Mgmt   | [Zustand](https://zustand.pmnd.rs/) |
| Notifications| [Notistack](https://iamhosseindhv.com/notistack) |
| Charts       | [Recharts](https://recharts.org/) |
| Bundler      | [Vite](https://vitejs.dev/) |

---

## 📁 Project Structure

```text
frontend/
├── public/                # Static assets (favicon, etc.)
├── src/                   # Main source code
│   ├── assets/            # Images and static media
│   ├── components/        # Reusable UI components
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Page components for routes
│   ├── services/          # API communication via Axios
│   ├── store/             # Global state management with Zustand
│   ├── utils/             # Helper functions/utilities
│   ├── App.tsx            # Main app component
│   └── main.tsx           # Application entry point
├── .env                   # Environment variables (not committed)
├── index.html             # HTML entry point
├── tailwind.config.js     # Tailwind configuration
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript config
├── package.json           # Project metadata and scripts
└── README.md              # Project documentation
```

---

## 📦 Installation & Setup

### Prerequisites

Ensure you have the following installed:

- [Node.js (>=18.x)](https://nodejs.org/)
- [pnpm](https://pnpm.io/) or npm

### Clone the Repository

```bash
git clone https://github.com/your-org/ashesi-dwa-frontend.git
cd ashesi-dwa-frontend
```

### Install Dependencies

```bash
# using pnpm
pnpm install

# or using npm
npm install
```

---

## 🧪 Running the App Locally

```bash
pnpm dev
# or
npm run dev
```

The application should now be running at: `http://localhost:5173`

---

## 🔨 Build for Production

```bash
pnpm build
# or
npm run build
```

This command compiles the application into the `dist/` folder for deployment.

---

## 🌐 Preview Production Build

```bash
pnpm preview
# or
npm run preview
```

This will serve the built files on a local server for preview.

---

## ✅ Linting

Lint the codebase using ESLint:

```bash
pnpm lint
# or
npm run lint
```

---

## 🧬 Environment Configuration

Create a `.env` file in the project root for environment-specific variables:

```env
VITE_API_BASE_URL=https://your-api-server.com/api
```

Note: Never commit secrets or production credentials to version control.

---

## 🧰 Available Scripts

| Script        | Description                                      |
|---------------|--------------------------------------------------|
| `dev`         | Starts development server                        |
| `build`       | Builds production-ready bundle                   |
| `preview`     | Serves the production build locally              |
| `lint`        | Runs ESLint on all source files                  |

---

## 📚 Features

- ✨ Modern UI built with Tailwind and React hooks
- 🔁 SPA routing with protected routes
- 📡 Axios service layer for backend interaction
- 🌍 Centralized global state via Zustand
- 🧾 Form management with TanStack React Form
- 🔔 Toast notifications with Notistack
- 📊 Dynamic charts with Recharts
- 📱 Fully responsive design
- 🧩 Easy component reuse and extensibility


---

## ✉️ Contact

For questions or feedback, please reach out to [Madiba](mailto:madstone.github@gmail.com)
.
