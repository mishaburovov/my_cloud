import React from 'react';
import './user.scss';
import axios from 'axios';

const User = ({ user, onDelete }) => {
    const handleDelete = async () => {
        try {
            await axios.delete(`http://localhost:5000/api/auth/users/${user._id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            onDelete(user.id);
        } catch (e) {
            console.error(e);
        }
    };


    const handleIncreaseSpace = async (increaseAmount) => {
        try {
            const response = await axios.post('http://localhost:5000/api/auth/increaseDiskSpace', {
                userId: user._id,
                increaseAmount: increaseAmount
            }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
            alert(response.data.message);
        } catch (e) {
            console.error(e);
            alert(e.response.data.message);
        }
    };

    const bytesToGigabytes = (bytes) => (bytes / (1024 ** 3)).toFixed(2); // Convert bytes to GB and round to two decimal places

    return (
        <div className="user">
            <div className="user__img">
            </div>
            <h3>{user.email}</h3>
            <div className="user__details">
                <p>Доступное пространство: {bytesToGigabytes(user.diskSpace)} GB</p>
                <p>Использовано: {bytesToGigabytes(user.usedSpace)} GB</p>
                <p>Роль: {user.roles.join(', ')}</p>
            </div>
            <div className="user__buttons">
                <button onClick={handleDelete}>Delete User</button>
                <button onClick={() => handleIncreaseSpace(1)}>+ 1 GB</button>
                <button onClick={() => handleIncreaseSpace(5)}>+ 5 GB</button>
                <button onClick={() => handleIncreaseSpace(10)}>+ 10 GB</button>
            </div>
        </div>
    );
};

export default User;