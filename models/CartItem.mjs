import { Schema, model } from 'mongoose';

const cartItemSchema = new Schema({
    cartSession: { type: Schema.Types.ObjectId, ref: 'CartSession', required: true },
    bookOffer: { type: Schema.Types.ObjectId, ref: 'BookOption', required: true },
    quantity: { type: Number, required: true },
});

const CartItem = model('CartItem', cartItemSchema);

export default CartItem;
