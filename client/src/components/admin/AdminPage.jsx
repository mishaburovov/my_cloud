import React from 'react';
import UserList from './UserList';
import "./adminPage.scss"

const AdminPage = () => {
    return (
        <div className='adminPage'>
            <div className='adminPage__header'>Панель Администратора</div>
            <UserList />
        </div>
    );
}

export default AdminPage;