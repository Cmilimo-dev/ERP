'use client'

import { PurchaseBasedForm } from '@/components/forms'
import React from 'react'
import { any, z } from 'zod'

const schema = z.object({
    rfq_no: any(),
    rfq_date: any(),
    vendor: any(),
    salesman: any()
})


const RFQ = () => {

    return <PurchaseBasedForm 
            module='rfq' 
            schema={schema} 
            />
}

export default RFQ