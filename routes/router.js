const express = require('express');
const path = require("path");

const router = express.Router();

let parentDirPath = path.resolve(__dirname, '..');

const publicDirPath = parentDirPath + "/public";
const htmlDirPath = parentDirPath + "/views";

router.use(express.static(publicDirPath));

router.get('/', (req, res) => {
    res.sendFile("home.html", {root: htmlDirPath});
})

router.get('/book', (req, res) => {
    res.sendFile("book.html", {root: htmlDirPath});
})

router.get('/cart', (req, res) => {
    res.sendFile("cart.html", {root: htmlDirPath});
})

module.exports = router;
