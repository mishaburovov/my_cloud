import React, { useEffect, useState } from "react";
import { Route, Routes, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from "react-redux";
import Registration from "./authorization/Registration";
import Login from "./authorization/Login";
import Disk from "./disk/Disk";
import Profile from "./profile/Profile";
import Navbar from "./navbar/Navbar";
import AdminPage from "./admin/AdminPage";
import { auth } from "../action/user";
import './app.scss';

function App() {
    const { isAuth, roles } = useSelector(state => state.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();


    useEffect(() => {
        dispatch(auth());
    }, [dispatch]);

    useEffect(() => {
        if (isAuth !== null) {
            if (roles.includes('ADMIN')) {
                navigate("/admin");
            } else {
                navigate(isAuth ? "/" : "/login");
            }
        }
    }, [isAuth]);





    return (
        <div className="app">
            <Navbar/>
            <div className="container app__container">
                {!isAuth ?
                <Routes>
                    <Route path="/registration" element={<Registration/>}/>
                    <Route path="/authorization" element={<Login/>}/>
                    <Route path="*" element={<Login/>} />
                </Routes>
                :
                <Routes>
                    <Route exact path="/" element={<Disk/>}/>
                    <Route path="/profile" element={<Profile/>} />
                    <Route path="/admin" element={<AdminPage />} />
                    <Route path="*" element={roles.includes('ADMIN') ? <AdminPage /> : <Disk />} />
                </Routes>
                }
            </div>
        </div>
    );
}

export default App;