import { useSelector, useDispatch } from "react-redux";

export default function useAuth(){
    const auth = useSelector(state=>state.user.isAuth)
    const isAuth = ()=>auth

    return {
        isAuth
    }
}