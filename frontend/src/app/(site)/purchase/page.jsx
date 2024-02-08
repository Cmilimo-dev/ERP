'use client'

import React from 'react'
import { any, z } from 'zod'
import { PurchaseBasedForm } from '@/components/forms'

const schema = z.object({
    invoice_no: any(),
    purchase_no: any().optional(),
    invoice_date: any().optional(),
    total: any().optional(),
    vat: any().optional(),
    discount: any().optional(),
    roundoff: any().optional(),
    net_amount: any().optional(),
    amount_payed: any().optional(),
    balance: any().optional(),
    payment_method: any().optional(),
    vendor: any().optional(),
    salesman: any().optional(),
    cheque_no: any().optional(),
    cheque_date: any().optional(),
})


const Purchase = () => {

    return <PurchaseBasedForm 
            module='purchase' 
            schema={schema} 
            />
}

export default Purchase