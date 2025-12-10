CREATE DATABASE order_system;
USE order_system;

-- 1) Books

CREATE TABLE PUBLISHER (
    publisher_id INT AUTO_INCREMENT,
    publisher_name VARCHAR(255) NOT NULL,
    `address` VARCHAR(255),
    PRIMARY KEY (publisher_id)
);

CREATE TABLE PUBLISHER_PHONE (
    publisher_id INT,
    phone VARCHAR(20) UNIQUE,
    PRIMARY KEY (publisher_id, phone),
    FOREIGN KEY (publisher_id) REFERENCES PUBLISHER(publisher_id)
);

CREATE TABLE AUTHOR (
    author_id INT AUTO_INCREMENT,
    author_name VARCHAR(255) NOT NULL,
    PRIMARY KEY (author_id)
);

CREATE TABLE BOOK (
    isbn VARCHAR(13),
    title VARCHAR(255) NOT NULL,
    pub_id INT NOT NULL,
    pub_year INT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(9) NOT NULL,
    CHECK (category IN ('Science', 'Art', 'Religion', 'History', 'Geography')),
    stock INT NOT NULL,
    threshold INT NOT NULL,
    PRIMARY KEY (isbn),
    FOREIGN KEY (pub_id) REFERENCES PUBLISHER(publisher_id)
);

CREATE TABLE BOOK_AUTHOR (
    isbn VARCHAR(13),
    author_id INT,
    PRIMARY KEY (isbn, author_id),
    FOREIGN KEY (isbn) REFERENCES BOOK(isbn),
    FOREIGN KEY (author_id) REFERENCES AUTHOR(author_id)
);

-- 2) Orders

-- Replenishment
CREATE TABLE `ORDER` (
    order_id INT AUTO_INCREMENT,
    isbn VARCHAR(13) NOT NULL,
    order_date DATE NOT NULL,
    quantity INT NOT NULL,
    `status` VARCHAR(20) NOT NULL,
    CHECK (`status` IN ('Pending', 'Confirmed')),
    PRIMARY KEY (order_id),
    FOREIGN KEY (isbn) REFERENCES BOOK(isbn)
);

-- 3) Users

CREATE TABLE `USER` (
    u_id INT AUTO_INCREMENT,   -- hash
    username VARCHAR(255) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) UNIQUE,
    `address` VARCHAR(255),
    `role` VARCHAR(5) NOT NULL,
    CHECK (`role` IN ('Admin', 'Staff')),
    PRIMARY KEY (u_id)
);

-- 4) Carts

CREATE TABLE CART (
    cart_id INT AUTO_INCREMENT,
    u_id INT NOT NULL,
    PRIMARY KEY (cart_id),
    FOREIGN KEY (u_id) REFERENCES `USER`(u_id)
);

CREATE TABLE CART_ITEM (
    cart_id INT,
    isbn VARCHAR(13),
    quantity INT NOT NULL,
    PRIMARY KEY (cart_id, isbn),
    FOREIGN KEY (cart_id) REFERENCES CART(cart_id),
    FOREIGN KEY (isbn) REFERENCES BOOK(isbn)
);

CREATE TABLE CUSTOMER_ORDER (
    order_id INT AUTO_INCREMENT,
    u_id INT NOT NULL,
    order_date DATE NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (order_id),
    FOREIGN KEY (u_id) REFERENCES `USER`(u_id)
);

CREATE TABLE CUSTOMER_ORDER_ITEM (
    order_id INT,
    isbn VARCHAR(13),
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (order_id, isbn),
    FOREIGN KEY (order_id) REFERENCES CUSTOMER_ORDER(order_id),
    FOREIGN KEY (isbn) REFERENCES BOOK(isbn)
);

CREATE TABLE CREDIT_CARD (
    card_number VARCHAR(16),
    u_id INT NOT NULL,
    cardholder_name VARCHAR(255) NOT NULL,
    expiration_date CHAR(5) NOT NULL,
    PRIMARY KEY (card_number),
    FOREIGN KEY (u_id) REFERENCES `USER`(u_id)
);
