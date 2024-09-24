import { createPool } from 'mysql2/promise';
import { readFileSync } from 'fs';
import { resolve } from "path";
import { User } from '../models/user.mjs';
import { BookOffer, BookPriceOption, BookFilter, BookFilterItem } from '../models/book_offer.mjs';
import { Cart, CartBookView } from '../models/cart.mjs';

const __dirname = import.meta.dirname;

class DBHandler {
    constructor(host, user, password, database, port) {
        try{
            this.pool = createPool({
                host: host,
                user: user,
                password: password,
                database: database,
                port: port,
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0,
                multipleStatements: true
            });
        }catch(err){
            console.error(err);
        }
    }

    async initDatabase() {
        let structureFilePath = resolve(__dirname, 'structure.sql');
        try {
            const sql = readFileSync(structureFilePath, 'utf-8');

            const conn = await this.pool.getConnection();
            await conn.query(sql);
            conn.release();

            console.log('Database initialized successfully.');
        } catch (error) {
            console.error('Error initializing the database:', error);
        }
    }

    async truncateDatabase() {
        try {
            const truncateQuery = `
                SET FOREIGN_KEY_CHECKS = 0;
                TRUNCATE TABLE book_option;
                TRUNCATE TABLE book;
                TRUNCATE TABLE category;
                TRUNCATE TABLE volume;
                TRUNCATE TABLE language;
                TRUNCATE TABLE state;
                TRUNCATE TABLE user;
                TRUNCATE TABLE cart_session;
                TRUNCATE TABLE cart_item;
                SET FOREIGN_KEY_CHECKS = 1;
            `;

            const conn = await this.pool.getConnection();
            await conn.query(truncateQuery);
            conn.release();

            console.log('Database truncated successfully.');
        } catch (error) {
            console.error('Error truncating the database:', error);
        }
    }

    async getBookFilters() {
        const conn = await this.pool.getConnection();

        const filters = [
            {name: "category", display_name: "Kategoria"},
            {name: "language", display_name: "Język"},
            {name: "state", display_name: "Stan"}
        ];

        const getItemsForFilter = async (filter) => {
            const [rows] = await conn.query(`SELECT * FROM ${filter.name}`);
            return rows.map(i => new BookFilterItem(i.id, i.name));
        };

        const result = await Promise.all(filters.map(async filter => {
            return new BookFilter(filter.name, filter.display_name, await getItemsForFilter(filter));
        }));

        conn.release();

        return result;
    }

    async getBookWithPriceOptions(bookId) {
        const conn = await this.pool.getConnection();

        const bookQuery = `
            SELECT b.id, b.title, b.description, b.year, b.publisher, b.authors, b.image_path, l.name as language
            FROM book b
            LEFT JOIN language l ON b.language_id = l.id
            WHERE b.id = ?
        `;
        const priceOptionsQuery = `
            SELECT bo.id, s.name AS state, bo.price
            FROM book_option bo
            LEFT JOIN state s ON bo.state_id = s.id
            WHERE bo.book_id = ?
            ORDER BY bo.price ASC
        `;
        
        const [bookData] = await conn.query(bookQuery, [bookId]);
        const [priceOptions] = await conn.query(priceOptionsQuery, [bookId]);

        if (bookData.length === 0) return null;

        const book = bookData[0];
        const bookPriceOptions = priceOptions.map(option => new BookPriceOption(option.id, option.state, option.price));

        conn.release();
        
        return new BookOffer(book.id, book.title, book.description, book.language, book.year, book.publisher, book.authors, book.image_path, bookPriceOptions);
    }

    async updateCartSessionTotal(userId) {
        const conn = await this.pool.getConnection();

        const totalQuery = `
            SELECT SUM(bo.price * ci.quantity) AS total
            FROM cart_item ci
            JOIN book_option bo ON ci.book_offer = bo.id
            JOIN cart_session cs ON ci.cart_session_id = cs.id
            WHERE cs.user_id = ?
        `;
        const [[{ total }]] = await conn.query(totalQuery, [userId]);

        const discountPercent = total > 200 ? 10 : total > 100 ? 5 : 0;

        const updateQuery = `
            UPDATE cart_session 
            SET total = ?, discount_percent = ?
            WHERE user_id = ?
        `;
        await conn.query(updateQuery, [total || 0, discountPercent, userId]);

        conn.release();
    } 

