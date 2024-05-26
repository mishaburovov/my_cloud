const express = require("express");
require('dotenv').config();
const mongoose = require("mongoose");
const fileUpload = require("express-fileupload");
const cors = require('cors');
const io = require("socket.io")(8080, {
    cors: { origin: '*' }
});
const corsMiddleware = require("./middleware/cors.middleware");
const authRouter = require("./routes/auth.routes");
const fileRouter = require("./routes/file.routes");
const messageRouter = require("./routes/message.routes");

const Message = require('./models/Message');
const UserModel = require('./models/User');
const Conversation = require('./models/Conversation');
const cookieParser = require('cookie-parser');
const errorMiddleware = require('./middleware/error-middleware');
const filePathMiddleware = require('./middleware/filepath.middleware')
const path = require('path');
const init = require('./init');

const app = express();
app.use(fileUpload({}));
app.use(corsMiddleware);
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL
}));
app.use(express.static("static"));
app.use(filePathMiddleware(path.join(__dirname, process.env.FILE_PATH)));
app.use("/api", authRouter);
app.use("/api/files", fileRouter);
app.use("/api/message", messageRouter);
app.use(errorMiddleware);



const PORT = process.env.PORT;

const start = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL);

        init()
        app.listen(PORT, () => {
            console.log("Server started on PORT", PORT);
        });
    } catch (e) {
        console.log(e, "Error connecting to MongoDB");
    }
};

start();

io.on("connection", socket => {
    console.log("New client connected");


    socket.on("sendMessage", async (data) => {
        const { conversationId, senderId, messageText, receiverId, email } = data;
        console.log('Получено сообщение от клиента:', data);
        let conversation;
        if (!conversationId && receiverId) {
            conversation = new Conversation({ members: [senderId, receiverId] });
            await conversation.save();
        }
        const newMessage = new Message({
            conversationId: conversation ? conversation._id : conversationId,
            senderId,
            messageText
        });
        await newMessage.save();
        const message = {
            user: { email: email },
            conversationId: conversation ? conversation._id : conversationId,
            senderId,
            message: messageText
        }
        console.log(conversationId)
        io.emit(conversationId, message);

    });

});

module.exports = app;

