'use client'

import { PurchaseBasedForm } from '@/components/forms'
import React from 'react'
import { any, z } from 'zod'

const schema = z.object({
    order_no: any(),
    order_date: any(),
    total: any(),
    vat: any(),
    discount: any(),
    roundoff: any(),
    net_amount: any(),
    vendor: any(),
    salesman: any()
})


const PurchaseOrder = () => {

    return <PurchaseBasedForm 
            module='purchase_order' 
            schema={schema} 
            />
}

export default PurchaseOrder