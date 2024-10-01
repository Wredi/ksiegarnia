import express from 'express';
import { resolve } from "path";
import { dbHandler } from '../index.mjs';
import qs from 'qs';
import { getUserFromSession } from '../utils/utils.mjs';

const commonRouter = express.Router();

const __dirname = import.meta.dirname;
let parentDirPath = resolve(__dirname, '..');
const publicDirPath = parentDirPath + "/public";

commonRouter.use(express.static(publicDirPath));

commonRouter.get('/', async (req, res) => {
    try {
        const bookOffers = await dbHandler.getBookViews(
            null, null, null, null, 6
        );
        const user = getUserFromSession(req);
        res.render('home', { 
            user,
            recentBooks: bookOffers
        });
    } catch (error) {
        console.error("Error: ", error);
        res.status(500).send("Internal Server Error");
    }
});

commonRouter.get('/browse', async (req, res) => {
    try {
        const params = qs.parse(req.query);  
        const bookOffers = await dbHandler.getBookOffers(
            params.search, params.category, params.language, params.state
        );
        const filters = await dbHandler.getBookFilters();
        
        const choosenFilters = {
            category: params.category, 
            language: params.language, 
            state: params.state
        };

        const user = getUserFromSession(req);  
        res.render('browse', { 
            books: bookOffers, 
            filters: filters, choosenFilters: choosenFilters, 
            searchPhrase: params.search, user 
        });
    } catch (error) {
        console.error("Error: ", error);
        res.status(500).send("Internal Server Error");
    }
});

function getPriceOptionId(book) {
    const element = book.price_options.find(o => o.count > 0);
    return element === undefined ? null : element.id;
}

commonRouter.route('/book/:id')
    .get(async (req, res) => {
        const bookId = req.params.id;
        const user = getUserFromSession(req);  

        try {
            const book = await dbHandler.getBookWithPriceOptions(bookId);
            
            if (!book) {
                return res.status(404).send("Book not found");
            }

            const seriesOffers = await dbHandler.getBookOffersFromSeries(book.id, book.series_id);

            res.render('book', { 
                book, 
                user, 
                selectedPriceOptionId: getPriceOptionId(book), 
                seriesOffers,
                message: null, 
                errorMessage: null 
            });
        } catch (error) {
            console.error("Error fetching book: ", error);
            res.status(500).send("Internal Server Error");
        }
    })
    .post(async (req, res) => {
        const bookId = req.params.id;
        const { priceOptionId } = req.body;
        const user = getUserFromSession(req);  

        const book = await dbHandler.getBookWithPriceOptions(bookId);
        
        if (!book) {
            return res.status(404).send("Book not found");
        }

        const seriesOffers = await dbHandler.getBookOffersFromSeries(book.id, book.series_id);

        if (!user) {
            return res.render('book', { 
                book: book, 
                user: null, 
                selectedPriceOptionId: getPriceOptionId(book), 
                seriesOffers,
                errorMessage: 'Musisz być zalogowany, aby dodać książkę do koszyka.', 
                message: null 
            });
        }

        try {
            await dbHandler.addBookToCart(user.id, priceOptionId);

            res.render('book', { 
                book: book, 
                user: user, 
                selectedPriceOptionId: getPriceOptionId(book), 
                seriesOffers,
                message: 'Książka została dodana do koszyka!', 
                errorMessage: null 
            });
        } catch (error) {
            console.error("Error adding to cart: ", error);
            res.status(500).send("Internal Server Error");
        }
    });

export default commonRouter;
