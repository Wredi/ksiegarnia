const express = require('express');
const router = require("./routes/router");

const app = express();

const PORT = 8011;

app.use('/', router);

const server = app.listen(PORT, (err) => {
    if (err) {
        console.log("Uwaga błąd!", err.message);
        return
    }

    console.log(`Serwer nasłuchuje na porcie ${PORT}`);
    console.log(`Wpisz w pasku adresu przeglądarki: http://localhost:${PORT}`);
})

