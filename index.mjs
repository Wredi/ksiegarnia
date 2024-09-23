import express from 'express';
import router from "./routes/router.mjs";
import process from 'process';
import { resolve } from "path";

import DBHandler from './db/db_handler.mjs';
import { config } from 'dotenv';

config();

const dbHandler = new DBHandler(
    process.env.DB_HOST,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    process.env.DB_NAME,
    process.env.DB_PORT
);
export { dbHandler };

if(process.env.INIT){
    await dbHandler.initDatabase();
    process.exit(0);
}else if(process.env.TRUNCATE){
    await dbHandler.truncateDatabase();
    process.exit(0);
}else{
    const __dirname = import.meta.dirname;
    let viewsDirPath = __dirname+ '/views';
    console.log(viewsDirPath);

    const app = express();

    app.set('views', viewsDirPath );
    app.set('view engine', 'ejs');

    const PORT = 8011;

    app.use('/', router);
    const server = app.listen(PORT, (err) => {
        if (err) {
            console.log("Uwaga błąd!", err.message);
            return
        }

        console.log(`Serwer nasłuchuje na porcie ${PORT}`);
        console.log(`Wpisz w pasku adresu przeglądarki: http://localhost:${PORT}`);
    });
}
