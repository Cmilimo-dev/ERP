'use client'

import React from 'react'
import { any, z } from 'zod'
import { SalesBasedForm } from '@/components/forms'

const schema = z.object({
    return_no: any(),
    invoice_date: any().optional(),
    invoice_no: any().optional(),
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
})


const SalesReturn = () => {

    return <SalesBasedForm 
        module='sales_return' 
        schema={schema} 
        />
}

export default SalesReturn