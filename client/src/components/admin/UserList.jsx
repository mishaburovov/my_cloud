import React, { useEffect, useState } from 'react';
import axiosInstance from '../../axios';
import User from './User';  // Ensure this is the path to your User component
import './userList.scss'


const UserList = () => {
    const [users, setUsers] = useState([]);

    const fetchUsers = async () => {
        try {
            const response = await axiosInstance.get('/users');
            console.log(response)
            setUsers(response.data);
        } catch (e) {
            console.error('Failed to fetch users:', e);
        }
    };

    const handleDeleteUser = async (userId) => {
        try {
            await axiosInstance.delete(`/users/${userId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setUsers(users.filter(user => user.id !== userId));
        } catch (e) {
            console.error('Failed to delete user:', e);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className='userList'>
            {users.map(user => (
                <User key={user.id} user={user} onDelete={() => handleDeleteUser(user.id)} />
            ))}
        </div>
    );
    
};

export default UserList;
