import { MongoClient, ObjectId } from 'mongodb';
import Category from '../models/Category.mjs';
import Language from '../models/Language.mjs';
import State from '../models/State.mjs';
import Series from '../models/Series.mjs';
import Book from '../models/Book.mjs';
import BookOption from '../models/BookOption.mjs';
import CartItem from '../models/CartItem.mjs';
import CartSession from '../models/CartSession.mjs';
import User from '../models/User.mjs';
import mongoose from 'mongoose';
import { insertData } from './data.mjs';

class DBHandler {
    constructor(uri, dbName) {
        this.uri = uri;
        this.dbName = dbName;
    }

    async connect() {
        try {
            await mongoose.connect(this.uri);
            console.log('Connected to MongoDB');
        } catch (error) {
            console.error('Error connecting to MongoDB:', error);
        }
    }

    async close() {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }

    async initDatabase() {
        try {
            await insertData();
            console.log('Database initialized successfully.');
        } catch (error) {
            console.error('Error initializing database:', error);
        }
    }

    async truncateDatabase() {
        try {
            await Promise.all([
                Series.deleteMany({}),
                Language.deleteMany({}),
                State.deleteMany({}),
                Category.deleteMany({}),
                Book.deleteMany({}),
                BookOption.deleteMany({}),
                User.deleteMany({}),
                CartItem.deleteMany({}),
                CartSession.deleteMany({}),
            ]);

            console.log('Database truncated successfully.');
        } catch (error) {
            console.error('Error truncating database:', error);
        }
    }

    async test() {
        try{
            console.log("-------------------------1----------------------------");
            console.log("TESTING getBookFilters");
            console.log((await this.getBookFilters())[0].items[0]);

            console.log("-------------------------2----------------------------");
            console.log("TESTING getBookWithPriceOptions");
            console.log(await this.getBookWithPriceOptions("677c190e6b74f5266ecb9a9a"));

            console.log("-------------------------3----------------------------");
            console.log("TESTING addUser");
            //await this.addUser("lol", "loll@gmail.com", "fffffffff");

            console.log("-------------------------4----------------------------");
            console.log("TESTING findUserByEmail");
            console.log(await this.findUserByEmail("loll@gmail.com"));

            console.log("-------------------------5----------------------------");
            console.log("TESTING getBookViews");
            console.log(await this.getBookViews());

            console.log("-------------------------6----------------------------");
            console.log("TESTING getBookOffersFromSeries");
            console.log(await this.getBookOffersFromSeries("677c2c66028957d8ba14077c", "677c2c66028957d8ba14075d"));

            console.log("-------------------------7----------------------------");
            console.log("TESTING getBookOffers");
            console.log((await this.getBookOffers())[0].price_options);
        } catch(err) {
            console.error(err);
        }
    }

    async getBookFilters() {
        try {
            const filters = [
                { name: 'category', display_name: 'Kategoria', model: Category },
                { name: 'language', display_name: 'Język', model: Language },
                { name: 'state', display_name: 'Stan', model: State }
            ];

            const result = await Promise.all(
                filters.map(async (filter) => {
                    const items = await filter.model.find();

                    if (filter.name === 'category') {
                        const categoryMap = new Map();

                        items.forEach(item => {
                            if (!item.parentCategory) {
                                categoryMap.set(item._id.toString(), {
                                    id: item._id.toString(),
                                    name: item.name,
                                    child_items: []
                                });
                            }
                        });

                        items.forEach(item => {
                            if (item.parentCategory) {
                                const parent = categoryMap.get(item.parentCategory.toString());
                                if (parent) {
                                    parent.child_items.push({
                                        id: item._id.toString(),
                                        name: item.name,
                                        child_items: []
                                    });
                                }
                            }
                        });

                        return {
                            filter_name: filter.name,
                            filter_display_name: filter.display_name,
                            items: [...categoryMap.values()]
                        };
                    } else {
                        return {
                            filter_name: filter.name,
                            filter_display_name: filter.display_name,
                            items: items.map(item => ({
                                id: item._id.toString(),
                                name: item.name
                            }))
                        };
                    }
                })
            );

            return result;
        } catch (error) {
            console.error('Error fetching book filters:', error);
            throw error;
        }
    }

