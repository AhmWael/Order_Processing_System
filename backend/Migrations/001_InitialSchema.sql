CREATE TABLE IF NOT EXISTS __MigrationsHistory (
    MigrationId VARCHAR(50) PRIMARY KEY,
    AppliedOn TIMESTAMP DEFAULT NOW()
);

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1) Publishers
CREATE TABLE publisher (
    publisher_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    publisher_name VARCHAR(255) NOT NULL,
    address VARCHAR(255)
);

CREATE TABLE publisher_phone (
    publisher_id UUID,
    phone VARCHAR(20) NOT NULL,
    PRIMARY KEY (publisher_id, phone),
    FOREIGN KEY (publisher_id) REFERENCES publisher(publisher_id)
);

-- 2) Authors
CREATE TABLE author (
    author_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_name VARCHAR(255) NOT NULL
);

-- 3) Books
CREATE TABLE book (
    isbn VARCHAR(13) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    pub_id UUID NOT NULL REFERENCES publisher(publisher_id),
    pub_year INT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(20) NOT NULL CHECK (category IN ('Science','Art','Religion','History','Geography')),
    stock INT NOT NULL,
    threshold INT NOT NULL
);

CREATE TABLE book_author (
    isbn VARCHAR(13) REFERENCES book(isbn) ON DELETE CASCADE,
    author_id UUID REFERENCES author(author_id) ON DELETE CASCADE,
    PRIMARY KEY (isbn, author_id)
);

-- 4) Replenishment Orders
CREATE TABLE replenishment_order (
    order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    isbn VARCHAR(13) NOT NULL REFERENCES book(isbn),
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    quantity INT NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('Pending','Confirmed'))
);

-- 5) Users
CREATE TABLE "user" (
    u_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) UNIQUE,
    address VARCHAR(255),
    role VARCHAR(10) NOT NULL CHECK (role IN ('Admin','Customer'))
);

-- 6) Shopping Carts
CREATE TABLE cart (
    cart_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    u_id UUID NOT NULL REFERENCES "user"(u_id)
);

CREATE TABLE cart_item (
    cart_id UUID REFERENCES cart(cart_id) ON DELETE CASCADE,
    isbn VARCHAR(13) REFERENCES book(isbn),
    quantity INT NOT NULL,
    PRIMARY KEY (cart_id, isbn)
);

-- 7) Customer Orders
CREATE TABLE customer_order (
    order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    u_id UUID NOT NULL REFERENCES "user"(u_id),
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_price DECIMAL(10,2) NOT NULL
);

CREATE TABLE customer_order_item (
    order_id UUID REFERENCES customer_order(order_id) ON DELETE CASCADE,
    isbn VARCHAR(13) REFERENCES book(isbn),
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (order_id, isbn)
);

-- 8) Credit Cards
CREATE TABLE credit_card (
    card_number VARCHAR(16) PRIMARY KEY,
    u_id UUID NOT NULL REFERENCES "user"(u_id),
    cardholder_name VARCHAR(255) NOT NULL,
    expiration_date CHAR(5) NOT NULL
);
