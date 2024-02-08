'use client'

import { cn } from '@/lib/utils';
import React, { forwardRef } from 'react';
import { Controller } from 'react-hook-form';

const Label = (value,errors) => {
    return (
    <>
        <label className="floating-label 
            absolute 
            pointer-events-none 
            left-[10px] 
            top-[25%] 
            transform 
            -translate-y-1/2 
            transition-all 
            duration-200 
            ease-in 
            text-sm 
            text-gray-500">
            {value}
        </label>
        <div className='text-red-400'>{errors?.message}</div>
    </>
)}

export const TextField = forwardRef(({ label, className, errors, ...props }, ref) => {
    return (
        <div className='relative mr-[20px]'>
            <input
                type="text"
                className={cn("floating-input", className)}
                placeholder=" "
                autoComplete="off"
                ref={ref}
                {...props}
            />
            {Label(label, errors)}
        </div>
    );
});
TextField.displayName = 'InputField';

export const HiddenField = forwardRef(({ ...props }, ref) => {
    return (
        <>
            <input
                type="hidden"
                ref={ref}
                {...props}
            />
        </>
    );
});
HiddenField.displayName = 'HiddenField';

export const NumberField = forwardRef(({ label, className, errors, ...props }, ref) => {
    return (
        <div className='relative mr-[20px]'>
            <input
                type="number"
                step='any'
                className={cn("floating-input", className)}
                placeholder=" "
                autoComplete="off"
                ref={ref}
                {...props}
            />
            {Label(label, errors)}
        </div>
    );
});
NumberField.displayName = 'NumberField';

export const CheckBoxField = forwardRef(({ label, className, control, name, ...props }, ref) => {
    return (
        <div className='relative mr-[20px]'>
            <Controller
            {...name}
            control={control}
            ref={ref}
            render={({ field }) => 
            <input
                {...field}
                type="checkbox"
                className={cn("floating-input", className)}
                {...name}
                {...props}
            />}
            />
            <label className='ml-1'>{label}</label>
        </div>
    );
});
CheckBoxField.displayName = 'CheckBoxField';

export const DateField = forwardRef(({ label, className, errors, ...props }, ref) => {
    return (
        <div className='relative mr-[20px]'>
            <input
                type="date"
                className={cn("floating-input", className)}
                placeholder=" "
                autoComplete="off"
                ref={ref}
                {...props}
            />
            {Label(label, errors)}
        </div>
    );
});
DateField.displayName = 'DateField';

export const TextAreaField = forwardRef(({ label, className, errors, ...props }, ref) => {
return (
    <div className='relative mr-[20px]'>
        <textarea
            className={cn("floating-input", className)}
            placeholder=" "
            autoComplete="off"
            ref={ref}
            {...props}
        />
        {Label(label, errors)}
        {/* <div className='text-red-400'>{errors?.message}</div> */}
    </div>
    );
});
TextAreaField.displayName = 'TextAreaField'

export const ComboField = forwardRef(({ label, errors, control, className, name, values, ...props }, ref) => {
    return (
        <div className='relative mr-[20px]'>
        <Controller
            {...name}
            control={control}
            ref={ref}
            render={({ field }) => 
            <select
                {...field}
                {...name}
                className={cn("floating-input", className)}
                {...props}
                >
                {values.map((value, index) => (
                    <option key={index} value={value}>
                    {value}
                    </option>
                ))}
            </select>}
        />
        {Label(label, errors)}
        </div>
    );
});
ComboField.displayName = 'ComboField'

export const TextComboField = forwardRef(({ label, className, values, errors, listName, ...props }, ref) => {
    return (
        <div className='relative mr-[20px]'>
            <input
                type="text"
                className={cn("floating-input", className)}
                placeholder=" "
                autoComplete="off"
                list={listName}
                ref={ref}
                {...props}
                />
            {Label(label, errors)}
            <datalist id={listName}>
            {values.map((value, index) =>
                <option key={index} value={value}>{value}</option>
                )}
            </datalist>
        </div>
    );
});
TextComboField.displayName = 'TextComboField'