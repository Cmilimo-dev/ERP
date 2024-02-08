'use client'
import React from 'react'
import { any, z } from 'zod'
import { SalesBasedForm } from '@/components/forms'

const schema = z.object({
    preforma_no: any(),
    preforma_date: any().optional(),
    total: any().optional(),
    vat: any().optional(),
    discount: any().optional(),
    roundoff: any().optional(),
    net_amount: any().optional(),
    customer: any().optional(),
    salesman: any().optional(),
})


const Preforma = () => {

    return <SalesBasedForm 
            module='preforma' 
            schema={schema} 
            />
}

export default Preforma