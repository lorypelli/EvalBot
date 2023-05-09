const { Schema, model } = require("mongoose")
let schema = new Schema({
    userId: { type: String, required: true },
    language: { type: String, required: true },
    code: { type: String, required: true },
})
module.exports = model("Snippet", schema)