# Ashesi Dwa – Backend

_The backend application for the Ashesi Dwa project, built with Go and PostgreSQL._

Ashesi DWA is an e-commerce platform designed to connect student vendors with buyers within Ashesi University. It provides a simple and accessible way for the campus community to discover and purchase products or services offered by fellow students.

This is the backend aspect, which serves as the data management and API layer of the platform. It handles user authentication, data validation, database interactions, and business logic. The backend is built with a focus on security, scalability, and maintainability to ensure a reliable and efficient platform.

---

## 🌐 Overview

This repository contains the **backend** source code for the Ashesi Dwa software engineering project. It provides the APIs and data management for the frontend application.

---

## 🚀 Tech Stack

| Layer             | Technology                                  |
|-------------------|---------------------------------------------|
| Language          | [Go](https://go.dev/)                      |
| Database          | [PostgreSQL](https://www.postgresql.org/)   |
| Query Builder     | [SQLC](https://sqlc.dev/)                    |
| Routing           | [Gin](https://gin-gonic.com/)                |
| ORM               | [pgx](https://github.com/jackc/pgx)         |
| Configuration     | [Viper](https://github.com/spf13/viper)     |
| Logging           | [Logrus](https://github.com/sirupsen/logrus) |
| Middleware        | [Gin Middleware](https://github.com/gin-gonic.com/docs/middleware/) |
| Testing           | [Go Test](https://go.dev/doc/test)          |

---

## 📁 Project Structure

```text
backend/
├── config/                 # Configuration files and logic
├── db/                     # Database schema, migrations, and SQLC generated code
├── internal/               # Internal packages (logging, utils, etc.)
├── middleware/             # Gin middleware components
├── repository/             # Database access layer (SQLC queries)
├── routes/                 # API route definitions
├── services/               # Business logic layer
├── yaak/                   # Yaak configuration files
├── go.mod                  # Go module definition
├── go.sum                  # Go dependencies checksum
├── main.go                 # Application entry point
├── sqlc.yaml               # SQLC configuration
└── README.md               # Project documentation
```

---

## 📦 Installation & Setup

### Prerequisites

Ensure you have the following installed:

- [Go (>=1.20)](https://go.dev/dl/)
- [PostgreSQL](https://www.postgresql.org/download/)
- [Docker](https://www.docker.com/) (optional, for running PostgreSQL in a container)

### Clone the Repository

```bash
git clone https://github.com/madstone0-0/dwa.git
cd dwa/backend
```

### Set up the Database

You can use Docker to quickly set up a PostgreSQL instance:

```bash
docker run --name ashesi-dwa-db -p 5432:5432 -e POSTGRES_USER=youruser -e POSTGRES_PASSWORD=yourpassword -d postgres
```

Or, you can install PostgreSQL locally and configure it manually.

### Configure the Application

Create a `.env` file with your database credentials and other settings.

### Install Dependencies

```bash
go mod download
```
---

## 🚀 Running the App Locally

```bash
go run main.go
```

The application should now be running and listening on the configured port (default: 8080).

---

## 🧪 Running Tests

```bash
go test ./...
```

---

## 🧬 Environment Configuration

Create a `.env` file in the backend directory for environment-specific variables:

```env
SECRET="secret_key_for_jwt"

DB_NAME="database_name"
DB_USER="database_username"
DB_HOST="localhost"
DB_PASS="password"
DB_PORT="5432"

HOST="localhost"
PORT="3000"
GIN_MODE="debug"
```

---

## 🧰 Key Packages

| Package        | Description                                      |
|---------------|--------------------------------------------------|
| `config`      | Handles application configuration using Viper   |
| `db`          | Manages database connections and migrations     |
| `handlers`    | Contains Gin handlers for API endpoints         |
| `internal`    | Provides internal utilities and helper functions |
| `middleware`  | Implements Gin middleware for authentication, authorization, etc. |
| `repository`  | Defines the data access layer using SQLC        |
| `routes`      | Configures API routes using Gin                 |
| `services`    | Implements business logic                       |

---

## 📚 Features

- ✨ RESTful API endpoints for managing users, vendors, items, carts, and transactions
- 🔐 User authentication and authorization
- 🗄️ PostgreSQL database for persistent data storage
- 🚀 Scalable architecture with well-defined layers
- ✅ Comprehensive test suite

---
