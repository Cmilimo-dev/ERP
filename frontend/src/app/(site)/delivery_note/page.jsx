'use client'

import React from 'react'
import { any, z } from 'zod'
import { SalesBasedForm } from '@/components/forms'

const schema = z.object({
    delivery_note_no: any(),
    delivery_note_date: any().optional(),
    total: any().optional(),
    vat: any().optional(),
    discount: any().optional(),
    roundoff: any().optional(),
    net_amount: any().optional(),
    customer: any().optional(),
    salesman: any().optional(),
})


const DeliveryNote = () => {
    
    return <SalesBasedForm 
            module='delivery_note' 
            schema={schema} 
            />   
}

export default DeliveryNote