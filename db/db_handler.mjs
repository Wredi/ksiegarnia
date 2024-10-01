import { createPool } from 'mysql2/promise';
import { readFileSync } from 'fs';
import { resolve } from "path";
import { User } from '../models/user.mjs';
import { BookOfferView, BookOffer, BookPriceOption, BookFilter, BookFilterItem } from '../models/book_offer.mjs';
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
            { name: "category", display_name: "Kategoria" },
            { name: "language", display_name: "Język" },
            { name: "state", display_name: "Stan" }
        ];

        const getCategoryItems = async () => {
            const [rows] = await conn.query(`SELECT * FROM category`);
            
            const categoryMap = new Map();

            const parentCategories = rows.filter(row => row.parent_category === null);
            
            parentCategories.forEach(row => {
                categoryMap.set(row.id, new BookFilterItem(row.id, row.name, []));
            });

            rows.forEach(row => {
                if (row.parent_category) {
                    const parentItem = categoryMap.get(row.parent_category);
                    if (parentItem) {
                        parentItem.child_items.push(new BookFilterItem(row.id, row.name, []));
                    }
                }
            });

            return [...categoryMap.values()];
        };

        const getItemsForFilter = async (filter) => {
            if (filter.name === "category") {
                return getCategoryItems();
            }

            const [rows] = await conn.query(`SELECT * FROM ${filter.name}`);
            return rows.map(i => new BookFilterItem(i.id, i.name, []));
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
            SELECT b.id, b.title, b.description, b.year, b.publisher, b.authors, b.image_path, l.name as language,
            b.series_id, sr.name as series_name, b.volume
            FROM book b
            LEFT JOIN language l ON b.language_id = l.id
            LEFT JOIN series sr ON b.series_id = sr.id
            WHERE b.id = ?
        `;
        const priceOptionsQuery = `
            SELECT bo.id, s.name AS state, bo.price, bo.count
            FROM book_option bo
            LEFT JOIN state s ON bo.state_id = s.id
            WHERE bo.book_id = ?
            ORDER BY bo.price ASC
        `;
        
        const [bookData] = await conn.query(bookQuery, [bookId]);
        const [priceOptions] = await conn.query(priceOptionsQuery, [bookId]);

        if (bookData.length === 0) return null;

        const book = bookData[0];
        const bookPriceOptions = priceOptions.map(option => new BookPriceOption(option.id, option.state, option.price, option.count));

        conn.release();
        
        return new BookOffer(
            book.id, book.title, book.description, book.language, book.year, 
            book.publisher, book.authors, book.series_id, book.series_name, 
            book.volume, book.image_path, bookPriceOptions
        );
    }

    async updateCartSessionTotal(userId) {
        const conn = await this.pool.getConnection();

        const totalQuery = `
            SELECT SUM(bo.price * ci.quantity) AS sum
            FROM cart_item ci
            JOIN book_option bo ON ci.book_offer = bo.id
            JOIN cart_session cs ON ci.cart_session_id = cs.id
            WHERE cs.user_id = ?
        `;
        const [[{ sum }]] = await conn.query(totalQuery, [userId]);

        const discountPercent = sum > 200 ? 10 : sum > 100 ? 5 : 0;

        const updateQuery = `
            UPDATE cart_session 
            SET sum = ?, discount_percent = ?
            WHERE user_id = ?
        `;
        await conn.query(updateQuery, [sum || 0, discountPercent, userId]);

        conn.release();
    } 

    async processPayment(userId) {
        const conn = await this.pool.getConnection();

        try {
            await conn.beginTransaction();

            const cartItemsQuery = `
                SELECT bo.id AS book_option_id, ci.quantity 
                FROM cart_item ci
                JOIN book_option bo ON ci.book_offer = bo.id
                JOIN cart_session cs ON ci.cart_session_id = cs.id
                WHERE cs.user_id = ?
            `;
            const [cartItems] = await conn.query(cartItemsQuery, [userId]);

            for (const item of cartItems) {
                const updateStockQuery = `
                    UPDATE book_option 
                    SET count = count - ? 
                    WHERE id = ? AND count >= ?
                `;
                const [updateResult] = await conn.query(updateStockQuery, [item.quantity, item.book_option_id, item.quantity]);

                if (updateResult.affectedRows === 0) {
                    throw new Error(`Not enough stock for book option ID: ${item.book_option_id}`);
                }
            }

            const deleteCartItemsQuery = `
                DELETE ci FROM cart_item ci
                JOIN cart_session cs ON ci.cart_session_id = cs.id
                WHERE cs.user_id = ?
            `;
            await conn.query(deleteCartItemsQuery, [userId]);

            const updateCartSessionQuery = `
                UPDATE cart_session 
                SET sum = 0, discount_percent = 0 
                WHERE user_id = ?
            `;
            await conn.query(updateCartSessionQuery, [userId]);

            await conn.commit();
        } catch (error) {
            await conn.rollback();
            console.error('Error processing payment:', error);
            throw error;
        } finally {
            conn.release();
        }
    }

    async updateCartItemQuantity(userId, bookOptionId, quantity) {
        const conn = await this.pool.getConnection();

        try {
            const updateQuery = `
                UPDATE cart_item ci
                JOIN book_option bo ON bo.id = ci.book_offer
                JOIN cart_session cs ON ci.cart_session_id = cs.id
                SET ci.quantity = LEAST(bo.count, ?)
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
                SELECT bo.id AS option_id, b.title, b.authors, b.image_path, s.name as state, bo.price, ci.quantity,
                       (bo.price * ci.quantity) AS total_price, bo.count as available_quantity
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
                book.image_path,
                book.state,
                book.price,
                book.quantity,
                book.total_price,
                book.available_quantity
            ));

            const cartSessionQuery = `
                SELECT 
                    sum, 
                    discount_percent, 
                    TRUNCATE((discount_percent / 100) * sum, 2) AS discount_sum,
                    sum - (SELECT discount_sum) AS total
                FROM cart_session 
                WHERE user_id = ?
            `;
            const [[cartSession]] = await conn.query(cartSessionQuery, [userId]);

            return new Cart(cartSession.sum, cartSession.discount_percent, cartSession.discount_sum, cartSession.total, books);
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

            const insertSession = `INSERT INTO cart_session (user_id, discount_percent, sum) VALUES (?, 0, 0)`;
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

    async getBookViews(search_query = null, category_id = null, lang_id = null, state_id = null, limit = null) {
        try {
            const conn = await this.pool.getConnection();

            let query = `
                SELECT 
                    b.id, b.image_path, b.title, b.authors, MIN(bo.price) as min_price, SUM(bo.count) as total_count
                FROM book b
                LEFT JOIN book_option bo ON bo.book_id = b.id
                LEFT JOIN category c ON b.category_id = c.id
                WHERE bo.count > 0
            `;

            const params = [];

            if (search_query) {
                query += ` AND b.title LIKE ?`;
                params.push(`%${search_query}%`);
            }
            if (category_id) {
                query += ` AND (b.category_id = ? OR c.parent_category = ?)`;
                params.push(category_id, category_id);
            }
            if (lang_id) {
                query += ` AND b.language_id = ?`;
                params.push(lang_id);
            }
            if (state_id) {
                query += ` AND bo.state_id = ?`;
                params.push(state_id);
            }

            query += ` GROUP BY b.id`;

            if (limit) {
                query += ` LIMIT ?`;
                params.push(limit);
            }

            const [rows] = await conn.execute(query, params);

            const bookViews = rows.map(row => new BookOfferView(
                row.id,
                row.title,
                row.authors,
                row.image_path,
                row.min_price,
                row.total_count
            ));

            conn.release();
            return bookViews;
        } catch (error) {
            console.error('Error fetching book views:', error);
            throw error;
        }
}

    async getBookOffers(search_query = null, category_id = null, lang_id = null, state_id = null) {
        try {
            const conn = await this.pool.getConnection();

            let query = `
                SELECT 
                    b.id, b.title, b.description, b.year, b.publisher, b.authors, b.image_path, bo.price, bo.count,
                    l.name as language, s.name as state, b.series_id, sr.name as series_name, b.volume,
                    bo.state_id as state_id
                FROM book b
                LEFT JOIN language l ON b.language_id = l.id
                LEFT JOIN series sr ON b.series_id = sr.id
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
                query += ` AND (b.category_id = ? OR c.parent_category = ?)`;
                params.push(category_id, category_id);
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
                        row.series_id,
                        row.series_name,
                        row.volume,
                        row.image_path,
                        []
                    );
                    offers.push(existingOffer);
                }

                existingOffer.price_options.push(
                    new BookPriceOption(
                        row.state_id,
                        row.state,
                        row.price,
                        row.count
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

    async getBookOffersFromSeries(book_id, series_id) {
        try {
            const conn = await this.pool.getConnection();

            let query = `
                SELECT 
                    b.id, b.image_path, b.title, b.authors, MIN(bo.price) as min_price, SUM(bo.count) as total_count
                FROM book b
                JOIN book_option bo ON bo.book_id = b.id
                JOIN category c ON b.category_id = c.id
                WHERE bo.count > 0 AND (b.series_id = ?) AND (b.id != ?)
                GROUP BY b.id
                ORDER BY b.series_id ASC
            `;

            const [rows] = await conn.execute(query, [series_id, book_id]);

            const bookViews = rows.map(row => new BookOfferView(
                row.id,
                row.title,
                row.authors,
                row.image_path,
                row.min_price,
                row.total_count
            ));

            conn.release();
            return bookViews;
        } catch (error) {
            console.error('Error fetching book views:', error);
            throw error;
        }
    }
}

export default DBHandler;
