import { Schema, model } from 'mongoose';

const bookSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    language: { type: Schema.Types.ObjectId, ref: 'Language' },
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    series: { type: Schema.Types.ObjectId, ref: 'Series' },
    volume: { type: Number },
    year: { type: Number },
    publisher: { type: String },
    authors: { type: String }, 
    imagePath: { type: String },
});

const Book = model('Book', bookSchema);
export default Book;
