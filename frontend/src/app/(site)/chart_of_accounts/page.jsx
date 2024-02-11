'use client'

import { TextField, TextAreaField, TextComboField, NumberField } from '@/components/form_fields'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from "@hookform/resolvers/zod"
import { string, z } from 'zod'
import { ListBox, MessageBox, Toast } from '@/components/popups'
import axios from 'axios'
import Button from '@/components/buttons'
import clsx from 'clsx'

const schema = z.object({
    account_code: string().min(1, { message: 'account code is required' }),
    account_name: string().min(1, { message: 'account name is required' }),
    account_type: string().optional(),
    opening_balance: string().optional(),
    sub_account: string().optional(),
    description: string().optional(),
})


const ChartOfAccounts = () => {
    const { register, handleSubmit, formState, setValue, clearErrors } = useForm({ defaultValues: {}, resolver: zodResolver(schema) })

    const { errors } = formState
    
    const [accountType, setAccountType] = useState('');
    
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
    
    const [isLocked, setIsLocked] = useState(false)
    
    const [idExists, setIdExists] = useState({
        first_id: '',
        next_id: '',
        prev_id: '',
        last_id: ''
    })
    
    const account_types = ['Income', 'Expense', 'Bank', 'Loan', 'Credit Card', 'Equity', 'Accounts Receivable', 'Accounts Payable', 'Current Assets', 'Fixed Assets', 'Current Liability', 'Long Term Liability', 'Cost of goods sold', 'Indirect Income', 'Indirect Expense']
    

    const setData = useCallback((data) => {
        setValue('account_code', data.account_code)
        setValue('account_name', data.account_name)
        setValue('account_type', data.account_type)
        setAccountType(data.account_type)
        setValue('opening_balance', data.opening_balance)
        setValue('sub_account', data.sub_account)
        setValue('description', data.description)
        setIsLocked(data.locked)
    }, [setValue])
    
    useEffect(() => {
        async function fetchData() {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}account`)
                const data = response.data.data;
                console.log(data)
                setData(data);
                setIsLocked(data.locked)
                setCurrentState('view')
                setCurrentID(data.id)
                setIdExists(response.data.id_exists)
            } catch (e) {
                setCurrentState('add')
            }
        }

        fetchData()
    }, [setData])

    const newData = async() => {
        try {
            if (currentID > 0) {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}account/${currentID}`)
                setData(response.data.data)
                setIdExists(response.data.id_exists)
                setCurrentState('view')
            }
        } catch (error) {
            console.error(error)
        }
    }
    
    useEffect(() => {
        newData()
    }, [currentID, setData])

    useEffect(() => {
        if (isListBoxVisible) {
            document.addEventListener('click', handleClickOutside);
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [isListBoxVisible]);

    useEffect(() => {
        if (currentState === 'view' && document.activeElement) {
            document.activeElement.blur();
            clearErrors()
        } else if (currentState === 'add' || currentState === 'edit') {
            document.getElementById('account_code').focus();
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
        setMessageBoxMessage(`Are you sure you want to delete this account?`)
    }
    
    const onYes = async() => {
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}account/${currentID}`)
        setMessageBoxVisible(false)
        if (!idExists.next_id && !idExists.prev_id) {
            setCurrentState('add')
            setData({})
        } else {
            setCurrentID(idExists.next_id? idExists.next_id : idExists.prev_id)
        }
    }

    const addClick = (event) => {
        event.preventDefault();
        setData({})
        setCurrentState('add')
    }

    const editClick = (event) => {
        event.preventDefault();
        setCurrentState('edit')
    }

    const findClick = useCallback(async() => {
        let response;
        try {
            response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}form_search/tblChartOfAccounts`)
            const items = response.data.map((item, index) => (
                <tr key={index} className={`${index % 2 === 0? `bg-white`:`bg-gray-100`} cursor-pointer`}>
                    <td onClick={() => listValueClick(item.id)} className='w-[12rem]'>{item.account_code}</td>
                    <td onClick={() => listValueClick(item.id)} className='w-[20rem] border-l-[1px] border-black'>{item.account_name}</td>
                    <td onClick={() => listValueClick(item.id)} className='w-[12rem] border-l-[1px] border-black'>{item.account_type}</td>
                    <td onClick={() => listValueClick(item.id)} className='w-[12rem] border-l-[1px] border-black'>{item.sub_account}</td>
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
                case 'account_code':
                    searchURI = `/account_code/${searchVal}`
                    break;
                case 'account_name':
                    searchURI = `/account_name/${searchVal}`
                    break;
                case 'account_type':
                    searchURI = `/account_type/${searchVal}`
                    break;
                case 'sub_account':
                    searchURI = `/sub_account/${searchVal}`
                    break;
                case '':
                    searchURI = `/${searchVal}`
                    break;
            }
        }
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}form_search/tblChartOfAccounts${searchURI}`)
            const items = response.data.map((item, index) => (
                <tr key={index} className={`${index % 2 === 0? `bg-white`:`bg-gray-100`} cursor-pointer`}>
                    <td onClick={() => listValueClick(item.id)} className='w-[12rem]'>{item.account_code}</td>
                    <td onClick={() => listValueClick(item.id)} className='w-[20rem] border-l-[1px] border-black'>{item.account_name}</td>
                    <td onClick={() => listValueClick(item.id)} className='w-[12rem] border-l-[1px] border-black'>{item.account_type}</td>
                    <td onClick={() => listValueClick(item.id)} className='w-[12rem] border-l-[1px] border-black'>{item.sub_account}</td>
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
            if (currentState === 'add')
                var response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}account`, formData);
            else
                var response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}account/${currentID}`, formData);
        
            // Check the response status and handle accordingly
            if (response.data.status === 'success') {
                // console.log('Form submitted successfully:', response.data);
                // Optionally, you can redirect or perform other actions upon successful submission
                showToast(response.data.message)
                setCurrentID(response.data.id)
                setCurrentState('view')
            } else {
                showToast(response.data.message)
                // console.error('Error submitting form:', response.data);
                // Handle error cases here
            }
        } catch (error) {
            showToast("Account saving failed")
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
            } else if (currentState === 'view' && (e.key === 'd' || e.key === 'D') && e.ctrlKey && !isLocked) {
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
    }, [currentID, idExists, currentState, setData, handleSubmit, saveForm, findClick, isLocked, isListBoxVisible]);        

    return (
    <>
    <form method="POST" className='mt-4 ml-3' onSubmit={handleSubmit(saveForm)}>
        <h1 className='font-black text-xl'>Chart Of Accounts</h1>
        
        {currentState === 'view' &&
        <div className="flex justify-start items-center gap-4 mt-5 w-[240px] md:w-[500px]">
            <Button type="button" value='Add' variant='secondary' onClick={addClick} />
            <Button type="button" value='Edit' variant='secondary' onClick={editClick} />
            {!isLocked && <Button type="button" value='Delete' variant='secondaryDanger' onClick={deleteClick} />}
        </div>
        }

        <div className={`flex flex-col md:flex-row justify-start ${currentState === 'view'? 'mt-10':'mt-5'}`}>
            <TextField id='account_code' label='Account Code' className={clsx('w-[240px] rounded-[5px] uppercase', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})}  tabIndex={currentState === 'view'? '-1':undefined} errors={errors.account_code} {...register('account_code')} />
            <span className='mt-5 md:mt-0'>
            <TextComboField 
                className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})}  
                tabIndex={currentState === 'view'? '-1':undefined} 
                label="Account Type" 
                values={account_types} 
                listName='account_types' 
                {...register(`account_type`)} 
                onChange={(e) => {
                    setAccountType(e.target.value);
                    setValue('account_type', e.target.value);
                }} />
                </span>
        </div>
        <div className='flex mt-5'>
            <TextField label='Account Name' className={clsx('w-[240px] lg:w-[500px] rounded-[5px] uppercase', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})}  tabIndex={currentState === 'view'? '-1':undefined} errors={errors.account_name} {...register('account_name')} />
        </div>
        <div className="flex flex-col md:flex-row mt-5">
            <NumberField 
                label='Opening Balance' 
                className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})}  
                tabIndex={currentState === 'view'? '-1':undefined} 
                errors={errors.opening_balance} 
                {...register('opening_balance')} />
            <span className='mt-5 md:mt-0'>
            <TextComboField 
                className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})}  
                tabIndex={currentState === 'view'? '-1':undefined} 
                label="Sub Account" 
                values={[]} 
                listName='sub_account'
                {...register(`sub_account`)} 
                onChange={(e) => setValue('sub_account', e.target.value)} />
            </span>
        </div>
        {accountType.toLowerCase() === 'bank' && 
        <div className='flex justify-between mt-5'>
            <TextField label='Bank Account' className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})}  tabIndex={currentState === 'view'? '-1':undefined} errors={errors.bank_account} {...register('bank_account')} />
            <TextField label='Account Holder' className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})}  tabIndex={currentState === 'view'? '-1':undefined} errors={errors.account_holder} {...register('account_holder')} />
        </div>
        }
        <div className='mt-5'>
            <TextAreaField label='description' className={clsx('w-[240px] lg:w-[500px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})}  tabIndex={currentState === 'view'? '-1':undefined} errors={errors.description} {...register('description')} />
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
        <ListBox ref={listBoxRef} items={listBoxItems} values={['account_code', 'account_name', 'account_type', 'sub_account']} setSearchVal={setSearchVal} setSearchIn={setSearchIn} />
    }
    {isMessageBoxVisible &&
        <MessageBox ref={listBoxRef} message={messageBoxMessage} onYes={onYes} isOpen={isMessageBoxVisible} setIsOpen={setMessageBoxVisible} />
    }
    </>
)}

export default ChartOfAccounts