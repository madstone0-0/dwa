# Ashesi Dwa

![Ashesi Dwa Logo](https://dwa.surge.sh/assets/dwa-icon-ByJZ5kBg.jpg)

_An e-commerce platform connecting student vendors with buyers within Ashesi University._

**Live Demo:** [https://dwa.surge.sh](https://dwa.surge.sh)

---

## 📱 Overview

Ashesi Dwa is a comprehensive e-commerce platform designed specifically for the Ashesi University community. The platform enables student vendors to showcase their products and services while providing buyers with a convenient and accessible marketplace to discover and purchase offerings from fellow students.

The project consists of two main components:
1. A React-based frontend providing an intuitive user interface
2. A Go-powered backend handling data management and business logic

---

## ✨ Key Features

- 🛍️ **Marketplace** - Browse and discover student-offered products and services
- 🔐 **User Authentication** - Secure login and registration system
- 👤 **User Profiles** - Customizable vendor and buyer profiles
- 🛒 **Shopping Cart** - Add, remove, and manage items before checkout
- 💳 **Transactions** - Secure payment processing and order management
- 📱 **Responsive Design** - Optimized for both desktop and mobile devices
- 🔍 **Search & Filter** - Find products by category, price range, or keywords
- 📊 **Vendor Analytics** - Inventory, sales and earnings tracking for vendors

---

## 🛠️ Architecture

The project follows a modern client-server architecture:

```
                 ┌─────────────────┐          ┌─────────────────┐
                 │                 │          │                 │
  User ◄────────►│  React Frontend ├─────────►│   Go Backend    │◄────────► PostgreSQL
                 │                 │   API    │                 │            Database
                 └─────────────────┘          └─────────────────┘
```

### Frontend (Client)

- Built with React 18, TypeScript, and Tailwind CSS
- Utilizes Zustand for state management
- Communicates with backend through RESTful API endpoints
- Deployed on Surge

### Backend (Server)

- Developed in Go with the Gin framework
- PostgreSQL database with SQLC for type-safe queries
- RESTful API design with proper authentication and authorization
- Structured with clear separation of concerns

---

## 🚀 Tech Stack

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Forms**: TanStack React Form
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Notifications**: Notistack
- **Charts**: Recharts
- **Bundler**: Vite

### Backend
- **Language**: Go
- **Web Framework**: Gin
- **Database**: PostgreSQL
- **Query Builder**: SQLC
- **ORM**: pgx
- **Configuration**: Viper
- **Logging**: Logrus

---

## 🔧 Development

### Prerequisites

- Node.js (v18+)
- pnpm or npm
- Go (v1.20+)
- PostgreSQL
- Docker (optional)

### Setting up the project

1. Clone the repository
   ```bash
   git clone https://github.com/madstone0-0/dwa.git
   cd dwa
   ```

2. Set up the backend
   ```bash
   cd backend
   go mod download
   # Configure your database connection in .env file
   ```

3. Set up the frontend
   ```bash
   cd frontend
   pnpm install # or npm install
   ```

4. Run the applications
   - Backend:
     ```bash
     cd backend
     go run main.go
     ```
   - Frontend:
     ```bash
     cd frontend
     pnpm dev # or npm run dev
     ```

For detailed setup instructions, refer to the individual README files in the [frontend](./frontend) and [backend](./backend) directories.

---

## 📂 Project Structure

```
dwa/
├── backend/                # Go backend application
│   ├── config/             # Configuration management
│   ├── db/                 # Database schema and migrations
│   ├── internal/           # Internal packages and utilities
│   ├── middleware/         # HTTP middleware
│   ├── repository/         # Data access layer
│   ├── routes/             # API route definitions
│   ├── services/           # Business logic
│   └── main.go             # Application entry point
│
├── frontend/               # React frontend application
│   ├── public/             # Static assets
│   ├── src/                # Source code
│   │   ├── assets/         # Images and media
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service layer
│   │   ├── store/          # Zustand state management
│   │   ├── types/          # TypeScript type definitions
│   │   ├── utils/          # Utility functions
│   │   ├── App.tsx         # Main application component
│   │   └── main.tsx        # Entry point
│   └── index.html          # HTML template
│
└── README.md               # This file
```

---

## 📦 Deployment

### Frontend
The frontend is deployed on Surge:
- URL: [https://dwa.surge.sh](https://dwa.surge.sh)
- Deployment command: `surge ./frontend/dist`

### Backend
The backend can be deployed on any platform that supports Go applications (e.g., AWS, DigitalOcean, Heroku).

---

## 🧪 Testing

### Frontend
```bash
cd frontend
pnpm test # or npm run test
```

### Backend
```bash
cd backend
go test ./...
```

---

## 👥 Contributors

- [Madiba](mailto:madstone.github@gmail.com) - Full Stack Developer
- [Peniel](mailto:pennyansah@gmail.com) - Frontend Developer
- [Tani](mailto:tanitoluwaadebayo@gmail.com) - Backend Developer
- [Vera](mailto:verafaithat18@gmail.com) - UI/UX Designer

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🔮 Future Enhancements

- Mobile application development
- Integration with popular payment gateways
- Advanced recommendation system
- Real-time notifications
- Vendor verification system
- Reviews and ratings

---

## 📸 Screenshots

*Coming soon*

---

## 📚 Documentation

Additional documentation is available in the following locations:
- [Frontend Documentation](./frontend/README.md)
- [Backend Documentation](./backend/README.md)
- [API Documentation](./backend/docs/api.md) (coming soon)

---

## 📞 Contact

For questions, feedback, or support, please contact any of the contributors listed above or open an issue on GitHub.
