import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { io } from 'socket.io-client';
import axios from 'axios';
import './chat.scss';

const Chat = ({ conversationId, userId, receiverId }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const token = localStorage.getItem('token');
    const [socket, setSocket] = useState(null);
    const user = useSelector(state=>state.user)
  
    useEffect(() => {
        console.log(conversationId)
        const newSocket = io(`http://localhost:8080`);
        setSocket(newSocket);

        newSocket.on("connect", () => {
            console.log("Соединение установлено");
        });
     
        newSocket.on(conversationId, (message) => {
            setMessages(prevMessages => [...prevMessages, message]);
            console.log(message);
        });

        newSocket.on("disconnect", () => {
            console.log("Соединение разорвано");
        });

        return () => newSocket.close();
    }, [conversationId]);


    const fetchMessages = async () => {
        if (!token) {
            console.error('Authorization token is missing. Please login.');
            return;
        }

        try {
            const response = await axios.get(`http://localhost:5000/api/message/receive/${conversationId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(response.data);
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim()) return;
        if (!token) {
            console.error('Authorization token is missing. Please login.');
            return;
        }

        const messageData = {
            conversationId,
            senderId: userId,
            email: user.currentUser.email,
            messageText: newMessage,  
            receiverId: receiverId
        };

        socket.emit("sendMessage", messageData);
        setNewMessage("");
    };

    useEffect(() => {
        if (conversationId) {
            fetchMessages();
        }
    }, [conversationId]);

    return (
        <div className="chat-container">
            <div className="chat-messages">
                {messages.map((msg, index) => (
                    <div key={msg.id} className="chat-message">
                        <strong>{msg.user.email}:</strong> {msg.message}
                    </div>
                ))}
            </div>
            <div className="chat-input">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Ваше сообщение..."
                />
                <button onClick={sendMessage}>Send</button>
            </div>
        </div>
    );
};

export default Chat;