    async getBookWithPriceOptions(bookIdString) {
        try {
            const bookId = new ObjectId(bookIdString);

            const book = await Book.findById(bookId)
                .populate({
                    path: 'series',
                    select: 'name',
                })
                .populate({
                    path: 'language',
                    select: 'name',
                })
                .lean(); 

            if (!book) return null;

            const bookOptions = await BookOption.find({ book: bookId })
                .populate({
                    path: 'state',
                    select: 'name',
                })
                .sort({ price: 1 })
                .lean();

            const priceOptions = bookOptions.map(option => ({
                id: option._id.toString(),
                state: option.state.name,
                price: option.price.toString(), 
                count: option.count,
            }));

            return {
                id: book._id.toString(),
                title: book.title,
                desc: book.description,
                language: book.language?.name || null,
                year: book.year,
                publisher: book.publisher,
                authors: book.authors,
                series_id: book.series?._id.toString() || null,
                series_name: book.series?.name || null,
                volume: book.volume,
                image_path: book.imagePath,
                price_options: priceOptions,
            };
        } catch (error) {
            console.error('Error fetching book with price options:', error);
            throw error;
        }
    }

    async updateCartSessionTotal(userId) {
        try {
            const cartSession = await CartSession.findOne({ user: userId });

            if (!cartSession) {
                throw new Error(`Cart session not found for user ID: ${userId}`);
            }

            const cartItems = await CartItem.aggregate([
                { $match: { cartSession: cartSession._id } },
                {
                    $lookup: {
                        from: 'bookoptions',
                        localField: 'bookOffer',
                        foreignField: '_id',
                        as: 'option',
                    },
                },
                { $unwind: '$option' },
                {
                    $group: {
                        _id: null,
                        sum: { $sum: { $multiply: ['$quantity', { $toDouble: '$option.price' }] } },
                    },
                },
            ]);

            const sum = cartItems[0]?.sum || 0;

            const discountPercent = sum > 200 ? 10 : sum > 100 ? 5 : 0;

            await CartSession.updateOne(
                { user: userId },
                { $set: { sum, discountPercent } }
            );
        } catch (error) {
            console.error('Error updating cart session total:', error);
            throw error;
        }
    }

    async processPayment(userId) {
        try {
            const cartSession = await CartSession.findOne({ user: userId });

            if (!cartSession) {
                throw new Error(`Cart session not found for user ID: ${userId}`);
            }

            const cartItems = await CartItem.aggregate([
                { $match: { cartSession: cartSession._id } },
                {
                    $lookup: {
                        from: 'bookoptions',
                        localField: 'bookOffer',
                        foreignField: '_id',
                        as: 'option',
                    },
                },
                { $unwind: '$option' },
                {
                    $project: {
                        bookOptionId: '$option._id',
                        quantity: 1,
                        stock: '$option.count',
                    },
                },
            ]);

            for (const item of cartItems) {
                if (item.quantity > item.stock) {
                    throw new Error(`Not enough stock for book option ID: ${item.bookOptionId}`);
                }

                const updateResult = await BookOption.updateOne(
                    { _id: item.bookOptionId, count: { $gte: item.quantity } },
                    { $inc: { count: -item.quantity } }
                );

                if (updateResult.modifiedCount === 0) {
                    throw new Error(`Failed to update stock for book option ID: ${item.bookOptionId}`);
                }
            }

            await CartItem.deleteMany({ cartSession: cartSession._id });

            cartSession.sum = 0;
            cartSession.discountPercent = 0;
            await cartSession.save();
        } catch (error) {
            console.error('Error processing payment:', error);
            throw error;
        }
    }

    async updateCartItemQuantity(userId, bookOptionId, quantity) {
        try {
            const cartSession = await CartSession.findOne({ user: userId });

            if (!cartSession) {
                throw new Error(`Cart session not found for user ID: ${userId}`);
            }

            const bookOption = await BookOption.findById(bookOptionId, 'count');

            if (!bookOption) {
                throw new Error(`Book option with ID ${bookOptionId} not found.`);
            }

            const updatedQuantity = Math.min(quantity, bookOption.count);

            const result = await CartItem.updateOne(
                { cartSession: cartSession._id, bookOffer: bookOptionId },
                { $set: { quantity: updatedQuantity } }
            );

            if (result.matchedCount === 0) {
                throw new Error(
                    `Cart item not found in session ${cartSession._id} for book option ${bookOptionId}`
                );
            }

            await this.updateCartSessionTotal(userId);
        } catch (error) {
            console.error('Error updating cart item quantity:', error);
            throw error;
        }
    }

