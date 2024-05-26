import React, {useState} from 'react';
import { Link } from 'react-router-dom';
import './navbar.scss'
import Logo from '../../assets/img/navbar-logo.svg'
import { useSelector, useDispatch } from 'react-redux';
import useAuth from "../../hooks/useAuth"
import { logout } from '../../reducers/userReducer';
import {getFiles, searchFiles} from "../../action/file";
import {showLoader} from "../../reducers/appReducer";
import avatarLogo from '../../assets/img/avatar.svg' 


const Navbar = () => {
  const { isAuth } = useAuth();
  const currentDir = useSelector(state => state.files.currentDir);
  const currentUser = useSelector(state => state.user.currentUser);
  const dispatch = useDispatch();

  const [searchName, setSearchName] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(false);

  const avatar = avatarLogo

  function searchChangeHandler(e) {
      setSearchName(e.target.value);
      if (searchTimeout !== false) {
          clearTimeout(searchTimeout);
      }
      dispatch(showLoader());
      if (e.target.value !== '') {
          setSearchTimeout(setTimeout((value) => {
              dispatch(searchFiles(value));
          }, 500, e.target.value));
      } else {
          dispatch(getFiles(currentDir));
      }
  }

  return (
      <div className="navbar">
          <div className="container navbar__box">
              <div className='navbar__column'>
                  <div className="navbar__logo">
                      <img src={Logo} alt="" />
                  </div>
                  <div className="navbar__header">ОБЛАЧНОЕ ХРАНИЛИЩЕ</div>
              </div>

              <div className='navbar__column'>
                  {isAuth() && window.location.pathname === "/" && <input
                      value={searchName}
                      onChange={e => searchChangeHandler(e)}
                      className='navbar__search'
                      type="text"
                      placeholder="Найти по названию..."
                  />}
                  
                  { !isAuth() && <div className="navbar__log">
                      <Link to="/authorization">ВОЙТИ</Link>
                  </div> }
                  
                  {!isAuth() && <div className="navbar__log">
                      <Link to="/registration">РЕГИСТРАЦИЯ</Link>
                  </div> }
                  
                  {isAuth() && <div className="navbar__login" onClick={() => dispatch(logout())}>
                      ВЫХОД
                  </div> }
                  {isAuth() && <Link to='/profile'>
                      <img className="navbar__avatar" src={avatar} alt=""/>
                  </Link>}
              </div>
          </div>
      </div>
  );
};

export default Navbar;