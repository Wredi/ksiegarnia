import { Schema, Types, model } from 'mongoose';

const cartSessionSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    discountPercent: { type: Types.Decimal128 },
    sum: { type: Types.Decimal128 },
});

const CartSession = model('CartSession', cartSessionSchema);

export default CartSession;
