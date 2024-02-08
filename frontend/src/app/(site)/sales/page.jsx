'use client'

import React from 'react'
import { any, z } from 'zod'
import { SalesBasedForm } from '@/components/forms'

const schema = z.object({
    invoice_no: any(),
    invoice_date: any().optional(),
    total: any().optional(),
    vat: any().optional(),
    discount: any().optional(),
    roundoff: any().optional(),
    net_amount: any().optional(),
    amount_received: any().optional(),
    balance: any().optional(),
    payment_method: any(),
    customer: any().optional(),
    salesman: any().optional(),
    cheque_no: any().optional(),
    cheque_date: any().optional(),
})


const Sales = () => {

    return <SalesBasedForm 
            module='sales' 
            schema={schema} 
            />
}

export default Sales