'use client'

import React from 'react'
import { any, string, z } from 'zod'
import { CustomerVendorForm } from '@/components/forms'

const schema = z.object({
    vendor_code: string().min(1, { message: 'Vendor code is required' }),
    vendor_name: string().min(1, { message: 'Vendor name is required' }),
    address: string().min(1, { message: 'Address is required' }),
    city: string().optional(),
    state: string().optional(),
    country: string().optional(),
    contact_person: string().optional(),
    mobile: string().min(1, { message: 'Mobile no is required' }),
    telephone: string().optional(),
    email: string().email().min(1, { message: 'Email is required' }),
    credit_alert: string().optional(),
    credit_block: string().optional(),
    credit_days: any().optional(),
    credit_balance: string().optional(),
})


const Vendor = () => {
    return <CustomerVendorForm 
            module='vendor'
            schema={schema}
            />
}

export default Vendor