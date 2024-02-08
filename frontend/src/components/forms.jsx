'use client'

import { TextField, DateField, NumberField, TextComboField, HiddenField, ComboField, CheckBoxField, TextAreaField } from '@/components/form_fields'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ListBox, MessageBox, Toast } from '@/components/popups'
import Button from '@/components/buttons'
import { RFQTable, SalesBasedTable } from '@/components/table'
import axios from 'axios'
import clsx from 'clsx'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

export const SalesBasedForm = ({module, schema}) => {

    const { register, handleSubmit, control, formState, setValue, getValues, clearErrors } = useForm({ defaultValues: {}, resolver: zodResolver(schema) })

    const { errors } = formState

    const [products, setProducts] = useState([])
    
    const [customers, setCustomers] = useState([])
    const [salesmen, setSalesmen] = useState([])

    const [currentState, setCurrentState] = useState('add')
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
        { product_code: '', product_name: '', product: '', unit: '', qty: '', price: '', item_discount: '', vat_perc: '', item_vat: '', item_total: '', units: []}
    ]);
    
    const payment_method = ['Cash', 'Card', 'Cheque', 'Bank Transfer']
    const [ payment, setPayment ] = useState('Cash')

    const setData = useCallback((data) => {
        if (module === 'sales') {
            setValue('invoice_no', data.invoice_no)
            setValue('invoice_date', data.invoice_date)
            setValue('amount_received', data.amount_received)
            setValue('balance', data.balance)
            setValue('payment_method', data.payment_method)
        
        } else if (module === 'sales_return') {
            setValue('return_no', data.return_no)
            setValue('invoice_no', data.invoice_no)
            setValue('invoice_date', data.invoice_date)
            setValue('amount_received', data.amount_received)
            setValue('balance', data.balance)
            setValue('payment_method', data.payment_method)
        
        } else if (module === 'sales_order') {
            setValue('order_no', data.order_no)
            setValue('order_date', data.order_date)
        
        } else if (module === 'quotation') {
            setValue('quotation_no', data.quotation_no)
            setValue('quotation_date', data.quotation_date)
            setValue('valid_till', data.valid_till)
        
        } else if (module === 'delivery_note') { 
            setValue('delivery_note_no', data.delivery_note_no)
            setValue('delivery_note_date', data.delivery_note_date)
        
        } else if (module === 'preforma') { 
            setValue('preforma_no', data.preforma_no)
            setValue('preforma_date', data.preforma_date)
        }
        setValue('total', data.total)
        setValue('vat', data.vat)
        setValue('discount', data.discount)
        setValue('roundoff', data.roundoff)
        setValue('net_amount', data.net_amount)
        setValue('customer', data.customer)
        setValue('customer_name', data.customer_name)
        setValue('salesman', data.salesman)
        setValue('salesman_name', data.salesman_name)
    }, [setValue, module]);

    useEffect(() => {
        async function fetchSalesmen() {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}form_search/tblEmployee`);

                setSalesmen(response.data);
            } catch (error) {
                console.error('Error fetching salesmen:', error);
            }
        }
        
        async function fetchCustomers() {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}form_search/tblCustomer`);
                
                setCustomers(response.data);
            } catch (error) {
                console.error('Error fetching customers:', error);
            }
        }
        
        async function fetchProducts() {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}form_search/tblProduct`);
                setProducts(response.data);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        }

        async function fetchData() {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}${module}`)
                const data = response.data.master_data;
                setData(data)
                setCurrentState('view')
                setCurrentID(data.id)
                setIdExists(response.data.id_exists)
                setTableData(response.data.details_data)
            } catch (error) {
                setCurrentState('add');
                setData({
                    invoice_no: module === 'sales'?1:null,
                    return_no: module === 'sales_return'?1:null,
                    preforma_no: 1,
                    quotation_no: 1,
                    order_no: 1,
                    delivery_note_no: 1,
                    invoice_date: new Date().toISOString().split('T')[0],
                    preforma_date: new Date().toISOString().split('T')[0],
                    quotation_date: new Date().toISOString().split('T')[0],
                    valid_till: new Date().toISOString().split('T')[0],
                    order_date: new Date().toISOString().split('T')[0],
                    delivery_note_date: new Date().toISOString().split('T')[0],
                })
            }
        }
    
        fetchProducts();
        fetchCustomers();
        fetchSalesmen();
        fetchData();
    }, [module, setData, setValue]);

    const fetchProductUnits = async(product) => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}product_unit/${product}`);
            return response.data
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    }

    const newData = useCallback(async() => {
        try {
            if (currentID > 0) {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}${module}/${currentID}`)
                setData(response.data.master_data)
                setTableData(response.data.details_data)
                setIdExists(response.data.id_exists)
                setCurrentState('view')
            }
        } catch (error) {
            console.error(error)
        }
    }, [module, currentID, setData])

    useEffect(() => {
        newData()
    }, [currentID, module, newData])
    
    useEffect(() => {
        if (currentState === 'view' && document.activeElement) {
            document.activeElement.blur();
            clearErrors()
        } else if (currentState === 'add' || currentState === 'edit') {
            switch (module) {
                case 'sales':
                    document.getElementById('invoice_date').focus();
                    break;
                case 'sales_return':
                    document.getElementById('invoice_no').focus();
                    break;
                case 'quotation':
                    document.getElementById('quotation_date').focus();
                    break;
                case 'delivery_note':
                    document.getElementById('delivery_note_date').focus();
                    break;
                case 'preforma':
                    document.getElementById('preforma_date').focus();
                    break;
                case 'sales_order':
                    document.getElementById('sales_order_date').focus();
                    break;
            }
        }
    }, [currentState, module, clearErrors])

    useEffect(() => {
        if (isListBoxVisible) {
            document.addEventListener('click', handleClickOutside);
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [isListBoxVisible]);

    const balanceChange = (value) => {
        let netAmount = parseFloat(getValues('net_amount')) || 0
        let amountReceived = value? parseFloat(value):parseFloat(getValues('amount_received'))
        
        let balance = (netAmount - (amountReceived? amountReceived:0)).toFixed(2)
        setValue('balance', balance)
    }

    const totalChange = (value, rowIndex, col) => {
        let total = 0;
        let discount = 0;
        let vat = 0;
        if (col === 'roundoff') {
            const amt = parseFloat(value)
            if (amt > 1) {
                setValue('roundoff', 1);
                value = 1
            }
            else if (amt < -1) {
                setValue('roundoff', -1);
                value = -1;
            }
        }
        let roundoff = (col === 'roundoff')? parseFloat(value) || 0 : parseFloat(getValues('roundoff')) || 0;
        
        for (let i=0; i<tableData.length; i++) {
            total += parseFloat(tableData[i]['item_total']) || 0
            vat += parseFloat(tableData[i]['item_vat']) || 0
            if (col === 'item_discount' && i === rowIndex)
                discount += parseFloat(value) || 0
            else
                discount += parseFloat(tableData[i]['item_discount']) || 0
        }
        const net_amount = total + roundoff;
        setValue('total', (total + discount - vat).toFixed(2));
        setValue('discount', discount);
        setValue('vat', vat);
        setValue('net_amount', net_amount);
        
        if (module === 'sales' || module === 'sales_return')
            balanceChange()
    }
    
    const inputChange = (value, rowIndex, col) => {
        if (col === 'qty' || col === 'price' || col === 'item_discount' || col === 'vat_perc') {
            const qty = (col === 'qty')? parseFloat(value) || 0 : parseFloat(tableData[rowIndex]['qty']) || 0;
            const price = (col === 'price')? parseFloat(value) || 0 : parseFloat(tableData[rowIndex]['price']) || 0;
            const item_discount = (col === 'item_discount')? parseFloat(value) || 0 : parseFloat(tableData[rowIndex]['item_discount']) || 0;
            const vat_perc = (col === 'vat_perc')? parseFloat(value) || 0 : parseFloat(tableData[rowIndex]['vat_perc']) || 0;


            const net = (qty * price) - item_discount 

            const item_vat = (net * vat_perc)/100;
            tableData[rowIndex]['item_vat'] = item_vat;

            const item_total = net + item_vat
            tableData[rowIndex]['item_total'] = item_total
            totalChange(value, rowIndex, col)
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
            tableData[0].product_code.trim() !== ''
        ) {
            const newData = [...tableData, { product_code: '', product_name: '', product: '', unit: '', qty: '', price: '', item_discount: '', vat_perc: '', item_vat: '', item_total: '', units: []}];
            setTableData(newData);
        }
    };

    const firstCellLeave = async(value, rowIndex) => {
        if (value) {
            const result = products.filter((product) => {
                if (value === product.product_code || value === product.product_name || value === (product.product_code + ' - ' + product.product_name)) {
                    return product;
                }
            })
            if (result.length > 0) {
                const newData = [...tableData];
                newData[rowIndex]['product_code'] = result[0].product_code;
                newData[rowIndex]['product_name'] = result[0].product_name;
                newData[rowIndex]['product'] = result[0].id;
                newData[rowIndex]['vat_perc'] = result[0].vat_perc;
                const units = []
                units.push({ unit: result[0].main_unit, multiple: '*', multiple_value: 1})
                const sub_units = await fetchProductUnits(result[0].id)
                sub_units.map(unit => units.push(unit))
                newData[rowIndex]['units'] = units
                setTableData(newData);
            } else {
                const newData = [...tableData];
                newData[rowIndex]['product_code'] = '';
                newData[rowIndex]['product_name'] = '';
                newData[rowIndex]['product'] = '';
                newData[rowIndex]['vat_perc'] = '';
                setTableData(newData);
                showToast(`Invalid product`)
            }
        } else {
            const newData = [...tableData];
            const rowToDelete = newData[rowIndex];
        
            // Check if the first column of the row is empty
            if (!rowToDelete.product_code.trim() && newData.length > 1) {
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

    const showToast = (message) => {
        setToastMessage(message);
        setIsToastVisible(true);
    };

    const handleToastClose = () => {
        setIsToastVisible(false);
        setToastMessage('');
    };

    const customerLeave = (value) => {
        if (!value) {
            setValue('customer', '');
            return;
        }
        const result = customers.filter((customer) => {
            if (value === customer.customer_code || value === customer.customer_name || value === (customer.customer_code + ' - ' + customer.customer_name)) {
                return customer;
            }
        })
        if (result.length > 0) {
            setValue('customer_name', result[0].customer_name);
            setValue('customer', (result[0].id).toString());
        }
        else {
            setValue('customer', '');
            showToast(`Invalid customer`)
        }
    }

    const salesmanLeave = (value) => {
        if (!value) {
            setValue('salesman', '');
            return;
        }
        const result = salesmen.filter((salesman) => {
            if (value === salesman.employee_code || value === salesman.employee_name || value === (salesman.employee_code + ' - ' + salesman.employee_name)) {
                return salesman;
            }
        })
        if (result.length > 0) {
            setValue('salesman_name', result[0].employee_name);
            setValue('salesman', (result[0].id).toString());
        }
        else {
            setValue('salesman', '');
            showToast(`Invalid salesman`)
        }
    }

    const deleteClick = () => {
        setMessageBoxVisible(true)
        setMessageBoxMessage(`Are you sure you want to delete?`)
    }
    
    const onYes = async() => {
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}${module}/${currentID}`)
        setMessageBoxVisible(false)
        if (!idExists.next_id && !idExists.prev_id) {
            setCurrentState('add')
            setData({
                invoice_no: module === 'sales'?1:null,
                return_no: module === 'sales_return'?1:null,
                preforma_no: 1,
                quotation_no: 1,
                order_no: 1,
                delivery_note_no: 1,
                invoice_date: new Date().toISOString().split('T')[0],
                preforma_date: new Date().toISOString().split('T')[0],
                quotation_date: new Date().toISOString().split('T')[0],
                valid_till: new Date().toISOString().split('T')[0],
                order_date: new Date().toISOString().split('T')[0],
                delivery_note_date: new Date().toISOString().split('T')[0],
            })
            setTableData([
                { product_code: '', product_name: '', product: '', unit: '', qty: '', price: '', item_discount: '', vat_perc: '', item_vat: '', item_total: '', units: []}
            ])
        } else {
            setCurrentID(idExists.next_id? idExists.next_id : idExists.prev_id)
        }
    }

    const addClick = useCallback((event) => {
        event.preventDefault();
        console.log(idExists.next_no)
        setData({
            invoice_no: (module === 'sales')?idExists.next_no:null,
            return_no: (module === 'sales_return')?idExists.next_no:null,
            preforma_no: idExists.next_no,
            quotation_no: idExists.next_no,
            order_no: idExists.next_no,
            delivery_note_no: idExists.next_no,
            invoice_date: new Date().toISOString().split('T')[0],
            preforma_date: new Date().toISOString().split('T')[0],
            quotation_date: new Date().toISOString().split('T')[0],
            valid_till: new Date().toISOString().split('T')[0],
            order_date: new Date().toISOString().split('T')[0],
            delivery_note_date: new Date().toISOString().split('T')[0],
        })
        setTableData([{ product_code: '', product_name: '', product: '', unit: '', qty: '', price: '', item_discount: '', vat_perc: '', item_vat: '', item_total: '', units: []}])
        setCurrentState('add')
    }, [module, idExists, setData])

    const editClick = (event) => {
        event.preventDefault();
        setCurrentState('edit')
    }

    const printClick = useCallback(async(event) => {
        event.preventDefault();
        window.open(`${process.env.NEXT_PUBLIC_API_URL}pdf/${module}/${currentID}`, '_blank');
    }, [module, currentID])

    const findClick = useCallback(async() => {
        let response;
        let items
        try {
            if (module === 'sales') {
                response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}invoice_search/sales/sales`)
                items = response.data.map((item, index) => (
                    <tr key={index} className={`${index % 2 === 0? `bg-white`:`bg-gray-100`} cursor-pointer`}>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem]'>{item.invoice_no}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.invoice_date}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[20rem] border-l-[1px] border-black'>{item.customer_name}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.net_amount}</td>
                    </tr>
                ))
            } else if (module === 'sales_return') {
                response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}invoice_search/sales/return`)
                items = response.data.map((item, index) => (
                    <tr key={index} className={`${index % 2 === 0? `bg-white`:`bg-gray-100`} cursor-pointer`}>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem]'>{item.return_no}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.invoice_date}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.invoice_no}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[20rem] border-l-[1px] border-black'>{item.customer_name}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.net_amount}</td>
                    </tr>
                ))
            } else if (module === 'sales_order') {
                response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}form_search/tblSalesOrder_Master`)
                items = response.data.map((item, index) => (
                    <tr key={index} className={`${index % 2 === 0? `bg-white`:`bg-gray-100`} cursor-pointer`}>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem]'>{item.order_no}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.order_date}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[20rem] border-l-[1px] border-black'>{item.customer_name}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.net_amount}</td>
                    </tr>
                ))
            } else if (module === 'quotation') {
                response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}form_search/tblQuotation_Master`)
                items = response.data.map((item, index) => (
                    <tr key={index} className={`${index % 2 === 0? `bg-white`:`bg-gray-100`} cursor-pointer`}>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem]'>{item.quotation_no}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.quotation_date}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[20rem] border-l-[1px] border-black'>{item.customer_name}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.net_amount}</td>
                    </tr>
                ))
            } else if (module === 'preforma') {
                response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}form_search/tblPreforma_Master`)
                items = response.data.map((item, index) => (
                    <tr key={index} className={`${index % 2 === 0? `bg-white`:`bg-gray-100`} cursor-pointer`}>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem]'>{item.preforma_no}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.preforma_date}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[20rem] border-l-[1px] border-black'>{item.customer_name}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.net_amount}</td>
                    </tr>
                ))
            } else if (module === 'delivery_note') {
                response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}form_search/tblDeliveryNote_Master`)
                items = response.data.map((item, index) => (
                    <tr key={index} className={`${index % 2 === 0? `bg-white`:`bg-gray-100`} cursor-pointer`}>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem]'>{item.delivery_note_no}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.delivery_note_date}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[20rem] border-l-[1px] border-black'>{item.customer_name}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.net_amount}</td>
                    </tr>
                ))
            }
            setListBoxItems(items);
            setIsListBoxVisible(true);
        } catch (error) {
            console.error('Error fetching data:', error);
            // Handle error as needed
        }
    }, [module])

    const formSearch = useCallback(async() => {
        let searchURI = ''
        let items
        let response
        if (searchVal.length > 0) {
            switch (searchIn) {
                case 'invoice_no':
                    searchURI = `/invoice_no/${searchVal}`
                    break;
                case 'invoice_date':
                    searchURI = `/invoice_date/${searchVal}`
                    break;
                case 'return_no':
                    searchURI = `/return_no/${searchVal}`
                    break;
                case 'return_date':
                    searchURI = `/invoice_date/${searchVal}`
                    break;
                case 'order_no':
                    searchURI = `/order_no/${searchVal}`
                    break;
                case 'order_date':
                    searchURI = `/order_date/${searchVal}`
                    break;
                case 'quotation_no':
                    searchURI = `/quotation_no/${searchVal}`
                    break;
                case 'quotation_date':
                    searchURI = `/quotation_date/${searchVal}`
                    break;
                case 'preforma_no':
                    searchURI = `/preforma_no/${searchVal}`
                    break;
                case 'preforma_date':
                    searchURI = `/preforma_date/${searchVal}`
                    break;
                case 'delivery_note_no':
                    searchURI = `/delivery_note_no/${searchVal}`
                    break;
                case 'delivery_note_date':
                    searchURI = `/delivery_note_date/${searchVal}`
                    break;
                case 'customer':
                    searchURI = `/customer__customer_name/${searchVal}`
                    break;
                default:
                    searchURI = `/${searchVal}`
                    break;
            }
        }
        try {
            if (module === 'sales') {
                response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}invoice_search/sales/sales${searchURI}`)
                items = response.data.map((item, index) => (
                    <tr key={index} className={`${index % 2 === 0? `bg-white`:`bg-gray-100`} cursor-pointer`}>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem]'>{item.invoice_no}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.invoice_date}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[20rem] border-l-[1px] border-black'>{item.customer_name}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.net_amount}</td>
                    </tr>
                ))
            } else if (module === 'sales_return') {
                response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}invoice_search/sales/return${searchURI}`)
                items = response.data.map((item, index) => (
                    <tr key={index} className={`${index % 2 === 0? `bg-white`:`bg-gray-100`} cursor-pointer`}>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem]'>{item.return_no}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.invoice_date}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.invoice_no}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[20rem] border-l-[1px] border-black'>{item.customer_name}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.net_amount}</td>
                    </tr>
                ))
            } else if (module === 'sales_order') {
                response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}form_search/tblSalesOrder_Master${searchURI}`)
                items = response.data.map((item, index) => (
                    <tr key={index} className={`${index % 2 === 0? `bg-white`:`bg-gray-100`} cursor-pointer`}>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem]'>{item.order_no}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.order_date}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[20rem] border-l-[1px] border-black'>{item.customer_name}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.net_amount}</td>
                    </tr>
                ))
            } else if (module === 'quotation') {
                response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}form_search/tblQuotation_Master${searchURI}`)
                items = response.data.map((item, index) => (
                    <tr key={index} className={`${index % 2 === 0? `bg-white`:`bg-gray-100`} cursor-pointer`}>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem]'>{item.quotation_no}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.quotation_date}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[20rem] border-l-[1px] border-black'>{item.customer_name}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.net_amount}</td>
                    </tr>
                ))
            } else if (module === 'preforma') {
                response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}form_search/tblPreforma_Master${searchURI}`)
                items = response.data.map((item, index) => (
                    <tr key={index} className={`${index % 2 === 0? `bg-white`:`bg-gray-100`} cursor-pointer`}>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem]'>{item.preforma_no}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.preforma_date}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[20rem] border-l-[1px] border-black'>{item.customer_name}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.net_amount}</td>
                    </tr>
                ))
            } else if (module === 'delivery_note') {
                response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}form_search/tblDeliveryNote_Master${searchURI}`)
                items = response.data.map((item, index) => (
                    <tr key={index} className={`${index % 2 === 0? `bg-white`:`bg-gray-100`} cursor-pointer`}>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem]'>{item.delivery_note_no}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.delivery_note_date}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[20rem] border-l-[1px] border-black'>{item.customer_name}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.net_amount}</td>
                    </tr>
                ))
            }
            setListBoxItems(items);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }, [searchIn, searchVal, module])

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
        const data={ master_data: formData, details_data: tableData }
        try {
            // Make a POST request to your Django URL with the form data
            let response;
            if (currentState === 'add') {
                response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}${module}`, data);
            }
            else {
                response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}${module}/${currentID}`, data);
            }
        
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
            showToast(`${module === 'preforma'? `Preforma`
            :module === 'delivery_note'? `Delivery Note`
            :module === 'quotation'? `Quotation`
            :module === 'sales'? `Sales`
            :module === 'sales_return'? `Return`
            :`Sales Order`} saving failed`)
            // console.error('An error occurred while submitting the form:', error);
            // Handle network errors or other exceptions here
        }
    }, [currentID, currentState, module, tableData]);
    
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
            } else if (currentState === 'view' && (e.key === 'p' || e.key === 'P') && e.ctrlKey) {
                e.preventDefault()
                printClick(e)
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
    }, [currentID, idExists, currentState, setData, handleSubmit, saveForm, findClick, isListBoxVisible, addClick, newData, printClick]);        


    return (
    <>
    <form method="POST" id='form_content' className='mt-4 ml-3' onSubmit={handleSubmit(saveForm)}>
        <h1 className='font-black text-xl'>
            {module === 'preforma'? `Preforma Invoice`
            :module === 'delivery_note'? `Delivery Note`
            :module === 'quotation'? `Quotation`
            :module === 'sales'? `Sales`
            :module === 'sales_return'? `Sales Return`
            :`Sales Order`}
        </h1>

        {currentState === 'view' &&
        <div className="flex justify-start items-center gap-4 mt-5 w-[500px]">
            <Button type="button" value='Add' variant='secondary' onClick={addClick} />
            <Button type="button" value='Edit' variant='secondary' onClick={editClick} />
            <Button type="button" value='Print' variant='secondary' onClick={printClick} />
            <Button type="button" value='Delete' variant='secondaryDanger' onClick={deleteClick} />
        </div>
        }

        <div className={`flex justify-start ${currentState === 'view'? 'mt-10':'mt-5'}`}>
            {module === 'preforma'? 
            <>
                <TextField label='Preforma no' className='w-[240px] rounded-[5px] pointer-events-none bg-[#f5f5f5]' tabIndex='-1' errors={errors.preforma_no} {...register('preforma_no')} />
                <DateField id='preforma_date' label='Preforma date' className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})} tabIndex={currentState === 'view' ? '-1' : undefined} errors={errors.preforma_date} defaultValue={new Date().toISOString().split('T')[0]} {...register('preforma_date')} />
            </>
            :module === 'delivery_note'?
            <>
                <TextField label='Delivery Note no' className='w-[240px] rounded-[5px] pointer-events-none bg-[#f5f5f5]' tabIndex='-1' errors={errors.delivery_note_no} {...register('delivery_note_no')} />
                <DateField id='delivery_note_date' label='Delivery Note date' className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})} tabIndex={currentState === 'view' ? '-1' : undefined} errors={errors.delivery_note_date} defaultValue={new Date().toISOString().split('T')[0]} {...register('delivery_note_date')} />
            </>
            :module === 'quotation'?
            <>
                <TextField label='Quotation no' className='w-[240px] rounded-[5px] pointer-events-none bg-[#f5f5f5]' tabIndex='-1' errors={errors.quotation_no} {...register('quotation_no')} />
                <DateField id='quotation_date' label='Quotation date' className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})} tabIndex={currentState === 'view' ? '-1' : undefined} errors={errors.quotation_date} defaultValue={new Date().toISOString().split('T')[0]} {...register('quotation_date')} />
                <DateField label='Valid Till' className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})} tabIndex={currentState === 'view' ? '-1' : undefined} errors={errors.valid_till} defaultValue={new Date().toISOString().split('T')[0]} {...register('valid_till')} />
            </> 
            :module === 'sales'?
            <>
                <TextField label='Invoice no' className='w-[240px] rounded-[5px] pointer-events-none bg-[#f5f5f5]' tabIndex='-1' errors={errors.invoice_no} {...register('invoice_no')} />
                <DateField id='invoice_date' label='Invoice date' className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})} tabIndex={currentState === 'view' ? '-1' : undefined} errors={errors.invoice_date} defaultValue={new Date().toISOString().split('T')[0]} {...register('invoice_date')} />
            </> 
            :module === 'sales_return'?
            <>
                <TextField label='Return no' className='w-[240px] rounded-[5px] pointer-events-none bg-[#f5f5f5]' tabIndex='-1' errors={errors.return_no} {...register('return_no')} />
                <TextField id='invoice_no' label='Invoice no' className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})} tabIndex={currentState === 'view'? '-1':undefined} errors={errors.invoice_no} {...register('invoice_no')} />
                <DateField label='Return date' className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})} tabIndex={currentState === 'view' ? '-1' : undefined} errors={errors.invoice_date} defaultValue={new Date().toISOString().split('T')[0]} {...register('invoice_date')} />
            </> 
            :<>
                <TextField label='Order no' className='w-[240px] rounded-[5px] pointer-events-none bg-[#f5f5f5]' tabIndex='-1' errors={errors.order_no} {...register('order_no')} />
                <DateField id='sales_order_date' label='Order date' className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})} tabIndex={currentState === 'view' ? '-1' : undefined} errors={errors.order_date} defaultValue={new Date().toISOString().split('T')[0]} {...register('order_date')} />
            </>}
            
        </div>
        <div className="flex justify-start mt-5">
            <TextComboField label='Customer' className={clsx('w-[500px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})} tabIndex={currentState==='view'? '-1':undefined} onChange={(e) => {}} errors={errors.customer} {...register('customer_name')} onBlur={(e) => customerLeave(e.target.value)} values={customers.map((customer) => customer.customer_code + ' - ' + customer.customer_name)} listName='customers' />
            <HiddenField {...register('customer')} />
            <TextComboField label='Salesman' className={clsx('w-[500px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})} tabIndex={currentState==='view'? '-1':undefined} onChange={(e) => {}} errors={errors.salesman} {...register('salesman_name')} onBlur={(e) => salesmanLeave(e.target.value)} values={salesmen.map((salesman) => salesman.employee_code + ' - ' + salesman.employee_name)} listName='salesmen' />
            <HiddenField {...register('salesman')} />
        </div>
        <div className='mt-5'>
        <SalesBasedTable
            tableData={tableData}
            inputChange={inputChange}
            lastCellLeave={lastCellLeave}
            firstCellLeave={firstCellLeave}
            moveRow={moveRow}
            products={products.map(product => product.product_code + ' - ' + product.product_name)}
            control={control}
            isView={currentState === 'view' && true}
        />
        </div>
        <div className="flex justify-start mt-5">
            <NumberField label='Total' className='w-[240px] rounded-[5px] bg-[#f5f5f5] pointer-events-none' tabIndex='-1' errors={errors.total} {...register('total')} />
            <NumberField label='VAT' className='w-[240px] rounded-[5px] bg-[#f5f5f5] pointer-events-none' tabIndex='-1' errors={errors.vat} {...register('vat')} />
            <NumberField label='Discount' className='w-[240px] rounded-[5px] bg-[#f5f5f5] pointer-events-none' tabIndex='-1' errors={errors.discount} {...register('discount')} />
            <NumberField label='RoundOff' className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})} tabIndex={currentState === 'view' ? '-1' : undefined} errors={errors.roundoff} {...register('roundoff')} onChange={(e) => totalChange(e.target.value, 0, 'roundoff')} />
            {(module !== 'sales' && module !== 'sales_return') && <NumberField label='Net Amount' className='w-[240px] rounded-[5px] bg-[#f5f5f5] pointer-events-none' tabIndex='-1' errors={errors.net_amount} {...register('net_amount')} />}
        </div>
        {module === 'sales' && 
        <div className='flex justify-start mt-5'>
        <NumberField 
            label='Net Amount' 
            className='w-[240px] rounded-[5px] bg-[#f5f5f5] pointer-events-none' 
            tabIndex='-1' 
            errors={errors.net_amount} 
            {...register('net_amount')} />
        <NumberField 
            label='Amount Received' 
            className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})} 
            tabIndex={currentState === 'view' ? '-1' : undefined} 
            errors={errors.amount_received}
            onInput = {(e) => balanceChange((e.target.value === '')? true: e.target.value)} 
            {...register('amount_received')} />
        <NumberField 
            label='Balance' 
            className='w-[240px] rounded-[5px] bg-[#f5f5f5] pointer-events-none' 
            tabIndex='-1' 
            errors={errors.balance} 
            {...register('balance')} />
        <ComboField
                label="Payment Method"
                errors={errors.payment_method}
                control={control}
                className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})} 
                tabIndex={currentState==='view'? '-1':undefined}
                onChange={(e) => {
                    setPayment(e.target.value);
                }}
                values={payment_method}
                name={register('payment_method')}
                value={payment}
            />
        </div>}
        {module === 'sales_return' && 
        <div className='flex justify-start mt-5'>
        <NumberField label='Net Amount' className='w-[240px] rounded-[5px] bg-[#f5f5f5] pointer-events-none' tabIndex='-1' errors={errors.net_amount} {...register('net_amount')} />
        <NumberField 
            label='Amount Payed' 
            className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})} 
            tabIndex={currentState === 'view' ? '-1' : undefined} 
            errors={errors.amount_received} 
            onInput = {(e) => balanceChange((e.target.value === '')? true: e.target.value)} 
            {...register('amount_received')} />
        <NumberField label='Balance' className='w-[240px] rounded-[5px] bg-[#f5f5f5] pointer-events-none' tabIndex='-1' errors={errors.balance} {...register('balance')} />
        <ComboField
                label="Payment Method"
                errors={errors.payment_method}
                control={control}
                className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})} 
                tabIndex={currentState==='view'? '-1':undefined}
                onChange={(e) => {
                    setPayment(e.target.value);
                }}
                values={payment_method}
                name={register('payment_method')}
                value={payment}
            />
        </div>}
        {((module === 'sales' || module === 'sales_return') && payment === 'Cheque') && 
        <div className='flex mt-5'>
            <TextField label='Cheque no' className={clsx('w-[240px] lg:w-[500px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})} tabIndex={currentState==='view'? '-1':undefined} errors={errors.cheque_no} {...register('cheque_no')} />
            <DateField label='Cheque Date' className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})} tabIndex={currentState==='view'? '-1':undefined} defaultValue={new Date().toISOString().split('T')[0]} errors={errors.cheque_date} {...register('cheque_date')} />
        </div>}
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
        <ListBox ref={listBoxRef} items={listBoxItems} values={
            (module === 'sales')?['invoice_no', 'invoice_date', 'customer']:
            (module === 'sales_return')?['return_no', 'invoice_no', 'return_date', 'customer']:
            (module === 'sales_order')?['order_no', 'order_date', 'customer']:
            (module === 'preforma')?['preforma_no', 'preforma_date', 'customer']:
            (module === 'quotation')?['quotation_no', 'quotation_date', 'customer']:
            ['delivery_note_no', 'delivery_note_date', 'customer']
        } setSearchVal={setSearchVal} setSearchIn={setSearchIn} />
    }
    {isMessageBoxVisible &&
        <MessageBox ref={listBoxRef} message={messageBoxMessage} onYes={onYes} isOpen={isMessageBoxVisible} setIsOpen={setMessageBoxVisible} />
    }
    </>
)}








export const PurchaseBasedForm = ({module, schema}) => {
    
    const { register, handleSubmit, control, formState, setValue, getValues, clearErrors } = useForm({ defaultValues: {}, resolver: zodResolver(schema) })

    const { errors } = formState
    
    const [products, setProducts] = useState([])
    
    const [vendors, setVendors] = useState([])
    const [salesmen, setSalesmen] = useState([])

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
        (module === 'rfq')? { product_code: '', product_name: '', product: '', unit: '', qty: '', units: [] }:{ product_code: '', product_name: '', product: '', unit: '', qty: '', price: '', item_discount: '', vat_perc: '', item_vat: '', item_total: '', units: []}
    ]);
    
    const payment_method = ['Cash', 'Card', 'Cheque', 'Bank Transfer']
    const [ payment, setPayment ] = useState('')

    const setData = useCallback((data) => {
        if (module === 'purchase') {
            setValue('invoice_no', data.invoice_no)
            setValue('purchase_no', data.purchase_no)
            setValue('invoice_date', data.invoice_date)
            setValue('amount_payed', data.amount_payed)
            setValue('balance', data.balance)
            setValue('payment_method', data.payment_method)

        } else if (module === 'purchase_return') {
            setValue('return_no', data.return_no)
            setValue('invoice_date', data.invoice_date)
            setValue('invoice_no', data.invoice_no)
            setValue('purchase_no', data.purchase_no)
            setValue('amount_payed', data.amount_payed)
            setValue('balance', data.balance)
            setValue('payment_method', data.payment_method)

        } else if (module === 'purchase_order') {
            setValue('order_no', data.order_no)
            setValue('order_date', data.order_date)
        } 
        
        if (module === 'rfq') {
            setValue('rfq_no', data.rfq_no)
            setValue('rfq_date', data.rfq_date)
        }
        else {
            setValue('total', data.total)
            setValue('vat', data.vat)
            setValue('discount', data.discount)
            setValue('roundoff', data.roundoff)
            setValue('net_amount', data.net_amount)
        }

        setValue('vendor', data.vendor)
        setValue('vendor_name', data.vendor_name)
        setValue('salesman', data.salesman)
        setValue('salesman_name', data.salesman_name)
    }, [setValue, module]);

    useEffect(() => {
        async function fetchSalesmen() {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}form_search/tblEmployee`);

                setSalesmen(response.data);
            } catch (error) {
                console.error('Error fetching salesmen:', error);
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
        
        async function fetchProducts() {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}form_search/tblProduct`);
                setProducts(response.data);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        }

        async function fetchData() {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}${module}`)
                const data = response.data.master_data;
                setData(data)
                setCurrentState('view')
                setCurrentID(data.id)
                setIdExists(response.data.id_exists)
                setTableData(response.data.details_data)
            } catch (error) {
                setCurrentState('add');
                setData({
                    invoice_no: module === 'purchase'?1:null,
                    return_no: module === 'purchase_return'?1:null,
                    order_no: 1,
                    rfq_no: 1,
                    invoice_date: new Date().toISOString().split('T')[0],
                    order_date: new Date().toISOString().split('T')[0],
                    rfq_date: new Date().toISOString().split('T')[0],
                })
            }
        }
        
        fetchProducts();
        fetchVendors();
        fetchSalesmen();
        fetchData();
    }, [module, setData]);
    
    const fetchProductUnits = async(product) => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}product_unit/${product}`);
            return response.data
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    }

    const newData = useCallback(async() => {
        try {
            if (currentID > 0) {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}${module}/${currentID}`)
                setData(response.data.master_data)
                setTableData(response.data.details_data)
                setIdExists(response.data.id_exists)
                setCurrentState('view')
            }
        } catch (error) {
            console.error(error)
        }
    }, [module, currentID, setData])
    
    useEffect(() => {
        newData()
    }, [currentID, module, newData])

    useEffect(() => {
        if (currentState === 'view' && document.activeElement) {
            document.activeElement.blur();
            clearErrors()
        } else if (currentState === 'add' || currentState === 'edit') {
            switch (module) {
                case 'purchase':
                    document.getElementById('purchase_no').focus();
                    break;
                case 'purchase_return':
                    document.getElementById('return_date').focus();
                    break;
                case 'rfq':
                    document.getElementById('rfq_date').focus();
                    break;
                case 'purchase_order':
                    document.getElementById('purchase_order_date').focus();
                    break;
            }
        }
    }, [currentState, module, clearErrors])

    useEffect(() => {
        if (isListBoxVisible) {
            document.addEventListener('click', handleClickOutside);
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [isListBoxVisible]);

    const balanceChange = (value) => {
        let netAmount = parseFloat(getValues('net_amount')) || 0
        let amountPayed = value? parseFloat(value):parseFloat(getValues('amount_payed'))
        
        let balance = (netAmount - (amountPayed? amountPayed:0)).toFixed(2)
        setValue('balance', balance)
    }

    const totalChange = (value, rowIndex, col) => {
        let total = 0;
        let discount = 0;
        let vat = 0;
        if (col === 'roundoff') {
            const amt = parseFloat(value)
            if (amt > 1) {
                setValue('roundoff', 1);
                value = 1
            }
            else if (amt < -1) {
                setValue('roundoff', -1);
                value = -1;
            }
        }
        let roundoff = (col === 'roundoff')? parseFloat(value) || 0 : parseFloat(getValues('roundoff')) || 0;
        
        for (let i=0; i<tableData.length; i++) {
            total += parseFloat(tableData[i]['item_total']) || 0
            vat += parseFloat(tableData[i]['item_vat']) || 0
            if (col === 'item_discount' && i === rowIndex)
                discount += parseFloat(value) || 0
            else
                discount += parseFloat(tableData[i]['item_discount']) || 0
        }
        const net_amount = total + roundoff;
        setValue('total', total + discount - vat);
        setValue('discount', discount);
        setValue('vat', vat);
        setValue('net_amount', net_amount);

        if (module === 'purchase' || module === 'purchase_return')
            balanceChange()
    }
    
    const inputChange = (value, rowIndex, col) => {
        if (col === 'qty' || col === 'price' || col === 'item_discount' || col === 'vat_perc') {
            const qty = (col === 'qty')? parseFloat(value) || 0 : parseFloat(tableData[rowIndex]['qty']) || 0;
            const price = (col === 'price')? parseFloat(value) || 0 : parseFloat(tableData[rowIndex]['price']) || 0;
            const item_discount = (col === 'item_discount')? parseFloat(value) || 0 : parseFloat(tableData[rowIndex]['item_discount']) || 0;
            const vat_perc = (col === 'vat_perc')? parseFloat(value) || 0 : parseFloat(tableData[rowIndex]['vat_perc']) || 0;


            const net = (qty * price) - item_discount 

            const item_vat = net * vat_perc;
            tableData[rowIndex]['item_vat'] = item_vat;

            const item_total = net + item_vat
            tableData[rowIndex]['item_total'] = item_total
            totalChange(value, rowIndex, col)
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
            tableData[0].product_code.trim() !== ''
        ) {
            const newData = [...tableData, module === 'rfq'? { product_code: '', product_name: '', product: '', unit: '', qty: '', units: [] }:{ product_code: '', product_name: '', product: '', unit: '', qty: '', price: '', item_discount: '', vat_perc: '', item_vat: '', item_total: '', units: []}];
            setTableData(newData);
        }
    };

    const firstCellLeave = async(value, rowIndex) => {
        if (value) {
            const result = products.filter((product) => {
                if (value === product.product_code || value === product.product_name || value === (product.product_code + ' - ' + product.product_name)) {
                    return product;
                }
            })
            if (result.length > 0) {
                const newData = [...tableData];
                newData[rowIndex]['product_code'] = result[0].product_code;
                newData[rowIndex]['product_name'] = result[0].product_name;
                newData[rowIndex]['product'] = result[0].id;
                newData[rowIndex]['vat_perc'] = result[0].vat_perc;
                const units = []
                units.push({ unit: result[0].main_unit, multiple: '*', multiple_value: 1})
                const sub_units = await fetchProductUnits(result[0].id)
                sub_units.map(unit => units.push(unit))
                newData[rowIndex]['units'] = units
                setTableData(newData);
            } else {
                const newData = [...tableData];
                newData[rowIndex]['product_code'] = '';
                newData[rowIndex]['product_name'] = '';
                newData[rowIndex]['product'] = '';
                newData[rowIndex]['vat_perc'] = '';
                setTableData(newData);
                showToast(`Invalid product`)
            }
        } else {
            const newData = [...tableData];
            const rowToDelete = newData[rowIndex];
            
            // Check if the first column of the row is empty
            if (!rowToDelete.product_code.trim() && newData.length > 1) {
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
    
    
    const vendorLeave = (value) => {
        if (!value)
        {
            setValue('vendor', '');
            return;
        }
        const result = vendors.filter((vendor) => {
            if (value === vendor.vendor_code || value === vendor.vendor_name || value === (vendor.vendor_code + ' - ' + vendor.vendor_name)) {
                return vendor;
            }
        })
        if (result.length > 0) {
            setValue('vendor_name', result[0].vendor_name);
            setValue('vendor', (result[0].id));
        }
        else {
            setValue('vendor_name', '');
            setValue('vendor', '');
            showToast(`Invalid vendor`)
        }
    }
    
    const salesmanLeave = (value) => {
        if (!value) {
            setValue('salesman', '');
            return;
        }
        const result = salesmen.filter((salesman) => {
            if (value === salesman.employee_code || value === salesman.employee_name || value === (salesman.employee_code + ' - ' + salesman.employee_name)) {
                return salesman;
            }
        })
        if (result.length > 0) {
            setValue('salesman_name', result[0].employee_name);
            setValue('salesman', (result[0].id));
        }
        else {
            setValue('salesman_name', '');
            setValue('salesman', '');
            showToast(`Invalid salesman`)
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
        setMessageBoxMessage(`Are you sure you want to delete?`)
    }
    
    const onYes = async() => {
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}${module}/${currentID}`)
        setMessageBoxVisible(false)
        if (!idExists.next_id && !idExists.prev_id) {
            setCurrentState('add')
            setData({
                invoice_no: (module === 'purchase')?1:null,
                return_no: (module === 'purchase_return')?1:null,
                order_no: 1,
                rfq_no: 1,
                invoice_date: new Date().toISOString().split('T')[0],
                order_date: new Date().toISOString().split('T')[0],
                rfq_date: new Date().toISOString().split('T')[0],
            })
            setTableData([
                (module === 'rfq')? { product_code: '', product_name: '', product: '', unit: '', qty: '', units: [] }:{ product_code: '', product_name: '', product: '', unit: '', qty: '', price: '', item_discount: '', vat_perc: '', item_vat: '', item_total: '', units: []}
            ])
        } else {
            setCurrentID(idExists.next_id? idExists.next_id : idExists.prev_id)
        }
    }

    const addClick = useCallback((event) => {
        event.preventDefault();
        setData({
            invoice_no: (module === 'purchase')?idExists.next_no:null,
            return_no: (module === 'purchase_return')?idExists.next_no:null,
            order_no: idExists.next_no,
            rfq_no: idExists.next_no,
            invoice_date: new Date().toISOString().split('T')[0],
            order_date: new Date().toISOString().split('T')[0],
            rfq_date: new Date().toISOString().split('T')[0],
        })
        setTableData(module === 'rfq'? [{ product_code: '', product_name: '', product: '', unit: '', qty: '', units: [] }]:[{ product_code: '', product_name: '', product: '', unit: '', qty: '', price: '', item_discount: '', vat_perc: '', item_vat: '', item_total: '', units: []}])
        setCurrentState('add')
    }, [idExists, module, setData])

    const editClick = (event) => {
        event.preventDefault();
        setCurrentState('edit')
    }

    const printClick = useCallback((event) => {
        event.preventDefault();
        window.open(`${process.env.NEXT_PUBLIC_API_URL}pdf/${module}/${currentID}`, '_blank');
    }, [currentID, module])

    const findClick = useCallback(async() => {
        let response;
        let items
        try {
            if (module === 'purchase') {
                response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}invoice_search/purchase/purchase`)
                items = response.data.map((item, index) => (
                    <tr key={index} className={`${index % 2 === 0? `bg-white`:`bg-gray-100`} cursor-pointer`}>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem]'>{item.invoice_no}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.invoice_date}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.purchase_no}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[20rem] border-l-[1px] border-black'>{item.vendor_name}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.net_amount}</td>
                    </tr>
                ))
            } else if (module === 'purchase_return') {
                response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}invoice_search/purchase/return`)
                items = response.data.map((item, index) => (
                    <tr key={index} className={`${index % 2 === 0? `bg-white`:`bg-gray-100`} cursor-pointer`}>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem]'>{item.return_no}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.invoice_date}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.invoice_no}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.purchase_no}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[20rem] border-l-[1px] border-black'>{item.vendor_name}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.net_amount}</td>
                    </tr>
                ))
            } else if (module === 'purchase_order') {
                response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}form_search/tblPurchaseOrder_Master`)
                items = response.data.map((item, index) => (
                    <tr key={index} className={`${index % 2 === 0? `bg-white`:`bg-gray-100`} cursor-pointer`}>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem]'>{item.order_no}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.order_date}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[20rem] border-l-[1px] border-black'>{item.vendor_name}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.net_amount}</td>
                    </tr>
                ))
            } else if (module === 'rfq') {
                response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}form_search/tblRFQ_Master`)
                items = response.data.map((item, index) => (
                    <tr key={index} className={`${index % 2 === 0? `bg-white`:`bg-gray-100`} cursor-pointer`}>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem]'>{item.rfq_no}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.rfq_date}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[20rem] border-l-[1px] border-black'>{item.vendor_name}</td>
                    </tr>
                ))
            }
            setListBoxItems(items);
            setIsListBoxVisible(true);
        } catch (error) {
            console.error('Error fetching data:', error);
            // Handle error as needed
        }
    }, [module])

    const formSearch = useCallback(async() => {
        let searchURI = ''
        let items
        let response
        if (searchVal.length > 0) {
            switch (searchIn) {
                case 'invoice_no':
                    searchURI = `/invoice_no/${searchVal}`
                    break;
                case 'invoice_date':
                    searchURI = `/invoice_date/${searchVal}`
                    break;
                case 'return_no':
                    searchURI = `/return_no/${searchVal}`
                    break;
                case 'return_date':
                    searchURI = `/invoice_date/${searchVal}`
                    break;
                case 'order_no':
                    searchURI = `/order_no/${searchVal}`
                    break;
                case 'order_date':
                    searchURI = `/order_date/${searchVal}`
                    break;
                case 'purchase_no':
                    searchURI = `/purchase_no/${searchVal}`
                    break;
                case 'vendor':
                    searchURI = `/vendor__vendor_name/${searchVal}`
                    break;
                default:
                    searchURI = `/${searchVal}`
                    break;
            }
        }
        try {
            if (module === 'purchase') {
                response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}invoice_search/purchase/purchase${searchURI}`)
                items = response.data.map((item, index) => (
                    <tr key={index} className={`${index % 2 === 0? `bg-white`:`bg-gray-100`} cursor-pointer`}>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem]'>{item.invoice_no}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.invoice_date}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.purchase_no}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[20rem] border-l-[1px] border-black'>{item.vendor_name}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.net_amount}</td>
                    </tr>
                ))
            } else if (module === 'purchase_return') {
                response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}invoice_search/purchase/return${searchURI}`)
                items = response.data.map((item, index) => (
                    <tr key={index} className={`${index % 2 === 0? `bg-white`:`bg-gray-100`} cursor-pointer`}>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem]'>{item.return_no}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.invoice_date}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.invoice_no}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.purchase_no}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[20rem] border-l-[1px] border-black'>{item.vendor_name}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.net_amount}</td>
                    </tr>
                ))
            } else if (module === 'purchase_order') {
                response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}form_search/tblPurchaseOrder_Master${searchURI}`)
                items = response.data.map((item, index) => (
                    <tr key={index} className={`${index % 2 === 0? `bg-white`:`bg-gray-100`} cursor-pointer`}>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem]'>{item.order_no}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.order_date}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[20rem] border-l-[1px] border-black'>{item.vendor_name}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.net_amount}</td>
                    </tr>
                ))
            } else if (module === 'rfq') {
                response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}form_search/tblRFQ_Master${searchURI}`)
                items = response.data.map((item, index) => (
                    <tr key={index} className={`${index % 2 === 0? `bg-white`:`bg-gray-100`} cursor-pointer`}>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem]'>{item.rfq_no}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.rfq_date}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[20rem] border-l-[1px] border-black'>{item.vendor_name}</td>
                    </tr>
                ))
            }
            setListBoxItems(items);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }, [searchIn, searchVal, module])

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
        const data={ master_data: formData, details_data: tableData }
        try {
            // Make a POST request to your Django URL with the form data
            let response;
            if (currentState === 'add') {
                response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}${module}`, data);
            }
            else {
                response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}${module}/${currentID}`, data);
            }
        
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
            showToast(`${module === 'purchase'? `Purchase`
            :module === 'purchase_return'? `Purchase Return`
            :module === 'rfq'? `RFQ`
            :`Purchase Order`} saving failed`)
            // console.error('An error occurred while submitting the form:', error);
            // Handle network errors or other exceptions here
        }
    }, [currentID, currentState, module, tableData]);

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
            } else if (currentState === 'view' && (e.key === 'p' || e.key === 'P') && e.ctrlKey) {
                e.preventDefault()
                printClick(e)
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
    }, [currentID, idExists, currentState, setData, handleSubmit, saveForm, findClick, isListBoxVisible, addClick, newData, printClick]);        


    return (
    <>
    <form method="POST" className='mt-4 ml-3' onSubmit={handleSubmit(saveForm)}>
        <h1 className='font-black text-xl'>
            {module === 'purchase'? `Purchase`
            :module === 'purchase_return'? `Purchase Return`
            :module === 'rfq'? `RFQ`
            :`Purchase Order`}
        </h1>

        {currentState === 'view' &&
        <div className="flex justify-start items-center gap-4 mt-5 w-[500px]">
            <Button type="button" value='Add' variant='secondary' onClick={addClick} />
            <Button type="button" value='Edit' variant='secondary' onClick={editClick} />
            <Button type="button" value='Print' variant='secondary' onClick={printClick} />
            <Button type="button" value='Delete' variant='secondaryDanger' onClick={deleteClick} />
        </div>
        }

        <div className={`flex justify-start ${currentState === 'view'? 'mt-10':'mt-5'}`}>
            {module === 'purchase'? 
            <>
                <TextField label='Invoice no' className='w-[240px] rounded-[5px] pointer-events-none bg-[#f5f5f5]' tabIndex='-1' errors={errors.invoice_no} {...register('invoice_no')} />
                <TextField id='purchase_no' label='Purchase no' className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})} tabIndex={currentState === 'view' ? '-1' : undefined} errors={errors.purchase_no} {...register('purchase_no')} />
                <DateField label='Invoice date' className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})} tabIndex={currentState === 'view' ? '-1' : undefined} errors={errors.invoice_date} defaultValue={new Date().toISOString().split('T')[0]} {...register('invoice_date')} />
            </>
            :module === 'purchase_return'?
            <>
                <TextField label='Return no' className='w-[240px] rounded-[5px] pointer-events-none bg-[#f5f5f5]' tabIndex='-1' errors={errors.return_no} {...register('return_no')} />
                <DateField id='return_date' label='Return date' className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})} tabIndex={currentState === 'view' ? '-1' : undefined} errors={errors.invoice_date} defaultValue={new Date().toISOString().split('T')[0]} {...register('invoice_date')} />
            </>
            :module === 'rfq'?
            <>
                <TextField label='RFQ no' className='w-[240px] rounded-[5px] pointer-events-none bg-[#f5f5f5]' tabIndex='-1' errors={errors.rfq_no} {...register('rfq_no')} />
                <DateField id='rfq_date' label='RFQ date' className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})} tabIndex={currentState === 'view' ? '-1' : undefined} errors={errors.rfq_date} defaultValue={new Date().toISOString().split('T')[0]} {...register('rfq_date')} />
            </> 
            :<>
                <TextField label='Order no' className='w-[240px] rounded-[5px] pointer-events-none bg-[#f5f5f5]' tabIndex='-1' errors={errors.order_no} {...register('order_no')} />
                <DateField id='purchase_order_date' label='Order date' className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})} tabIndex={currentState === 'view' ? '-1' : undefined} errors={errors.order_date} defaultValue={new Date().toISOString().split('T')[0]} {...register('order_date')} />
            </>}
            
        </div>
        {module === 'purchase_return' &&
        <div className='flex justify-start mt-5'>
            <TextField label='Purchase no' className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})} tabIndex={currentState === 'view' ? '-1' : undefined} errors={errors.purchase_no} {...register('purchase_no')} />
            <TextField label='Invoice no' className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})} tabIndex={currentState === 'view' ? '-1' : undefined} errors={errors.invoice_no} {...register('invoice_no')} />
        </div>
        }
        <div className="flex justify-start mt-5">
            <TextComboField label='Vendor' className={clsx('w-[500px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})} tabIndex={currentState==='view'? '-1':undefined} onChange={(e) => {}} errors={errors.vendor} {...register('vendor_name')} onBlur={(e) => vendorLeave(e.target.value)} values={vendors.map((vendor) => vendor.vendor_code + ' - ' + vendor.vendor_name)} listName='vendors' />
            <HiddenField {...register('vendor')} />
            <TextComboField label='Salesman' className={clsx('w-[500px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})} tabIndex={currentState==='view'? '-1':undefined} onChange={(e) => {}} errors={errors.salesman} {...register('salesman_name')} onBlur={(e) => salesmanLeave(e.target.value)} values={salesmen.map((salesman) => salesman.employee_code + ' - ' + salesman.employee_name)} listName='salesmen' />
            <HiddenField {...register('salesman')} />
        </div>
        <div className='mt-5'>
        {module === 'rfq'? 
            <RFQTable
            tableData={tableData}
            inputChange={inputChange}
            lastCellLeave={lastCellLeave}
            firstCellLeave={firstCellLeave}
            moveRow={moveRow}
            products={products.map(product => product.product_code + ' - ' + product.product_name)}
            control={control}
            isView={currentState === 'view' && true}
        />:
        <SalesBasedTable
            tableData={tableData}
            inputChange={inputChange}
            lastCellLeave={lastCellLeave}
            firstCellLeave={firstCellLeave}
            moveRow={moveRow}
            products={products.map(product => product.product_code + ' - ' + product.product_name)}
            control={control}
            isView={currentState === 'view' && true}
        />}
        </div>
        {(module !== 'rfq') &&
            <div className="flex justify-start mt-5">
                <NumberField label='Total' className='w-[240px] rounded-[5px] bg-[#f5f5f5] pointer-events-none' tabIndex='-1' errors={errors.total} {...register('total')} />
                <NumberField label='VAT' className='w-[240px] rounded-[5px] bg-[#f5f5f5] pointer-events-none' tabIndex='-1' errors={errors.vat} {...register('vat')} />
                <NumberField label='Discount' className='w-[240px] rounded-[5px] bg-[#f5f5f5] pointer-events-none' tabIndex='-1' errors={errors.discount} {...register('discount')} />
                <NumberField label='RoundOff' className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})} tabIndex={currentState === 'view' ? '-1' : undefined} errors={errors.roundoff} {...register('roundoff')} onChange={(e) => totalChange(e.target.value, 0, 'roundoff')} />
                {(module !== 'purchase' && module !== 'purchase_return') && <NumberField label='Net Amount' className='w-[240px] rounded-[5px] bg-[#f5f5f5] pointer-events-none' tabIndex='-1' errors={errors.net_amount} {...register('net_amount')} />}
            </div>
        }
        {module === 'purchase' && 
        <div className='flex justify-start mt-5'>
        <NumberField label='Net Amount' className='w-[240px] rounded-[5px] bg-[#f5f5f5] pointer-events-none' tabIndex='-1' errors={errors.net_amount} {...register('net_amount')} />
        <NumberField 
            label='Amount Payed' 
            className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})} 
            tabIndex={currentState === 'view' ? '-1' : undefined} 
            errors={errors.amount_payed} 
            onInput={(e) => balanceChange((e.target.value === '')? true: e.target.value)}
            {...register('amount_payed')} />
        <NumberField label='Balance' className='w-[240px] rounded-[5px] bg-[#f5f5f5] pointer-events-none' tabIndex='-1' errors={errors.balance} {...register('balance')} />
        <ComboField
                label="Payment Method"
                errors={errors.payment_method}
                control={control}
                className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})} 
                tabIndex={currentState==='view'? '-1':undefined}
                onChange={(e) => {
                    setPayment(e.target.value);
                }}
                values={payment_method}
                name={register('payment_method')}
                value={payment}
            />
        </div>}
        {module === 'purchase_return' && 
        <div className='flex justify-start mt-5'>
        <NumberField label='Net Amount' className='w-[240px] rounded-[5px] bg-[#f5f5f5] pointer-events-none' tabIndex='-1' errors={errors.net_amount} {...register('net_amount')} />
        <NumberField 
            label='Amount Received' 
            className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})} 
            tabIndex={currentState === 'view' ? '-1' : undefined} 
            errors={errors.amount_payed}
            onInput={(e) => balanceChange((e.target.value === '')? true: e.target.value)} 
            {...register('amount_payed')} />
        <NumberField label='Balance' className='w-[240px] rounded-[5px] bg-[#f5f5f5] pointer-events-none' tabIndex='-1' errors={errors.balance} {...register('balance')} />
        <ComboField
                label="Payment Method"
                errors={errors.payment_method}
                control={control}
                className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})} 
                tabIndex={currentState==='view'? '-1':undefined}
                onChange={(e) => {
                    setPayment(e.target.value);
                }}
                values={payment_method}
                name={register('payment_method')}
                value={payment}
            />
        </div>}
        {((module === 'purchase' || module === 'purchase_return') && payment === 'Cheque') && 
        <div className='flex mt-5'>
            <TextField label='Cheque no' className={clsx('w-[240px] lg:w-[500px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})} tabIndex={currentState==='view'? '-1':undefined} errors={errors.cheque_no} {...register('cheque_no')} />
            <DateField label='Cheque Date' className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})} tabIndex={currentState==='view'? '-1':undefined} defaultValue={new Date().toISOString().split('T')[0]} errors={errors.cheque_date} {...register('cheque_date')} />
        </div>}
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
        <ListBox ref={listBoxRef} items={listBoxItems} values={
            (module === 'purchase')?['invoice_no', 'purchase_no', 'invoice_date', 'vendor']:
            (module === 'purchase_return')?['return_no', 'invoice_no', 'purchase_no', 'return_date', 'vendor']:
            (module === 'purchase_order')?['order_no', 'order_date', 'vendor']:
            ['rfq_no', 'rfq_date', 'vendor']
        } setSearchVal={setSearchVal} setSearchIn={setSearchIn} />
    }
    {isMessageBoxVisible &&
        <MessageBox ref={listBoxRef} message={messageBoxMessage} onYes={onYes} isOpen={isMessageBoxVisible} setIsOpen={setMessageBoxVisible} />
    }
    </>
)}








export const PaymentReceiptForm = ({module, schema}) => {
    
    const { register, handleSubmit, control, formState, setValue, getValues, clearErrors } = useForm({ defaultValues: {}, resolver: zodResolver(schema) })

    const { errors } = formState

    const [currentState, setCurrentState] = useState('view')
    const [currentID, setCurrentID] = useState(0)
    
    const [vendors, setVendors] = useState([])
    // const [isVendor, setIsVendor] = useState(true)
    const [accountsPayables, setAccountsPayables] = useState([])
    
    const [customers, setCustomers] = useState([])
    // const [isCustomer, setIsCustomer] = useState(true)
    const [accountsReceivables, setAccountsReceivables] = useState([])
    
    const [creditBalance, setCreditBalance] = useState(0)
    const [ payment, setPayment ] = useState('Cash')

    const [editingCustomer, setEditingCustomer] = useState('')
    const [editingVendor, setEditingVendor] = useState('')
    const [editingBalance, setEditingBalance] = useState(0)
    
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
    
    const payment_method = ['Cash', 'Card', 'Cheque', 'Bank Transfer']
    
    const setData = useCallback((data) => {
        if (module === 'receipt') {
            setValue('receipt_no', data.receipt_no)
            setValue('receipt_date', data.receipt_date)
            if (data.customer) {
                setValue('is_customer', true)
            } else {
                setValue('is_customer', false)
            }
            if (data.is_customer)
                setValue('is_customer', true)
            setValue('customer', data.customer)
            setValue('customer_name', data.customer_name)
            setValue('receipt_from', data.receipt_from)
        } else {
            setValue('payment_no', data.payment_no)
            setValue('payment_date', data.payment_date)
            if (data.vendor) {
                setValue('is_vendor', true)
            } else {
                setValue('is_vendor', false)
            }
            if (data.is_vendor)
                setValue('is_vendor', true)
            setValue('vendor', data.vendor)
            setValue('vendor_name', data.vendor_name)
            setValue('payment_to', data.payment_to)
        }
        setValue('payment_method', data.payment_method)
        setValue('amount', data.amount)
        setValue('discount', data.discount)
        setValue('credit_balance', data.credit_balance)
        setValue('cheque_no', data.cheque_no)
        setValue('cheque_date', data.cheque_date)
    }, [setValue, module])

    useEffect(() => {
        async function fetchVendors() {
            if (module === 'payment')
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}form_search/tblVendor`);
                setVendors(response.data);
            } catch (error) {
                console.error('Error fetching vendors:', error);
            }
        }

        async function fetchAccountsPayables() {
            if (module === 'payment')
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}accounts_payables`);
                setAccountsPayables(response.data);
            } catch (error) {
                console.error('Error fetching customers:', error);
            }
        }

        async function fetchCustomers() {
            if (module === 'receipt')
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}form_search/tblCustomer`);
                setCustomers(response.data);
            } catch (error) {
                console.error('Error fetching customers:', error);
            }
        }

        async function fetchAccountsReceivables() {
            if (module === 'receipt')
            try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}accounts_receivables`);
                setAccountsReceivables(response.data);
            } catch (error) {
                console.error('Error fetching customers:', error);
            }
        }

        async function fetchData() {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}${module}`)
                const data = response.data.data;
                setData(data);
                setPayment(data.payment_method)
                // setIsCustomer(data.customer);
                // setIsVendor(data.vendor);
                setCurrentState('view')
                setCurrentID(data.id)
                setIdExists(response.data.id_exists)
            } catch (e) {
                setCurrentState('add')
                setData({
                    payment_no: 1,
                    payment_date: new Date().toISOString().split('T')[0],
                    is_vendor: true,
                    receipt_no: 1,
                    receipt_date: new Date().toISOString().split('T')[0],
                    is_customer: true,
                    payment_method: 'Cash'
                })
                setPayment('Cash')
                // setIsCustomer(true);
                // setIsVendor(true);
            }
        }

        fetchData()
        fetchVendors();
        fetchCustomers();
        fetchAccountsPayables()
        fetchAccountsReceivables()
    }, [setData, module]);

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
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}${module}/${currentID}`)
                const data = response.data.data
                setData(data)
                setIdExists(response.data.id_exists)
                setCurrentState('view')
                // setIsCustomer(data.customer);
                // setIsVendor(data.vendor);
            }
        } catch (error) {
            console.error(error)
        }
    }, [module, currentID, setData])
    
    useEffect(() => {
        newData()
    }, [currentID, module, newData])

    useEffect(() => {
        if (currentState === 'view' && document.activeElement) {
            document.activeElement.blur();
            clearErrors()
        } else if (currentState === 'add' || currentState === 'edit') {
            switch (module) {
                case 'payment':
                    document.getElementById('payment_date').focus();
                    break;
                case 'receipt':
                    document.getElementById('receipt_date').focus();
                    break;
            }
        }
    }, [currentState, module, clearErrors])

    useEffect(() => {
        if (isListBoxVisible) {
            document.addEventListener('click', handleClickOutside);
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [isListBoxVisible]);

    useEffect(() => {
        let discount = parseFloat(getValues('discount')) ||  0;
        let amount = parseFloat(getValues('amount')) || 0
        setValue('credit_balance', creditBalance - discount - amount)
    }, [creditBalance, setValue, getValues])

    const amountChange = (value) => {
        let discount = parseFloat(getValues('discount')) || 0;
        value = parseFloat(value) || 0
        setValue('credit_balance', creditBalance - discount - value)
    }
    
    const discountChange = (value) => {
        let amount = parseFloat(getValues('amount')) || 0;
        value = parseFloat(value) || 0
        setValue('credit_balance', creditBalance - amount - value)
        setValue('discount', value)
    }
    
    const vendorLeave = useCallback((value) => {
        if (!value)
        {
            setValue('vendor', '');
            setCreditBalance(0)
            return;
        }
        const result = vendors.filter((vendor) => {
            if (value === vendor.vendor_code || value === vendor.vendor_name || value === (vendor.vendor_code + ' - ' + vendor.vendor_name)) {
                return vendor;
            }
        })
        if (result.length > 0) {
            setValue('vendor_name', result[0].vendor_name);
            setValue('vendor', (result[0].id));
            if (currentState === 'edit' && result[0].id === editingVendor) {
                setCreditBalance(parseFloat(result[0].credit_balance) + editingBalance);
            } else {
                setCreditBalance(parseFloat(result[0].credit_balance))
            }
        } else {
            setValue('vendor_name', '');
            setValue('vendor', '');
            setCreditBalance(0)
            showToast(`Invalid vendor`)
        }
    }, [currentState, editingBalance, editingVendor, setValue, vendors])
    
    const customerLeave = useCallback((value) => {
        if (!value)
        {
            setValue('customer', '');
            setCreditBalance(0)
            return;
        }
        const result = customers.filter((customer) => {
            if (value === customer.customer_code || value === customer.customer_name || value === (customer.customer_code + ' - ' + customer.customer_name)) {
                return customer;
            }
        })
        if (result.length > 0) {
            setValue('customer_name', result[0].customer_name);
            setValue('customer', (result[0].id));
            if (currentState === 'edit' && result[0].id === editingCustomer) {
                setCreditBalance(parseFloat(result[0].credit_balance) + editingBalance);
            } else {
                setCreditBalance(parseFloat(result[0].credit_balance))
            }
        }
        else {
            setValue('customer_name', '');
            setValue('customer', '');
            setCreditBalance(0)
            showToast(`Invalid customer`)
        }
    }, [currentState, editingBalance, editingCustomer, setValue, customers])

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
        setMessageBoxMessage(`Are you sure you want to delete this ${module}?`)
    }, [module])
    
    const onYes = async() => {
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}${module}/${currentID}`)
        setMessageBoxVisible(false)
        if (!idExists.next_id && !idExists.prev_id) {
            setCurrentState('add')
            setData({
                payment_no: 1,
                payment_date: new Date().toISOString().split('T')[0],
                is_vendor: true,
                receipt_no: 1,
                receipt_date: new Date().toISOString().split('T')[0],
                is_customer: true,
                payment_method: 'Cash'
            })
            setPayment('Cash')
            // setIsCustomer(true)
            // setIsVendor(true)
        } else {
            setCurrentID(idExists.next_id? idExists.next_id : idExists.prev_id)
        }
    }

    const addClick = useCallback((event) => {
        event.preventDefault();
        setData({
            payment_no: idExists.next_no,
            payment_date: new Date().toISOString().split('T')[0],
            is_vendor: true,
            receipt_no: idExists.next_no,
            receipt_date: new Date().toISOString().split('T')[0],
            is_customer: true,
            payment_method: 'Cash'
        })
        setPayment('Cash')
        setCreditBalance(0)
        // setIsCustomer(true)
        // setIsVendor(true)
        setCurrentState('add')
    }, [idExists, setData])

    const editClick = useCallback((event) => {
        event.preventDefault();
        setCurrentState('edit')
        const amount = parseFloat(getValues('amount')) || 0
        const discount = parseFloat(getValues('discount')) || 0
        setEditingCustomer(getValues('customer'))
        setEditingVendor(getValues('vendor'))
        setEditingBalance(amount + discount)
    }, [getValues])

    useEffect(() => {
        if (currentState === 'edit')
            if (module === 'receipt')
                customerLeave(getValues('customer_name'))
            else
                vendorLeave(getValues('vendor_name'))
    }, [currentState, customerLeave, vendorLeave, getValues, module])

    // const printClick = useCallback((event) => {
    //     event.preventDefault();
    //     window.open(`${process.env.NEXT_PUBLIC_API_URL}pdf/${module}/${currentID}`, '_blank');
    // }, [currentID, module])

    const findClick = useCallback(async() => {
        let response;
        let items
        try {
            if (module === 'payment') {
                response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}form_search/tblPayment`)
                items = response.data.map((item, index) => (
                    <tr key={index} className={`${index % 2 === 0? `bg-white`:`bg-gray-100`} cursor-pointer`}>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem]'>{item.payment_no}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[14rem] border-l-[1px] border-black'>{item.vendor_id? item.vendor_name:item.payment_to}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[14rem] border-l-[1px] border-black'>{item.payment_date}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.amount}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.cheque_no}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.cheque_no&& item.cheque_date}</td>
                    </tr>
                ))
            } else if (module === 'receipt') {
                response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}form_search/tblReceipt`)
                items = response.data.map((item, index) => (
                    <tr key={index} className={`${index % 2 === 0? `bg-white`:`bg-gray-100`} cursor-pointer`}>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem]'>{item.receipt_no}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[14rem] border-l-[1px] border-black'>{item.customer_id? item.customer_name:item.receipt_from}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[14rem] border-l-[1px] border-black'>{item.receipt_date}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.amount}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.cheque_no}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.cheque_no&& item.cheque_date}</td>
                    </tr>
                ))
            }
            setListBoxItems(items);
            setIsListBoxVisible(true);
        } catch (error) {
            console.error('Error fetching data:', error);
            // Handle error as needed
        }
    }, [module])

    const formSearch = useCallback(async() => {
        let searchURI = ''
        if (searchVal.length > 0) {
            switch (searchIn) {
                case 'payment_no':
                    searchURI = `/payment_no/${searchVal}`
                    break;
                case 'payment_date':
                    searchURI = `/payment_date/${searchVal}`
                    break;
                case 'payment_to':
                    searchURI = `/payment_to/vendor__vendor_name/${searchVal}`
                    break;
                case 'receipt_no':
                    searchURI = `/receipt_no/${searchVal}`
                    break;
                case 'receipt_date':
                    searchURI = `/receipt_date/${searchVal}`
                    break;
                case 'receipt_from':
                    searchURI = `/receipt_from/customer__customer_name/${searchVal}`
                    break;
                case 'cheque_no':
                    searchURI = `/cheque_no/${searchVal}`
                    break;
                case 'cheque_date':
                    searchURI = `/cheque_date/${searchVal}`
                    break;
                case '':
                    searchURI = `/${searchVal}`
                    break;
            }
        }
        try {
            let response;
            let items
            if (module === 'payment') {
                response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}form_search/tblPayment${searchURI}`)
                items = response.data.map((item, index) => (
                    <tr key={index} className={`${index % 2 === 0? `bg-white`:`bg-gray-100`} cursor-pointer`}>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem]'>{item.payment_no}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[14rem] border-l-[1px] border-black'>{item.vendor? item.vendor_name:item.payment_to}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[14rem] border-l-[1px] border-black'>{item.payment_date}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.amount}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.cheque_no}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.cheque_date}</td>
                    </tr>
                ))
            } else if (module === 'receipt') {
                response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}form_search/tblReceipt${searchURI}`)
                items = response.data.map((item, index) => (
                    <tr key={index} className={`${index % 2 === 0? `bg-white`:`bg-gray-100`} cursor-pointer`}>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem]'>{item.receipt_no}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[14rem] border-l-[1px] border-black'>{item.customer? item.customer_name:item.receipt_from}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[14rem] border-l-[1px] border-black'>{item.receipt_date}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.amount}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.cheque_no}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.cheque_date}</td>
                    </tr>
                ))
            }
            setListBoxItems(items);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }, [searchIn, searchVal, module])

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
        if (!(formData.vendor > 0) && module === 'payment') {
            showToast('Vendor is required')
            return
        } else if (!(formData.customer > 0) && module === 'receipt') {
            showToast('Customer is required')
            return
        }
        try {
            // Make a POST request to your Django URL with the form data
            let response;
            if (currentState === 'add') {
                response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}${module}`, formData);
            }
            else {
                response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}${module}/${currentID}`, formData);
            }
        
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
            showToast(`${module} saving failed`)
            // console.error('An error occurred while submitting the form:', error);
            // Handle network errors or other exceptions here
        }
    }, [currentID, currentState, module]);

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
            // } else if (currentState === 'view' && (e.key === 'p' || e.key === 'P') && e.ctrlKey) {
            //     e.preventDefault()
            //     printClick(e)
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
    }, [currentID, idExists, currentState, setData, handleSubmit, saveForm, findClick, isListBoxVisible, addClick, newData, deleteClick, editClick]);        


    return (
    <>
    <form method="POST" className='mt-4 ml-3' onSubmit={handleSubmit(saveForm)}>
        <div className='flex flex-col xl:flex-row'>
            <div className='w-[550px]'>
                <h1 className='font-black text-xl'>
                    {module === 'receipt'? `Receipt`:`Payment`}
                </h1>

                {currentState === 'view' &&
                <div className="flex justify-start items-center gap-4 mt-5 w-[240px] md:w-[500px]">
                    <Button type="button" value='Add' variant='secondary' onClick={addClick} />
                    <Button type="button" value='Edit' variant='secondary' onClick={editClick} />
                    <Button type="button" value='Delete' variant='secondaryDanger' onClick={deleteClick} />
                </div>
                }

                <div className={`flex flex-col md:flex-row justify-start ${currentState === 'view'? 'mt-10':'mt-5'}`}>
                    {module === "payment"?
                    <>
                    <TextField label='Payment no' className='w-[240px] rounded-[5px] pointer-events-none bg-[#f5f5f5]' tabIndex='-1' errors={errors.payment_no} {...register('payment_no')} />
                    <span className='mt-5 md:mt-0'>
                    <DateField id='payment_date' label='Payment Date' className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})} tabIndex={currentState === 'view'? '-1':undefined} defaultValue={new Date().toISOString().split('T')[0]} errors={errors.payment_date} {...register('payment_date')} />
                    </span>
                    </>
                    :
                    <>
                    <TextField label='Receipt no' className='w-[240px] rounded-[5px] pointer-events-none bg-[#f5f5f5]' tabIndex='-1' errors={errors.receipt_no} {...register('receipt_no')} />
                    <span className='mt-5 md:mt-0'>
                    <DateField id='receipt_date' label='Receipt Date' className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})} tabIndex={currentState === 'view'? '-1':undefined} defaultValue={new Date().toISOString().split('T')[0]} errors={errors.receipt_date} {...register('receipt_date')} />
                    </span>
                    </>}
                </div>
                <div className="flex flex-col md:flex-row mt-5 justify-between w-[240px] md:w-[780px]">
                {module === 'payment' ?
                <>
                {/* <CheckBoxField checked={isVendor? true:false} 
                    label="Vendor" 
                    control={control}
                    className={clsx({'pointer-events-none': currentState === 'view'})}
                    tabIndex={currentState === 'view' ? '-1' : undefined}
                    onChange={() => setIsVendor(!isVendor)} 
                    name={register('is_vendor')} 
                    />
                {isVendor ? 
                    <span className='mt-5 md:mt-0'> */}
                    <TextComboField label='Vendor' className={clsx('w-[240px] md:w-[500px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})} tabIndex={currentState==='view'? '-1':undefined} onChange={(e) => {}} errors={errors.vendor} {...register('vendor_name')} onBlur={(e) => vendorLeave(e.target.value)} values={vendors.map((vendor) => vendor.vendor_code + ' - ' + vendor.vendor_name)} listName='vendors' />
                    <HiddenField {...register('vendor')} />
                    {/* </span>
                    :
                    <span className='mt-5 md:mt-0'>
                        <TextField label="Payment To" className={clsx('w-[240px] md:w-[500px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})} tabIndex={currentState === 'view'? '-1':undefined} defaultValue="" errors={errors.payment_to} {...register('payment_to')} />
                    </span>
                } */}
                </>
                :
                <>
                {/* <CheckBoxField checked={isCustomer? true:false} 
                    label="Customer" 
                    control={control}
                    className={clsx({'pointer-events-none': currentState === 'view'})}
                    tabIndex={currentState === 'view' ? '-1' : undefined}
                    onChange={() => setIsCustomer(!isCustomer)} 
                    name={register('is_customer')} 
                    />
                {isCustomer ? 
                    <span className='mt-5 md:mt-0'> */}
                    <TextComboField label='Customer' className={clsx('w-[240px] md:w-[500px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})} tabIndex={currentState==='view'? '-1':undefined} onChange={(e) => {}} errors={errors.customer} {...register('customer_name')} onBlur={(e) => customerLeave(e.target.value)} values={customers.map((customer) => customer.customer_code + ' - ' + customer.customer_name)} listName='customers' />
                    <HiddenField {...register('customer')} />
                    {/* </span>
                    :
                    <span className='mt-5 md:mt-0'>
                        <TextField label="Receipt From" className={clsx('w-[240px] md:w-[500px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})} tabIndex={currentState === 'view'? '-1':undefined} defaultValue="" errors={errors.receipt_from} {...register('receipt_from')} />
                    </span>
                } */}
                
                </>    
                } 
                </div>
                <div className="flex flex-col md:flex-row mt-5">
                <ComboField
                        label="Payment Method"
                        errors={errors.payment_method}
                        control={control}
                        className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})}  
                        tabIndex={currentState === 'view'? '-1':undefined}
                        onChange={(e) => {
                            setPayment(e.target.value);
                        }}
                        values={payment_method}
                        name={register('payment_method')}
                        value={payment}
                        />
                    <span className='mt-5 md:mt-0'>
                        <NumberField label='Amount' className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})}  tabIndex={currentState === 'view'? '-1':undefined} errors={errors.amount} {...register('amount')} onChange={(e) => amountChange(e.target.value)} />
                    </span>
                </div>
                <div className="flex flex-col md:flex-row mt-5">
                {/* {(module === 'receipt' || module === 'payment') &&  */}
                {/* <span className='mt-5 md:mt-0'> */}
                    <NumberField label='Discount' className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})}  tabIndex={currentState === 'view'? '-1':undefined} errors={errors.discount} {...register('discount')} onChange={(e) => discountChange(e.target.value)} />
                {/* </span> */}
                {/* } */}
                {currentState !== 'view' &&
                    <span className='mt-5 md:mt-0'>
                        <NumberField label='Credit Balance' className='w-[240px] rounded-[5px] pointer-events-none bg-[#f5f5f5]' tabIndex='-1' {...register('credit_balance')} />
                    </span>
                }
                </div>
                {payment === 'Cheque' && 
                <div className='flex flex-col md:flex-row mt-5'>
                    <TextField label='Cheque no' className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})} tabIndex={currentState === 'view'? '-1':undefined} errors={errors.cheque_no} {...register('cheque_no')} />
                    <span className='mt-5 md:mt-0'>
                        <DateField label='Cheque Date' className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})} tabIndex={currentState === 'view'? '-1':undefined} defaultValue={new Date().toISOString().split('T')[0]} errors={errors.cheque_date} {...register('cheque_date')} />
                    </span>
                </div>
                }
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
            <div className='w-[45rem] h-[90vh] rounded-md border-black border-[1px] overflow-auto list-scrollbar shadow-[#6365f17e] shadow-lg'>
                {currentState !== 'view'&& <table className='w-full text-sm font-sans border-collapse'>
                    <thead className='border-b-[1px] border-t-[1px] border-slate-400'>
                        <tr>
                            <th className='w-[5%]'>#</th>
                            <th className='border-l-[1px] border-slate-400 w-[15%]'>Invoice No</th>
                            <th className='border-l-[1px] border-slate-400 w-[20%]'>Due Date</th>
                            <th className='border-l-[1px] border-slate-400 w-[40%]'>{module === 'payment'? 'Vendor':'Customer'} Name</th>
                            <th className='border-l-[1px] border-slate-400 w-[20%]'>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                    {module === 'payment'&& accountsPayables.map((payable, index) => (
                    <tr key={index}>
                        <td>{index + 1}</td>
                        <td className='border-l-[1px] border-slate-400 p-1'>{payable.invoice.invoice_no}</td>
                        <td className='border-l-[1px] border-slate-400 p-1'>{payable.due_date}</td>
                        <td className='border-l-[1px] border-slate-400 p-1'>{payable.vendor.vendor_name}</td>
                        <td className='border-l-[1px] border-slate-400 p-1'>{payable.invoice.balance}</td>
                    </tr>
                    ))} 

                    {module === 'receipt'&& accountsReceivables.map((receivables, index) => (
                    <tr key={index}>
                        <td>{index + 1}</td>
                        <td className='border-l-[1px] border-slate-400 p-1'>{receivables.invoice.invoice_no}</td>
                        <td className='border-l-[1px] border-slate-400 p-1'>{receivables.due_date}</td>
                        <td className='border-l-[1px] border-slate-400 p-1'>{receivables.customer.customer_name}</td>
                        <td className='border-l-[1px] border-slate-400 p-1'>{receivables.invoice.balance}</td>
                    </tr>
                    ))} 
                    </tbody>
                </table>}
            </div>
        </div>
    </form>
    {isToastVisible && 
        <Toast message={toastMessage} onClose={handleToastClose} />
    }
    {isListBoxVisible &&
        <ListBox 
            ref={listBoxRef} 
            items={listBoxItems} 
            values={
                (module === 'payment')?
                ['payment_no', 'payment_date', 'payment_to', 'cheque_no', 'cheque_date']:
                ['receipt_no', 'receipt_date', 'receipt_from', 'cheque_no', 'cheque_date']} 
            setSearchVal={setSearchVal} 
            setSearchIn={setSearchIn} />
    }
    {isMessageBoxVisible &&
        <MessageBox ref={listBoxRef} message={messageBoxMessage} onYes={onYes} isOpen={isMessageBoxVisible} setIsOpen={setMessageBoxVisible} />
    }
    </>
)}







