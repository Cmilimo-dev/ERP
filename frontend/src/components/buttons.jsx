import { cn } from '@/lib/utils'
import React from 'react'

const Button = ({ value, variant, className, ...props }) => {
return (
<>
    <button 
    className={cn(`p-[0.2rem] 
    rounded-md 
    cursor-pointer 
    ${variant === 'primary' ? 
    `bg-[#6366f1] text-slate-200 w-[150px] hover:bg-[#4f46e5] focus:bg-[#4f46e5]` 
    
    : variant === 'danger' ?
    `bg-[#f43f5e] text-slate-200 w-[150px] hover:bg-[#bb475a] focus:bg-[#bb475a]`

    : variant === 'secondaryDanger' ?
    `text-[#bb475a] bg-[#dddcf9] hover:shadow-md focus:shadow-md w-[70px]`

    : variant === 'disabled' ?
    `pointer-events-none bg-gray-300 text-white w-[70px]`

    : `text-[#4f46e5] bg-[#dddcf9] focus:shadow-md hover:shadow-md w-[80px]`
    }
    outline-none`, className)}
    tabIndex={variant === 'disabled' ? '-1':undefined}
    {...props}
    >
        {value}
    </button>
</>
)}

export default Button
