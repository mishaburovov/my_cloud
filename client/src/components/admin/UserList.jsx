import React, { useEffect, useState } from 'react';
import axios from 'axios';
import User from './User';  // Ensure this is the path to your User component
import './userList.scss'


const UserList = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/auth/users', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setUsers(response.data);
        } catch (e) {
            console.error('Failed to fetch users:', e);
        }
    };

    const handleDeleteUser = async (userId) => {
        try {
            await axios.delete(`http://localhost:5000/api/auth/users/${userId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setUsers(users.filter(user => user.id !== userId));
        } catch (e) {
            console.error('Failed to delete user:', e);
        }
    };

    return (
        <div className='userList'>
            {users.map(user => (
                <User key={user.id} user={user} onDelete={() => handleDeleteUser(user.id)} />
            ))}
        </div>
    );
    
};

export default UserList;
