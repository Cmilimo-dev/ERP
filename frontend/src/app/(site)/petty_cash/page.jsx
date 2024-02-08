'use client'

import { TextField, DateField, NumberField, TextComboField, HiddenField } from '@/components/form_fields'
import { PettyCashTable } from '@/components/table'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from "@hookform/resolvers/zod"
import { any, number, z } from 'zod'
import { ListBox, MessageBox, Toast } from '@/components/popups'
import Button from '@/components/buttons'
import axios from 'axios'
import clsx from 'clsx'

const schema = z.object({
    transaction_no: number(),
    transaction_date: any(),
    petty_cash_account: any(),
    total: any()
})


const PettyCash = () => {
    const { register, handleSubmit, formState, setValue, clearErrors } = useForm({ defaultValues: {}, resolver: zodResolver(schema) })

    const { errors } = formState

    const [accounts, setAccounts] = useState([])
    
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
    
    // Initialize the table data with the initial value
    const [tableData, setTableData] = useState([
        { account_code: '', account_name: '', account: '', total: '', remarks: ''}
    ]);

    const setData = useCallback((data) => {
        setValue('transaction_no', data.transaction_no)
        setValue('transaction_date', data.transaction_date)
        setValue('total', data.total)
    }, [setValue])

    useEffect(() => {
        async function fetchAccounts() {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}form_search/tblChartOfAccounts`);
                setAccounts(response.data);
            } catch (error) {
                console.error('Error fetching accounts:', error);
            }
        }

        async function fetchData() {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}petty_cash`)
                const data = response.data.master_data;
                setData(data);
                setCurrentState('view')
                setCurrentID(data.id)
                setIdExists(response.data.id_exists)
                setTableData(response.data.details_data)
            } catch (e) {
                setData({
                    transaction_no: 1,
                    transaction_date: new Date().toISOString().split('T')[0]
                })
                setCurrentState('add')
            }
        }

        fetchData()
        fetchAccounts();
    }, [setData]);

    const newData = useCallback(async() => {
        try {
            if (currentID > 0) {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}petty_cash/${currentID}`)
                setData(response.data.master_data)
                setTableData(response.data.details_data)
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
            document.getElementById('transaction_date').focus();
        }
    }, [currentState, clearErrors])

    const totalChange = (value, rowIndex) => {
        let amount = 0;
        
        for (let i=0; i<tableData.length; i++) {
            if (i !== rowIndex)
            amount += parseFloat(tableData[i]['amount']) || 0
        }
        amount += parseFloat(value) || 0
        setValue('total', amount);
    }
    
    const inputChange = (value, rowIndex, col) => {
        if (col === 'amount') {
            totalChange(value, rowIndex, col);
        }
        const newData = [...tableData];
        newData[rowIndex][col] = value;
        setTableData(newData);
    };
    
    const lastCellLeave = (event, rowIndex) => {
        if (
            event.key === 'Tab' &&
            !event.shiftKey &&
            rowIndex === tableData.length - 1 &&
            tableData[0].account_code.trim() !== ''
        ) {
            const newData = [...tableData, { account_code: '', account_name: '', account: '', total: '', remarks: ''}];
            setTableData(newData);
        }
    };

    const firstCellLeave = async(value, rowIndex) => {
        if (value) {
            const result = accounts.filter((account) => {
                if (value === account.account_code || value === account.account_name || value === (account.account_code + ' - ' + account.account_name)) {
                    return account;
                }
            })
            if (result.length > 0) {
                const newData = [...tableData];
                newData[rowIndex]['account_code'] = result[0].account_code;
                newData[rowIndex]['account_name'] = result[0].account_name;
                newData[rowIndex]['account'] = result[0].id;
                setTableData(newData);
            } else {
                const newData = [...tableData];
                newData[rowIndex]['account_code'] = '';
                newData[rowIndex]['account_name'] = '';
                newData[rowIndex]['account'] = '';
                setTableData(newData);
                showToast(`Invalid account`)
            }
        } else {
            const newData = [...tableData];
            const rowToDelete = newData[rowIndex];
        
            // Check if the first column of the row is empty
            if (!rowToDelete.account_code.trim() && newData.length > 1) {
                newData.splice(rowIndex, 1);
                setTableData(newData);
            }
        }
    };

    const moveRow = (fromIndex, toIndex) => {
        const newData = [...tableData];
        const [movedRow] = newData.splice(fromIndex, 1);
        newData.splice(toIndex, 0, movedRow);
        setTableData(newData);
    };

    const accountLeave = (e) => {
        const value = e.target.value;
        if (!value) 
            return;
        const current_account_name = e.target.name
        const current_account = current_account_name.replace("_name", "")
        const result = accounts.filter((account) => {
            if (value === account.account_code 
            || value === account.account_name 
            || value === (account.account_code + ' - ' + account.account_name)) {
                return account;
            }
        })
        if (result.length > 0) {
            setValue(current_account_name, result[0].account_name);
            setValue(current_account, (result[0].id));
        }
        else {
            setValue(current_account_name, '');
            setValue(current_account, '');
            showToast(`Invalid account`)
        }
    }

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
        setMessageBoxMessage(`Are you sure you want to delete this petty cash?`)
    }
    
    const onYes = async() => {
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}petty_cash/${currentID}`)
        setMessageBoxVisible(false)
        if (!idExists.next_id && !idExists.prev_id) {
            setCurrentState('add')
            setData({
                transaction_no: 1
            })
            setTableData([{ account_code: '', account_name: '', account: '', total: '', remarks: ''}])
        } else {
            setCurrentID(idExists.next_id? idExists.next_id : idExists.prev_id)
        }
    }
    
    const addClick = useCallback((event) => {
        event.preventDefault();
        setData({
            transaction_no: idExists.next_no,
            transaction_date: new Date().toISOString().split('T')[0]
        })
        setTableData([{ account_code: '', account_name: '', account: '', total: '', remarks: ''}])
        setCurrentState('add')
    }, [idExists, setData])

    const editClick = (event) => {
        event.preventDefault();
        setCurrentState('edit')
    }

    // const printClick = useCallback((event) => {
    //     event.preventDefault();
    //     window.open(`${process.env.NEXT_PUBLIC_API_URL}pdf/petty_cash/${currentID}`, '_blank')
    // }, [currentID])

    const findClick = useCallback(async() => {
        let response;
        try {
            response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}form_search/tblPettyCash_Master`)
            const items = response.data.map((item, index) => (
                <tr key={index} className={`${index % 2 === 0? `bg-white`:`bg-gray-100`} cursor-pointer`}>
                    <td onClick={() => listValueClick(item.id)} className='w-[10rem]'>{item.transaction_no}</td>
                    <td onClick={() => listValueClick(item.id)} className='w-[10rem] border-l border-black'>{item.transaction_date}</td>
                    <td onClick={() => listValueClick(item.id)} className='w-[20rem] border-l border-black'>{item.petty_cash_account}</td>
                    <td onClick={() => listValueClick(item.id)} className='w-[10rem] border-l border-black'>{item.total}</td>
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
                case 'transaction_no':
                    searchURI = `/transaction_no/${searchVal}`
                    break;
                case 'transaction_date':
                    searchURI = `/transaction_date/${searchVal}`
                    break;
                case 'petty_cash_account':
                    searchURI = `/petty_cash_account__account_name/${searchVal}`
                    break;
                default:
                    searchURI = `/${searchVal}`
                    break;
            }
        }
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}form_search/tblPettyCash_Master${searchURI}`)
            const items = response.data.map((item, index) => (
                <tr key={index} className={`${index % 2 === 0? `bg-white`:`bg-gray-100`} cursor-pointer`}>
                    <td onClick={() => listValueClick(item.id)} className='w-[10rem]'>{item.transaction_no}</td>
                    <td onClick={() => listValueClick(item.id)} className='w-[10rem] border-l border-black'>{item.transaction_date}</td>
                    <td onClick={() => listValueClick(item.id)} className='w-[20rem] border-l border-black'>{item.petty_cash_account}</td>
                    <td onClick={() => listValueClick(item.id)} className='w-[10rem] border-l border-black'>{item.total}</td>
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
        // Include the CSRF token in the form data before submitting
        const data={ master_data: formData, details_data: tableData }
        try {
            // Make a POST request to your Django URL with the form data
            let response
            if (currentState === 'add')
                response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}petty_cash`, data)
            else
                response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}petty_cash/${currentID}`, data)
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
            showToast("Petty Cash saving failed")
            // console.error('An error occurred while submitting the form:', error);
            // Handle network errors or other exceptions here
        }
    }, [currentID, currentState,tableData]);

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
    
        // Attach the event listener to the document
        document.addEventListener('keydown', handleKeyDown);
    
        // Cleanup the event listener on component unmount
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [currentID, idExists, currentState, setData, handleSubmit, saveForm, findClick, isListBoxVisible, addClick, newData]);        


    return (
    <>
    <form method="POST" className='mt-4 ml-3' onSubmit={handleSubmit(saveForm)}>
        <h1 className='font-black text-xl mb-4'>Petty Cash</h1>

        {currentState === 'view' &&
        <div className="flex justify-start items-center gap-4 mt-5 w-[500px]">
            <Button type="button" value='Add' variant='secondary' onClick={addClick} />
            <Button type="button" value='Edit' variant='secondary' onClick={editClick} />
            <Button type="button" value='Print' variant='secondary' onClick={printClick} />
            <Button type="button" value='Delete' variant='secondaryDanger' onClick={deleteClick} />
        </div>
        }

        <div className={`flex justify-start ${currentState === 'view'? 'mt-10':'mt-5'}`}>
            <TextField label='transaction no' className='w-[240px] rounded-[5px] pointer-events-none bg-[#f5f5f5]' tabIndex='-1' errors={errors.transaction_no} {...register('transaction_no')} />
            <DateField id='transaction_date' label='transaction date' className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})} tabIndex={currentState === 'view' ? '-1' : undefined} errors={errors.transaction_date} defaultValue={new Date().toISOString().split('T')[0]} {...register('transaction_date')} />
            <TextComboField 
                label='Petty Cash Account' 
                className={clsx('w-[240px] md:w-[500px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})}  
                tabIndex={currentState === 'view'? '-1':undefined} 
                errors={errors.petty_cash_account} 
                {...register('petty_cash_account_name')} 
                onBlur={(e) => accountLeave(e)} 
                values={accounts.map((account) => account.account_code + ' - ' + account.account_name)} 
                listName='accounts' />
            <HiddenField {...register('petty_cash_account')} />
        </div>
        <div className='mt-5'>
            <PettyCashTable
                tableData={tableData}
                inputChange={inputChange}
                lastCellLeave={lastCellLeave}
                firstCellLeave={firstCellLeave}
                moveRow={moveRow}
                accounts={accounts.map(account => account.account_code + ' - ' + account.account_name)} 
                isView={currentState === 'view' && true}
            />
        </div>
        <div className="flex justify-end mt-5">
            <NumberField label='Total' className='w-[240px] rounded-[5px] pointer-events-none bg-[#f5f5f5]' tabIndex='-1' {...register('total')} />
        </div>
        <div className="flex justify-center items-center gap-4 mt-5">
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
        <ListBox ref={listBoxRef} items={listBoxItems} values={['transaction_no', 'transaction_date', 'petty_cash_account']} setSearchVal={setSearchVal} setSearchIn={setSearchIn} />
    }
    {isMessageBoxVisible &&
        <MessageBox ref={listBoxRef} message={messageBoxMessage} onYes={onYes} isOpen={isMessageBoxVisible} setIsOpen={setMessageBoxVisible} />
    }
    </>
)}

export default PettyCash