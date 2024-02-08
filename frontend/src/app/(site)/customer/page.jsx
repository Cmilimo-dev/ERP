'use client'

import React from 'react'
import { any, string, z } from 'zod'
import { CustomerVendorForm } from '@/components/forms'

const schema = z.object({
    customer_code: string().min(1, { message: 'customer code is required' }),
    customer_name: string().min(1, { message: 'customer name is required' }),
    address: string().min(1, { message: 'Address is required' }),
    city: string().optional(),
    state: string().optional(),
    country: string().optional(),
    contact_person: string().optional(),
    mobile: string().min(1, { message: 'Mobile no is required' }),
    telephone: string().optional(),
    email: string().email().min(1, { message: 'Email is required' }),
    credit_alert: any().optional(),
    credit_block: any().optional(),
    credit_days: any().optional(),
    credit_balance: any().optional(),
})


const Customer = () => {
        return <CustomerVendorForm 
                module='customer'
                schema={schema}
                />
    }

export default Customer