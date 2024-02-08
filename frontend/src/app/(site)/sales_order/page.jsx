'use client'

import React from 'react'
import { any, z } from 'zod'
import { SalesBasedForm } from '@/components/forms'

const schema = z.object({
    order_no: any(),
    order_date: any().optional(),
    total: any().optional(),
    vat: any().optional(),
    discount: any().optional(),
    roundoff: any().optional(),
    net_amount: any().optional(),
    customer: any().optional(),
    salesman: any().optional(),
})


const SalesOrder = () => {
    
    return <SalesBasedForm 
            module='sales_order' 
            schema={schema} 
            />
}

export default SalesOrder