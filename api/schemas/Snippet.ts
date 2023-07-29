import { Schema, model } from 'mongoose';
export interface snippet {
    userId: string,
    language: string,
    code: string,
    evaluatorId: number,
    history: HistoryArray[]
}
interface HistoryArray {
    language: string,
    code: string
}
const schema = new Schema({
    userId: { type: String, required: true },
    language: { type: String, required: true },
    code: { type: String, required: true },
    evaluatorId: { type: Number, default: 0 },
    history: { type: Array, default: [] }
});
export default model<snippet>('Snippet', schema);