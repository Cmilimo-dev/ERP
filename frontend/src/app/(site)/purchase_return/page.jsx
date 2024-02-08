'use client'

import React from 'react'
import { any, z } from 'zod'
import { PurchaseBasedForm } from '@/components/forms'

const schema = z.object({
    return_no: any(),
    invoice_no: any(),
    purchase_no: any(),
    invoice_date: any(),
    total: any(),
    vat: any(),
    discount: any(),
    roundoff: any(),
    net_amount: any(),
    amount_payed: any(),
    balance: any(),
    payment_method: any(),
    vendor: any(),
    salesman: any(),
    cheque_no: any().optional(),
    cheque_date: any().optional(),
})


const PurchaseReturn = () => {

    return <PurchaseBasedForm 
            module='purchase_return' 
            schema={schema} 
            />
}

export default PurchaseReturn