'use client'

import React from 'react'
import { any, z } from 'zod'
import { SalesBasedForm } from '@/components/forms'

const schema = z.object({
    quotation_no: any(),
    quotation_date: any().optional(),
    valid_till: any().optional(),
    total: any().optional(),
    vat: any().optional(),
    discount: any().optional(),
    roundoff: any().optional(),
    net_amount: any().optional(),
    customer: any().optional(),
    salesman: any().optional(),
})


const Quotation = () => {

    return <SalesBasedForm 
        module='quotation' 
        schema={schema} 
        />
}

export default Quotation