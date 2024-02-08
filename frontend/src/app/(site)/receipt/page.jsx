'use client'

import React from 'react'
import { any, z } from 'zod'
import { PaymentReceiptForm } from '@/components/forms'

const schema = z.object({
    receipt_no: any(),
    receipt_date: any(),
    is_customer: any(),
    customer: any().optional(),
    receipt_from: any().optional(),
    payment_method: any().optional(),
    amount: any().optional(),
    discount: any().optional(),
    cheque_no: any().optional(),
    cheque_date: any().optional(),
}).refine((data) => {
    if (data.is_customer && data.customer == '') {
        return {message: 'Customer is required',
        path: ['is_customer']}
    } else if (!data.is_customer && data.receipt_from == '') {
        return{message: 'Receipt from is required',
        path: ['receipt_from']}
    }
    return true
})


const Receipt = () => {
    return <PaymentReceiptForm
            module='receipt'
            schema={schema}
            />
}

export default Receipt