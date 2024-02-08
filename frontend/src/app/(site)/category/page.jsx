'use client'

import { TextField } from '@/components/form_fields'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from "@hookform/resolvers/zod"
import { string, z } from 'zod'
import { ListBox, MessageBox, Toast } from '@/components/popups'
import axios from 'axios'
import Button from '@/components/buttons'
import clsx from 'clsx'

const schema = z.object({
    category_code: string().min(1, { message: 'category code is required' }),
    category_name: string().min(1, { message: 'category name is required' }),
})


const ChartOfAccounts = () => {
    const { register, handleSubmit, formState, setValue, clearErrors } = useForm({ defaultValues: {}, resolver: zodResolver(schema) })


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
        setValue('category_code', data.category_code)
        setValue('category_name', data.category_name)
    }, [setValue])
    
    useEffect(() => {
        async function fetchData() {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}category`)
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
        try {
            async function getData() {
                if (currentID > 0) {
                    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}category/${currentID}`)
                    setData(response.data.data)
                    setIdExists(response.data.id_exists)
                }
            }
            
            getData()
        } catch (error) {
            console.error(error)
        }
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
            clearErrors();
        } else if (currentState === 'add' || currentState === 'edit') {
            document.getElementById('category_code').focus();
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
        setMessageBoxMessage(`Are you sure you want to delete this category?`)
    }
    
    const onYes = async() => {
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}category/${currentID}`)
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
            response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}form_search/tblCategory`)
            const items = response.data.map((item, index) => (
                <tr key={index} className={`${index % 2 === 0? `bg-white`:`bg-gray-100`} cursor-pointer`}>
                    <td onClick={() => listValueClick(item.id)} className='w-[12rem]'>{item.category_code}</td>
                    <td onClick={() => listValueClick(item.id)} className='w-[20rem] border-l-[1px] border-black'>{item.category_name}</td>
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
                case 'category_code':
                    searchURI = `/category_code/${searchVal}`
                    break;
                case 'category_name':
                    searchURI = `/category_name/${searchVal}`
                    break;
                case '':
                    searchURI = `/${searchVal}`
                    break;
            }
        }
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}form_search/tblCategory${searchURI}`)
            const items = response.data.map((item, index) => (
                <tr key={index} className={`${index % 2 === 0? `bg-white`:`bg-gray-100`} cursor-pointer`}>
                    <td onClick={() => listValueClick(item.id)} className='w-[12rem]'>{item.category_code}</td>
                    <td onClick={() => listValueClick(item.id)} className='w-[20rem] border-l-[1px] border-black'>{item.category_name}</td>
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

    const cancelClick = useCallback(async() => {
        try {
            const result = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}category/${currentID}`)
            setData(result.data.data)
            setIdExists(result.data.id_exists)
            setCurrentState('view')
        } catch (error) {
            console.log(error)
        }
    }, [currentID, setData]);
    
    const saveForm = useCallback(async(formData) => {
        try {
            // Make a POST request to your Django URL with the form data
            if (currentState === 'add')
                var response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}category`, formData);
            else
                var response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}category/${currentID}`, formData);
        
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
            showToast("Category saving failed")
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
                cancelClick()
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
    }, [currentID, idExists, currentState, setData, handleSubmit, saveForm, findClick, cancelClick, isListBoxVisible]);        

    return (
    <>
    <form method="POST" className='mt-4 ml-3' onSubmit={handleSubmit(saveForm)}>
        <h1 className='font-black text-xl'>Category</h1>
        
        {currentState === 'view' &&
        <div className="flex justify-start items-center gap-4 mt-5 w-[240px] md:w-[500px]">
            <Button type="button" value='Add' variant='secondary' onClick={addClick} />
            <Button type="button" value='Edit' variant='secondary' onClick={editClick} />
            <Button type="button" value='Delete' variant='secondaryDanger' onClick={deleteClick} />
        </div>
        }

        <div className={`flex justify-start ${currentState === 'view'? 'mt-10':'mt-5'}`}>
            <TextField id='category_code' label='Category Code' className={clsx('w-[240px] rounded-[5px] uppercase', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})}  tabIndex={currentState === 'view'? '-1':undefined} errors={errors.category_code} {...register('category_code')} />
        </div>
        <div className='flex mt-5'>
            <TextField label='Category Name' className={clsx('w-[240px] lg:w-[500px] rounded-[5px] uppercase', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})}  tabIndex={currentState === 'view'? '-1':undefined} errors={errors.category_name} {...register('category_name')} />
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
            <Button type="button" value='Cancel' variant='danger' onClick={cancelClick} />
        </>
        }
        </div>
    </form>
    {isToastVisible && 
        <Toast message={toastMessage} onClose={handleToastClose} />
    }
    {isListBoxVisible &&
        <ListBox ref={listBoxRef} items={listBoxItems} values={['category_code', 'category_name']} setSearchVal={setSearchVal} setSearchIn={setSearchIn} />
    }
    {isMessageBoxVisible &&
        <MessageBox ref={listBoxRef} message={messageBoxMessage} onYes={onYes} isOpen={isMessageBoxVisible} setIsOpen={setMessageBoxVisible} />
    }
    </>
)}

export default ChartOfAccounts