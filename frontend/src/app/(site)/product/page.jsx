'use client'

import { TextField, NumberField, TextComboField, CheckBoxField, TextAreaField, HiddenField, ComboField } from '@/components/form_fields'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from "@hookform/resolvers/zod"
import { any, string, z } from 'zod'
import axios from 'axios'
import { ListBox, MessageBox, Toast } from '@/components/popups'
import Button from '@/components/buttons'
import { ProductTable } from '@/components/table'
import clsx from 'clsx'

const schema = z.object({
    product_code: string().min(1, { message: 'product code is required' }),
    product_name: string().min(1, { message: 'product name is required' }),
    main_unit: string().min(1, { message: 'main unit is required' }),
    multiple_units: any(),
    description: string().optional(),
    cost_price: string().min(1, { message: 'cost price is required' }),
    last_purchase_price: string().optional(),
    selling_price: string().optional(),
    type: string().optional(),
    stock: string().optional(),
    stock_on_delivery: string().optional(),
    vendor_id: any().optional(),
    category_id: any().optional(),
    vat_perc: string().optional(),
    inventory_account: any().optional(),
    cost_account: any().optional(),
    income_account: any().optional(),
})


const Product = () => {
    const { register, handleSubmit, control, formState, setValue, clearErrors } = useForm({ defaultValues: {}, resolver: zodResolver(schema) })

    const { errors } = formState

    const [idExists, setIdExists] = useState({
        first_id: '',
        next_id: '',
        prev_id: '',
        last_id: ''
    })
    
    
    const [multipleUnit, setMultipleUnit] = useState(false);
    const [vendors, setVendors] = useState([])
    const [categories, setCategories] = useState([])
    const [accounts, setAccounts] = useState([])
    const [type, setType] = useState('stock') 

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

    // Initialize the table data with the initial value
    const [tableData, setTableData] = useState([
        { unit: '', multiple: '*', multiple_value: '' },
    ]);
    
    const units = ['pcs', 'box', 'ctn', 'kg']
    
    const setData = useCallback((data) => {
        setValue('product_code', data.product_code)
        setValue('product_name', data.product_name)
        setValue('main_unit', data.main_unit)
        setValue('multiple_units', data.multiple_units)
        setMultipleUnit(data.multiple_units)
        setValue('description', data.description)
        setValue('cost_price', data.cost_price)
        setValue('last_purchase_price', data.last_purchase_price)
        setValue('selling_price', data.selling_price)
        setValue('type', data.type)
        setType(data.type)
        setValue('stock', data.stock)
        setValue('stock_on_delivery', data.stock_on_delivery)
        setValue('vat_perc', data.vat_perc)
        setValue('vendor_id', data.vendor)
        setValue('vendor_name', data.vendor_name)
        setValue('category_id', data.category)
        setValue('category_name', data.category_name)
        setValue('inventory_account_name', data.inventory_account_name)
        setValue('inventory_account', data.inventory_account)
        setValue('cost_account_name', data.cost_account_name)
        setValue('cost_account', data.cost_account)
        setValue('income_account_name', data.income_account_name)
        setValue('income_account', data.income_account)
    }, [setValue])

    const newData = useCallback(async() => {
        if (currentID > 0)
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}product/${currentID}`)
            setData(response.data.master_data)
            if (response.data.details_data.length > 0)
                setTableData(response.data.details_data)
            else
                setTableData([{ unit: '', multiple: '*', multiple_value: '' }])
            setIdExists(response.data.id_exists)
            setCurrentState('view')
        } catch (error) {
            console.log(error)
        }
    }, [currentID, setData])

    useEffect(() => {
        if (type === 'non-stock') {
            setValue('last_purchase_price', '')
            setValue('selling_price', '')
            setValue('stock', '')
            setValue('stock_on_delivery', '')
        } else if (type === 'service') {
            setValue('last_purchase_price', '')
            setValue('selling_price', '')
            setValue('stock', '')
            setValue('stock_on_delivery', '')
            setValue('vendor_id', '')
            setValue('vendor_name', '')
        } else if (type === 'description-only') {
            setValue('cost_price', '')
            setValue('last_purchase_price', '')
            setValue('selling_price', '')
            setValue('stock', '')
            setValue('stock_on_delivery', '')
            setValue('vat_perc', '')
            setValue('vendor_id', '')
            setValue('vendor_name', '')
            setValue('category_id', '')
            setValue('category_name', '')
        }
    }, [type, setValue])
    
    useEffect(() => {
        async function fetchCategories() {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}form_search/tblCategory`);

                setCategories(response.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        }
        
        async function fetchVendors() {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}form_search/tblVendor`);
                
                setVendors(response.data);
            } catch (error) {
                console.error('Error fetching vendors:', error);
            }
        }
        
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
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}product`)
                setCurrentID(response.data.master_data.id)
            } catch (e) {
                setCurrentState('add')
                setData({
                    multiple_units: false,
                    type: 'stock'
                })
                setTableData([{ unit: '', multiple: '*', multiple_value: '' }])
                setType('stock')
            }
        }

        fetchData()
        fetchVendors();
        fetchAccounts();
        fetchCategories();
    }, [setData]);
    
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
    }, [newData, currentID])

    useEffect(() => {
        if (currentState === 'view' && document.activeElement) {
            document.activeElement.blur();
            clearErrors()
        } else if (currentState === 'add' || currentState === 'edit') {
            document.getElementById('product_code').focus();
        }
    }, [currentState, clearErrors])

    const inputChange = (value, rowIndex, col) => {
        const newData = [...tableData];
        newData[rowIndex][col] = value;
        setTableData(newData);
    };
    
    const lastCellLeave = (event, rowIndex) => {
        if (
            event.key === 'Tab' &&
            !event.shiftKey &&
            rowIndex === tableData.length - 1 &&
            tableData[0].unit.trim() !== ''
        ) {
            const newData = [...tableData, { unit: '', multiple: '*', multiple_value: '' }];
            setTableData(newData);
        }
    };

    const firstCellLeave = (rowIndex) => {
        const newData = [...tableData];
        const rowToDelete = newData[rowIndex];
    
        // Check if the first column of the row is empty
        if (!rowToDelete.unit.trim() && newData.length > 1) {
            newData.splice(rowIndex, 1);
            setTableData(newData);
        }
    };

    const moveRow = (fromIndex, toIndex) => {
        const newData = [...tableData];
        const [movedRow] = newData.splice(fromIndex, 1);
        newData.splice(toIndex, 0, movedRow);
        setTableData(newData);
    };
    
    const vendorLeave = (value) => {
        if (!value) 
        return;
        const result = vendors.filter((vendor) => {
            if (value === vendor.vendor_code 
                || value === vendor.vendor_name 
                || value === (vendor.vendor_code + ' - ' + vendor.vendor_name)) {
                return vendor;
            }
        })
        if (result.length > 0) {
            setValue('vendor_name', result[0].vendor_name);
            setValue('vendor_id', (result[0].id));
        }
        else {
            setValue('vendor_name', '');
            showToast(`Invalid vendor`)
        }
    }

    const categoryLeave = (value) => {
        if (!value) 
            return;
        const result = categories.filter((category) => {
            if (value === category.category_code 
                || value === category.category_name 
                || value === (category.category_code + ' - ' + category.category_name)) {
                return category;
            }
        })
        if (result.length > 0) {
            setValue('category_name', result[0].category_name);
            setValue('category_id', (result[0].id));
        }
        else {
            setValue('category_name', '');
            showToast(`Invalid category`)
        }
    }
    
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
    
    const accountChange = (e) => {
        const value = e.target.value;
        if (!value) 
            return;
        const current_account = e.target.name.replace("_name", "")
        const result = accounts.filter((account) => {
            if (value === account.account_code 
            || value === account.account_name 
            || value === (account.account_code + ' - ' + account.account_name)) {
                return account;
            }
        })
        if (result.length > 0) {
            setValue(current_account, (result[0].id));
        }
        else {
            setValue(current_account, '');
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
        setMessageBoxMessage(`Are you sure you want to delete this product?`)
    }
    
    const onYes = async() => {
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}product/${currentID}`)
        setMessageBoxVisible(false)
        if (!idExists.next_id && !idExists.prev_id) {
            setCurrentState('add')
            setData({
                type: 'stock'
            })
            setType('stock')
            setTableData([{ unit: '', multiple: '*', multiple_value: '' }])
        } else {
            setCurrentID(idExists.next_id? idExists.next_id : idExists.prev_id)
        }
    }
    
    const addClick = useCallback((event) => {
        event.preventDefault();
        setData({
            type: 'stock'
        })
        setType('stock')
        setTableData([{ unit: '', multiple: '*', multiple_value: '' }])
        setCurrentState('add')
    }, [setData])
    
    const editClick = (event) => {
        event.preventDefault();
        setCurrentState('edit')
    }

    const findClick = useCallback(async() => {
        let response;
        try {
            response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}form_search/tblProduct`)
            const items = response.data.map((item, index) => (
                <tr key={index} className={`${index % 2 === 0? `bg-white`:`bg-gray-100`} cursor-pointer`}>
                    <td onClick={() => listValueClick(item.id)} className='w-[8rem]'>{item.product_code}</td>
                    <td onClick={() => listValueClick(item.id)} className='w-[20rem] border-l-[1px] border-black'>{item.product_name}</td>
                    <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.main_unit}</td>
                    <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.type}</td>
                    <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.stock}</td>
                    <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.cost_price}</td>
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
                case 'product_code':
                    searchURI = `/product_code/${searchVal}`
                    break;
                case 'product_name':
                    searchURI = `/product_name/${searchVal}`
                    break;
                case 'main_unit':
                    searchURI = `/main_unit/${searchVal}`
                    break;
                case 'type':
                    searchURI = `/type/${searchVal}`
                    break;
                default:
                    searchURI = `/${searchVal}`
                    break;
            }
        }
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}form_search/tblProduct${searchURI}`)
            const items = response.data.map((item, index) => (
                <tr key={index} className={`${index % 2 === 0? `bg-white`:`bg-gray-100`} cursor-pointer`}>
                    <td onClick={() => listValueClick(item.id)} className='w-[8rem]'>{item.product_code}</td>
                    <td onClick={() => listValueClick(item.id)} className='w-[20rem] border-l-[1px] border-black'>{item.product_name}</td>
                    <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.main_unit}</td>
                    <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.type}</td>
                    <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.stock}</td>
                    <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.cost_price}</td>
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
                response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}product`, data);
            else
                response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}product/${currentID}`, data);
        
            // Check the response status and handle accordingly
            if (response.data.status === 'success') {
                // console.log('Form submitted successfully:', response.data);
                // Optionally, you can redirect or perform other actions upon successful submission
                showToast(response.data.message)
                setCurrentID(response.data.id)
            } else {
                showToast(response.data.message)
                // console.error('Error submitting form:', response.data);
                // Handle error cases here
            }
        } catch (error) {
            showToast("Product saving failed")
            // console.error('An error occurred while submitting the form:', error);
            // Handle network errors or other exceptions here
        }
    }, [currentID, currentState, tableData]);

    useEffect(() => {
        const handleKeyDown = async function (e) {
            if (currentState === 'view' && (e.key === 'a' || e.key === 'A') && e.ctrlKey) {
                e.preventDefault()
                addClick(e)
            } else if (currentState === 'view' && (e.key === 'e' || e.key === 'E') && e.ctrlKey) {
                e.preventDefault()
                editClick(e)
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
    }, [currentID, idExists, currentState, setData, handleSubmit, saveForm, findClick, isListBoxVisible, newData, addClick]);


    return (
    <>
    <form method="POST" className='flex flex-col mt-3 ml-6 md:ml-3' onSubmit={handleSubmit(saveForm)}>
        <div className='flex flex-col xl:flex-row'>
            <div>
                <h1 className='font-black text-xl'>Product</h1>
                
                {currentState === 'view' &&
                <div className="flex justify-start items-center gap-4 mt-4 w-[240px] md:w-[500px]">
                    <Button type="button" value='Add' variant='secondary' onClick={addClick} />
                    <Button type="button" value='Edit' variant='secondary' onClick={editClick} />
                    <Button type="button" value='Delete' variant='secondaryDanger' onClick={deleteClick} />
                </div>
                }

                <div className={`flex flex-col md:flex-row justify-start ${currentState === 'view'? 'mt-10':'mt-5'}`}>
                    <TextField 
                        id = 'product_code'
                        label='Product Code' 
                        className={clsx('w-[240px] rounded-[5px] uppercase', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})} 
                        tabIndex={currentState === 'view'? '-1':undefined} 
                        errors={errors.product_code} 
                        {...register('product_code')} />
                    <span className='mt-5 md:mt-0'>
                    <TextComboField 
                        className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})} 
                        tabIndex={currentState === 'view'? '-1':undefined} 
                        label="Main Unit" 
                        values={units} 
                        listName='units'
                        errors={errors.main_unit}
                        {...register(`main_unit`)} />
                    </span>
                </div>

                <div className="flex justify-start mt-5">
                    <TextField 
                        label='Product Name' 
                        className={clsx('w-[240px] md:w-[500px] rounded-[5px] uppercase', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})}  
                        tabIndex={currentState === 'view'? '-1':undefined} 
                        errors={errors.product_name} 
                        {...register('product_name')} />
                </div>

                <div className="flex justify-start mt-5">
                    <TextAreaField 
                        label='Description' 
                        className={clsx('w-[240px] md:w-[500px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})}  
                        tabIndex={currentState === 'view'? '-1':undefined} 
                        errors={errors.description} 
                        {...register('description')} />
                </div>

                <div className="flex flex-col md:flex-row justify-start mt-5">
                    <ComboField
                        control={control}
                        className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})}
                        name={register('type')}
                        values={['stock', 'non-stock', 'service', 'description-only']}
                        onChange={(e) => setType(e.target.value)}
                        value={type}
                        label='Type'
                        tabIndex={currentState === 'view'? '-1':undefined} 
                        errors={errors.type}
                    />
                    {type !== 'description-only' &&
                    <span className='mt-5 md:mt-0'>
                    <NumberField 
                        label='Cost Price' 
                        className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})}  
                        tabIndex={currentState === 'view'? '-1':undefined} 
                        errors={errors.cost_price} 
                        {...register('cost_price')} />
                    </span>
                    }
                </div>

                {type === 'stock' &&
                <div className="flex flex-col md:flex-row justify-start mt-5">
                    <NumberField 
                        label='Last Purchase Price' 
                        className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})}  
                        tabIndex={currentState === 'view'? '-1':undefined} 
                        errors={errors.last_purchase_price} 
                        {...register('last_purchase_price')} />
                    <span className='mt-5 md:mt-0'>
                    <NumberField 
                        label='Selling Price' 
                        className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})}  
                        tabIndex={currentState === 'view'? '-1':undefined} 
                        errors={errors.selling_price} 
                        {...register('selling_price')} />
                    </span>
                </div>}
                {type === 'stock' &&
                <div className="flex flex-col md:flex-row justify-start mt-5">
                    <NumberField 
                        label='Stock' 
                        className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})}  
                        tabIndex={currentState === 'view'? '-1':undefined} 
                        errors={errors.stock} 
                        {...register('stock')} />
                    <span className='mt-5 md:mt-0'>
                    <NumberField 
                        label='Stock On Delivery' 
                        className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})}  
                        tabIndex={currentState === 'view'? '-1':undefined} 
                        errors={errors.stock_on_delivery} 
                        {...register('stock_on_delivery')} />
                    </span>
                </div>}

                {(type !== 'service' && type !== 'description-only') &&
                <div className="flex justify-start mt-5">
                    <TextComboField 
                        label='Vendor' 
                        className={clsx('w-[240px] md:w-[500px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})}  
                        tabIndex={currentState === 'view'? '-1':undefined} 
                        errors={errors.vendor_name} 
                        {...register('vendor_name')} 
                        onBlur={(e) => vendorLeave(e.target.value)} 
                        values={vendors.map((vendor) => vendor.vendor_code + ' - ' + vendor.vendor_name)} 
                        listName='vendors' />
                    <HiddenField {...register('vendor_id')} />
                </div>}
                {type !== 'description-only' &&
                <>
                <div className="flex flex-col md:flex-row justify-start mt-5">
                    <TextComboField 
                        label='Category' 
                        className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})}  
                        tabIndex={currentState === 'view'? '-1':undefined} 
                        errors={errors.category_name} 
                        {...register('category_name')} 
                        onBlur={(e) => categoryLeave(e.target.value)} 
                        values={categories.map((category) => category.category_code + ' - ' + category.category_name)} 
                        listName='categories' />
                    <HiddenField {...register('category_id')} />
                    <span className='mt-5 md:mt-0'>
                    <NumberField 
                        label='VAT %' 
                        className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})}  
                        tabIndex={currentState === 'view'? '-1':undefined} 
                        errors={errors.vat_perc} 
                        {...register('vat_perc')} />
                    </span>
                </div>

                <div className="flex justify-start mt-5">
                    <TextComboField 
                        label='Inventory Account' 
                        className={clsx('w-[240px] md:w-[500px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})}  
                        tabIndex={currentState === 'view'? '-1':undefined} 
                        errors={errors.inventory_account} 
                        {...register('inventory_account_name')} 
                        onBlur={(e) => accountLeave(e)} 
                        onChange={(e) => accountChange(e)} 
                        values={accounts.map((account) => account.account_code + ' - ' + account.account_name)} 
                        listName='accounts' />
                    <HiddenField {...register('inventory_account')} />
                </div>

                <div className="flex justify-start mt-5">
                    <TextComboField 
                        label='Cost Account' 
                        className={clsx('w-[240px] md:w-[500px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})}  
                        tabIndex={currentState === 'view'? '-1':undefined} 
                        errors={errors.cost_account} 
                        {...register('cost_account_name')} 
                        onBlur={(e) => accountLeave(e)} 
                        onChange={(e) => accountChange(e)} 
                        values={accounts.map((account) => account.account_code + ' - ' + account.account_name)} 
                        listName='accounts' />
                    <HiddenField {...register('cost_account')} />
                </div>

                <div className="flex justify-start mt-5">
                    <TextComboField 
                        label='Income Account' 
                        className={clsx('w-[240px] md:w-[500px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})}  
                        tabIndex={currentState === 'view'? '-1':undefined} 
                        errors={errors.income_account} 
                        {...register('income_account_name')} 
                        onBlur={(e) => accountLeave(e)} 
                        onChange={(e) => accountChange(e)} 
                        values={accounts.map((account) => account.account_code + ' - ' + account.account_name)} 
                        listName='accounts' />
                    <HiddenField {...register('income_account')} />
                </div>
                </>}
                <div className="flex flex-col md:flex-row justify-center items-center gap-4 mt-5 w-[240px] md:w-[500px] mb-5">
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
            <div className={`${currentState === 'view'? `mt-2 xl:mt-[7rem]` : `mt-2 xl:mt-11`}`}>
                {currentState !== 'view' &&<span className='md:mt-0'>
                <CheckBoxField checked={multipleUnit? true:false}
                    label="Multiple Units" 
                    control={control}
                    onChange={() => setMultipleUnit(!multipleUnit)} 
                    value={multipleUnit}
                    name={register('multiple_units')}
                    className={clsx({'pointer-events-none': currentState === 'view'})} 
                    tabIndex={currentState === 'view'? '-1':undefined}
                    />
                </span>}
                <div className={`w-[240px] md:w-[500px] ${currentState !== 'view' && `mt-5`}`}>
                {multipleUnit && <ProductTable
                    tableData={tableData}
                    inputChange={inputChange}
                    lastCellLeave={lastCellLeave}
                    firstCellLeave={firstCellLeave}
                    moveRow={moveRow}
                    control={control}
                    units={units}
                    isView={currentState === 'view'}
                    />}
                </div>

            </div>
        </div>
    </form>
    {isToastVisible && 
        <Toast message={toastMessage} onClose={handleToastClose} />
    }
    {isListBoxVisible &&
        <ListBox ref={listBoxRef} items={listBoxItems} values={['product_code', 'product_name', 'main_unit', 'type']} setSearchVal={setSearchVal} setSearchIn={setSearchIn} />
    }
    {isMessageBoxVisible &&
        <MessageBox ref={listBoxRef} message={messageBoxMessage} onYes={onYes} isOpen={isMessageBoxVisible} setIsOpen={setMessageBoxVisible} />
    }
    </>
)}

export default Product