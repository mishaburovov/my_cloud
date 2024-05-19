const { Schema, model, ObjectId } = require('mongoose');

const Message= new Schema({
  conversationId: {type: String},
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  messageText: { type: String, required: true },
});

module.exports = model('Message', Message);