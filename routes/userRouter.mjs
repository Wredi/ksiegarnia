import express from 'express';
import bcrypt from 'bcrypt';
import { dbHandler } from '../index.mjs';
import { getUserFromSession } from '../utils/utils.mjs';

const userRouter = express.Router();

userRouter.get('/register', (req, res) => {
    const user = getUserFromSession(req);  
    res.render('register', { user });
});

userRouter.get('/login', (req, res) => {
    const user = getUserFromSession(req); 
    res.render('login', { user });
});

userRouter.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await dbHandler.findUserByEmail(email); 
        
        if (!user) {
            return res.render('login', { user: getUserFromSession(req), errorMessage: 'Niepoprawny email bądź hasło' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        
        if (!isPasswordValid) {
            return res.render('login', { user: getUserFromSession(req), errorMessage: 'Niepoprawny email bądź hasło' });
        }

        req.session.userId = user.id;
        req.session.userName = user.name;

        res.redirect('/');
    } catch (error) {
        console.error("Login Error: ", error);
        res.status(500).send("Internal Server Error");
    }
});

userRouter.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send("Could not log out.");
        }
        res.redirect('/login');
    });
});

userRouter.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    
    try {
        const existingUser = await dbHandler.findUserByEmail(email);
        if (existingUser) {
            return res.render('register', { user: getUserFromSession(req), errorMessage: 'Ten email jest już użytkowany' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await dbHandler.addUser(name, email, hashedPassword);

        res.render('register', { user: getUserFromSession(req), successMessage: 'Zarejestrowano pomyślnie!' });
    } catch (error) {
        console.error("Error: ", error);
        res.status(500).send("Internal Server Error");
    }
});

export default userRouter;