    //NOT USED CURRENTLY, TODO
    async clearCartSession(userId) {
        const conn = await this.pool.getConnection();

        const query = `
            DELETE ci
            FROM cart_item ci
            JOIN cart_session cs ON ci.cart_session_id = cs.id
            WHERE cs.user_id = ?
        `;
        const result = await conn.query(query, [userId]);
        console.log("clearCarSession");
        console.log(result);

        //await this.updateCartSessionTotal((await this.getUserCartSessionId(userId)));

        conn.release();
    }

    async updateCartItemQuantity(userId, bookOptionId, quantity) {
        const conn = await this.pool.getConnection();

        try {
            const updateQuery = `
                UPDATE cart_item ci
                JOIN cart_session cs ON ci.cart_session_id = cs.id
                SET ci.quantity = ?
                WHERE cs.user_id = ? AND ci.book_offer = ?
            `;

            await conn.query(updateQuery, [quantity, userId, bookOptionId]);

            await this.updateCartSessionTotal(userId);

        } catch (error) {
            console.error('Error updating cart item quantity:', error);
            throw error;
        } finally {
            conn.release();
        }
    }

    async deleteCartItem(userId, bookOptionId) {
        const conn = await this.pool.getConnection();

        try {
            const deleteQuery = `
                DELETE ci FROM cart_item ci
                JOIN cart_session cs ON ci.cart_session_id = cs.id
                WHERE cs.user_id = ? AND ci.book_offer = ?
            `;

            await conn.query(deleteQuery, [userId, bookOptionId]);

            await this.updateCartSessionTotal(userId);

        } catch (error) {
            console.error('Error deleting cart item:', error);
            throw error;
        } finally {
            conn.release();
        }
    }

    async getCartItem(userId, bookOptionId) {
        const conn = await this.pool.getConnection();

        const query = `
            SELECT ci.id, ci.quantity
            FROM cart_item ci
            JOIN cart_session cs ON ci.cart_session_id = cs.id
            WHERE cs.user_id = ? AND ci.book_offer = ?
        `;
        const [result] = await conn.query(query, [userId, bookOptionId]);
        
        conn.release();

        return result.length > 0 ? result[0] : null;
    }

    async getUserCart(userId) {
        const conn = await this.pool.getConnection();

        try {
            const bookDetailsQuery = `
                SELECT bo.id AS option_id, b.title, b.authors, s.name as state, bo.price, ci.quantity,
                       (bo.price * ci.quantity) AS total_price
                FROM cart_item ci
                JOIN book_option bo ON ci.book_offer = bo.id
                JOIN book b ON bo.book_id = b.id
                JOIN state s ON bo.state_id = s.id
                JOIN cart_session cs ON ci.cart_session_id = cs.id
                WHERE cs.user_id = ?
            `;

            const [booksData] = await conn.query(bookDetailsQuery, [userId]);

            const books = booksData.map(book => new CartBookView(
                book.option_id,
                book.title,
                book.authors,
                book.state,
                book.price,
                book.quantity,
                book.total_price
            ));

            const cartSessionQuery = `
                SELECT total, discount_percent 
                FROM cart_session 
                WHERE user_id = ?
            `;
            const [[cartSession]] = await conn.query(cartSessionQuery, [userId]);

            const sum = books.reduce((acc, book) => acc + book.total_price, 0);
            const discount = (cartSession.discount_percent / 100) * sum;
            const total = sum - discount;

            return new Cart(sum, discount, total, books);
        } catch (error) {
            console.error('Error retrieving user cart:', error);
            throw error;
        } finally {
            conn.release();
        }
    }