export const CustomerVendorForm = ({module, schema}) => {
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
        if (module === 'customer') {
            setValue('customer_code', data.customer_code)
            setValue('customer_name', data.customer_name)
        } else {
            setValue('vendor_code', data.vendor_code)
            setValue('vendor_name', data.vendor_name)
        }
        setValue('address', data.address)
        setValue('city', data.city)
        setValue('state', data.state)
        setValue('country', data.country)
        setValue('contact_person', data.contact_person)
        setValue('mobile', data.mobile)
        setValue('telephone', data.telephone)
        setValue('email', data.email)
        setValue('credit_alert', data.credit_alert)
        setValue('credit_block', data.credit_block)
        setValue('credit_days', data.credit_days)
        setValue('credit_balance', data.credit_balance)
    }, [setValue, module])
    
    const newData = useCallback(async() => {
        if (currentID > 0)
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}${module}/${currentID}`)
            setData(response.data.data)
            setIdExists(response.data.id_exists)
            setCurrentState('view')
        } catch (error) {
            console.log(error)
        }
    }, [module, currentID, setData])

    useEffect(() => {
        newData()
    }, [currentID, module, newData])
    
    useEffect(() => {
        async function fetchData() {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}${module}`)
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
    }, [setData, module])

    useEffect(() => {
        if (isListBoxVisible) {
            document.addEventListener('click', handleClickOutside);
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [isListBoxVisible]);

    useEffect(() => {
        try {
            async function getData() {
                if (currentID > 0) {
                    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}${module}/${currentID}`)
                    setData(response.data.data)
                    setIdExists(response.data.id_exists)
                }
            }
            
            getData()
        } catch (error) {
            console.error(error)
        }
    }, [currentID, setData, module])

    useEffect(() => {
        if (currentState === 'view' && document.activeElement) {
            document.activeElement.blur();
            clearErrors()
        } else {
            if (module === 'customer')
                document.getElementById('customer_code').focus();
            else
                document.getElementById('vendor_code').focus();
        }
    }, [currentState, clearErrors, module])

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
        setMessageBoxMessage(`Are you sure you want to delete this ${module}?`)
    }, [module])
    
    const onYes = async() => {
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}${module}/${currentID}`)
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
            if (module === 'customer')
                response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}form_search/tblCustomer`)
            else
                response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}form_search/tblVendor`)
            const items = response.data.map((item, index) => (
                <tr key={index} className={`${index % 2 === 0? `bg-white`:`bg-gray-100`} cursor-pointer`}>
                    {module === 'customer'?
                    <>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem]'>{item.customer_code}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[14rem] border-l-[1px] border-black'>{item.customer_name}</td>
                    </> 
                    :
                    <>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem]'>{item.vendor_code}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[14rem] border-l-[1px] border-black'>{item.vendor_name}</td>
                    </> 
                    }
                    <td onClick={() => listValueClick(item.id)} className='w-[14rem] border-l-[1px] border-black'>{item.email}</td>
                    <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.mobile}</td>
                    <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.credit_balance}</td>
                    <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.credit_days}</td>
                </tr>
            ))
            
            setListBoxItems(items);
            setIsListBoxVisible(true);
        } catch (error) {
            console.error('Error fetching data:', error);
            // Handle error as needed
        }
    }, [module])

    const formSearch = useCallback(async() => {
        let searchURI = ''
        if (searchVal.length > 0) {
            switch (searchIn) {
                case 'customer_code':
                    searchURI = `/customer_code/${searchVal}`
                    break;
                case 'customer_name':
                    searchURI = `/customer_name/${searchVal}`
                    break;
                case 'email':
                    searchURI = `/email/${searchVal}`
                    break;
                case 'mobile':
                    searchURI = `/mobile/${searchVal}`
                    break;
                case '':
                    searchURI = `/${searchVal}`
                    break;
            }
        }
        try {
            let response
            if (module === 'customer')
                response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}form_search/tblCustomer${searchURI}`)
            else
                response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}form_search/tblVendor${searchURI}`)
            const items = response.data.map((item, index) => (
                <tr key={index} className={`${index % 2 === 0? `bg-white`:`bg-gray-100`} cursor-pointer`}>
                    {module === 'customer'?
                    <>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem]'>{item.customer_code}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[14rem] border-l-[1px] border-black'>{item.customer_name}</td>
                    </>
                    :
                    <>
                        <td onClick={() => listValueClick(item.id)} className='w-[8rem]'>{item.vendor_code}</td>
                        <td onClick={() => listValueClick(item.id)} className='w-[14rem] border-l-[1px] border-black'>{item.vendor_name}</td>
                    </>
                    }
                    <td onClick={() => listValueClick(item.id)} className='w-[14rem] border-l-[1px] border-black'>{item.email}</td>
                    <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.mobile}</td>
                    <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.credit_balance}</td>
                    <td onClick={() => listValueClick(item.id)} className='w-[8rem] border-l-[1px] border-black'>{item.credit_days}</td>
                </tr>
            ))
            setListBoxItems(items);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }, [searchIn, searchVal, module])

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
        // console.log(formData);
        try {
            // Make a POST request to your Django URL with the form data
            let response
            if (currentState === 'add') 
                response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}${module}`, formData);
            else
                response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}${module}/${currentID}`, formData);
        
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
            showToast(`${module} saving failed`)
            // console.error('An error occurred while submitting the form:', error);
            // Handle network errors or other exceptions here
        }
    }, [currentID, currentState, module]);
    
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
    }, [currentID, idExists, currentState, setData, handleSubmit, saveForm, findClick, newData, deleteClick, isListBoxVisible]);


    return (
    <>
    <form method="POST" className='mt-4 ml-6 md:ml-3' onSubmit={handleSubmit(saveForm)}>
        <h1 className='font-black text-xl first-letter:uppercase'>{module} Information</h1>
        
        {currentState === 'view' &&
        <div className="flex justify-start items-center gap-4 mt-5 w-[240px] md:w-[500px]">
            <Button type="button" value='Add' variant='secondary' onClick={addClick} />
            <Button type="button" value='Edit' variant='secondary' onClick={editClick} />
            <Button type="button" value='Delete' variant='secondaryDanger' onClick={deleteClick} />
        </div>
        }

        <div className={`flex flex-col md:flex-row justify-start ${currentState === 'view'? 'mt-10':'mt-5'}`}>
            {module === 'customer'?
            <>
            <TextField id="customer_code" label='Customer Code' className={clsx('w-[240px] rounded-[5px] uppercase', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})}  tabIndex={currentState === 'view'? '-1':undefined} errors={errors.customer_code} {...register('customer_code')} />
            <span className='mt-5 md:mt-0'>
                <TextField label='Customer Name' className={clsx('w-[240px] md:w-[500px] rounded-[5px] uppercase', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})}  tabIndex={currentState === 'view'? '-1':undefined} errors={errors.customer_name} {...register('customer_name')} />    
            </span>
            </>
            :
            <>
            <TextField id="vendor_code" label='Vendor Code' className={clsx('w-[240px] rounded-[5px] uppercase', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})}  tabIndex={currentState === 'view'? '-1':undefined} errors={errors.vendor_code} {...register('vendor_code')} />
            <span className='mt-5 md:mt-0'>
                <TextField label='Vendor Name' className={clsx('w-[240px] md:w-[500px] rounded-[5px] uppercase', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})}  tabIndex={currentState === 'view'? '-1':undefined} errors={errors.vendor_name} {...register('vendor_name')} />    
            </span>
            </>
            }
        </div>
        <div className="mt-5">
            <TextAreaField label='Address' className={clsx('w-[240px] md:w-[760px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})}  tabIndex={currentState === 'view'? '-1':undefined} errors={errors.address} {...register('address')} />
        </div>
        <div className={`flex flex-col md:flex-row justify-start mt-5`}>
            <TextField label='City' className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})}  tabIndex={currentState === 'view'? '-1':undefined} errors={errors.city} {...register('city')} />
            <span className='mt-5 md:mt-0'>
                <TextField label='State' className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})}  tabIndex={currentState === 'view'? '-1':undefined} errors={errors.state} {...register('state')} />    
            </span>
            <span className='mt-5 md:mt-0'>
                <TextField label='Country' className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})}  tabIndex={currentState === 'view'? '-1':undefined} errors={errors.country} {...register('country')} />
            </span>
        </div>
        <div className={`flex flex-col md:flex-row justify-start mt-5`}>
            <TextField label='Contact Person' className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})}  tabIndex={currentState === 'view'? '-1':undefined} errors={errors.contact_person} {...register('contact_person')} />    
            <span className='mt-5 md:mt-0'>
                <TextField label='Mobile' className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})}  tabIndex={currentState === 'view'? '-1':undefined} errors={errors.mobile} {...register('mobile')} />
            </span>
            <span className='mt-5 md:mt-0'>
                <TextField label='Telephone' className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})}  tabIndex={currentState === 'view'? '-1':undefined} errors={errors.telephone} {...register('telephone')} />    
            </span>
        </div>
        <div className={`flex flex-col md:flex-row justify-start mt-5`}>
            <TextField label='Email' className={clsx('w-[240px] md:w-[500px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})}  tabIndex={currentState === 'view'? '-1':undefined} errors={errors.email} {...register('email')} />
            <span className='mt-5 md:mt-0'>
                <TextField label='Credit Balance' className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})}  tabIndex={currentState === 'view'? '-1':undefined} errors={errors.credit_balance} {...register('credit_balance')} />
            </span>
        </div>
        <div className={`flex flex-col md:flex-row justify-start mt-5`}>
            <TextField label='Credit Alert' className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})}  tabIndex={currentState === 'view'? '-1':undefined} errors={errors.credit_alert} {...register('credit_alert')} />
            <span className='mt-5 md:mt-0'>
                <TextField label='Credit Block' className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})}  tabIndex={currentState === 'view'? '-1':undefined} errors={errors.credit_block} {...register('credit_block')} />    
            </span>
            <span className='mt-5 md:mt-0'>
                <TextField label='Credit Days' className={clsx('w-[240px] rounded-[5px]', {'pointer-events-none bg-[#f5f5f5]': currentState === 'view'})}  tabIndex={currentState === 'view'? '-1':undefined} errors={errors.credit_days} {...register('credit_days')} />
            </span>
        </div>
        <div className="flex flex-col md:flex-row justify-center items-center w-[240px] lg:w-[760px] gap-4 mt-5">
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
        <ListBox ref={listBoxRef} items={listBoxItems} 
        values={module === 'customer'?
            ['customer_code', 'customer_name', 'email', 'mobile']:
            ['vendor_code', 'vendor_name', 'email', 'mobile']
        } 
        setSearchVal={setSearchVal} setSearchIn={setSearchIn} />
    }
    {isMessageBoxVisible &&
        <MessageBox ref={listBoxRef} message={messageBoxMessage} onYes={onYes} isOpen={isMessageBoxVisible} setIsOpen={setMessageBoxVisible} />
    }
    </>
)}