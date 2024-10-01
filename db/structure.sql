CREATE TABLE IF NOT EXISTS series (
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
    series_id INT,
    volume INT,
    year INT,
    publisher VARCHAR(255),
    authors VARCHAR(255),
    image_path VARCHAR(255),
    FOREIGN KEY (category_id) REFERENCES category(id),
    FOREIGN KEY (series_id) REFERENCES series(id),
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

INSERT INTO series (name) VALUES 
('II wojna światowa.');

INSERT INTO language (name) VALUES 
('Angielski'), 
('Polski');

INSERT INTO state (name) VALUES 
('Nowy'), 
('Bardzo dobry'), 
('Dobry'), 
('Zniszczone');

INSERT INTO category (name, parent_category) VALUES 
('Podręczniki', NULL), 
('Katalogi', NULL), 
('Informatory', NULL), 
('Przewodniki', NULL), 
('Atlasy', NULL), 
('Albumy', NULL), 
('Beletrystyka', NULL), 
('Historia', NULL), 
('I wojna światowa', 8),
('II wojna światowa', 8),
('Czasy starożytne', 8);

INSERT INTO book (title, description, language_id, category_id, series_id, volume, year, publisher, authors, image_path) 
VALUES 
('W pustyni i w puszczy', 'Przygody polskiego chłopca i afrykańskiej dziewczynki w Afryce.', 2, 7, NULL, NULL, 1911, 'Gebethner i Wolff', 'Henryk Sienkiewicz', 'example1.jpg'),
('Krzyżacy', 'Opowieść o wojnie Polski z Zakonem Krzyżackim.', 2, 7, NULL, NULL, 1900, 'Gebethner i Wolff', 'Henryk Sienkiewicz', 'example2.jpg'),
('Przewodnik po Paryżu', 'Praktyczny przewodnik po atrakcjach i kulturze Paryża.', 2, 4, NULL, NULL, 2021, 'Pascal', 'Piotr Kowalski', 'example3.jpg'),
('Atlas geograficzny', 'Zbiór map świata, kontynentów i państw.', 2, 5, NULL, NULL, 2019, 'Demart', 'Jan Nowak', 'example4.jpg'),
('Historia starożytna', 'Książka opisująca starożytne cywilizacje, takie jak Egipt i Mezopotamia.', 2, 11, NULL, NULL, 2015, 'Wydawnictwo Literackie', 'Tadeusz Zieliński', 'example5.jpg'),
('Bitwa pod Verdun', 'Opowieść o jednej z najważniejszych bitew I wojny światowej.', 2, 9, NULL, NULL, 2017, 'Znak', 'Jacek Kaczmarek', 'example6.jpg'),
('II wojna światowa. Tom 1', 'Kompleksowa historia drugiej wojny światowej.', 2, 10, 1, 1, 2005, 'Zysk i S-ka', 'Norman Davies', 'example7.jpg'),
('II wojna światowa. Tom 2', 'Jeszcze więcej wojny.', 2, 10, 1, 2, 2008, 'Zysk i S-ka', 'Norman Davies', 'example7.jpg'),
('Przewodnik po Włoszech', 'Wszystko, co trzeba wiedzieć o podróży po Włoszech.', 2, 4, NULL, NULL, 2019, 'Pascal', 'Anna Nowak', 'example8.jpg'),
('Album Sztuki Renesansowej', 'Piękne ilustracje i historie dzieł sztuki renesansowej.', 2, 6, NULL, NULL, 2018, 'Arkady', 'Jan Kowalski', 'example9.jpg'),
('Angielskie idiomy', 'Zbiór najczęściej używanych angielskich idiomów.', 1, 3, NULL, NULL, 2020, 'Oxford University Press', 'John Smith', 'example10.jpg');

INSERT INTO book_option (book_id, state_id, price, count) 
VALUES 
(1, 1, 15.99, 10), 
(1, 3, 10.99, 0), 
(2, 1, 18.99, 0),
(3, 1, 19.50, 15),
(4, 2, 25.00, 7), 
(5, 1, 22.00, 12),
(5, 2, 12.00, 12),
(5, 3, 10.00, 15),
(6, 3, 9.99, 6),
(7, 2, 30.00, 8),
(7, 3, 12.00, 0),
(8, 1, 17.99, 10),
(9, 1, 34.99, 5),
(10, 1, 12.99, 20);
