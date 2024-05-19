import React, { useState, useEffect } from 'react';
import './profile.scss';
import Chat from "./Chat";
import { useSelector } from 'react-redux';
import axios from 'axios';

const Profile = () => {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [receiverId, setReceiverId] = useState(null);
    const {currentUser: user} = useSelector(state => state.user);
    const token = localStorage.getItem('token');
    console.log("receiverId", receiverId)
    const fetchConversations = async () => {
        if (!token) {
            console.error('Authorization token is missing. Please login.');
            return;
        }

        try {
            if (user && user.id) {
                const response = await axios.get(`http://localhost:5000/api/message/conversation/${user.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                setConversations(response.data.conversationUserData);
            }
        } catch (error) {
            console.error("Error fetching conversations:", error);
        }
    };

    useEffect(() => {
        console.log("yes")
        fetchConversations();

    }, []);
    
    const bytesToGigabytes = (bytes) => (bytes / (1024 ** 3)).toFixed(2);

    const usedSpaceInGB = bytesToGigabytes(user.usedSpace);
    const freeSpaceInGB = bytesToGigabytes(user.diskSpace-user.usedSpace);
    const totalSpaceInGB = bytesToGigabytes(user.diskSpace);
    

    return (
        <div className="profile-container">
            <div className="user-info">
                <h2>Пользователь</h2>
                {user ? (
                    <div>
                        <p>Email: {user.email}</p>
                        <p>Размер диска: {totalSpaceInGB} GB</p>
                        <p>Свободно: {freeSpaceInGB} GB</p>
                        <p>Использовано: {usedSpaceInGB} GB</p>
                        
                    </div>
                ) : (
                    <p>No user information available</p>
                )}
            </div>

            <div className="conversations-list">
                <h2>Поддержка:</h2>
                <ul>
                    {conversations.map((conv, index) => (
                        <li key={conv.conversationId} onClick={() => { setSelectedConversation(conv.conversationId); setReceiverId(conv.receiverId); }}>
                            {conv.user.email}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="chat-section">
                {selectedConversation ? (
                    <Chat conversationId={selectedConversation} userId={user.id} receiverId={receiverId} />
                ) : (
                    <h2>Выбор чата</h2>
                )}
            </div>
        </div>
    );
};

export default Profile;
