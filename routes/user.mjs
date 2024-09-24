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

userRouter.get('/cart', async (req, res) => {
    const user = getUserFromSession(req);

    try {
        const cart = await dbHandler.getUserCart(user.id);
        res.render('cart', { cart, user: user});
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).send('Error loading cart');
    }
});

userRouter.post('/cart/update-quantity', async (req, res) => {
    const user = getUserFromSession(req);
    const userId = user.id;

    const { bookOptionId, quantity } = req.body;

    try {
        await dbHandler.updateCartItemQuantity(userId, bookOptionId, quantity);

        const updatedCart = await dbHandler.getUserCart(userId);
        res.json({ success: true, cart: updatedCart });
    } catch (error) {
        console.error('Error updating cart item quantity:', error);
        res.status(500).json({ success: false, message: 'Error updating quantity' });
    }
});

userRouter.post('/cart/delete-item', async (req, res) => {
    const user = getUserFromSession(req);
    const userId = user.id;
    const { bookOptionId } = req.body;

    try {
        await dbHandler.deleteCartItem(userId, bookOptionId);

        const updatedCart = await dbHandler.getUserCart(userId);
        res.json({ success: true, cart: updatedCart });
    } catch (error) {
        console.error('Error deleting cart item:', error);
        res.status(500).json({ success: false, message: 'Error deleting item' });
    }
});

export default userRouter;
