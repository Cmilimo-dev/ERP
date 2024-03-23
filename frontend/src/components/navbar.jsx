'use client'

import Image from 'next/image'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import open_sidebar from '../../public/open_sidebar.svg'
import settings from '../../public/settings.svg'
import Link from 'next/link'
import { HelpBox } from './popups'
import { logoutUser } from './Auth'

const Navbar = ({ toggleSidebar }) => {
    const [isDropdownVisible, setDropdownVisible] = useState(false);
    const [isSidebarVisible, setSidebarVisible] = useState(false);
    const dropdownRef = useRef(null);
    
    // const [isReportsVisible, setReportsVisible] = useState(false);
    // const reportsTimeRef = useRef(null);
    
    const [isHelpVisible, setHelpVisible] = useState(false);
    const helpRef = useRef(null);

    // const handleMouseEnter = () => {
    //     clearTimeout(reportsTimeRef.current);
    //     setReportsVisible(true);
    // };

    // const handleMouseLeave = () => {
    //     reportsTimeRef.current = setTimeout(() => {
    //     setReportsVisible(false);
    //     }, 200); // Adjust the delay as needed
    // };

    // Clear the timeout when the component unmounts
    // useEffect(() => {
    //     return () => clearTimeout(reportsTimeRef.current);
    // }, []);


    const handleSettingsClick = () => {
        setDropdownVisible(!isDropdownVisible);
    };

    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setDropdownVisible(false);
        }
    };
    
    const helpClickOutside = useCallback((event) => {
        if (helpRef.current && !helpRef.current.contains(event.target) && isHelpVisible) {
            closeHelp();
        }
    }, [isHelpVisible]);

    useEffect(() => {
        document.addEventListener('click', handleClickOutside);
        document.addEventListener('click', helpClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
            document.removeEventListener('click', helpClickOutside);
        };
    }, [helpClickOutside]);

    
    useEffect(() => {
        const handleResize = () => {
          // Adjust this value based on your design breakpoints
            const isLargeLayout = document.documentElement.clientWidth >= 1024;
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

        
    const closeHelp = () => {
        setHelpVisible(false);
    };

    return (
        <header className={`bg-white border-slate-200 border-b-2 shadow-md shadow-[#7171c516] flex justify-between items-center p-2 w-[100vw] h-[5vh]`}>
            <div className="flex items-center justify-center">
                <button className="text-slate-800 lg:hidden" aria-controls="sidebar" aria-expanded="false" onClick={() => {
                    setSidebarVisible(!isSidebarVisible);
                    toggleSidebar()
                    }}>
                    <Image src={open_sidebar} alt="sidebar" className='w-[30px] h-[30px]' />
                </button>
            </div>
            <div className="flex gap-1 items-center justify-center p-1 md:ml-[10rem]">
                <Link href='/' tabIndex='-1' >
                    <button className="text-slate-800 hover:bg-gray-200 rounded-md transition-all ease-linear duration-300 w-[100px] cursor-pointer" aria-controls="sidebar" aria-expanded="false">
                        Home
                    </button>
                </Link>
                <Link href='/cheques' tabIndex='-1' >
                    <button className="text-slate-800 hover:bg-gray-200 rounded-md transition-all ease-linear duration-300 w-[100px] cursor-pointer" aria-controls="sidebar" aria-expanded="false">
                        Cheques
                    </button>
                </Link>
                <Link href='/reports' tabIndex='-1' >
                    <button className="text-slate-800 hover:bg-gray-200 rounded-md transition-all ease-linear duration-300 w-[100px] cursor-pointer" aria-controls="sidebar" aria-expanded="false">
                        Reports
                    </button>
                </Link>
                {/* <div className="relative">
                <div>
                    <button onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="text-slate-800 hover:bg-gray-200 rounded-md transition-all ease-linear duration-300 w-[100px] cursor-pointer" aria-controls="sidebar" aria-expanded="false">
                        Reports
                    </button>
                </div>
                {isReportsVisible && (
                    <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="absolute mt-4 bg-white border border-gray-300 rounded-md shadow-md w-[70rem] left-1/2 transform -translate-x-1/2 z-50">
                        <div className='flex'>
                            <div className='flex flex-col'>
                                <Link href='/company_information' className='p-1 w-[200px] hover:underline'>
                                    Company Information
                                </Link>
                                <Link href='/employees' className='p-1 w-[200px] hover:underline'>
                                    Employees
                                </Link>
                                <Link href='/category' className='p-1 w-[200px] hover:underline'>
                                    Category
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
                </div> */}
                <button 
                    className="text-slate-800 hover:bg-gray-200 rounded-md transition-all ease-linear duration-300 w-[100px] cursor-pointer" 
                    aria-controls="sidebar" 
                    aria-expanded="false"
                    onClick={() => setHelpVisible(true)} >
                    Help
                </button>
            </div>
            <div className="relative" ref={dropdownRef}>
                <div
                    className="flex items-center justify-center cursor-pointer p-1 rounded-md"
                    onClick={handleSettingsClick}
                >
                    <button className="text-slate-800" aria-controls="sidebar" aria-expanded="false">
                        <Image src={settings} alt='settings' className='w-[30px] h-[30px]' />
                    </button>
                </div>
                {isDropdownVisible && (
                    <div className="absolute right-0 mt-2 bg-white border border-gray-300 rounded-md shadow-md w-[200px] z-50">
                        <div className='flex flex-col'>
                            <Link href='/company_information' onClick={() => setDropdownVisible(!isDropdownVisible)} className='p-1 hover:bg-gray-200 transition-all ease-linear duration-300'>
                                Company Information
                            </Link>
                            <Link href='/employees' onClick={() => setDropdownVisible(!isDropdownVisible)} className='p-1 hover:bg-gray-200 transition-all ease-linear duration-300'>
                                Employees
                            </Link>
                            <Link href='/category' onClick={() => setDropdownVisible(!isDropdownVisible)} className='p-1 hover:bg-gray-200 transition-all ease-linear duration-300'>
                                Category
                            </Link>
                            <Link href='/petty_cash' onClick={() => setDropdownVisible(!isDropdownVisible)} className='p-1 hover:bg-gray-200 transition-all ease-linear duration-300'>
                                Petty Cash
                            </Link>
                            <button onClick={() => logoutUser()} className='text-left p-1 hover:bg-gray-200 transition-all ease-linear duration-300'>
                                Logout
                            </button>
                        </div>
                    </div>
                )}
            </div>
            {isHelpVisible && 
            <HelpBox ref={helpRef}
                setHelpVisible={setHelpVisible}
            />}
        </header>
)}

export default Navbar
