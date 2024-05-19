const {Schema, model, ObjectId} = require("mongoose")


const Coversation = new Schema({
    members: {type: Array, required: true}
})

module.exports = model('Conversation', Coversation)