    async deleteCartItem(userId, bookOptionId) {
        try {
            const cartSession = await CartSession.findOne({ user: userId });

            if (!cartSession) {
                throw new Error(`Cart session not found for user ID: ${userId}`);
            }

            const result = await CartItem.deleteOne({
                cartSession: cartSession._id,
                bookOffer: bookOptionId,
            });

            if (result.deletedCount === 0) {
                throw new Error(`Cart item not found for book option ID: ${bookOptionId}`);
            }

            await this.updateCartSessionTotal(userId);
        } catch (error) {
            console.error('Error deleting cart item:', error);
            throw error;
        }
    }

    async getCartItem(userId, bookOptionId) {
        try {
            const cartSession = await CartSession.findOne({ user: userId });

            if (!cartSession) {
                throw new Error(`Cart session not found for user ID: ${userId}`);
            }

            const cartItem = await CartItem.findOne({
                cartSession: cartSession._id,
                bookOffer: bookOptionId,
            });

            return cartItem ? { id: cartItem._id.toString(), quantity: cartItem.quantity } : null;
        } catch (error) {
            console.error('Error retrieving cart item:', error);
            throw error;
        }
    }

    async getUserCart(userId) {
        try {
            const cartSession = await CartSession.findOne({ user: userId });

            if (!cartSession) {
                throw new Error(`Cart session not found for user ID: ${userId}`);
            }

            const booksData = await CartItem.aggregate([
                { $match: { cartSession: cartSession._id } },
                {
                    $lookup: {
                        from: 'bookoptions',
                        localField: 'bookOffer',
                        foreignField: '_id',
                        as: 'bookOption',
                    },
                },
                { $unwind: '$bookOption' },
                {
                    $lookup: {
                        from: 'books',
                        localField: 'bookOption.book',
                        foreignField: '_id',
                        as: 'book',
                    },
                },
                { $unwind: '$book' },
                {
                    $lookup: {
                        from: 'states',
                        localField: 'bookOption.state',
                        foreignField: '_id',
                        as: 'state',
                    },
                },
                { $unwind: '$state' },
                {
                    $project: {
                        option_id: '$bookOption._id',
                        title: '$book.title',
                        authors: '$book.authors',
                        image_path: '$book.imagePath',
                        state: '$state.name',
                        price: '$bookOption.price',
                        quantity: '$quantity',
                        total_price: { $multiply: ['$quantity', '$bookOption.price'] },
                        available_quantity: '$bookOption.count',
                    },
                },
            ]);

            const books = booksData.map(book => ({
                option_id: book.option_id.toString(),
                title: book.title,
                authors: book.authors,
                image_path: book.image_path,
                state: book.state,
                price: parseFloat(book.price).toFixed(2),
                quantity: book.quantity,
                total_price: parseFloat(book.total_price).toFixed(2),
                available_quantity: book.available_quantity,
            }));

            const discountSum = (parseFloat(cartSession.discountPercent) / 100) * parseFloat(cartSession.sum);
            const total = parseFloat(cartSession.sum) - discountSum;

            return {
                sum: parseFloat(cartSession.sum).toFixed(2),
                discount_percent: parseFloat(cartSession.discountPercent).toFixed(2),
                discount_sum: discountSum.toFixed(2),
                total: total.toFixed(2),
                books,
            };
        } catch (error) {
            console.error('Error retrieving user cart:', error);
            throw error;
        }
    }

    async incrementCartItem(cartItemId) {
        try {
            await CartItem.updateOne(
                { _id: cartItemId },
                { $inc: { quantity: 1 } }
            );
        } catch (error) {
            console.error('Error incrementing cart item quantity:', error);
            throw error;
        }
    }

