'use client'

import { TextField, DateField, ComboField } from '@/components/form_fields'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ListBox, MessageBox, Toast } from '@/components/popups'
import Button from '@/components/buttons'
import axios from 'axios'
import clsx from 'clsx'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { any, z } from 'zod'

const schema = z.object({
    transfer_no: any(),
    transfer_date: any(),
    transfer_method: any().optional(),
    cheque_no: any().optional(),
    cheque_date: any().optional(),
})


const ChequeTransfer = () => {
    
    const { register, handleSubmit, control, formState, setValue, clearErrors } = useForm({ defaultValues: {}, resolver: zodResolver(schema) })

    const { errors } = formState
    const [ module, setModule ] = useState('received')
    const [ received, setReceived ] = useState([])
    const [ payed, setPayed ] = useState([])
    
    const [currentState, setCurrentState] = useState('view')
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
    
    const transfer_method = ['Bank', 'Card', 'Cash', 'Bank Transfer']
    
    const setData = useCallback((data) => {
        setValue('transfer_no', data.transfer_no)
        setValue('transfer_date', data.transfer_date)
        setValue('transfer_method', data.transfer_method)
        setValue('cheque_no', data.cheque_no)
        setValue('cheque_date', data.cheque_date)
        setValue('is_issued', data.is_issued? 'payed':'received')
        setModule(data.is_issued? 'payed':'received')
    }, [setValue])

    useEffect(() => {
        async function fetchCheques() {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}cheques`);
                setReceived(response.data.received);
                setPayed(response.data.payed);
            } catch (error) {
                console.error('Error fetching vendors:', error);
            }
        }

        async function fetchData() {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}cheque_transfer`)
                const data = response.data.data;
                setData(data);
                setCurrentState('view')
                setCurrentID(data.id)
                setIdExists(response.data.id_exists)
            } catch (e) {
                setCurrentState('add')
                setData({
                    transfer_no: 1,
                    transfer_date: new Date().toISOString().split('T')[0],
                    cheque_date: null,
                    transfer_method: 'Bank'
                })
            }
        }

        fetchData()
        fetchCheques()
    }, [setData]);

    useEffect(() => {
        if (isListBoxVisible) {
            document.addEventListener('click', handleClickOutside);
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [isListBoxVisible]);
    
    const newData = useCallback(async() => {
        try {
            if (currentID > 0) {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}cheque_transfer/${currentID}`)
                const data = response.data.data
                setData(data)
                setIdExists(response.data.id_exists)
                setCurrentState('view')
            }
        } catch (error) {
            console.error(error)
        }
    }, [currentID, setData])
    
    useEffect(() => {
        newData()
    }, [currentID, newData])

    useEffect(() => {
        if (currentState === 'view' && document.activeElement) {
            document.activeElement.blur();
            clearErrors()
        } else if (currentState === 'add' || currentState === 'edit') {
            document.getElementById('transfer_date').focus();
        }
    }, [currentState, clearErrors])

    useEffect(() => {
        if (isListBoxVisible) {
            document.addEventListener('click', handleClickOutside);
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [isListBoxVisible]);
    
    const chequeNoChange = useCallback((value) => {
        if (!value)
        {
            setValue('cheque_date', null);
            return;
        }
        const result = module==='received'? received.filter((cheque) => {
            if (value === cheque.cheque_no) {
                return cheque;
            }
        }):payed.filter((cheque) => {
            if (value === cheque.cheque_no) {
                return cheque;
            }
        })
        if (result.length > 0) {
            setValue('cheque_date', result[0].cheque_date);
        }
        else {
            setValue('cheque_date', null);
        }
    }, [])

    const showToast = (message) => {
        setToastMessage(message);
        setIsToastVisible(true);
    };

    const handleToastClose = () => {
        setIsToastVisible(false);
        setToastMessage('');
    };
    
    const deleteClick = useCallback(() => {
        setMessageBoxVisible(true)
        setMessageBoxMessage(`Are you sure you want to delete this cheque transfer?`)
    }, [])
    
    const onYes = async() => {
        const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}cheque_transfer/${currentID}`)
        setMessageBoxVisible(false)
        if (response.data.status === 'success') {
            if (!idExists.next_id && !idExists.prev_id) {
                setCurrentState('add')
                setData({
                    transfer_no: 1,
                    transfer_date: new Date().toISOString().split('T')[0],
                    transfer_method: 'Bank'
                })
            } else {
                setCurrentID(idExists.next_id? idExists.next_id : idExists.prev_id)
            }
        } else {
            showToast(response.message)
        }
    }

    const addClick = useCallback((event) => {
        event.preventDefault();
        setData({
            transfer_no: 1,
            transfer_date: new Date().toISOString().split('T')[0],
            transfer_method: 'Bank'
        })
    }, [setData])

    const editClick = useCallback((event) => {
        event.preventDefault();
        setCurrentState('edit')
    }, [])

    // useEffect(() => {
    //     if (currentState === 'edit')
    //         if (module === 'receipt')
    //             customerLeave(getValues('customer_name'))
    //         else
    //             vendorLeave(getValues('vendor_name'))
    // }, [currentState, customerLeave, vendorLeave, getValues, module])

    const findClick = useCallback(async() => {
        let response;
        let items
        try {
            response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}form_search/tblChequeTransfer`)
            items = response.data.map((item, index) => (
                <tr key={index} className={`${index % 2 === 0? `bg-white`:`bg-gray-100`} cursor-pointer`}>
                    <td onClick={() => listValueClick(item.id)} className='w-[8rem]'>{item.transfer_no}</td>
                    <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.transfer_date}</td>
                    <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.cheque.cheque_no}</td>
                    <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.cheque.cheque_date}</td>
                    <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.cheque.is_issued? 'Issued':'Received'}</td>
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
                case 'transfer_no':
                    searchURI = `/transfer_no/${searchVal}`
                    break;
                case 'transfer_date':
                    searchURI = `/transfer_date/${searchVal}`
                    break;
                case 'cheque_no':
                    searchURI = `/cheque__cheque_no/${searchVal}`
                    break;
                case 'cheque_date':
                    searchURI = `/cheque__cheque_date/${searchVal}`
                    break;
                case '':
                    searchURI = `/${searchVal}`
                    break;
            }
        }
        try {
            let response;
            let items
            response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}form_search/tblChequeTransfer${searchURI}`)
            items = response.data.map((item, index) => (
                <tr key={index} className={`${index % 2 === 0? `bg-white`:`bg-gray-100`} cursor-pointer`}>
                    <td onClick={() => listValueClick(item.id)} className='w-[8rem]'>{item.transfer_no}</td>
                    <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.transfer_date}</td>
                    <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.cheque.cheque_no}</td>
                    <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.cheque.cheque_date}</td>
                    <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.cheque.is_issued? 'Issued':'Received'}</td>
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
        if (formData.cheque_no === '' || formData.cheque_no === undefined || formData.cheque_no === null) {
            showToast('Cheque no should not be empty')
            return;
        }
        try {
            let response;
            if (currentState === 'add') {
                response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}cheque_transfer`, formData);
            }
            else {
                response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}cheque_transfer/${currentID}`, formData);
            }
        
            if (response.data.status === 'success') {
                showToast(response.data.message)
                setCurrentID(response.data.id)
                setCurrentState('view')
            } else {
                showToast(response.data.message)
            }
        } catch (error) {
            showToast(`Cheque transfer failed`)
        }
    }, [currentID, currentState]);

    useEffect(() => {
        const handleKeyDown = async function (e) {
            if (currentState === 'view' && (e.key === 'a' || e.key === 'A') && e.ctrlKey) {
                e.preventDefault()
                addClick(e)
            } else if (currentState === 'view' && (e.key === 'e' || e.key === 'E') && e.ctrlKey) {
                e.preventDefault()
                editClick(e);
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
    
        document.addEventListener('keydown', handleKeyDown);
    
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [currentID, idExists, currentState, setData, handleSubmit, saveForm, findClick, isListBoxVisible, addClick, newData, deleteClick, editClick]);        
    
    return (
    <>
    <form method="POST" className='mt-4 ml-3' onSubmit={handleSubmit(saveForm)}>
        <div className='flex flex-col xl:flex-row'>
            <div className='w-[550px]'>
                <h1 className='font-black text-xl'>
                    Cheque Transfer
                </h1>

                {currentState === 'view' &&
                <div className="flex justify-start items-center gap-4 mt-5 w-[240px] md:w-[500px]">
                    <Button type="button" value='Add' variant='secondary' onClick={addClick} />
                    <Button type="button" value='Edit' variant='secondary' onClick={editClick} />
                    <Button type="button" value='Delete' variant='secondaryDanger' onClick={deleteClick} />
                </div>}
                <div className='flex mt-3'>
                    <input className='hidden pdc-radio' type="radio" {...register("is_issued")} value='received' checked={module==='received'} />
                    <label className={clsx("inline-block p-1 bg-gray-200 cursor-pointer rounded m-[5px] w-[50%] border border-black h-[2rem] text-center", {'bg-gray-300': module==='received'})} htmlFor="received" onClick={() => setModule('received')}>PDC Received</label>

                    <input className='hidden pdc-radio' type="radio" {...register("is_issued")} value='payed' checked={module==='payed'} />
                    <label className={clsx("inline-block p-1 bg-gray-200 cursor-pointer rounded m-[5px] w-[50%] border border-black h-[2rem] text-center", {'bg-gray-300': module==='payed'})} htmlFor="payed" onClick={() => setModule('payed')}>PDC Payed</label>
                </div>

                <div className="flex flex-col md:flex-row mt-5">
                    <TextField label='Transfer no' className='w-[240px] rounded-[5px] pointer-events-none bg-[#f5f5f5]' tabIndex='-1' errors={errors.transfer_no} {...register('transfer_no')} />
                    <span className='mt-5 md:mt-0'>
                    <DateField id='transfer_date' label='Transfer Date' className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})} tabIndex={currentState === 'view'? '-1':undefined} defaultValue={new Date().toISOString().split('T')[0]} errors={errors.transfer_date} {...register('transfer_date')} />
                    </span>
                </div>

                <div className="flex flex-col md:flex-row mt-5">
                    <TextField label='Cheque no'className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})} tabIndex={currentState === 'view'? '-1':undefined} errors={errors.cheque_no} {...register('cheque_no')} onChange={chequeNoChange} />
                    <span className='mt-5 md:mt-0'>
                    <DateField id='cheque_date' label='Cheque Date' className='w-[240px] rounded-[5px] pointer-events-none bg-[#f5f5f5]' tabIndex='-1' defaultValue={new Date().toISOString().split('T')[0]} errors={errors.cheque_date} {...register('cheque_date')} />
                    </span>
                </div>

                <div className="flex flex-col md:flex-row mt-5">
                <ComboField
                        label="Transfer Method"
                        errors={errors.transfer_method}
                        control={control}
                        className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})}  
                        tabIndex={currentState === 'view'? '-1':undefined}
                        values={transfer_method}
                        name={register('transfer_method')}
                        />
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
            </div>
            {currentState !== 'view'&&
            <div className='w-[45rem] h-[90vh] rounded-md border-black border-[1px] overflow-auto list-scrollbar shadow-[#6365f17e] shadow-lg'>
                <table className='w-full text-sm font-sans border-collapse'>
                    <thead className='border-b-[1px] border-t-[1px] border-slate-400'>
                        <tr>
                            <th className='w-[5%]'>#</th>
                            <th className='border-l-[1px] border-slate-400 w-[50%]'>Cheque No</th>
                            <th className='border-l-[1px] border-slate-400 w-[50%]'>Cheque Date</th>
                        </tr>
                    </thead>
                    <tbody>
                    {module === 'payed'&& payed.map((cheque, index) => (
                    <tr key={index}>
                        <td>{index + 1}</td>
                        <td className='border-l-[1px] border-slate-400 p-1'>{cheque.cheque_no}</td>
                        <td className='border-l-[1px] border-slate-400 p-1'>{cheque.cheque_date}</td>
                    </tr>
                    ))} 
                    
                    {module === 'received'&& received.map((cheque, index) => (
                    <tr key={index}>
                        <td>{index + 1}</td>
                        <td className='border-l-[1px] border-slate-400 p-1'>{cheque.cheque_no}</td>
                        <td className='border-l-[1px] border-slate-400 p-1'>{cheque.cheque_date}</td>
                    </tr>
                    ))} 
                    </tbody>
                </table>
            </div>}
        </div>
    </form>
    {isToastVisible && 
        <Toast message={toastMessage} onClose={handleToastClose} />
    }
    {isListBoxVisible &&
        <ListBox 
            ref={listBoxRef} 
            items={listBoxItems} 
            values={['transfer_no', 'transfer_date', 'cheque_no', 'cheque_date']} 
            setSearchVal={setSearchVal} 
            setSearchIn={setSearchIn} />
    }
    {isMessageBoxVisible &&
        <MessageBox ref={listBoxRef} message={messageBoxMessage} onYes={onYes} isOpen={isMessageBoxVisible} setIsOpen={setMessageBoxVisible} />
    }
    </>
)}

export default ChequeTransfer