import { Schema, model } from "mongoose"
interface schema {
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
let schema = new Schema({
    userId: { type: String, required: true },
    language: { type: String, required: true },
    code: { type: String, required: true },
    evaluatorId: { type: Number, default: 0 },
    history: { type: Array, default: [] }
})
export = model<schema>("Snippet", schema)