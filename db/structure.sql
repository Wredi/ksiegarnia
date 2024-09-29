CREATE TABLE IF NOT EXISTS volume (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS language (
    id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS state (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS category (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_category INT,
    FOREIGN KEY (parent_category) REFERENCES category(id)
);

CREATE TABLE IF NOT EXISTS book (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    language_id INT,
    category_id INT,
    volume_id INT,
    year INT,
    publisher VARCHAR(255),
    authors VARCHAR(255),
    image_path VARCHAR(255),
    FOREIGN KEY (category_id) REFERENCES category(id),
    FOREIGN KEY (volume_id) REFERENCES volume(id),
    FOREIGN KEY (language_id) REFERENCES language(id)
);

CREATE TABLE IF NOT EXISTS book_option (
    id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT,
    state_id INT,
    price DECIMAL(10, 2),
    count INT,
    FOREIGN KEY (book_id) REFERENCES book(id),
    FOREIGN KEY (state_id) REFERENCES state(id)
);

CREATE TABLE IF NOT EXISTS user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    mail VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS cart_session (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    discount_percent DECIMAL(5, 2),
    sum DECIMAL(10, 2),
    FOREIGN KEY (user_id) REFERENCES user(id)
);

CREATE TABLE IF NOT EXISTS cart_item (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cart_session_id INT,
    book_offer INT,
    quantity INT,
    FOREIGN KEY (cart_session_id) REFERENCES cart_session(id),
    FOREIGN KEY (book_offer) REFERENCES book_option(id)
);

/*CREATE TABLE IF NOT EXISTS `order` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    total DECIMAL(10, 2),
    discount_percent DECIMAL(5, 2),
    -- Future fields for payment info, address, and if realized will go here
    FOREIGN KEY (user_id) REFERENCES user(id)
);

CREATE TABLE IF NOT EXISTS order_item (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    book_offer INT,
    quantity INT,
    FOREIGN KEY (order_id) REFERENCES `order`(id),
    FOREIGN KEY (book_offer) REFERENCES book_offer(id)
);*/

-- Insert into volume
INSERT INTO volume (name) VALUES 
('Volume 1'), 
('Volume 2'), 
('Volume 3'),
('Special Edition Volume 1');

-- Insert into language
INSERT INTO language (name) VALUES 
('English'), 
('Spanish'), 
('German'),
('French'),
('Italian');

-- Insert into state
INSERT INTO state (name) VALUES 
('New'), 
('Used'), 
('Damaged');

-- Insert into category (with some subcategories)
INSERT INTO category (name, parent_category) VALUES 
('Fiction', NULL), 
('Non-Fiction', NULL), 
('Science Fiction', 1), 
('Fantasy', 1), 
('History', 2), 
('Biography', 2);

-- Insert more books
INSERT INTO book (title, description, language_id, category_id, volume_id, year, publisher, authors, image_path) 
VALUES 
('The Time Traveler', 'A journey through time in a thrilling sci-fi adventure.', 1, 3, 1, 2015, 'Orbit', 'H.G. Wells', 'time_traveler.jpg'),
('The Magic World', 'A fantasy land filled with magic and wonder.', 1, 4, 2, 2018, 'Penguin Random House', 'J.K. Rowling', 'magic_world.jpg'),
('The Great War', 'A detailed account of World War II.', 1, 5, 3, 2020, 'Oxford University Press', 'John Keegan', 'great_war.jpg'),
('La Vida de Picasso', 'Biography of Pablo Picasso.', 2, 6, 1, 2016, 'Editorial Planeta', 'José Martínez', 'picasso_bio.jpg'),
('Cien Años de Soledad', 'A masterpiece of magical realism.', 2, 1, 2, 1967, 'HarperCollins', 'Gabriel García Márquez', 'one_hundred_years.jpg'),
('Létranger', 'A classic existentialist novel.', 4, 1, 1, 1942, 'Gallimard', 'Albert Camus', 'stranger.jpg'),
('Dune', 'A science fiction epic in the far future.', 1, 3, 3, 1965, 'Ace Books', 'Frank Herbert', 'dune.jpg'),
('Il Nome della Rosa', 'A historical murder mystery set in a medieval monastery.', 5, 5, 1, 1980, 'Bompiani', 'Umberto Eco', 'name_of_rose.jpg');

-- Insert book options (states and prices for different books)
INSERT INTO book_option (book_id, state_id, price, count) 
VALUES 
(1, 1, 12.99, 15), -- The Time Traveler (New)
(1, 2, 9.99, 8),  -- The Time Traveler (Used)
(2, 1, 18.50, 20), -- The Magic World (New)
(3, 1, 25.00, 10), -- The Great War (New)
(3, 2, 15.50, 5),  -- The Great War (Used)
(4, 1, 22.00, 7),  -- La Vida de Picasso (New)
(5, 1, 30.00, 12), -- Cien Años de Soledad (New)
(6, 1, 10.99, 6),  -- Létranger (New)
(7, 1, 19.99, 18), -- Dune (New)
(7, 2, 12.99, 5),  -- Dune (Used)
(8, 1, 14.99, 10); -- Il Nome della Rosa (New)
