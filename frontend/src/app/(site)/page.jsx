'use client';

import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2';
import "chart.js/auto";

const HomePageDetails = ({title, headings, details}) => {
    return  <div className='bg-white w-[20rem] md:w-[39rem] h-[20rem] rounded-md border-black border-[1px] p-1 shadow-lg overflow-auto list-scrollbar'>
                <h1 className='font-bold'>{title}</h1>
                <table className='w-full'>
                    <thead className='border-b-[1px] border-t-[1px] border-black'>
                        {headings}
                    </thead>
                    <tbody>
                        {details}
                    </tbody>
                </table>
            </div>
}

const HomePage = () => {

    const [orders, setOrders] = useState([])
    const [receivables, setReceivables] = useState([])
    const [payables, setPayables] = useState([])
    const [salesChange, setSalesChange] = useState([])

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}home_details`)
                setOrders(response.data.orders);
                setReceivables(response.data.receivables);  
                setPayables(response.data.payables);  
                setSalesChange(response.data.sales_change)
            } catch (error) {

            }
        }

        fetchData()
    }, [])

    // Extracting dates and amounts from salesChange
    const dates = salesChange.map(entry => entry.invoice_date);
    const amounts = salesChange.map(entry => parseFloat(entry.total_net_amount));

    // Creating data for Chart.js
    const data = {
        labels: dates,
        datasets: [
        {
            label: 'Total Sales',
            data: amounts,
            fill: false,
            borderColor: 'rgba(75,192,192,1)', // Line color
            pointBackgroundColor: 'rgba(75,192,192,1)', // Point color
            pointRadius: 6,
            pointHoverRadius: 8,
            borderWidth: 2,
        },
        ],
    };

    // Configuration options
    const options = {
        scales: {
        x: {
            type: 'category',
            labels: dates,
        },
        y: {
            beginAtZero: true,
            ticks: {
            callback: value => Math.ceil(value / 100) * 100, // Round to the next divisible number by 100
            },
        },
        },
    };


return (
    <>
        <div className='flex flex-col p-4 gap-5'>
            <div className='flex flex-col-reverse lg:flex-row gap-5'>
                <HomePageDetails title='Orders' 
                    headings={
                        <tr>
                            <th className='w-[5%]'>#</th>
                            <th className='border-l-[1px] border-black w-[15%]'>Order No</th>
                            <th className='border-l-[1px] border-black w-[20%]'>Order Date</th>
                            <th className='border-l-[1px] border-black w-[60%]'>Customer Name</th>
                        </tr>}
                    details={orders.map((order, index) => (
                        <tr key={index}>
                            <td>{index + 1}</td>
                            <td className='border-l-[1px] border-black p-1'>{order.order_no}</td>
                            <td className='border-l-[1px] border-black p-1'>{order.order_date}</td>
                            <td className='border-l-[1px] border-black p-1'>{order.customer_name}</td>
                        </tr>
                        ))} 
                />
                <div className='bg-white w-[20rem] md:w-[39rem] h-[20rem] rounded-xl border-[#15d52f] border-[1px] shadow-lg shadow-[#4c8b5532] p-1'>
                    <Line data={data} options={options} />
                </div>
            </div>
            <div className='flex flex-col lg:flex-row gap-5'>
            <HomePageDetails title='Accounts Receivables' 
                headings={
                    <tr>
                        <th className='w-[5%]'>#</th>
                        <th className='border-l-[1px] border-black w-[15%]'>Invoice No</th>
                        <th className='border-l-[1px] border-black w-[20%]'>Due Date</th>
                        <th className='border-l-[1px] border-black w-[60%]'>Customer Name</th>
                    </tr>}
                details={receivables.map((receivable, index) => (
                    <tr key={index}>
                        <td>{index + 1}</td>
                        <td className='border-l-[1px] border-black p-1'>{receivable.invoice.invoice_no}</td>
                        <td className='border-l-[1px] border-black p-1'>{receivable.due_date}</td>
                        <td className='border-l-[1px] border-black p-1'>{receivable.customer.customer_name}</td>
                    </tr>
                    ))} 
            />
            <HomePageDetails title='Accounts Payables' 
                headings={
                    <tr>
                        <th className='w-[5%]'>#</th>
                        <th className='border-l-[1px] border-black w-[15%]'>Invoice No</th>
                        <th className='border-l-[1px] border-black w-[20%]'>Due Date</th>
                        <th className='border-l-[1px] border-black w-[60%]'>Vendor Name</th>
                    </tr>}
                details={payables.map((payable, index) => (
                    <tr key={index}>
                        <td>{index + 1}</td>
                        <td className='border-l-[1px] border-black p-1'>{payable.invoice.invoice_no}</td>
                        <td className='border-l-[1px] border-black p-1'>{payable.due_date}</td>
                        <td className='border-l-[1px] border-black p-1'>{payable.vendor.vendor_name}</td>
                    </tr>
                    ))} 
            />
            </div>
        </div>
    </>
)}

export default HomePage