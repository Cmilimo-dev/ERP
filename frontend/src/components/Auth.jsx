'use client'

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Loader from './loader';

export const Auth = ({children}) => {
    const router = useRouter();
    const path = usePathname();
    const [loading, setLoading] = useState(true);

    if (typeof window !== 'undefined') {
        // Check if localStorage is available in the browser
        const userData = localStorage.getItem('user');
        const user = userData ? JSON.parse(userData) : null;
        
        useEffect(() => {
            if (!user) {
                console.log('No User');
                router.replace('/login');
            } else if (path === '/login') {
                router.replace('/');
            }

            // Set loading to false after authentication checks
            
            setTimeout(() => {
                setLoading(false);
            }, 2000)
        }, [router, user]); // Include router and user in the dependencies array
    }

    // Return null or placeholder content during the initial render
    return loading ? <Loader /> : <>{children}</>;
};

export const loginUser = (userId, username) => {
    localStorage.setItem('user', JSON.stringify({ userId, username }))
};

export const logoutUser = () => {
    localStorage.removeItem('user')
    window.location.replace('/login')
};