import { MongoClient, ObjectId } from 'mongodb';

class DBHandler {
    constructor(uri, dbName) {
        this.client = new MongoClient(uri);
        this.dbName = dbName;
    }

    async connect() {
        try {
            await this.client.connect();
            this.db = this.client.db(this.dbName);
            console.log('Connected to MongoDB');
        } catch (error) {
            console.error('Error connecting to MongoDB:', error);
        }
    }

    async close() {
        await this.client.close();
        console.log('Disconnected from MongoDB');
    }

    async initDatabase() {
        try {
const series = await this.db.collection('series').insertOne({
    name: 'II wojna światowa.'
});

// Insert into language
const languages = await this.db.collection('language').insertMany([
    {  name: 'Angielski' },
    {  name: 'Polski' }
]);

// Insert into state
const states = await this.db.collection('state').insertMany([
    {  name: 'Nowy' },
    {  name: 'Bardzo dobry' },
    {  name: 'Dobry' },
    {  name: 'Zniszczone' }
]);

const preCategories = await this.db.collection('category').insertOne(
    { name: "Wojny", parent_category: null }
);

// Insert into category
const categories = await this.db.collection('category').insertMany([
    {  name: 'Podręczniki', parent_category: null },
    {  name: 'Katalogi', parent_category: null },
    {  name: 'Informatory', parent_category: null },
    {  name: 'Przewodniki', parent_category: null },
    {  name: 'Atlasy', parent_category: null },
    {  name: 'Albumy', parent_category: null },
    {  name: 'Beletrystyka', parent_category: null },
    {  name: 'Historia', parent_category: null },
    {  name: 'I wojna światowa', parent_category: new ObjectId(preCategories.insertedId)},
    {  name: 'II wojna światowa', parent_category: new ObjectId(preCategories.insertedId)},
    {  name: 'Czasy starożytne', parent_category: null}
    /*
    {  name: 'I wojna światowa', parent_category: new ObjectId(categories.insertedIds[7]) },
    {  name: 'II wojna światowa', parent_category: new ObjectId(categories.insertedIds[7]) },
    {  name: 'Czasy starożytne', parent_category: new ObjectId(categories.insertedIds[7]) }
    */
]);

// Insert into book
const books = await this.db.collection('book').insertMany([
    {
      
        title: 'W pustyni i w puszczy',
        description: 'Przygody polskiego chłopca i afrykańskiej dziewczynki w Afryce.',
        language_id: new ObjectId(languages.insertedIds[1]),
        category_id: new ObjectId(categories.insertedIds[6]),
        series_id: null,
        volume: null,
        year: 1911,
        publisher: 'Gebethner i Wolff',
        authors: 'Henryk Sienkiewicz',
        image_path: 'example1.jpg'
    },
    {
     
        title: 'Krzyżacy',
        description: 'Opowieść o wojnie Polski z Zakonem Krzyżackim.',
        language_id: new ObjectId(languages.insertedIds[1]),
        category_id: new ObjectId(categories.insertedIds[6]),
        series_id: null,
        volume: null,
        year: 1900,
        publisher: 'Gebethner i Wolff',
        authors: 'Henryk Sienkiewicz',
        image_path: 'example2.jpg'
    },
    {
    
        title: 'Przewodnik po Paryżu',
        description: 'Praktyczny przewodnik po atrakcjach i kulturze Paryża.',
        language_id: new ObjectId(languages.insertedIds[1]),
        category_id: new ObjectId(categories.insertedIds[3]),
        series_id: null,
        volume: null,
        year: 2021,
        publisher: 'Pascal',
        authors: 'Piotr Kowalski',
        image_path: 'example3.jpg'
    },
    {
   
        title: 'Atlas geograficzny',
        description: 'Zbiór map świata, kontynentów i państw.',
        language_id: new ObjectId(languages.insertedIds[1]),
        category_id: new ObjectId(categories.insertedIds[4]),
        series_id: null,
        volume: null,
        year: 2019,
        publisher: 'Demart',
        authors: 'Jan Nowak',
        image_path: 'example4.jpg'
    },
    {
  
        title: 'Historia starożytna',
        description: 'Książka opisująca starożytne cywilizacje, takie jak Egipt i Mezopotamia.',
        language_id: new ObjectId(languages.insertedIds[1]),
        category_id: new ObjectId(categories.insertedIds[10]),
        series_id: null,
        volume: null,
        year: 2015,
        publisher: 'Wydawnictwo Literackie',
        authors: 'Tadeusz Zieliński',
        image_path: 'example5.jpg'
    },
    {
 
        title: 'Bitwa pod Verdun',
        description: 'Opowieść o jednej z najważniejszych bitew I wojny światowej.',
        language_id: new ObjectId(languages.insertedIds[1]),
        category_id: new ObjectId(categories.insertedIds[8]),
        series_id: null,
        volume: null,
        year: 2017,
        publisher: 'Znak',
        authors: 'Jacek Kaczmarek',
        image_path: 'example6.jpg'
    },
    {

        title: 'II wojna światowa. Tom 1',
        description: 'Kompleksowa historia drugiej wojny światowej.',
        language_id: new ObjectId(languages.insertedIds[1]),
        category_id: new ObjectId(categories.insertedIds[9]),
        series_id: new ObjectId(series.insertedId),
        volume: 1,
        year: 2005,
        publisher: 'Zysk i S-ka',
        authors: 'Norman Davies',
        image_path: 'example7.jpg'
    },
    {

        title: 'II wojna światowa. Tom 2',
        description: 'Jeszcze więcej wojny.',
        language_id: new ObjectId(languages.insertedIds[1]),
        category_id: new ObjectId(categories.insertedIds[9]),
        series_id: new ObjectId(series.insertedId),
        volume: 2,
        year: 2008,
        publisher: 'Zysk i S-ka',
        authors: 'Norman Davies',
        image_path: 'example7.jpg'
    },
    {

        title: 'Przewodnik po Włoszech',
        description: 'Wszystko, co trzeba wiedzieć o podróży po Włoszech.',
        language_id: new ObjectId(languages.insertedIds[1]),
        category_id: new ObjectId(categories.insertedIds[3]),
        series_id: null,
        volume: null,
        year: 2019,
        publisher: 'Pascal',
        authors: 'Anna Nowak',
        image_path: 'example8.jpg'
    },
    {

        title: 'Album Sztuki Renesansowej',
        description: 'Piękne ilustracje i historie dzieł sztuki renesansowej.',
        language_id: new ObjectId(languages.insertedIds[1]),
        category_id: new ObjectId(categories.insertedIds[5]),
        series_id: null,
        volume: null,
        year: 2018,
        publisher: 'Arkady',
        authors: 'Jan Kowalski',
        image_path: 'example9.jpg'
    },
    {

        title: 'Angielskie idiomy',
        description: 'Zbiór najczęściej używanych angielskich idiomów.',
        language_id: new ObjectId(languages.insertedIds[0]),
        category_id: new ObjectId(categories.insertedIds[2]),
        series_id: null,
        volume: null,
        year: 2020,
        publisher: 'Oxford University Press',
        authors: 'John Smith',
        image_path: 'example10.jpg'
    }
]);

// Insert into book_option
await this.db.collection('book_option').insertMany([
    { book_id: books.insertedIds[0], state_id: new ObjectId(states.insertedIds[0]), price: 15.99, count: 10 },
    { book_id: books.insertedIds[0], state_id: new ObjectId(states.insertedIds[2]), price: 10.99, count: 0 },
    { book_id: books.insertedIds[1], state_id: new ObjectId(states.insertedIds[0]), price: 18.99, count: 0 },
    { book_id: books.insertedIds[2], state_id: new ObjectId(states.insertedIds[0]), price: 19.50, count: 15 },
    { book_id: books.insertedIds[3], state_id: new ObjectId(states.insertedIds[1]), price: 25.00, count: 7 },
    { book_id: books.insertedIds[4], state_id: new ObjectId(states.insertedIds[0]), price: 22.00, count: 12 },
    { book_id: books.insertedIds[4], state_id: new ObjectId(states.insertedIds[1]), price: 12.00, count: 12 },
    { book_id: books.insertedIds[4], state_id: new ObjectId(states.insertedIds[2]), price: 10.00, count: 15 },
    { book_id: books.insertedIds[5], state_id: new ObjectId(states.insertedIds[2]), price: 9.99, count: 6 },
    { book_id: books.insertedIds[6], state_id: new ObjectId(states.insertedIds[1]), price: 30.00, count: 8 },
    { book_id: books.insertedIds[6], state_id: new ObjectId(states.insertedIds[2]), price: 12.00, count: 0 },
    { book_id: books.insertedIds[7], state_id: new ObjectId(states.insertedIds[0]), price: 17.99, count: 10 },
    { book_id: books.insertedIds[8], state_id: new ObjectId(states.insertedIds[0]), price: 34.99, count: 5 },
    { book_id: books.insertedIds[9], state_id: new ObjectId(states.insertedIds[0]), price: 12.99, count: 20 },
    { book_id: books.insertedIds[10], state_id: new ObjectId(states.insertedIds[0]), price: 20.99, count: 0 }
]);
            console.log('Database initialized successfully.');
        } catch (error) {
            console.error('Error initializing database:', error);
        }
    }

