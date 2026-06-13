import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
const ProtectedRoutes = ()=>{
    const {user, loading} = useAuth()
    if (loading) return <div>Loading...</div>
    return user ? <Outlet/>:<Navigate to="/login"/>
}
export default ProtectedRoutes