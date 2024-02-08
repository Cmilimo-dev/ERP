'use client'

import Button from '@/components/buttons'
import { DateField, HiddenField, NumberField, TextAreaField, TextComboField, TextField } from '@/components/form_fields'
import { Toast } from '@/components/popups'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import clsx from 'clsx'
import React, { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { any, number, string, z } from 'zod'

const schema = z.object({
    company_name: string(),
    address: string(),
    trn: string(),
    telephone1: string(),
    telephone2: string(),
    mobile1: string(),
    mobile2: string(),
    whatsapp: string(),
    fax: string(),
    email: string(),
    website: string(),
    last_vat_return: any(),
    next_vat_return: any(),
    fy_start_date: any(),
    fy_end_date: any(),
    active_accounting_period_from: any(),
    active_accounting_period_to: any(),
    last_sales_close_date: any(),
    invoice_form: any(),
    default_attention: string(),
    default_cash_account: number(),
    default_bank_account: number(),
    default_sales_account: number(),
    default_purchase_account: number(),
    default_sales_return_account: number(),
    default_purchase_return_account: number(),
    default_accounts_receivable_account: number(),
    default_accounts_payable_account: number(),
    default_vat_recoverable_account: number(),
    default_vat_payable_account: number(),
    default_credit_card_account: number(),
    default_credit_card_bank_account: number(),
    default_credit_card_commission_account: number(),
    default_pettycash_account: number(),
    default_depreciation_account: number(),
    default_bad_debts_account: number(),
    default_sales_discount_account: number(),
    default_purchase_discount_account: number(),
    default_pdc_issued_account: number(),
    default_pdc_received_account: number(),
    default_inventory_account: number(),
})

const CompanyInformation = () => {

    const { register, handleSubmit, formState, setValue } = useForm({defaultValues: {}, resolver: zodResolver(schema)})

    const { errors } = formState

    const [ accounts, setAccounts ] = useState([])

    const setData = useCallback((data) => {
        setValue('company_name', data.company_name)
        setValue('address', data.address)
        setValue('trn', data.trn)
        setValue('telephone1', data.telephone1)
        setValue('telephone2', data.telephone2)
        setValue('mobile1', data.mobile1)
        setValue('mobile2', data.mobile2)
        setValue('whatsapp', data.whatsapp)
        setValue('fax', data.fax)
        setValue('email', data.email)
        setValue('website', data.website)
        setValue('last_vat_return', data.last_vat_return)
        setValue('next_vat_return', data.next_vat_return)
        setValue('fy_start_date', data.fy_start_date)
        setValue('fy_end_date', data.fy_end_date)
        setValue('active_accounting_period_from', data.active_accounting_period_from)
        setValue('active_accounting_period_to', data.active_accounting_period_to)
        setValue('last_sales_close_date', data.last_sales_close_date)
        setValue('invoice_form', data.invoice_form)
        setValue('default_attention', data.default_attention)

        setValue('default_cash_account', data.default_cash_account)
        setValue('default_bank_account', data.default_bank_account)
        setValue('default_sales_account', data.default_sales_account)
        setValue('default_purchase_account', data.default_purchase_account)
        setValue('default_sales_return_account', data.default_sales_return_account)
        setValue('default_purchase_return_account', data.default_purchase_return_account)
        setValue('default_accounts_receivable_account', data.default_accounts_receivable_account)
        setValue('default_accounts_payable_account', data.default_accounts_payable_account)
        setValue('default_vat_recoverable_account', data.default_vat_recoverable_account)
        setValue('default_vat_payable_account', data.default_vat_payable_account)
        setValue('default_credit_card_account', data.default_credit_card_account)
        setValue('default_credit_card_bank_account', data.default_credit_card_bank_account)
        setValue('default_credit_card_commission_account', data.default_credit_card_commission_account)
        setValue('default_pettycash_account', data.default_pettycash_account)
        setValue('default_depreciation_account', data.default_depreciation_account)
        setValue('default_bad_debts_account', data.default_bad_debts_account)
        setValue('default_sales_discount_account', data.default_sales_discount_account)
        setValue('default_purchase_discount_account', data.default_purchase_discount_account)
        setValue('default_inventory_account', data.default_inventory_account)
        setValue('default_pdc_issued_account', data.default_pdc_issued_account)
        setValue('default_pdc_received_account', data.default_pdc_received_account)

        setValue('default_cash_account_name', data.default_cash_account_name)
        setValue('default_bank_account_name', data.default_bank_account_name)
        setValue('default_sales_account_name', data.default_sales_account_name)
        setValue('default_purchase_account_name', data.default_purchase_account_name)
        setValue('default_sales_return_account_name', data.default_sales_return_account_name)
        setValue('default_purchase_return_account_name', data.default_purchase_return_account_name)
        setValue('default_accounts_receivable_account_name', data.default_accounts_receivable_account_name)
        setValue('default_accounts_payable_account_name', data.default_accounts_payable_account_name)
        setValue('default_vat_recoverable_account_name', data.default_vat_recoverable_account_name)
        setValue('default_vat_payable_account_name', data.default_vat_payable_account_name)
        setValue('default_credit_card_account_name', data.default_credit_card_account_name)
        setValue('default_credit_card_bank_account_name', data.default_credit_card_bank_account_name)
        setValue('default_credit_card_commission_account_name', data.default_credit_card_commission_account_name)
        setValue('default_pettycash_account_name', data.default_pettycash_account_name)
        setValue('default_depreciation_account_name', data.default_depreciation_account_name)
        setValue('default_bad_debts_account_name', data.default_bad_debts_account_name)
        setValue('default_sales_discount_account_name', data.default_sales_discount_account_name)
        setValue('default_purchase_discount_account_name', data.default_purchase_discount_account_name)
        setValue('default_inventory_account_name', data.default_inventory_account_name)
        setValue('default_pdc_issued_account_name', data.default_pdc_issued_account_name)
        setValue('default_pdc_received_account_name', data.default_pdc_received_account_name)
    }, [setValue])
    
    useEffect(() => {
        async function fetchData() {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}company_information`)
                const data = response.data;
                setData(data);
            } catch (e) {
                
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

        fetchAccounts()
        fetchData()
    }, [setData])

    const [isToastVisible, setIsToastVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const showToast = (message) => {
        setToastMessage(message);
        setIsToastVisible(true);
    };

    const handleToastClose = () => {
        setIsToastVisible(false);
        setToastMessage('');
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

    const saveForm = async(formData) => {
        try {
            var response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}company_information`, formData);
        
            // Check the response status and handle accordingly
            if (response.data.status === 'success') {
                // console.log('Form submitted successfully:', response.data);
                // Optionally, you can redirect or perform other actions upon successful submission
                showToast(response.data.message)
                window.location.reload();
            } else {
                showToast(response.data.message)
                // console.error('Error submitting form:', response.data);
                // Handle error cases here
            }
        } catch (error) {
            showToast('Company Information Saving Failed')
            // console.error('An error occurred while submitting the form:', error);
            // Handle network errors or other exceptions here
        }
    };
    

    return (
    <>
    <form method="POST" className='flex flex-col mt-3 ml-6 md:ml-3' onSubmit={handleSubmit(saveForm)}>
        <div className="flex flex-col md:flex-row w-[240px] md:w-[1020px] justify-between">
            <h1 className='font-black text-xl'>Company Information</h1>
            <span className='mt-5 md:mt-0'>
                <Button type="submit" value='Save' variant='primary' />
            </span>
        </div>

        <div className={`flex flex-col md:flex-row justify-start mt-5`}>
            <TextField 
                label='Company Name' 
                className={clsx('w-[240px] lg:w-[500px] rounded-[5px] uppercase')} 
                // tabIndex='-1' 
                errors={errors.company_name} 
                {...register('company_name')} />
            <span className='mt-5 md:mt-0'>
            <TextField 
                label='TRN' 
                className={clsx('w-[240px] lg:w-[500px] rounded-[5px] uppercase')} 
                // tabIndex='-1' 
                errors={errors.trn} 
                {...register('trn')} />
            </span>
        </div>

        <div className="flex justify-start mt-5">
            <TextAreaField 
                label='Address' 
                className={clsx('w-[240px] md:w-[1020px] rounded-[5px]')}  
                // tabIndex='-1' 
                errors={errors.address} 
                {...register('address')} />
        </div>

        <div className={`flex flex-col md:flex-row justify-start mt-5`}>
            <NumberField 
                label='Telephone 1' 
                className={clsx('w-[240px] rounded-[5px]')} 
                // tabIndex='-1' 
                errors={errors.telephone1} 
                {...register('telephone1')} />
            <span className='mt-5 md:mt-0'>
            <NumberField 
                label='Telephone 2'  
                className={clsx('w-[240px] rounded-[5px]')} 
                // tabIndex='-1' 
                errors={errors.telephone2} 
                {...register('telephone2')} />
            </span>
            <span className='mt-5 md:mt-0'>
            <NumberField 
                label='Mobile 1'  
                className={clsx('w-[240px] rounded-[5px]')} 
                // tabIndex='-1' 
                errors={errors.mobile1} 
                {...register('mobile1')} />
            </span>
            <span className='mt-5 md:mt-0'>
            <NumberField 
                label='Mobile 2' 
                className={clsx('w-[240px] rounded-[5px]')} 
                // tabIndex='-1' 
                errors={errors.mobile2} 
                {...register('mobile2')} />
            </span>
        </div>

        <div className={`flex flex-col md:flex-row justify-start mt-5`}>
            <TextField 
                label='Email' 
                className={clsx('w-[240px] lg:w-[500px] rounded-[5px]')} 
                // tabIndex='-1' 
                errors={errors.email} 
                {...register('email')} />
            <span className='mt-5 md:mt-0'>
            <TextField 
                label='Website' 
                className={clsx('w-[240px] lg:w-[500px] rounded-[5px]')} 
                // tabIndex='-1' 
                errors={errors.website} 
                {...register('website')} />
            </span>
        </div>

        <div className={`flex flex-col md:flex-row justify-start mt-5`}>
            <TextField 
                label='WhatsApp' 
                className={clsx('w-[240px] rounded-[5px]')} 
                // tabIndex='-1' 
                errors={errors.whatsapp} 
                {...register('whatsapp')} />
            <span className='mt-5 md:mt-0'>
            <TextField 
                label='Fax' 
                className={clsx('w-[240px] rounded-[5px]')} 
                // tabIndex='-1' 
                errors={errors.fax} 
                {...register('fax')} />
            </span>
            <span className='mt-5 md:mt-0'>
            <DateField 
            label='FY Start Date' 
            className={clsx('w-[240px] rounded-[5px]')}  
            errors={errors.fy_start_date} 
            defaultValue={new Date().toISOString().split('T')[0]} 
            {...register('fy_start_date')} />
            </span>
            <span className='mt-5 md:mt-0'>
            <DateField 
            label='FY End Date' 
            className={clsx('w-[240px] rounded-[5px]')}  
            errors={errors.fy_end_date} 
            defaultValue={new Date().toISOString().split('T')[0]} 
            {...register('fy_end_date')} />
            </span>
        </div>

        <div className={`flex flex-col md:flex-row justify-start mt-5`}>
            <DateField 
            label='Active Accounting Period From' 
            className={clsx('w-[240px] rounded-[5px]')}  
            errors={errors.active_accounting_period_from} 
            defaultValue={new Date().toISOString().split('T')[0]} 
            {...register('active_accounting_period_from')} />
            <span className='mt-5 md:mt-0'>
            <DateField 
            label='Active Accounting Period To' 
            className={clsx('w-[240px] rounded-[5px]')}  
            errors={errors.active_accounting_period_to} 
            defaultValue={new Date().toISOString().split('T')[0]} 
            {...register('active_accounting_period_to')} />
            </span>
            <span className='mt-5 md:mt-0'>
            <DateField 
            label='Last VAT return' 
            className={clsx('w-[240px] rounded-[5px]')}  
            errors={errors.last_vat_return} 
            defaultValue={new Date().toISOString().split('T')[0]} 
            {...register('last_vat_return')} />
            </span>
            <span className='mt-5 md:mt-0'>
            <DateField 
            label='Next VAT return' 
            className={clsx('w-[240px] rounded-[5px]')}  
            errors={errors.next_vat_return} 
            defaultValue={new Date().toISOString().split('T')[0]} 
            {...register('next_vat_return')} />
            </span>
        </div>


        <div className={`flex flex-col md:flex-row justify-start mt-5`}>
            <DateField 
            label='Last Sales Close Date' 
            className={clsx('w-[240px] rounded-[5px]')}  
            errors={errors.last_sales_close_date} 
            defaultValue={new Date().toISOString().split('T')[0]} 
            {...register('last_sales_close_date')} />
            <span className='mt-5 md:mt-0'>
            <TextComboField 
                label='Invoice Form' 
                className={clsx('w-[240px] rounded-[5px]')}  
                // tabIndex='-1' 
                errors={errors.invoice_form} 
                {...register('invoice_form')}  
                values={[]} 
                listName='invoice_form' />
            </span>
            <span className='mt-5 md:mt-0'>
            <TextField 
                label='Default Attention' 
                className={clsx('w-[240px] md:w-[500px] rounded-[5px]')} 
                // tabIndex='-1' 
                errors={errors.default_attention} 
                {...register('default_attention')} />
            </span>
        </div>

        <div className={`flex flex-col md:flex-row justify-start mt-5`}>
            <TextComboField 
                label='Default Cash Account' 
                className={clsx('w-[240px] md:w-[500px] rounded-[5px]')}  
                // tabIndex='-1' 
                errors={errors.default_cash_account_name} 
                {...register('default_cash_account_name')}  
                values={accounts.map((account) => account.account_code + ' - ' + account.account_name)} 
                onChange={(e) => accountChange(e)}
                onBlur={(e) => accountLeave(e)}
                listName='accounts' />
                <HiddenField {...register('default_cash_account')} />
            <span className='mt-5 md:mt-0'>
            <TextComboField 
                label='Default Bank Account' 
                className={clsx('w-[240px] md:w-[500px] rounded-[5px]')}  
                // tabIndex='-1' 
                errors={errors.default_bank_account_name} 
                {...register('default_bank_account_name')}  
                values={accounts.map((account) => account.account_code + ' - ' + account.account_name)} 
                onChange={(e) => accountChange(e)}
                onBlur={(e) => accountLeave(e)}
                listName='accounts' />
                <HiddenField {...register('default_bank_account')} />
            </span>
        </div>

        <div className={`flex flex-col md:flex-row justify-start mt-5`}>
            <TextComboField 
                label='Default Sales Account' 
                className={clsx('w-[240px] md:w-[500px] rounded-[5px]')}  
                // tabIndex='-1' 
                errors={errors.default_sales_account_name} 
                {...register('default_sales_account_name')}  
                values={accounts.map((account) => account.account_code + ' - ' + account.account_name)} 
                onChange={(e) => accountChange(e)}
                onBlur={(e) => accountLeave(e)}
                listName='accounts' />
                <HiddenField {...register('default_sales_account')} />
            <span className='mt-5 md:mt-0'>
            <TextComboField 
                label='Default Purchase Account' 
                className={clsx('w-[240px] md:w-[500px] rounded-[5px]')}  
                // tabIndex='-1' 
                errors={errors.default_purchase_account_name} 
                {...register('default_purchase_account_name')}  
                values={accounts.map((account) => account.account_code + ' - ' + account.account_name)} 
                onChange={(e) => accountChange(e)}
                onBlur={(e) => accountLeave(e)}
                listName='accounts' />
                <HiddenField {...register('default_purchase_account')} />
            </span>
        </div>

        <div className={`flex flex-col md:flex-row justify-start mt-5`}>
            <TextComboField 
                label='Default Sales Return Account' 
                className={clsx('w-[240px] md:w-[500px] rounded-[5px]')}  
                // tabIndex='-1' 
                errors={errors.default_sales_return_account_name} 
                {...register('default_sales_return_account_name')}  
                values={accounts.map((account) => account.account_code + ' - ' + account.account_name)} 
                onChange={(e) => accountChange(e)}
                onBlur={(e) => accountLeave(e)}
                listName='accounts' />
                <HiddenField {...register('default_sales_return_account')} />
            <span className='mt-5 md:mt-0'>
            <TextComboField 
                label='Default Purchase Return Account' 
                className={clsx('w-[240px] md:w-[500px] rounded-[5px]')}  
                // tabIndex='-1' 
                errors={errors.default_purchase_return_account_name} 
                {...register('default_purchase_return_account_name')}  
                values={accounts.map((account) => account.account_code + ' - ' + account.account_name)} 
                onChange={(e) => accountChange(e)}
                onBlur={(e) => accountLeave(e)}
                listName='accounts' />
                <HiddenField {...register('default_purchase_return_account')} />
            </span>
        </div>

        <div className={`flex flex-col md:flex-row justify-start mt-5`}>
            <TextComboField 
                label='Default Accounts Receivable Account' 
                className={clsx('w-[240px] md:w-[500px] rounded-[5px]')}  
                // tabIndex='-1' 
                errors={errors.default_accounts_receivable__account_name} 
                {...register('default_accounts_receivable_account_name')}  
                values={accounts.map((account) => account.account_code + ' - ' + account.account_name)} 
                onChange={(e) => accountChange(e)}
                onBlur={(e) => accountLeave(e)}
                listName='accounts' />
                <HiddenField {...register('default_accounts_receivable_account')} />
            <span className='mt-5 md:mt-0'>
            <TextComboField 
                label='Default Accounts Payable Account' 
                className={clsx('w-[240px] md:w-[500px] rounded-[5px]')}  
                // tabIndex='-1' 
                errors={errors.default_accounts_payable_account_name} 
                {...register('default_accounts_payable_account_name')}  
                values={accounts.map((account) => account.account_code + ' - ' + account.account_name)} 
                onChange={(e) => accountChange(e)}
                onBlur={(e) => accountLeave(e)}
                listName='accounts' />
                <HiddenField {...register('default_accounts_payable_account')} />
            </span>
        </div>

        <div className={`flex flex-col md:flex-row justify-start mt-5`}>
            <TextComboField 
                label='Default VAT Recoverable Account' 
                className={clsx('w-[240px] md:w-[500px] rounded-[5px]')}  
                // tabIndex='-1' 
                errors={errors.default_vat_recoverable_account_name} 
                {...register('default_vat_recoverable_account_name')}  
                values={accounts.map((account) => account.account_code + ' - ' + account.account_name)} 
                onChange={(e) => accountChange(e)}
                onBlur={(e) => accountLeave(e)}
                listName='accounts' />
                <HiddenField {...register('default_vat_recoverable_account')} />
            <span className='mt-5 md:mt-0'>
            <TextComboField 
                label='Default VAT Payable Account' 
                className={clsx('w-[240px] md:w-[500px] rounded-[5px]')}  
                // tabIndex='-1' 
                errors={errors.default_vat_payable_account_name} 
                {...register('default_vat_payable_account_name')}  
                values={accounts.map((account) => account.account_code + ' - ' + account.account_name)} 
                onChange={(e) => accountChange(e)}
                onBlur={(e) => accountLeave(e)}
                listName='accounts' />
                <HiddenField {...register('default_vat_payable_account')} />
            </span>
        </div>

        <div className={`flex flex-col md:flex-row justify-start mt-5`}>
            <TextComboField 
                label='Default Credit Card Account' 
                className={clsx('w-[240px] md:w-[500px] rounded-[5px]')}  
                // tabIndex='-1' 
                errors={errors.default_credit_card_account_name} 
                {...register('default_credit_card_account_name')}  
                values={accounts.map((account) => account.account_code + ' - ' + account.account_name)} 
                onChange={(e) => accountChange(e)}
                onBlur={(e) => accountLeave(e)}
                listName='accounts' />
                <HiddenField {...register('default_credit_card_account')} />
            <span className='mt-5 md:mt-0'>
            <TextComboField 
                label='Default Credit Card Bank Account' 
                className={clsx('w-[240px] md:w-[500px] rounded-[5px]')}  
                // tabIndex='-1' 
                errors={errors.default_credit_card_bank_account_name} 
                {...register('default_credit_card_bank_account_name')}  
                values={accounts.map((account) => account.account_code + ' - ' + account.account_name)} 
                onChange={(e) => accountChange(e)}
                onBlur={(e) => accountLeave(e)}
                listName='accounts' />
                <HiddenField {...register('default_credit_card_bank_account')} />
            </span>
        </div>

        <div className={`flex flex-col md:flex-row justify-start mt-5`}>
            <TextComboField 
                label='Default Credit Card Commission Account' 
                className={clsx('w-[240px] md:w-[500px] rounded-[5px]')}  
                // tabIndex='-1' 
                errors={errors.default_credit_card_commission_account_name} 
                {...register('default_credit_card_commission_account_name')}  
                values={accounts.map((account) => account.account_code + ' - ' + account.account_name)} 
                onChange={(e) => accountChange(e)}
                onBlur={(e) => accountLeave(e)}
                listName='accounts' />
                <HiddenField {...register('default_credit_card_commission_account')} />
            <span className='mt-5 md:mt-0'>
            <TextComboField 
                label='Default Petty Cash Account' 
                className={clsx('w-[240px] md:w-[500px] rounded-[5px]')}  
                // tabIndex='-1' 
                errors={errors.default_pettycash_account_name} 
                {...register('default_pettycash_account_name')}  
                values={accounts.map((account) => account.account_code + ' - ' + account.account_name)} 
                onChange={(e) => accountChange(e)}
                onBlur={(e) => accountLeave(e)}
                listName='accounts' />
                <HiddenField {...register('default_pettycash_account')} />
            </span>
        </div>

        <div className={`flex flex-col md:flex-row justify-start mt-5`}>
            <TextComboField 
                label='Default Depreciation Account' 
                className={clsx('w-[240px] md:w-[500px] rounded-[5px]')}  
                // tabIndex='-1' 
                errors={errors.default_depreciation_account_name} 
                {...register('default_depreciation_account_name')}  
                values={accounts.map((account) => account.account_code + ' - ' + account.account_name)} 
                onChange={(e) => accountChange(e)}
                onBlur={(e) => accountLeave(e)}
                listName='accounts' />
                <HiddenField {...register('default_depreciation_account')} />
            <span className='mt-5 md:mt-0'>
            <TextComboField 
                label='Default Bad Debts Account' 
                className={clsx('w-[240px] md:w-[500px] rounded-[5px]')}  
                // tabIndex='-1' 
                errors={errors.default_bad_debts_account_name} 
                {...register('default_bad_debts_account_name')}  
                values={accounts.map((account) => account.account_code + ' - ' + account.account_name)} 
                onChange={(e) => accountChange(e)}
                onBlur={(e) => accountLeave(e)}
                listName='accounts' />
                <HiddenField {...register('default_bad_debts_account')} />
            </span>
        </div>

        <div className={`flex flex-col md:flex-row justify-start mt-5`}>
            <TextComboField 
                label='Default Sales Discount Account' 
                className={clsx('w-[240px] md:w-[500px] rounded-[5px]')}  
                // tabIndex='-1' 
                errors={errors.default_sales_discount_account_name} 
                {...register('default_sales_discount_account_name')}  
                values={accounts.map((account) => account.account_code + ' - ' + account.account_name)} 
                onChange={(e) => accountChange(e)}
                onBlur={(e) => accountLeave(e)}
                listName='accounts' />
                <HiddenField {...register('default_sales_discount_account')} />
            <span className='mt-5 md:mt-0'>
            <TextComboField 
                label='Default Purchase Discount Account' 
                className={clsx('w-[240px] md:w-[500px] rounded-[5px]')}  
                // tabIndex='-1' 
                errors={errors.default_purchase_discount_account_name} 
                {...register('default_purchase_discount_account_name')}  
                values={accounts.map((account) => account.account_code + ' - ' + account.account_name)} 
                onChange={(e) => accountChange(e)}
                onBlur={(e) => accountLeave(e)}
                listName='accounts' />
                <HiddenField {...register('default_purchase_discount_account')} />
            </span>
        </div>

        <div className={`flex flex-col md:flex-row justify-start mt-5`}>
            <TextComboField 
                label='Default PDC Issued Account' 
                className={clsx('w-[240px] md:w-[500px] rounded-[5px]')}  
                // tabIndex='-1' 
                errors={errors.default_pdc_issued_account_name} 
                {...register('default_pdc_issued_account_name')}  
                values={accounts.map((account) => account.account_code + ' - ' + account.account_name)} 
                onChange={(e) => accountChange(e)}
                onBlur={(e) => accountLeave(e)}
                listName='accounts' />
                <HiddenField {...register('default_pdc_issued_account')} />
            <span className='mt-5 md:mt-0'>
            <TextComboField 
                label='Default PDC Received Account' 
                className={clsx('w-[240px] md:w-[500px] rounded-[5px]')}  
                // tabIndex='-1' 
                errors={errors.default_pdc_received_account_name} 
                {...register('default_pdc_received_account_name')}  
                values={accounts.map((account) => account.account_code + ' - ' + account.account_name)} 
                onChange={(e) => accountChange(e)}
                onBlur={(e) => accountLeave(e)}
                listName='accounts' />
                <HiddenField {...register('default_pdc_received_account')} />
            </span>
        </div>

        <div className={`flex flex-col md:flex-row justify-start mt-5`}>
            <TextComboField 
                label='Default Inventory Account' 
                className={clsx('w-[240px] md:w-[500px] rounded-[5px]')}  
                // tabIndex='-1' 
                errors={errors.default_inventory_account_name} 
                {...register('default_inventory_account_name')}  
                values={accounts.map((account) => account.account_code + ' - ' + account.account_name)} 
                onChange={(e) => accountChange(e)}
                onBlur={(e) => accountLeave(e)}
                listName='accounts' />
                <HiddenField {...register('default_inventory_account')} />
        </div>
    </form>
    {isToastVisible && 
        <Toast message={toastMessage} onClose={handleToastClose} />
    }
    </>
)}

export default CompanyInformation
