'use client'

import Button from '@/components/buttons'
import React, { useState } from 'react'
import queryString from 'query-string';

const ReportsPage = () => {

const [ data, setData ] = useState({
    'report': 'sales', 
    'summary_or_detail': 'summary', 
    'report_range': 'today', 
    'return': 'include-return', 
    'from_date': new Date().toISOString().split('T')[0], 
    'to_date': new Date().toISOString().split('T')[0] 
})

const handleDataChange = (event) => {
    const name = event.target.name
    const value = event.target.value
    setData({
        ...data,
        [name]: value
    })
}

const printClick = async() => {
    const queryParams = queryString.stringify(data);
    const url = `${process.env.NEXT_PUBLIC_API_URL}${data.report}_report/?${queryParams}`;
    window.open(url, '_blank');
}

return (
<div className='p-3'>
    <h1 className='font-black text-xl'>Reports</h1>
    
    <div className='flex flex-col mt-2'>
        <label className='text-sm'>Report</label>
        <select className='w-[180px] rounded-md' onChange={handleDataChange} name='report'>
            <option value='sales' defaultValue>Sales</option>
            <option value='purchase'>Purchase</option>
            <option value='jv'>Journal Voucher</option>
            <option value='trial_balance'>Trial Balance</option>
            <option value='profit_loss'>Profit & Loss</option>
            <option value='balance_sheet'>Balance Sheet</option>
        </select>
    </div>
    {(data.report === 'sales' || data.report === 'purchase') && 
    <>
    <div className='flex border border-gray-400 rounded-md mt-2 w-[13rem] h-[2rem] justify-between'>
        <div className='p-2'>
            <label className='text-sm mr-2'>Summary</label>
            <input type='radio' value="summary" name='summary_or_detail' defaultChecked={true} onChange={handleDataChange} />
        </div>
        <div className='p-2'>
            <label className='text-sm mr-2'>Detail</label>
            <input type='radio' value="detail" name='summary_or_detail' onChange={handleDataChange} />
        </div>
    </div>
    
    <div className='flex border border-gray-400 rounded-md h-[2rem] w-[25rem] mt-2 justify-between'>
        <div className='p-2'>
            <label className='text-sm mr-2'>Include Return</label>
            <input type='radio' value="include-return" name='return' defaultChecked={true} onChange={handleDataChange} />
        </div>
        <div className='p-2'>
            <label className='text-sm mr-2'>Exclude Return</label>
            <input type='radio' value="exclude-return" name='return' onChange={handleDataChange} />
        </div>
        <div className='p-2'>
            <label className='text-sm mr-2'>Return Only</label>
            <input type='radio' value="return-only" name='return' onChange={handleDataChange} />
        </div>
    </div>
    </>}
    <div className='flex border border-gray-400 rounded-md h-[2rem] w-[25rem] mt-2 justify-between'>
        <div className='p-2'>
            <label className='text-sm mr-2'>Today</label>
            <input type='radio' value="today" name='report_range' defaultChecked={true} onChange={handleDataChange} />
        </div>
        <div className='p-2'>
            <label className='text-sm mr-2'>This Month</label>
            <input type='radio' value="this-month" name='report_range' onChange={handleDataChange} />
        </div>
        <div className='p-2'>
            <label className='text-sm mr-2'>This year</label>
            <input type='radio' value="this-year" name='report_range' onChange={handleDataChange} />
        </div>
        <div className='p-2'>
            <label className='text-sm mr-2'>Range</label>
            <input type='radio' value="range" name='report_range' onChange={handleDataChange} />
        </div>
    </div>
    
    {data.report_range === 'range' && 
    <div className='flex justify-between mt-2'>    
        <div className='flex flex-col'>
            <label className='text-sm'>From Date</label>
            <input type='date' className='w-[180px] rounded-md' defaultValue={new Date().toISOString().split('T')[0]} name='from_date' onChange={handleDataChange} />
        </div>
        <div className='flex flex-col'>
            <label className='text-sm'>To Date</label>
            <input type='date' className='w-[180px] rounded-md' defaultValue={new Date().toISOString().split('T')[0]} name='to_date' onChange={handleDataChange} />
        </div>
    </div>}

    <div className='flex justify-between mt-2'>    
        <Button type="button" value='Print' variant='primary' className='w-[180px] mt-3' onClick={printClick} />
    </div>
</div>
)}

export default ReportsPage
