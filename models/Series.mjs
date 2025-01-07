import { Schema, model } from 'mongoose';

const seriesSchema = new Schema({
    name: { type: String, required: true },
});

const Series = model('Series', seriesSchema);
export default Series;
