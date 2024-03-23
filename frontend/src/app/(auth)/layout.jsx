import React from 'react'

const AuthLayout = ({ children }) => {
    return (
        <main className='bg-[#dddcf9] flex justify-center items-center w-[100vw] h-[100vh]'>
            {children}
        </main>
    )
}

export default AuthLayout
