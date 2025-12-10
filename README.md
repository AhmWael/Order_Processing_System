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
* Checkout with credit card validation
* View past orders

### System Features

* Raw SQL queries with integrity constraints
* Triggers for automatic stock management
* JWT-based authentication
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
OrderProcessingSystem/
├── backend/
│   ├── Controllers/
│   ├── Services/
│   ├── Repositories/
│   ├── Migrations/
│   ├── Models/
│   ├── DTOs/
│   ├── Utilities/
│   ├── appsettings.json
│   ├── Program.cs
│   └── Startup.cs
├── frontend/
│   ├── pages/
│   ├── components/
│   ├── public/
│   ├── styles/
│   ├── package.json
│   └── next.config.js
├── database/
│   ├── schema.sql
│   ├── seed.sql
│   └── triggers.sql
├── docs/
│   └── openapi.yaml
├── docker-compose.yml
├── Dockerfile.backend
├── Dockerfile.frontend
├── tests/
│   ├── backend/
│   └── frontend/
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

| Method | Endpoint       | Description               |
| ------ | -------------- | ------------------------- |
| GET    | /api/cart      | Get customer cart         |
| POST   | /api/cart      | Add item to cart          |
| PUT    | /api/cart/{id} | Update cart item quantity |
| DELETE | /api/cart/{id} | Remove item from cart     |

### Sales / Checkout

| Method | Endpoint            | Description                    |
| ------ | ------------------- | ------------------------------ |
| POST   | /api/checkout       | Complete purchase              |
| GET    | /api/orders/history | Get past orders for a customer |

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

