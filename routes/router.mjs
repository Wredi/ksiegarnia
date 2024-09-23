import express from 'express';
import { resolve } from "path";
import { dbHandler } from '../index.mjs';
import qs from 'qs';
import { getUserFromSession } from '../utils/utils.mjs';

const router = express.Router();

const __dirname = import.meta.dirname;
let parentDirPath = resolve(__dirname, '..');
const publicDirPath = parentDirPath + "/public";
const htmlDirPath = parentDirPath + "/views";

router.use(express.static(publicDirPath));

router.get('/', async (req, res) => {
    try {
        const params = qs.parse(req.query);  
        const bookOffers = await dbHandler.getBookOffers(
            params.search, params.category, params.language, params.state
        );
        
        const user = getUserFromSession(req);  
        res.render('home', { books: bookOffers, user });
    } catch (error) {
        console.error("Error: ", error);
        res.status(500).send("Internal Server Error");
    }
});

router.route('/book/:id')
    .get(async (req, res) => {
        const bookId = req.params.id;
        const user = getUserFromSession(req);  

        try {
            const book = await dbHandler.getBookWithPriceOptions(bookId);
            
            if (!book) {
                return res.status(404).send("Book not found");
            }

            res.render('book', { 
                book, 
                user, 
                selectedPriceOptionId: book.price_options[0].id, 
                selectedPrice: book.price_options[0].price, 
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
        
        if (!user) {
            return res.render('book', { 
                book: book, 
                user: null, 
                selectedPriceOptionId: book.price_options[0].id, 
                selectedPrice: book.price_options[0].price, 
                errorMessage: 'Musisz być zalogowany, aby dodać książkę do koszyka.', 
                message: null 
            });
        }

        try {
            await dbHandler.addBookToCart(user.id, priceOptionId);

            res.render('book', { 
                book: book, 
                user: user, 
                selectedPriceOptionId: book.price_options[0].id, 
                selectedPrice: book.price_options[0].price, 
                message: 'Książka została dodana do koszyka!', 
                errorMessage: null 
            });
        } catch (error) {
            console.error("Error adding to cart: ", error);
            res.status(500).send("Internal Server Error");
        }
    });

router.get('/cart', (req, res) => {
    res.sendFile("cart.html", {root: htmlDirPath});
});

export default router;