    async incrementCartItem(cartItemId) {
        const conn = await this.pool.getConnection();
        const query = `UPDATE cart_item SET quantity = quantity + 1 WHERE id = ?`;

        await conn.query(query, [cartItemId]);

        conn.release();
    }

    async addBookToCart(userId, bookOptionId) {
        const conn = await this.pool.getConnection();

        const sessionQuery = `SELECT id FROM cart_session WHERE user_id = ?`;
        let [cartSession] = await conn.query(sessionQuery, [userId]);

        const cartSessionId = cartSession[0].id;
        
        const existingCartItem = await this.getCartItem(userId, bookOptionId);
        if (existingCartItem) {
            await this.incrementCartItem(existingCartItem.id);
        } else {
            const insertItem = `INSERT INTO cart_item (cart_session_id, book_offer, quantity) VALUES (?, ?, 1)`;
            await conn.query(insertItem, [cartSessionId, bookOptionId]);
        }

        await this.updateCartSessionTotal(userId);

        conn.release();
    }

    async addUser(name, mail, passwordHash) {
        try {
            const query = `INSERT INTO user (name, mail, password_hash) VALUES (?, ?, ?)`;
            const conn = await this.pool.getConnection();
            const [result] = await conn.query(query, [name, mail, passwordHash]);

            const userId = result.insertId;

            const insertSession = `INSERT INTO cart_session (user_id, discount_percent, total) VALUES (?, 0, 0)`;
            await conn.query(insertSession, [userId]);

            conn.release();

            console.log('User added successfully.');
        } catch (error) {
            console.error('Error adding user:', error);
            throw error;
        }
    }

    async findUserByEmail(mail) {
        try {
            const query = `SELECT * FROM user WHERE mail = ?`;
            const conn = await this.pool.getConnection();
            const [rows] = await conn.query(query, [mail]);
            conn.release();

            if(rows[0]) {
                return new User(rows[0].id, rows[0].mail, rows[0].name, rows[0].password_hash);
            }

            return null;
        } catch (error) {
            console.error('Error fetching user:', error);
            throw error;
        }
    }

    async getBookOffers(search_query = null, category_id = null, lang_id = null, state_id = null) {
        try {
            const conn = await this.pool.getConnection();

            let query = `
                SELECT 
                    b.id, b.title, b.description, b.year, b.publisher, b.authors, b.image_path, bo.price, 
                    l.name as language, s.name as state,
                    bo.state_id as state_id
                FROM book b
                LEFT JOIN language l ON b.language_id = l.id
                LEFT JOIN book_option bo ON bo.book_id = b.id
                LEFT JOIN state s ON bo.state_id = s.id
                LEFT JOIN category c ON b.category_id = c.id
                WHERE 1=1
            `;

            const params = [];

            // Filters:
            if (search_query) {
                query += ` AND b.title LIKE ?`;
                params.push(`%${search_query}%`);
            }
            if (category_id) {
                query += ` AND b.category_id = ?`;
                params.push(category_id);
            }
            if (lang_id) {
                query += ` AND b.language_id = ?`;
                params.push(lang_id);
            }
            if (state_id) {
                query += ` AND bo.state_id = ?`;
                params.push(state_id);
            }

            const [rows] = await conn.execute(query, params);

            const bookOffers = rows.reduce((offers, row) => {
                let existingOffer = offers.find(offer => offer.id === row.id);

                if (!existingOffer) {
                    existingOffer = new BookOffer(
                        row.id,
                        row.title,
                        row.description,
                        row.language,
                        row.year,
                        row.publisher,
                        row.authors,
                        row.image_path,
                        []
                    );
                    offers.push(existingOffer);
                }

                existingOffer.price_options.push(
                    new BookPriceOption(
                        row.state_id,
                        row.state,
                        row.price
                    )
                );

                return offers;
            }, []);

            conn.release();
            return bookOffers;
        } catch (error) {
            console.error('Error fetching book offers:', error);
        }
    }
}

export default DBHandler;
