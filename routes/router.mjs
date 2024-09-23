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

router.get('/book', (req, res) => {
    res.sendFile("book.html", {root: htmlDirPath});
});

router.get('/cart', (req, res) => {
    res.sendFile("cart.html", {root: htmlDirPath});
});

export default router;
