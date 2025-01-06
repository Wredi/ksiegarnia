import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';

import commonRouter from "./routes/commonRouter.mjs";
import userRouter from "./routes/userRouter.mjs";
import cartRouter from "./routes/cartRouter.mjs";

import process from 'process';

import DBHandler from './db/db_handler.mjs';
import { config } from 'dotenv';

config();

/*
const dbHandler = new DBHandler(
    process.env.DB_HOST,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    process.env.DB_NAME,
    process.env.DB_PORT
);
export { dbHandler };
*/
const dbHandler = new DBHandler(
    "mongodb://0.0.0.0:27017",
    "sklep"
);
await dbHandler.connect();
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

    const app = express();

    app.set('views', viewsDirPath );
    app.set('view engine', 'ejs');

    app.use(session({
        secret: 'your_secret_key', 
        resave: false, 
        saveUninitialized: false, 
        cookie: { secure: false }
    }));
    app.use(express.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    app.use('/', commonRouter);
    app.use('/', userRouter);
    app.use('/cart', cartRouter);

    const server = app.listen(8011, (err) => {
        if (err) {
            console.log("Uwaga błąd!", err.message);
            return
        }

        console.log(`http://localhost:8011`);
    });
}
