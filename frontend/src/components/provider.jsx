'use client'

import React, { createContext, useState } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const loginUser = (userId, username) => {
        setUser({ userId, username });
        localStorage.setItem('user', JSON.stringify({ userId, username }))
    };

    const logoutUser = () => {
        setUser(null);
        localStorage.removeItem('user')
    };

    return (
        <UserContext.Provider value={{ user, loginUser, logoutUser }}>
            {children}
        </UserContext.Provider>
    );
};