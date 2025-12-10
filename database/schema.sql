CREATE DATABASE order_system;
USE order_system;

-- 1) Books

CREATE TABLE PUBLISHER (
    publisher_id INT AUTO_INCREMENT,
    publisher_name VARCHAR(255) NOT NULL,
    address VARCHAR(255),
    phone VARCHAR(20),
    PRIMARY KEY (publisher_id)
);

CREATE TABLE PUBLISHER_PHONE (
    publisher_id INT,
    phone VARCHAR(20),
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
    category VARCHAR(255) NOT NULL,
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
CREATE TABLE ORDER (
    order_id INT AUTO_INCREMENT,
    isbn VARCHAR(13) NOT NULL,
    order_date DATE NOT NULL,
    quantity INT NOT NULL,
    status VARCHAR(20) NOT NULL,
    CHECK (status IN ('Pending', 'Confirmed')),
    PRIMARY KEY (order_id),
    FOREIGN KEY (isbn) REFERENCES BOOK(isbn)
);