    async truncateDatabase() {
        try {
            const collections = await this.db.listCollections().toArray();

            await Promise.all(
                collections.map(async (collection) => {
                    await this.db.collection(collection.name).deleteMany({});
                })
            );

            console.log('Database truncated successfully.');
        } catch (error) {
            console.error('Error truncating database:', error);
        }
    }

    async getBookFilters() {
        try {
            const filters = [
                { name: 'category', display_name: 'Kategoria' },
                { name: 'language', display_name: 'Język' },
                { name: 'state', display_name: 'Stan' }
            ];

            const result = await Promise.all(
                filters.map(async (filter) => {
                    const items = await this.db.collection(filter.name).find().toArray();

                    if (filter.name === 'category') {
                        const categoryMap = new Map();
                        
                        items.forEach(item => {
                            if (!item.parent_category) {
                                categoryMap.set(item._id.toString(), {
                                    id: item._id.toString(),
                                    name: item.name,
                                    child_items: []
                                });
                            }
                        });

                        items.forEach(item => {
                            if (item.parent_category) {
                                const parent = categoryMap.get(item.parent_category.toString());
                                if (parent) {
                                    parent.child_items.push({
                                        id: item._id.toString(),
                                        name: item.name,
                                        child_items: []
                                    });
                                }
                            }
                        });

                        return { filter_name: filter.name, filter_display_name: filter.display_name, items: [...categoryMap.values()] };
                    } else {
                        return {
                            filter_name: filter.name,
                            filter_display_name: filter.display_name,
                            items: items.map(item => ({ id: item._id.toString(), name: item.name }))
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

    async getBookWithPriceOptions(bookId) {
        try {
            const book = (await this.db
                .collection('book')
                .aggregate([
                    { $match: { _id: new ObjectId(bookId) } },
                    {
                        $lookup: {
                            from: 'series',
                            let: { seriesId: '$series_id' },
                            pipeline: [
                                { $match: { $expr: { $eq: ['$_id', '$$seriesId'] } } }
                            ],
                            as: 'series'
                        }
                    },
                    {
                        $lookup: {
                            from: 'language',
                            localField: 'language_id',
                            foreignField: '_id',
                            as: 'language'
                        }
                    },
                    { $unwind: '$language' },
                    {
                        $lookup: {
                            from: 'book_option',
                            localField: '_id',
                            foreignField: 'book_id',
                            pipeline: [
                                {
                                    $lookup: {
                                        from: 'state',
                                        localField: 'state_id',
                                        foreignField: '_id',
                                        as: 'state'
                                    }
                                },
                                { $unwind: '$state' },
                                { $sort: {price: 1} }
                            ],
                            as: 'price_options',
                        }
                    },
                ])
                .toArray())[0];

            if (!book) return null;

            /*
            const priceOptions = await this.db
                .collection('book_option')
                .aggregate([
                    { $match: { book_id: new ObjectId(bookId) } },
                    {
                        $lookup: {
                            from: 'state',
                            localField: 'state_id',
                            foreignField: '_id',
                            as: 'state'
                        }
                    },
                    { $unwind: '$state' },
                    { $sort: { price: 1 } }
                ])
                .toArray();*/
            const priceOptions = book.price_options;

            return {
                id: book._id.toString(),
                title: book.title,
                desc: book.description,
                language: book.language.name,
                year: book.year,
                publisher: book.publisher,
                authors: book.authors,
                series_id: book.series_id,
                series_name: book.series[0]?.name || null,
                volume: book.volume,
                image_path: book.image_path,
                price_options: priceOptions.map(option => ({
                    id: option._id.toString(),
                    state: option.state.name,
                    price: option.price,
                    count: option.count
                }))
            };
        } catch (error) {
            console.error('Error fetching book with price options:', error);
            throw error;
        }
    }

    async updateCartSessionTotal(userId) {
        try {
            const cartSession = await this.db.collection('cart_session').findOne({ user_id: new ObjectId(userId) });

            if (!cartSession) {
                throw new Error(`Cart session not found for user ID: ${userId}`);
            }

            const cartItems = await this.db.collection('cart_item').aggregate([
                { $match: { cart_session_id: cartSession._id } },
                {
                    $lookup: {
                        from: 'book_option',
                        localField: 'book_offer',
                        foreignField: '_id',
                        as: 'option'
                    }
                },
                { $unwind: '$option' },
                {
                    $group: {
                        _id: null,
                        sum: { $sum: { $multiply: ['$quantity', '$option.price'] } }
                    }
                }
            ]).toArray();

            const sum = cartItems[0]?.sum || 0;
            const discountPercent = sum > 200 ? 10 : sum > 100 ? 5 : 0;

            await this.db.collection('cart_session').updateOne(
                { user_id: new ObjectId(userId) },
                { $set: { sum, discount_percent: discountPercent } }
            );
        } catch (error) {
            console.error('Error updating cart session total:', error);
            throw error;
        }
    }

    async processPayment(userId) {
        try {
            const cartSession = await this.db.collection('cart_session').findOne({ user_id: new ObjectId(userId) });

            if (!cartSession) {
                throw new Error(`Cart session not found for user ID: ${userId}`);
            }

            const cartItems = await this.db.collection('cart_item').aggregate([
                { $match: { cart_session_id: cartSession._id } },
                {
                    $lookup: {
                        from: 'book_option',
                        localField: 'book_offer',
                        foreignField: '_id',
                        as: 'option'
                    }
                },
                { $unwind: '$option' },
                { $project: { book_option_id: '$option._id', quantity: 1, stock: '$option.count' } }
            ]).toArray();

            for (const item of cartItems) {
                if (item.quantity > item.stock) {
                    throw new Error(`Not enough stock for book option ID: ${item.book_option_id}`);
                }

                const updateResult = await this.db.collection('book_option').updateOne(
                    { _id: item.book_option_id, count: { $gte: item.quantity } },
                    { $inc: { count: -item.quantity } }
                );

                if (updateResult.modifiedCount === 0) {
                    throw new Error(`Failed to update stock for book option ID: ${item.book_option_id}`);
                }
            }

            await this.db.collection('cart_item').deleteMany({ cart_session_id: cartSession._id } );

            await this.db.collection('cart_session').updateOne(
                { _id: cartSession._id },
                { $set: { sum: 0, discount_percent: 0 } }
            );

        } catch (error) {
            console.error('Error processing payment:', error);
            throw error;
        } 
    }

    async updateCartItemQuantity(userId, bookOptionId, quantity) {
        try {
            const cartSession = await this.db.collection('cart_session').findOne({ user_id: new ObjectId(userId) });

            if (!cartSession) {
                throw new Error(`Cart session not found for user ID: ${userId}`);
            }

            const bookOption = await this.db.collection('book_option').findOne(
                { _id: new ObjectId(bookOptionId) },
                { projection: { count: 1 } }
            );

            if (!bookOption) {
                throw new Error(`Book option with ID ${bookOptionId} not found.`);
            }

            const updatedQuantity = Math.min(quantity, bookOption.count);

            const result = await this.db.collection('cart_item').updateOne(
                { cart_session_id: cartSession._id, book_offer: new ObjectId(bookOptionId) },
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
            const cartSession = await this.db.collection('cart_session').findOne({ user_id: new ObjectId(userId) });

            if (!cartSession) {
                throw new Error(`Cart session not found for user ID: ${userId}`);
            }

            const result = await this.db.collection('cart_item').deleteOne({
                cart_session_id: cartSession._id,
                book_offer: new ObjectId(bookOptionId),
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
            const cartSession = await this.db.collection('cart_session').findOne({ user_id: new ObjectId(userId) });

            if (!cartSession) {
                throw new Error(`Cart session not found for user ID: ${userId}`);
            }

            const cartItem = await this.db.collection('cart_item').findOne({
                cart_session_id: cartSession._id,
                book_offer: new ObjectId(bookOptionId),
            });

            return cartItem ? { id: cartItem._id.toString(), quantity: cartItem.quantity } : null;
        } catch (error) {
            console.error('Error retrieving cart item:', error);
            throw error;
        }
    }

    async getUserCart(userId) {
        try {
            const cartSession = await this.db.collection('cart_session').findOne({ user_id: new ObjectId(userId) });

            if (!cartSession) {
                throw new Error(`Cart session not found for user ID: ${userId}`);
            }

            const booksData = await this.db.collection('cart_item').aggregate([
                { $match: { cart_session_id: cartSession._id } },
                {
                    $lookup: {
                        from: 'book_option',
                        localField: 'book_offer',
                        foreignField: '_id',
                        as: 'book_option',
                    },
                },
                { $unwind: '$book_option' },
                {
                    $lookup: {
                        from: 'book',
                        localField: 'book_option.book_id',
                        foreignField: '_id',
                        as: 'book',
                    },
                },
                { $unwind: '$book' },
                {
                    $lookup: {
                        from: 'state',
                        localField: 'book_option.state_id',
                        foreignField: '_id',
                        as: 'state',
                    },
                },
                { $unwind: '$state' },
                {
                    $project: {
                        option_id: '$book_option._id',
                        title: '$book.title',
                        authors: '$book.authors',
                        image_path: '$book.image_path',
                        state: '$state.name',
                        price: '$book_option.price',
                        quantity: '$quantity',
                        total_price: { $multiply: ['$quantity', '$book_option.price'] },
                        available_quantity: '$book_option.count',
                    },
                },
            ]).toArray();

            const books = booksData.map(book => ({
                option_id: book.option_id.toString(),
                title: book.title,
                authors: book.authors,
                image_path: book.image_path,
                state: book.state,
                price: book.price.toFixed(2),
                quantity: book.quantity,
                total_price: book.total_price.toFixed(2),
                available_quantity: book.available_quantity,
            }));

            const discountSum = (cartSession.discount_percent / 100) * cartSession.sum;
            const total = cartSession.sum - discountSum;

            console.log({
                sum: cartSession.sum,
                discount_percent: cartSession.discount_percent,
                discount_sum: discountSum.toFixed(2),
                total: total.toFixed(2),
                books,
            });

            return {
                sum: cartSession.sum.toFixed(2),
                discount_percent: cartSession.discount_percent.toFixed(2),
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
            await this.db.collection('cart_item').updateOne(
                { _id: new ObjectId(cartItemId) },
                { $inc: { quantity: 1 } }
            );
        } catch (error) {
            console.error('Error incrementing cart item quantity:', error);
            throw error;
        }
    }

    async addBookToCart(userId, bookOptionId) {
        try {
            const cartSession = await this.db.collection('cart_session').findOne({ user_id: new ObjectId(userId) });

            if (!cartSession) {
                throw new Error('Cart session not found for user.');
            }

            const cartSessionId = cartSession._id;

            const existingCartItem = await this.db.collection('cart_item').findOne({
                cart_session_id: cartSessionId,
                book_offer: new ObjectId(bookOptionId),
            });

            if (existingCartItem) {
                await this.incrementCartItem(existingCartItem._id);
            } else {
                await this.db.collection('cart_item').insertOne({
                    cart_session_id: cartSessionId,
                    book_offer: new ObjectId(bookOptionId),
                    quantity: 1,
                });
            }

            await this.updateCartSessionTotal(userId);
        } catch (error) {
            console.error('Error adding book to cart:', error);
            throw error;
        }
    }

    async addUser(name, mail, passwordHash) {
        try {
            const userResult = await this.db.collection('user').insertOne({
                name: name,
                mail: mail,
                password_hash: passwordHash,
            });

            const userId = userResult.insertedId;

            await this.db.collection('cart_session').insertOne({
                user_id: userId,
                discount_percent: 0,
                sum: 0,
            });

            console.log('User added successfully.');
        } catch (error) {
            console.error('Error adding user:', error);
            throw error;
        }
    }

    async findUserByEmail(mail) {
        try {
            const user = await this.db.collection('user').findOne({ mail });

            if (user) {
                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.mail,
                    password_hash: user.password_hash
                };
            }

            return null;
        } catch (error) {
            console.error('Error finding user by email:', error);
            throw error;
        }
    }

    async getBookViews(search_query = null, category_id = null, lang_id = null, state_id = null, limit = null) {
        try {
            const matchStage = { $and: [{ 'book_option.count': { $gt: 0 } }] };

            if (search_query) {
                matchStage.$and.push({ 'book.title': { $regex: search_query, $options: 'i' } });
            }
            if (category_id) {
                matchStage.$and.push({
                    $or: [
                        { 'book.category_id': new ObjectId(category_id) },
                        { 'category.parent_category': new ObjectId(category_id) },
                    ],
                });
            }
            if (lang_id) {
                matchStage.$and.push({ 'book.language_id': new ObjectId(lang_id) });
            }
            if (state_id) {
                matchStage.$and.push({ 'book_option.state_id': new ObjectId(state_id) });
            }

            // Build the aggregation pipeline
            const pipeline = [
                {
                    $lookup: {
                        from: 'book_option',
                        localField: '_id',
                        foreignField: 'book_id',
                        as: 'book_option',
                    },
                },
                { $unwind: '$book_option' },
                {
                    $lookup: {
                        from: 'category',
                        localField: 'category_id',
                        foreignField: '_id',
                        as: 'category',
                    },
                },
                { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
                { $match: matchStage },
                {
                    $group: {
                        _id: '$_id',
                        image_path: { $first: '$image_path' },
                        title: { $first: '$title' },
                        authors: { $first: '$authors' },
                        min_price: { $min: '$book_option.price' },
                        total_count: { $sum: '$book_option.count' },
                    },
                },
                //{ $sort: { title: 1 } }, // Sort alphabetically by title
            ];

            if (limit) {
                pipeline.push({ $limit: limit });
            }

            const books = await this.db.collection('book').aggregate(pipeline).toArray();

            return books.map(book => ({
                id: book._id.toString(),
                image_path: book.image_path,
                title: book.title,
                authors: book.authors,
                min_price: book.min_price,
                total_count: book.total_count,
            }));
        } catch (error) {
            console.error('Error fetching book views:', error);
            throw error;
        }
    }


    async getBookOffers(search_query = null, category_id = null, lang_id = null, state_id = null) {
        try {
            const matchStage = { $and: [] };

            if (search_query) {
                matchStage.$and.push({ title: { $regex: search_query, $options: 'i' } });
            }
            if (category_id) {
                matchStage.$and.push({
                    $or: [
                        { category_id: new ObjectId(category_id) },
                        { 'category.parent_category': new ObjectId(category_id) }
                    ]
                });
            }
            if (lang_id) {
                matchStage.$and.push({ language_id: new ObjectId(lang_id) });
            }
            if (state_id) {
                matchStage.$and.push({ 'book_option.state_id': new ObjectId(state_id) });
            }

            if (!matchStage.$and.length) {
                delete matchStage.$and;
            }

            // Build aggregation pipeline
            const pipeline = [
                {
                    $lookup: {
                        from: 'language',
                        localField: 'language_id',
                        foreignField: '_id',
                        as: 'language'
                    }
                },
                { $unwind: { path: '$language', preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: 'series',
                        localField: 'series_id',
                        foreignField: '_id',
                        as: 'series'
                    }
                },
                { $unwind: { path: '$series', preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: 'book_option',
                        localField: '_id',
                        foreignField: 'book_id',
                        as: 'book_option'
                    }
                },
                { $unwind: { path: '$book_option', preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: 'state',
                        localField: 'book_option.state_id',
                        foreignField: '_id',
                        as: 'state'
                    }
                },
                { $unwind: { path: '$state', preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: 'category',
                        localField: 'category_id',
                        foreignField: '_id',
                        as: 'category'
                    }
                },
                { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
                { $match: matchStage },
                {
                    $project: {
                        id: '$_id',
                        title: 1,
                        description: 1,
                        year: 1,
                        publisher: 1,
                        authors: 1,
                        image_path: 1,
                        language: '$language.name',
                        state: '$state.name',
                        state_id: '$book_option.state_id',
                        price: '$book_option.price',
                        count: '$book_option.count',
                        series_id: '$series._id',
                        series_name: '$series.name',
                        volume: 1
                    }
                },
                //{ $sort: { title: 1 } } // Sort alphabetically by title
            ];

            // Execute aggregation
            const rows = await this.db.collection('book').aggregate(pipeline).toArray();

            // Transform data into desired structure
            const bookOffers = rows.reduce((offers, row) => {
                let existingOffer = offers.find(offer => offer.id.equals(row.id));

                if (!existingOffer) {
                    existingOffer = {
                        id: row.id,
                        title: row.title,
                        desc: row.description,
                        language: row.language,
                        year: row.year,
                        publisher: row.publisher,
                        authors: row.authors,
                        series_id: row.series_id?.toString() || null,
                        series_name: row.series_name || null,
                        volume: row.volume,
                        image_path: row.image_path,
                        price_options: []
                    };
                    offers.push(existingOffer);
                }

                existingOffer.price_options.push({
                    state_id: row.state_id?.toString() || null,
                    state: row.state,
                    price: row.price,
                    count: row.count
                });

                return offers;
            }, []);

            return bookOffers;
        } catch (error) {
            console.error('Error fetching book offers:', error);
            throw error;
        }
    }

    async getBookOffersFromSeries(book_id, series_id) {
        try {
            const pipeline = [
                {
                    $match: {
                        series_id: new ObjectId(series_id), // Match books from the same series
                        _id: { $ne: new ObjectId(book_id) } // Exclude the given book
                    }
                },
                {
                    $lookup: {
                        from: 'book_option',
                        localField: '_id',
                        foreignField: 'book_id',
                        as: 'book_options'
                    }
                },
                {
                    $unwind: '$book_options' // Decompose the book_options array
                },
                {
                    $match: {
                        'book_options.count': { $gt: 0 } // Only include books with available stock
                    }
                },
                {
                    $group: {
                        _id: '$_id',
                        title: { $first: '$title' },
                        authors: { $first: '$authors' },
                        image_path: { $first: '$image_path' },
                        min_price: { $min: '$book_options.price' }, // Find the minimum price
                        total_count: { $sum: '$book_options.count' } // Sum the counts
                    }
                },
                {
                    $sort: { _id: 1 } // Optional: Sort results by ID
                }
            ];

            // Execute the aggregation pipeline
            const rows = await this.db.collection('book').aggregate(pipeline).toArray();

            // Map results to BookOfferView instances
            const bookViews = rows.map(row => ({
                id: row._id.toString(),
                title: row.title,
                authors: row.authors,
                image_path: row.image_path,
                min_price: row.min_price,
                total_count: row.total_count
            }));

            return bookViews;
        } catch (error) {
            console.error('Error fetching book offers from series:', error);
            throw error;
        }
    }
}

export default DBHandler;
