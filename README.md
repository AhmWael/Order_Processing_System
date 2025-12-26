# Order Processing System

A simplified **online bookstore system** built using **.NET 10 (C#)** for the backend and **Next.js** for the frontend. This system supports **Administrators** and **Customers**, managing books, publishers, stock levels, orders, sales, and shopping carts.

The project uses **raw SQL** (no ORM), **Docker & Docker Compose**, **unit testing**, and **CI/CD pipelines**.

---

## **Features**

### Admin Features

* Add, modify, and delete books
* Manage book stock levels
* Place and confirm orders with publishers
* Generate reports:

  * Total sales (daily/monthly)
  * Top 5 customers
  * Top 10 selling books
  * Number of times a book has been ordered

### Customer Features

* Register, login, and manage account
* Search books by title, ISBN, author, category, or publisher
* Manage shopping cart (add, remove, view)
* Checkout with saved credit cards
* Manage credit cards with AES-256 encryption
* View past orders

### System Features

* Raw SQL queries with integrity constraints
* Triggers for automatic stock management
* JWT-based authentication with role-based authorization
* AES-256-CBC encryption for sensitive data (credit cards)
* Comprehensive admin reporting system
* Dockerized backend, frontend, and database
* CI/CD pipelines for automated build and deployment

---

## **Tech Stack**

* **Backend:** .NET 10, ASP.NET Core Web API, C#
* **Frontend:** Next.js, React, TailwindCSS
* **Database:** PostgreSQL (raw SQL)
* **Containerization:** Docker & Docker Compose
* **Testing:** xUnit (backend), Jest & React Testing Library (frontend)
* **CI/CD:** GitHub Actions
* **Authentication:** JWT

---

## **File Structure**

```
Order_Processing_System/
├── backend/
│   ├── Controllers/
│   │   ├── AuthController.cs
│   │   ├── AuthorsController.cs
│   │   ├── BooksController.cs
│   │   ├── CartController.cs
│   │   ├── CreditCardsController.cs
│   │   ├── PublishersController.cs
│   │   ├── ReplenishmentOrdersController.cs
│   │   ├── ReportsController.cs
│   │   └── UsersController.cs
│   ├── Services/
│   │   ├── Author/
│   │   ├── Book/
│   │   ├── Cart/
│   │   ├── CreditCard/
│   │   │   ├── ICreditCardService.cs
│   │   │   └── CreditCardService.cs
│   │   ├── CustomerOrder/
│   │   ├── Publisher/
│   │   ├── Report/
│   │   │   ├── IReportService.cs
│   │   │   └── ReportService.cs
│   │   ├── ReplenishmentOrder/
│   │   ├── Seeders/
│   │   └── User/
│   ├── Repositories/
│   │   ├── Author/
│   │   ├── Book/
│   │   ├── Cart/
│   │   ├── CreditCard/
│   │   │   ├── ICreditCardRepository.cs
│   │   │   └── CreditCardRepository.cs
│   │   ├── CustomerOrder/
│   │   ├── Publisher/
│   │   ├── Report/
│   │   │   ├── IReportRepository.cs
│   │   │   └── ReportRepository.cs
│   │   ├── ReplenishmentOrder/
│   │   └── User/
│   ├── Migrations/
│   │   ├── 001_InitialSchema.sql
│   │   ├── 002_Triggers.sql
│   │   └── MigrationRunner.cs
│   ├── Models/
│   │   ├── Authors.cs
│   │   ├── Book.cs
│   │   ├── Carts.cs
│   │   ├── CreditCard.cs
│   │   ├── CustomerOrders.cs
│   │   ├── Publisher.cs
│   │   ├── ReplenishmentOrder.cs
│   │   └── User.cs
│   ├── DTOs/
│   │   ├── Author/
│   │   ├── Book/
│   │   ├── Cart/
│   │   ├── CreditCard/
│   │   │   └── CreditCardDTO.cs
│   │   ├── CustomerOrders/
│   │   ├── Publisher/
│   │   ├── Report/
│   │   │   └── ReportDTO.cs
│   │   ├── ReplenishmentOrder/
│   │   └── User/
│   ├── Middleware/
│   │   └── GlobalLogger.cs
│   ├── openapi/
│   │   └── openapi.json
│   ├── Properties/
│   │   └── launchSettings.json
│   ├── appsettings.json
│   ├── appsettings.Development.json
│   ├── backend.csproj
│   ├── backend.http
│   └── Program.cs
├── frontend/
│   ├── app/
│   │   ├── signup/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── public/
│   ├── eslint.config.mjs
│   ├── next.config.ts
│   ├── package.json
│   ├── postcss.config.mjs
│   ├── tsconfig.json
│   └── README.md
├── database/
│   └── schema.sql
├── docs/
│   ├── Contribution Guidelines & Conventions.md
│   └── ERDdiagram.dot
├── tests/
│   └── backend/
│       ├── Controllers/
│       ├── Services/
│       ├── backend.Tests.csproj
│       └── UnitTest1.cs
├── compose.yaml
├── docker-compose.override.yml
├── Dockerfile.backend
├── Dockerfile.backend.dev
├── Dockerfile.frontend
├── Order_Processing_System.sln
├── package.json
└── README.md
```

---

## **Database**

The system includes the following main tables:

* `Books`
* `Authors`
* `BookAuthors`
* `Publishers`
* `PublisherPhones`
* `ReplenishmentOrder`
* `Users`
* `Cart`
* `CartItems`
* `CustomerOrder`
* `CustomerOrderItems`
* `CreditCard`

**Triggers & Constraints:**

* Prevent negative stock updates
* Automatic order creation when stock < threshold
* Update stock upon order confirmation

Sample ERD and relational schema are provided in `/database/schema.sql`.

---

## **API Endpoints**

**Examples:**

### Auth

| Method | Endpoint           | Description           |
| ------ | ------------------ | --------------------- |
| POST   | /api/auth/login    | Customer/Admin login  |
| POST   | /api/auth/register | Customer registration |

### Books

| Method | Endpoint          | Description                           |
| ------ | ----------------- | ------------------------------------- |
| GET    | /api/books        | List all books                        |
| GET    | /api/books/{isbn} | Get book details                      |
| GET    | /api/books/search | Search books by title/author/category |
| POST   | /api/books        | Add new book (Admin only)             |
| PUT    | /api/books/{isbn} | Update book (Admin only)              |
| DELETE | /api/books/{isbn} | Delete book (Admin only)              |

### Orders

| Method | Endpoint                 | Description                |
| ------ | ------------------------ | -------------------------- |
| POST   | /api/orders              | Place order (Admin only)   |
| PUT    | /api/orders/{id}/confirm | Confirm order (Admin only) |
| GET    | /api/orders              | List all orders            |

### Shopping Cart

| Method | Endpoint             | Description          |
| ------ | -------------------- | -------------------- |
| GET    | /api/cart            | Get customer cart    |
| POST   | /api/cart/items      | Add item to cart     |
| DELETE | /api/cart/items/{id} | Remove item from cart |
| POST   | /api/cart/checkout   | Complete purchase    |

### Credit Cards

| Method | Endpoint                 | Description                    |
| ------ | ------------------------ | ------------------------------ |
| GET    | /api/credit-cards        | Get saved credit cards         |
| POST   | /api/credit-cards        | Add new credit card (encrypted)|
| DELETE | /api/credit-cards/{id}   | Delete credit card             |

### Reports (Admin Only)

| Method | Endpoint                                        | Description                      |
| ------ | ----------------------------------------------- | -------------------------------- |
| GET    | /api/reports/sales/previous-month               | Previous month total sales       |
| GET    | /api/reports/sales/by-date?date={yyyy-MM-dd}    | Sales for specific date          |
| GET    | /api/reports/customers/top-5                    | Top 5 customers (last 3 months)  |
| GET    | /api/reports/books/top-10                       | Top 10 selling books (last 3 months)|
| GET    | /api/reports/books/{isbn}/replenishment-orders  | Replenishment orders for book    |

> For full OpenAPI documentation, see **[(OpenAPI YAML)](docs/openapi-schema.yaml)**  

---

## **Setup & Deployment (Docker Compose)**

### 1. Clone Repository

```bash
git clone https://github.com/AhmWael/Order_Processing_System.git
cd Order_Processing_System
```

### 2. Build and Run

```bash
docker-compose up --build
```

This will start:

* Backend: `http://localhost:5000`
* Frontend: `http://localhost:3000`
* Database: SQL Server/PostgreSQL container

### 3. Apply Database Schema

```bash
docker exec -i <db-container> psql -U <user> -d <dbname> < database/schema.sql
docker exec -i <db-container> psql -U <user> -d <dbname> < database/seed.sql
docker exec -i <db-container> psql -U <user> -d <dbname> < database/triggers.sql
```

### 4. Access Application

* Frontend: `http://localhost:3000`
* API Swagger Docs: `http://localhost:5000/swagger`

---

## **Testing**

### Backend Unit Tests

```bash
cd backend
dotnet test
```

### Frontend Tests

```bash
cd frontend
npm install
npm run test
```

---

## **License**

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

