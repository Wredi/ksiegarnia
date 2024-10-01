import express from 'express';
import { dbHandler } from '../index.mjs';
import { getUserFromSession, isInt } from '../utils/utils.mjs';

const cartRouter = express.Router();

cartRouter.get('/', async (req, res) => {
    const user = getUserFromSession(req);
    if(!user) {
        return res.redirect('/login');
    }

    try {
        const cart = await dbHandler.getUserCart(user.id);
        res.render('cart', { cart, user: user});
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).send('Error loading cart');
    }
});

cartRouter.post('/', async (req, res) => {
    const user = getUserFromSession(req);
    if(!user) {
        return res.redirect('/login');
    }

    try {
        await dbHandler.processPayment(user.id);

        const cart = await dbHandler.getUserCart(user.id);
        res.render('cart', { cart, user: user, paymentMessage: 'Twoja płatność jest w realizacji.' });
    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).send('Error processing payment.');
    }
});

cartRouter.post('/update-quantity', async (req, res) => {
    const user = getUserFromSession(req);
    if(!user) {
        return res.status(500).json({ success: false, message: 'Error updating quantity' });
    }

    const userId = user.id;

    const { bookOptionId, quantity } = req.body;
    if(!isInt(bookOptionId) || !isInt(quantity)) {
        return res.status(500).json({ success: false, message: 'Error updating quantity' });
    }

    try {
        await dbHandler.updateCartItemQuantity(userId, bookOptionId, quantity);

        const updatedCart = await dbHandler.getUserCart(userId);
        res.json({ success: true, cart: updatedCart });
    } catch (error) {
        console.error('Error updating cart item quantity:', error);
        res.status(500).json({ success: false, message: 'Error updating quantity' });
    }
});

cartRouter.post('/delete-item', async (req, res) => {
    const user = getUserFromSession(req);
    if(!user) {
        return res.status(500).json({ success: false, message: 'Error updating quantity' });
    }

    const userId = user.id;
    const { bookOptionId } = req.body;

    if(!isInt(bookOptionId)) {
        return res.status(500).json({ success: false, message: 'Error updating quantity' });
    }

    try {
        await dbHandler.deleteCartItem(userId, bookOptionId);

        const updatedCart = await dbHandler.getUserCart(userId);
        res.json({ success: true, cart: updatedCart });
    } catch (error) {
        console.error('Error deleting cart item:', error);
        res.status(500).json({ success: false, message: 'Error deleting item' });
    }
});

export default cartRouter;
