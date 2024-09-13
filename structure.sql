> book - id, title, description, language, category_id, volume_id, year, publisher, authors
> book_offert - id, book_id, state, price, count
> category - id, name, parent_category
> user - id, name, mail, password_hash
> volume - id, name

> cart_session - id, user_id, discount_percent, total
> cart_item - id, cart_session_id, book_offert, quantity

> order - id, user_id, total, discount_percent <payment and address info and if realized>
> order_item - id, order_id, book_offert, quantity

CREATE TABLE volume (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE category (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_category INT,
    FOREIGN KEY (parent_category) REFERENCES category(id)
);

CREATE TABLE book (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    language VARCHAR(50),
    category_id INT,
    volume_id INT,
    year INT,
    publisher VARCHAR(255),
    authors VARCHAR(255),
    image_path VARCHAR(255),
    FOREIGN KEY (category_id) REFERENCES category(id),
    FOREIGN KEY (volume_id) REFERENCES volume(id)
);

CREATE TABLE book_offer (
    id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT,
    state VARCHAR(50),
    price DECIMAL(10, 2),
    count INT,
    FOREIGN KEY (book_id) REFERENCES book(id)
);

CREATE TABLE user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    mail VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE cart_session (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    discount_percent DECIMAL(5, 2),
    total DECIMAL(10, 2),
    FOREIGN KEY (user_id) REFERENCES user(id)
);

CREATE TABLE cart_item (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cart_session_id INT,
    book_offer INT,
    quantity INT,
    FOREIGN KEY (cart_session_id) REFERENCES cart_session(id),
    FOREIGN KEY (book_offer) REFERENCES book_offer(id)
);

CREATE TABLE `order` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    total DECIMAL(10, 2),
    discount_percent DECIMAL(5, 2),
    -- Future fields for payment info, address, and if realized will go here
    FOREIGN KEY (user_id) REFERENCES user(id)
);

CREATE TABLE order_item (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    book_offer INT,
    quantity INT,
    FOREIGN KEY (order_id) REFERENCES `order`(id),
    FOREIGN KEY (book_offer) REFERENCES book_offer(id)
);
