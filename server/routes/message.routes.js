const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');
const Conversation = require('../models/Conversation');



router.post('/conversation', authMiddleware, async (req, res) => {
    try {
        const {senderId, receivedId} = req.body;
        const newConversation = new Conversation({members: [senderId, receivedId]});
        await newConversation.save();
        res.status(200).send('Conversation created succesfully');
    } catch (error) {
        console.log(error, 'Error')
    }
});




router.get('/conversation/:userId', authMiddleware, async (req, res) => {
    try {
        const userId = req.params.userId;
        const conversations = await Conversation.find({members: { $in:[userId]}});
        console.log(userId, conversations)
        const conversationUserData = await Promise.all(conversations.map(async (conversation) => {
            const receivedId = conversation.members.find((member) => member !== userId);
            const user = await User.findById(receivedId);

        if (user) {
            return { user: { email: user.email }, conversationId: conversation._id, receivedId: receivedId };
        } else {
            return { user: { email: 'Unknown User' }, conversationId: conversation._id }; // Or handle it as per your requirement
        }
    
        }));
        console.log(conversationUserData)
        res.status(200).json({ conversations, conversationUserData });
    } catch (error) {
        console.log(error, 'Error');
        res.status(500).json({ error: 'An error occurred' });
    }
});






    router.get('/receive/:conversationId', authMiddleware, async (req, res) => {
        try {
            const conversationId = req.params.conversationId;
            if(conversationId === 'new') return res.status(200).json([])
            const messages = await Message.find({ conversationId });
            const messageUserData = Promise.all(messages.map(async (message) => {
                const user = await User.findById(message.senderId);
                return {user: {email: user.email}, message: message.messageText}
            }));
            res.status(200).json(await messageUserData);
        } catch (error) {
            console.error("Ошибка при отправке сообщения:", error);
            res.status(500).json({ message: 'Ошибка сервера при получении сообщений' });
        }
    });


module.exports = router;

