'use client'

import Loader from '@/components/loader';
import Navbar from '@/components/navbar'
import Sidebar from '@/components/sidebar'
import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react'

const MainLayout = ({children}) => {
    const [isSidebarVisible, setSidebarVisible] = useState(false);
    const sidebarRef = useRef(null);

    const toggleSidebar = () => {
        setSidebarVisible(!isSidebarVisible);
    };

    const closeSidebar = () => {
        setSidebarVisible(false);
    };

    const handleClickOutside = useCallback((event) => {
        if (sidebarRef.current && !sidebarRef.current.contains(event.target) && isSidebarVisible && document.documentElement.clientWidth <= 768) {
        closeSidebar();
        }
    }, [isSidebarVisible]);

    useEffect(() => {
        document.addEventListener('click', handleClickOutside);

        return () => {
        document.removeEventListener('click', handleClickOutside);
        };
    }, [handleClickOutside]);

    useEffect(() => {
        const handleResize = () => {
        // Adjust this value based on your design breakpoints
        const isLargeLayout = window.innerWidth >= 768;
        setSidebarVisible(isLargeLayout);
        };

        // Call it once to set the initial state
        handleResize();

        // Attach the event listener for window resize
        window.addEventListener('resize', handleResize);

        // Cleanup the event listener on component unmount
        return () => {
        window.removeEventListener('resize', handleResize);
        };
    }, []);


    return <Suspense fallback={<Loader />}>
        <main className='flex'>
        <Sidebar ref={sidebarRef} 
        className={`min-w-[15rem] 
        text-white h-[100vh] 
        bg-[#1e293b] p-1 z-50
        ${isSidebarVisible ? 'flex flex-col fixed opacity-100 ml-0' 
        : 
        'opacity-0 ml-[-240px]'} 
        transition-all 
        ease-linear 
        duration-300`} onClose={closeSidebar} />
        <section className={`flex flex-col items-center md:justify-start md:items-start lg:overflow-hidden 
        transition-all 
        ease-linear 
        duration-300`}>
            <Navbar toggleSidebar={toggleSidebar} />
            <section className={`${isSidebarVisible && 'lg:ml-[15rem]'}`}>
                {children}
            </section>
        </section>
        </main>
    </Suspense>
    };

    export default MainLayout;