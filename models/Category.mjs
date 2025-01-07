import { Schema, model } from 'mongoose';

const categorySchema = new Schema({
    name: { type: String, required: true },
    parentCategory: { type: Schema.Types.ObjectId, ref: 'Category' },
});

const Category = model('Category', categorySchema);

export default Category;
