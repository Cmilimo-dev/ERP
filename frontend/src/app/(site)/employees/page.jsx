'use client'

import Button from '@/components/buttons'
import { ComboField, DateField, TextAreaField, TextComboField, TextField } from '@/components/form_fields'
import { ListBox, MessageBox, Toast } from '@/components/popups'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import clsx from 'clsx'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { any, string, z } from 'zod'

const schema = z.object({
    employee_code: string().min(1, { message: 'Employee code is required' }),
    employee_name: string().min(1, { message: 'Employee name is required' }),
    profession: string().min(1, { message: 'Profession is required' }),
    join_date: string().optional(),
    present_status: string().optional(),
    emirates_id: string().optional(),
    labour_card: string().optional(),
    passport: string().optional(),
    passport_expiry: string().optional(),
    visa: string().optional(),
    visa_expiry: string().optional(),
    health_insurance: string().optional(),
    health_insurance_expiry: string().optional(),
    basic_pay: any().optional(),
    hra: any().optional(),
    address: string().optional(),
    phone_no: string().optional(),
    mobile: string().optional(),
    email: string().optional(),
})

const Employees = () => {

    const { register, handleSubmit, formState, setValue, control, clearErrors } = useForm({ defaultValues: {}, resolver: zodResolver(schema) })


    const { errors } = formState

    const [currentState, setCurrentState] = useState('')
    const [currentID, setCurrentID] = useState(0)
    
    const [isToastVisible, setIsToastVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    
    const [isListBoxVisible, setIsListBoxVisible] = useState(false);
    const [listBoxItems, setListBoxItems] = useState([])
    const [searchIn, setSearchIn] = useState('')
    const [searchVal, setSearchVal] = useState('')
    const listBoxRef = useRef(null)

    const [messageBoxMessage, setMessageBoxMessage] = useState('')
    const [isMessageBoxVisible, setMessageBoxVisible] = useState(false)
    
    const [idExists, setIdExists] = useState({
        first_id: '',
        next_id: '',
        prev_id: '',
        last_id: ''
    })
    
    const setData = useCallback((data) => {
        setValue('employee_code', data.employee_code)
        setValue('employee_name', data.employee_name)
        setValue('profession', data.profession)
        setValue('join_date', data.join_date)
        setValue('present_status', data.present_status)
        setValue('emirates_id', data.emirates_id)
        setValue('labour_card', data.labour_card)
        setValue('passport', data.passport)
        setValue('passport_expiry', data.passport_expiry)
        setValue('visa', data.visa)
        setValue('visa_expiry', data.visa_expiry)
        setValue('health_insurance', data.health_insurance)
        setValue('health_insurance_expiry', data.health_insurance_expiry)
        setValue('basic_pay', data.basic_pay)
        setValue('hra', data.hra)
        setValue('address', data.address)
        setValue('phone_no', data.phone_no)
        setValue('mobile', data.mobile)
        setValue('email', data.email)
    }, [setValue])

    const newData = useCallback(async() => {
        try {
            const result = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}employee/${currentID}`)
            setData(result.data.data)
            setIdExists(result.data.id_exists)
            setCurrentState('view')
        } catch (error) {
            console.log(error)
        }
    }, [currentID, setData])

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}employee`)
                const data = response.data.data;
                setData(data);
                setCurrentState('view')
                setCurrentID(data.id)
                setIdExists(response.data.id_exists)
            } catch (e) {
                setCurrentState('add')
            }
        }

        fetchData()
    }, [setData])

    useEffect(() => {
        if (isListBoxVisible) {
            document.addEventListener('click', handleClickOutside);
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [isListBoxVisible]);

    useEffect(() => {
        newData()
    }, [newData])
    
    useEffect(() => {
        if (currentState === 'view' && document.activeElement) {
            document.activeElement.blur();
            clearErrors()
        } else if (currentState === 'add' || currentState === 'edit') {
            document.getElementById('employee_code').focus();
        }
    }, [currentState, clearErrors])
    
    const showToast = (message) => {
        setToastMessage(message);
        setIsToastVisible(true);
    };

    const handleToastClose = () => {
        setIsToastVisible(false);
        setToastMessage('');
    };

    const deleteClick = () => {
        setMessageBoxVisible(true)
        setMessageBoxMessage(`Are you sure you want to delete this employee?`)
    }
    
    const onYes = async() => {
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}employee/${currentID}`)
        setMessageBoxVisible(false)
        if (!idExists.next_id && !idExists.prev_id) {
            setCurrentState('add')
            setData({
                id: idExists.last_id
            })
        } else {
            setCurrentID(idExists.next_id? idExists.next_id : idExists.prev_id)
        }
    }

    const addClick = (event) => {
        event.preventDefault();
        setData({
            id: idExists.last_id
        })
        setCurrentState('add')
    }

    const editClick = (event) => {
        event.preventDefault();
        setCurrentState('edit')
    }

    const findClick = useCallback(async() => {
        let response;
        try {
            response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}form_search/tblEmployee`)
            const items = response.data.map((item, index) => (
                <tr key={index} className={`${index % 2 === 0? `bg-white`:`bg-gray-100`} cursor-pointer`}>
                    <td onClick={() => listValueClick(item.id)} className='w-[8rem]'>{item.employee_code}</td>
                    <td onClick={() => listValueClick(item.id)} className='w-[14rem] border-l-[1px] border-black'>{item.employee_name}</td>
                    <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.profession}</td>
                    <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.basic_pay}</td>
                    <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.join_date}</td>
                    <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.present_status}</td>
                </tr>
            ))
            
            setListBoxItems(items);
            setIsListBoxVisible(true);
        } catch (error) {
            console.error('Error fetching data:', error);
            // Handle error as needed
        }
    }, [])

    const formSearch = useCallback(async() => {
        let searchURI = ''
        if (searchVal.length > 0) {
            switch (searchIn) {
                case 'employee_code':
                    searchURI = `/employee_code/${searchVal}`
                    break;
                case 'employee_name':
                    searchURI = `/employee_name/${searchVal}`
                    break;
                case 'profession':
                    searchURI = `/profession/${searchVal}`
                    break;
                case 'join_date':
                    searchURI = `/join_date/${searchVal}`
                    break;
                case '':
                    searchURI = `/${searchVal}`
                    break;
            }
        }
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}form_search/tblEmployee${searchURI}`)
            const items = response.data.map((item, index) => (
                <tr key={index} className={`${index % 2 === 0? `bg-white`:`bg-gray-100`} cursor-pointer`}>
                    <td onClick={() => listValueClick(item.id)} className='w-[8rem]'>{item.employee_code}</td>
                    <td onClick={() => listValueClick(item.id)} className='w-[14rem] border-l-[1px] border-black'>{item.employee_name}</td>
                    <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.profession}</td>
                    <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.basic_pay}</td>
                    <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.join_date}</td>
                    <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.present_status}</td>
                </tr>
            ))
            setListBoxItems(items);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }, [searchIn, searchVal])

    useEffect(() => {
        formSearch()
    }, [searchIn, searchVal, formSearch])
    
    const listValueClick = (id) => {
        setIsListBoxVisible(false);
        setCurrentID(id);
    }

    const handleClickOutside = (event) => {
        if (listBoxRef.current && !listBoxRef.current.contains(event.target)) {
            setIsListBoxVisible(false);
        }
    };
    
    const saveForm = useCallback(async(formData) => {
        try {
            // Make a POST request to your Django URL with the form data
            let response
            if (currentState === 'add')
                response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}employee`, formData);
            else
                response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}employee/${currentID}`, formData);
        
            // Check the response status and handle accordingly
            if (response.data.status === 'success') {
                // console.log('Form submitted successfully:', response.data);
                // Optionally, you can redirect or perform other actions upon successful submission
                showToast(response.data.message);
                setCurrentID(response.data.id)
                setCurrentState('view')
            } else {
                showToast(response.data.message)
                // console.error('Error submitting form:', response.data);
                // Handle error cases here
            }
        } catch (error) {
            showToast("Employee saving failed")
            // console.error('An error occurred while submitting the form:', error);
            // Handle network errors or other exceptions here
        }
    }, [currentID, currentState]);
    
    useEffect(() => {
        const handleKeyDown = async function (e) {
            if (currentState === 'view' && (e.key === 'a' || e.key === 'A') && e.ctrlKey) {
                e.preventDefault()
                setCurrentState('add');
                setData({});
            } else if (currentState === 'view' && (e.key === 'e' || e.key === 'E') && e.ctrlKey) {
                e.preventDefault()
                setCurrentState('edit');
            } else if (currentState === 'view' && (e.key === 'd' || e.key === 'D') && e.ctrlKey) {
                e.preventDefault()
                deleteClick()
            } else if (currentState === 'view' && (e.key === 'f' || e.key === 'F') && e.ctrlKey && isListBoxVisible) {
                e.preventDefault()
                setIsListBoxVisible(false)
            } else if (currentState === 'view' && (e.key === 'f' || e.key === 'F') && e.ctrlKey) {
                e.preventDefault()
                findClick()
            } else if (currentState === 'view' && e.key === 'ArrowLeft' && e.ctrlKey && idExists.prev_id) {
                e.preventDefault()
                setCurrentID(idExists.prev_id);
            } else if (currentState === 'view' && e.key === 'ArrowRight' && e.ctrlKey && idExists.next_id) {
                e.preventDefault()
                setCurrentID(idExists.next_id);
            } else if (currentState === 'view' && e.key === 'ArrowDown' && e.ctrlKey && idExists.prev_id) {
                e.preventDefault()
                setCurrentID(idExists.first_id);
            } else if (currentState === 'view' && e.key === 'ArrowUp' && e.ctrlKey && idExists.next_id) {
                e.preventDefault()
                setCurrentID(idExists.last_id);
            } else if ((currentState === 'add' || currentState === 'edit') && (e.key === 'c' || e.key === 'C') && e.ctrlKey) {
                e.preventDefault()
                newData()
            } else if ((currentState === 'add' || currentState === 'edit') && (e.key === 's' || e.key === 'S') && e.ctrlKey) {
                e.preventDefault()
                handleSubmit(saveForm)()
            } else if ((e.ctrlKey || e.altKey) && 
            (e.key === 'f' || e.key === 'F' 
            || e.key === 'd' || e.key === 'D'
            || e.key === 'a' || e.key === 'A'
            || e.key === 'g' || e.key === 'G'
            || e.key === 'k' || e.key === 'K'
            || e.key === 'l' || e.key === 'L'
            || e.key === 'p' || e.key === 'P'
            || e.key === 'o' || e.key === 'O'
            || e.key === 'u' || e.key === 'U'
            || e.key === 't' || e.key === 'T'
            || e.key === 'e' || e.key === 'E'
            )) {
                e.preventDefault();
            }
        };
    
        // Attach the event listener to the document
        document.addEventListener('keydown', handleKeyDown);
    
        // Cleanup the event listener on component unmount
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [currentID, idExists, currentState, setData, handleSubmit, saveForm, findClick, isListBoxVisible, newData]);        


return (
<>
<form method="POST" className='mt-4 ml-3' onSubmit={handleSubmit(saveForm)}>
        <h1 className='font-black text-xl'>Employee Information</h1>
        
        {currentState === 'view' &&
        <div className="flex justify-start items-center gap-4 mt-5 w-[240px] md:w-[500px]">
            <Button type="button" value='Add' variant='secondary' onClick={addClick} />
            <Button type="button" value='Edit' variant='secondary' onClick={editClick} />
            <Button type="button" value='Delete' variant='secondaryDanger' onClick={deleteClick} />
        </div>
        }

        <div className={`flex flex-col md:flex-row justify-start ${currentState === 'view'? 'mt-10':'mt-5'}`}>
            <TextField 
                id = 'employee_code'
                label='Employee Code' 
                className={clsx('w-[240px] rounded-[5px] uppercase', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})}  
                tabIndex={currentState === 'view'? '-1':undefined} 
                errors={errors.employee_code} 
                {...register('employee_code')} />
            <span className='mt-5 md:mt-0'>
            <TextComboField 
                label='Profession' 
                className={clsx('w-[240px] rounded-[5px] uppercase', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})}  
                tabIndex={currentState === 'view'? '-1':undefined} 
                errors={errors.profession} 
                {...register('profession')} 
                values={['Manager', 'Salesman']} 
                listName='profession' />
            </span>
        </div>

        <div className='flex mt-5'>
            <TextField 
                label='Employee Name' 
                className={clsx('w-[240px] lg:w-[500px] rounded-[5px] uppercase', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})}  
                tabIndex={currentState === 'view'? '-1':undefined} 
                errors={errors.employee_name} 
                {...register('employee_name')} />
        </div>

        <div className={`flex flex-col md:flex-row justify-start mt-5`}>
            <DateField label='Join Date' 
                className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})} 
                tabIndex={currentState === 'view'? '-1':undefined} 
                defaultValue={new Date().toISOString().split('T')[0]} 
                errors={errors.join_date} 
                {...register('join_date')} />
            <span className='mt-5 md:mt-0'>
            <ComboField
                control={control}
                className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})}
                name={register('present_status')}
                values={['Active', 'Inactive']}
                label='Present Status'
                tabIndex={currentState === 'view'? '-1':undefined} 
                errors={errors.present_status}
                defaultValue='Active'
            />
            </span>
        </div>

        <div className="flex flex-col md:flex-row justify-start mt-5">
            <TextField 
                label='Emirates ID' 
                className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})}  
                tabIndex={currentState === 'view'? '-1':undefined} 
                errors={errors.emirates_id} 
                {...register('emirates_id')} />
            <span className='mt-5 md:mt-0'>
            <TextField 
                label='Labout Card' 
                className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})}  
                tabIndex={currentState === 'view'? '-1':undefined} 
                errors={errors.labour_card} 
                {...register('labour_card')} />
            </span>
        </div>
        
        <div className="flex flex-col md:flex-row justify-start mt-5">
            <TextField 
                label='Passport' 
                className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})}  
                tabIndex={currentState === 'view'? '-1':undefined} 
                errors={errors.passport} 
                {...register('passport')} />
            <span className='mt-5 md:mt-0'>
            <DateField 
                label='Passport Expiry' 
                className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})} 
                tabIndex={currentState === 'view'? '-1':undefined} 
                defaultValue={new Date().toISOString().split('T')[0]} 
                errors={errors.passport_expiry} 
                {...register('passport_expiry')} />
            </span>
        </div>
        
        <div className="flex flex-col md:flex-row justify-start mt-5">
            <TextField 
                label='Visa' 
                className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})}  
                tabIndex={currentState === 'view'? '-1':undefined} 
                errors={errors.visa} 
                {...register('visa')} />
            <span className='mt-5 md:mt-0'>
            <DateField 
                label='Visa Expiry' 
                className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})} 
                tabIndex={currentState === 'view'? '-1':undefined} 
                defaultValue={new Date().toISOString().split('T')[0]} 
                errors={errors.visa_expiry} 
                {...register('visa_expiry')} />
            </span>
        </div>
        
        <div className="flex flex-col md:flex-row justify-start mt-5">
            <TextField 
                label='Health Insurance' 
                className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})}  
                tabIndex={currentState === 'view'? '-1':undefined} 
                errors={errors.health_insurance} 
                {...register('health_insurance')} />
            <span className='mt-5 md:mt-0'>
            <DateField 
                label='Health Insurance Expiry' 
                className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})} 
                tabIndex={currentState === 'view'? '-1':undefined} 
                defaultValue={new Date().toISOString().split('T')[0]} 
                errors={errors.health_insurance_expiry} 
                {...register('health_insurance_expiry')} />
            </span>
        </div>
        
        <div className="flex flex-col md:flex-row justify-start mt-5">
            <TextField 
                label='Basic Pay' 
                className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})}  
                tabIndex={currentState === 'view'? '-1':undefined} 
                errors={errors.basic_pay} 
                {...register('basic_pay')} />
            <span className='mt-5 md:mt-0'>
            <TextField 
                label='HRA' 
                className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})}  
                tabIndex={currentState === 'view'? '-1':undefined} 
                errors={errors.hra} 
                {...register('hra')} />
            </span>
        </div>
        
        <div className='mt-5'>
            <TextAreaField 
                label='Address' 
                className={clsx('w-[240px] lg:w-[500px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})}  
                tabIndex={currentState === 'view'? '-1':undefined} 
                errors={errors.address} 
                {...register('address')} />
        </div>
        
        <div className="flex flex-col md:flex-row justify-start mt-5">
            <TextField 
                label='Phone No' 
                className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})}  
                tabIndex={currentState === 'view'? '-1':undefined} 
                errors={errors.phone_no} 
                {...register('phone_no')} />
            <span className='mt-5 md:mt-0'>
            <TextField 
                label='Mobile' 
                className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})}  
                tabIndex={currentState === 'view'? '-1':undefined} 
                errors={errors.mobile} 
                {...register('mobile')} />
            </span>
        </div>

        <div className='flex mt-5'>
            <TextField 
                label='Email' 
                className={clsx('w-[240px] lg:w-[500px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})}  
                tabIndex={currentState === 'view'? '-1':undefined} 
                errors={errors.email} 
                {...register('email')} />
        </div>
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 mt-5 w-[240px] md:w-[500px]">
        {currentState === 'view'? 
        <>
            <Button type="button" value='First' onClick={() => setCurrentID(idExists.first_id)} variant={idExists.prev_id? `secondary`:`disabled`} />
            <Button type="button" value='Previous' onClick={() => setCurrentID(idExists.prev_id)} variant={idExists.prev_id? `secondary`:`disabled`} />
            <Button type="button" value='Find' onClick={findClick} variant={(idExists.prev_id || idExists.next_id)? `secondary`:`disabled`} />
            <Button type="button" value='Next' onClick={() => setCurrentID(idExists.next_id)} variant={idExists.next_id? `secondary`:`disabled`} />
            <Button type="button" value='Last' onClick={() => setCurrentID(idExists.last_id)} variant={idExists.next_id? `secondary`:`disabled`} />
        </>
        :
        <>
            <Button type="submit" value='Save' variant='primary' />
            <Button type="button" value='Cancel' variant='danger' onClick={newData} />
        </>
        }
        </div>
    </form>
    {isToastVisible && 
        <Toast message={toastMessage} onClose={handleToastClose} />
    }
    {isListBoxVisible &&
        <ListBox ref={listBoxRef} items={listBoxItems} values={['employee_code', 'employee_name', 'profession', 'join_date']} setSearchVal={setSearchVal} setSearchIn={setSearchIn} />
    }
    {isMessageBoxVisible &&
        <MessageBox ref={listBoxRef} message={messageBoxMessage} onYes={onYes} isOpen={isMessageBoxVisible} setIsOpen={setMessageBoxVisible} />
    }
</>
)}

export default Employees
