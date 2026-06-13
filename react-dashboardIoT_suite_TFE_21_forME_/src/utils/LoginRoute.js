import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Adjust the import path as necessary

const LoginRoute = ({ children }) => {
    const { user } = useAuth();

    // If the user is authenticated, redirect them to the home page
    if (user) {
        return <Navigate to="/" replace />;
    }

    // If not authenticated, render the children components (Login page in this case)
    return children;
};

export default LoginRoute;