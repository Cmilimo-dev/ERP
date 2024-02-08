'use client'

import React from 'react'
import { any, z } from 'zod'
import { PaymentReceiptForm } from '@/components/forms'

const schema = z.object({
    payment_no: any(),
    payment_date: any(),
    is_vendor: any(),
    vendor: any().optional(),
    payment_to: any().optional(),
    payment_method: any().optional(),
    amount: any().optional(),
    discount: any().optional(),
    cheque_no: any().optional(),
    cheque_date: any().optional(),
}).refine((data) => {
    if (data.is_vendor && data.vendor == '') {
        return {message: 'Vendor is required',
        path: ['is_vendor']}
    } else if (!data.is_vendor && data.payment_to == '') {
        return{message: 'Payment to is required',
        path: ['payment_to']}
    }
    return true
})


const Payment = () => {
    
    return <PaymentReceiptForm
            module='payment'
            schema={schema} />

}

export default Payment