import { Schema, Types, model } from 'mongoose';

const bookOptionSchema = new Schema({
    book: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    state: { type: Schema.Types.ObjectId, ref: 'State', required: true },
    price: { type: Types.Decimal128, required: true },
    count: { type: Number, required: true },
});
const BookOption = model('BookOption', bookOptionSchema);

export default BookOption;
