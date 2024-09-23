import { createPool } from 'mysql2/promise';
import { readFileSync } from 'fs';
import { resolve } from "path";
import { User } from '../models/user.mjs';

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

    async addUser(name, mail, passwordHash) {
        try {
            const query = `INSERT INTO user (name, mail, password_hash) VALUES (?, ?, ?)`;
            const conn = await this.pool.getConnection();
            await conn.query(query, [name, mail, passwordHash]);
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

    async getBookOffers(search_query = null, category_id = null, lang_id = null, state_id = null) {
        try {
            const conn = await this.pool.getConnection();

            let query = `
                SELECT 
                    b.id, b.title, b.description, l.name AS language, b.year, b.publisher, b.authors, b.image_path, 
                    s.name AS state, bo.price
                FROM book b
                LEFT JOIN language l ON b.language_id = l.id
                LEFT JOIN book_option bo ON bo.book_id = b.id
                LEFT JOIN state s ON bo.state_id = s.id
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
                    existingOffer = {
                        id: row.id,
                        title: row.title,
                        desc: row.description,
                        language: row.language,
                        year: row.year,
                        publisher: row.publisher,
                        authors: row.authors,
                        image_path: row.image_path,
                        price_options: []
                    };
                    offers.push(existingOffer);
                }

                existingOffer.price_options.push({
                    state: row.state,
                    price: row.price
                });

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
