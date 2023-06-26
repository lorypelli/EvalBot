import { Schema, model } from "mongoose"
let schema = new Schema({
    userId: { type: String, required: true },
    language: { type: String, required: true },
    code: { type: String, required: true },
})
export = model("Snippet", schema)