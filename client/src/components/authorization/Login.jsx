import React from "react";
import './authorization.scss'
import Input from "../UI/Input";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { login } from "../../action/user";

const Login = () => {

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const dispatch = useDispatch()

    return (
        <div className="authorization">
            <div className="authorization__header">Войти</div>
            <Input value={email} setValue={setEmail} type="text" placeholder="Введите email..."/>
            <Input value={password} setValue={setPassword} type="password" placeholder="Введите пароль..."/>
            <button className="authorization__btn" onClick={() => dispatch(login(email, password))}>Войти</button>
        </div> 
    );
};

export default Login;