    async addBookToCart(userId, bookOptionId) {
        try {
            const cartSession = await CartSession.findOne({ user: userId });

            if (!cartSession) {
                throw new Error('Cart session not found for user.');
            }

            const cartSessionId = cartSession._id;

            const existingCartItem = await CartItem.findOne({
                cartSession: cartSessionId,
                bookOffer: bookOptionId,
            });

            if (existingCartItem) {
                await incrementCartItem(existingCartItem._id);
            } else {
                const newCartItem = new CartItem({
                    cartSession: cartSessionId,
                    bookOffer: bookOptionId,
                    quantity: 1,
                });
                await newCartItem.save();
            }

            await this.updateCartSessionTotal(userId);
        } catch (error) {
            console.error('Error adding book to cart:', error);
            throw error;
        }
    }

    async addUser(name, email, passwordHash) {
        try {
            const user = new User({ name, email, passwordHash });
            await user.save();

            const cartSession = new CartSession({
                user: user._id,
                discountPercent: 0,
                sum: 0,
            });
            await cartSession.save();

            console.log('User added successfully.');
        } catch (error) {
            console.error('Error adding user:', error);
            throw error;
        }
    }

    async findUserByEmail(email) {
        try {
            const user = await User.findOne({ email }).lean(); 

            if (user) {
                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    password_hash: user.passwordHash,
                };
            }

            return null;
        } catch (error) {
            console.error('Error finding user by email:', error);
            throw error;
        }
    }

    async getBookViews(searchQuery = null, categoryId = null, langId = null, stateId = null, limit = null) {
        try {
            const matchConditions = [{ 'bookOptions.count': { $gt: 0 } }];

            if (searchQuery) {
                matchConditions.push({ title: { $regex: searchQuery, $options: 'i' } });
            }

            if (categoryId) {
                matchConditions.push({
                    $or: [
                        { category: categoryId },
                        { 'category.parentCategory': categoryId },
                    ],
                });
            }

            if (langId) {
                matchConditions.push({ language: langId });
            }

            if (stateId) {
                matchConditions.push({ 'bookOptions.state': stateId });
            }

            const pipeline = [
                {
                    $lookup: {
                        from: 'bookoptions', 
                        localField: '_id',
                        foreignField: 'book',
                        as: 'bookOptions',
                    },
                },
                { $unwind: '$bookOptions' },
                {
                    $lookup: {
                        from: 'categories', 
                        localField: 'category',
                        foreignField: '_id',
                        as: 'categoryDetails',
                    },
                },
                { $unwind: { path: '$categoryDetails', preserveNullAndEmptyArrays: true } },
                { $match: { $and: matchConditions } },
                {
                    $group: {
                        _id: '$_id',
                        imagePath: { $first: '$imagePath' },
                        title: { $first: '$title' },
                        authors: { $first: '$authors' },
                        minPrice: { $min: '$bookOptions.price' },
                        totalCount: { $sum: '$bookOptions.count' },
                    },
                },
            ];

            if (limit) {
                pipeline.push({ $limit: limit });
            }

            const books = await Book.aggregate(pipeline);

            return books.map(book => ({
                id: book._id.toString(),
                image_path: book.imagePath,
                title: book.title,
                authors: book.authors,
                min_price: book.minPrice ? book.minPrice.toString() : null, 
                total_count: book.totalCount,
            }));
        } catch (error) {
            console.error('Error fetching book views:', error);
            throw error;
        }
    }


    async getBookOffers(searchQuery = null, categoryIdString = null, langIdString = null, stateIdString = null) {
        try {
            const categoryId = categoryIdString == null ? null : new ObjectId(categoryIdString);
            const langId = langIdString == null ? null : new ObjectId(langIdString);
            const stateId = stateIdString == null ? null : new ObjectId(stateIdString);

            const matchConditions = { $and: [] };

            if (searchQuery) {
                matchConditions.$and.push({ title: { $regex: searchQuery, $options: 'i' } });
            }

            if (categoryId) {
                matchConditions.$and.push({
                    $or: [
                        { 'category._id': categoryId },
                        { 'category.parentCategory': categoryId },
                    ],
                });
            }

            if (langId) {
                matchConditions.$and.push({ 'language._id': langId });
            }

            if (stateId) {
                matchConditions.$and.push({ 'bookOptions.state': stateId });
            }

            if (!matchConditions.$and.length) {
                delete matchConditions.$and;
            }

            const pipeline = [
                {
                    $lookup: {
                        from: 'languages',
                        localField: 'language',
                        foreignField: '_id',
                        as: 'language',
                    },
                },
                {
                    $lookup: {
                        from: 'series',
                        localField: 'series',
                        foreignField: '_id',
                        as: 'series',
                    },
                },
                {
                    $lookup: {
                        from: 'bookoptions',
                        localField: '_id',
                        foreignField: 'book',
                        as: 'bookOptions',
                    },
                },
                { $unwind: { path: '$bookOptions', preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: 'states',
                        localField: 'bookOptions.state',
                        foreignField: '_id',
                        as: 'state',
                    },
                },
                {
                    $lookup: {
                        from: 'categories',
                        localField: 'category',
                        foreignField: '_id',
                        as: 'category',
                    },
                },
                { $unwind: { path: '$language', preserveNullAndEmptyArrays: true } },
                { $unwind: { path: '$series', preserveNullAndEmptyArrays: true } },
                { $unwind: { path: '$state', preserveNullAndEmptyArrays: true } },
                { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
                { $match: matchConditions },
                {
                    $project: {
                        id: '$_id',
                        title: 1,
                        description: 1,
                        year: 1,
                        publisher: 1,
                        authors: 1,
                        imagePath: 1,
                        language: '$language.name',
                        state: '$state.name',
                        stateId: '$bookOptions.state',
                        price: '$bookOptions.price',
                        count: '$bookOptions.count',
                        seriesId: '$series._id',
                        seriesName: '$series.name',
                        volume: 1,
                    },
                },
            ];

            const rows = await Book.aggregate(pipeline)

            const bookOffers = rows.reduce((offers, row) => {
                let existingOffer = offers.find(offer => offer.id === row.id.toString());

                if (!existingOffer) {
                    existingOffer = {
                        id: row.id.toString(),
                        title: row.title,
                        desc: row.description,
                        language: row.language,
                        year: row.year,
                        publisher: row.publisher,
                        authors: row.authors,
                        series_id: row.seriesId ? row.seriesId.toString() : null,
                        series_name: row.seriesName || null,
                        volume: row.volume,
                        image_path: row.imagePath,
                        price_options: [],
                    };
                    offers.push(existingOffer);
                }

                existingOffer.price_options.push({
                    state_id: row.stateId ? row.stateId.toString() : null,
                    state: row.state,
                    price: row.price ? row.price.toString() : null, 
                    count: row.count,
                });

                return offers;
            }, []);

            return bookOffers;
        } catch (error) {
            console.error('Error fetching book offers:', error);
            throw error;
        }
    }

    async getBookOffersFromSeries(bookIdString, seriesIdString) {
        try {
            const bookId = new ObjectId(bookIdString);
            const seriesId = new ObjectId(seriesIdString);

            const pipeline = [
                {
                    $match: {
                        series: seriesId, 
                        _id: { $ne: bookId }, 
                    },
                },
                {
                    $lookup: {
                        from: 'bookoptions', 
                        localField: '_id',
                        foreignField: 'book',
                        as: 'bookOptions',
                    },
                },
                {
                    $unwind: '$bookOptions', 
                },
                {
                    $match: {
                        'bookOptions.count': { $gt: 0 }, 
                    },
                },
                {
                    $group: {
                        _id: '$_id',
                        title: { $first: '$title' },
                        authors: { $first: '$authors' },
                        imagePath: { $first: '$imagePath' },
                        minPrice: { $min: '$bookOptions.price' }, 
                        totalCount: { $sum: '$bookOptions.count' }, 
                    },
                },
                {
                    $sort: { _id: 1 }, 
                },
            ];

            const books = await Book.aggregate(pipeline);

            return books.map(book => ({
                id: book._id.toString(),
                title: book.title,
                authors: book.authors,
                image_path: book.imagePath,
                min_price: book.minPrice ? book.minPrice.toString() : null, 
                total_count: book.totalCount,
            }));
        } catch (error) {
            console.error('Error fetching book offers from series:', error);
            throw error;
        }
    }
}

export default DBHandler;
