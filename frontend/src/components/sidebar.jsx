import React, { forwardRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import logo from '../../public/logo.svg'
import product from '../../public/product.svg'
import customer from '../../public/customer.svg'
import vendor from '../../public/vendor.svg'
import sales from '../../public/sales.svg'
import purchase from '../../public/purchase.svg'
import sales_return from '../../public/sales_return.svg'
import purchase_return from '../../public/purchase_return.svg'
import quotation from '../../public/quotation.svg'
import preforma_invoice from '../../public/preforma_invoice.svg'
import sales_order from '../../public/sales_order.svg'
import delivery_note from '../../public/delivery_note.svg'
import rfq from '../../public/rfq.svg'
import purchase_order from '../../public/purchase_order.svg'
import payment from '../../public/payment.svg'
import receipt from '../../public/receipt.svg'
import chart_of_accounts from '../../public/chart_of_accounts.svg'
import journal_voucher from '../../public/journal_voucher.svg'

const Sidebar = forwardRef(({className, onClose}, ref) => {
    const handleLinkClick = useCallback(() => {
        if (document.documentElement.clientWidth <= 768) {
          onClose(); // Close the sidebar when a link is clicked
        }
    }, [onClose]);
    
return (
<aside className={className} ref={ref}>
    <div className='mx-[auto] mt-3'>
        <Link href='/' onClick={handleLinkClick} className='flex p-1 ml-1 rounded-xl'>
            <Image src={logo} alt="logo" className='w-[50px] h-[50px]' />
        </Link>
    </div>

    <div className='mt-3 border-blue-200 border-t-[1px]'>
        <Link href='/product' onClick={handleLinkClick} className='flex p-1 ml-1 rounded-xl hover:bg-[#2e4263]'>
            <span><Image src={product} alt="product" className='w-[15px] h-[15px] ml-2 mt-1' /></span>
            <span className='ml-2'>Product</span>
        </Link>
        <Link href='/customer' onClick={handleLinkClick} className='flex p-1 ml-1 rounded-xl hover:bg-[#2e4263]'>
            <span><Image src={customer} alt="customer" className='w-[15px] h-[15px] ml-2 mt-1' /></span>
            <span className='ml-2'>Customer</span>
        </Link>
        <Link href='/vendor' onClick={handleLinkClick} className='flex p-1 ml-1 rounded-xl hover:bg-[#2e4263]'>
            <span><Image src={vendor} alt="vendor" className='w-[15px] h-[15px] ml-2 mt-1' /></span>
            <span className='ml-2'>Vendor</span>
        </Link>
    </div>

    <div className='mt-3 border-blue-200 border-t-[1px]'>
        <Link href='/sales' onClick={handleLinkClick} className='flex p-1 ml-1 rounded-xl hover:bg-[#2e4263]'>
            <span><Image src={sales} alt="sales" className='w-[15px] h-[15px] ml-2 mt-1' /></span>
            <span className='ml-2'>Sales</span>
        </Link>
        <Link href='/purchase' onClick={handleLinkClick} className='flex p-1 ml-1 rounded-xl hover:bg-[#2e4263]'>
            <span><Image src={purchase} alt="purchase" className='w-[15px] h-[15px] ml-2 mt-1' /></span>
            <span className='ml-2'>Purchase</span>
        </Link>
        <Link href='/sales_return' onClick={handleLinkClick} className='flex p-1 ml-1 rounded-xl hover:bg-[#2e4263]'>
            <span><Image src={sales_return} alt="sales_return" className='w-[15px] h-[15px] ml-2 mt-1' /></span>
            <span className='ml-2'>Sales Return</span>
        </Link>
        <Link href='/purchase_return' onClick={handleLinkClick} className='flex p-1 ml-1 rounded-xl hover:bg-[#2e4263]'>
            <span><Image src={purchase_return} alt="purchase_return" className='w-[15px] h-[15px] ml-2 mt-1' /></span>
            <span className='ml-2'>Purchase Return</span>
        </Link>
    </div>

    <div className='mt-3 border-blue-200 border-t-[1px]'>
        <Link href='/quotation' onClick={handleLinkClick} className='flex p-1 ml-1 rounded-xl hover:bg-[#2e4263]'>
            <span><Image src={quotation} alt="quotation" className='w-[15px] h-[15px] ml-2 mt-1' /></span>
            <span className='ml-2'>Quotation</span>
        </Link>
        <Link href='/preforma_invoice' onClick={handleLinkClick} className='flex p-1 ml-1 rounded-xl hover:bg-[#2e4263]'>
            <span><Image src={preforma_invoice} alt="preforma_invoice" className='w-[15px] h-[15px] ml-2 mt-1' /></span>
            <span className='ml-2'>Preforma Invoice</span>
        </Link>
        <Link href='/sales_order' onClick={handleLinkClick} className='flex p-1 ml-1 rounded-xl hover:bg-[#2e4263]'>
            <span><Image src={sales_order} alt="sales_order" className='w-[15px] h-[15px] ml-2 mt-1' /></span>
            <span className='ml-2'>Sales Order</span>
        </Link>
        <Link href='/delivery_note' onClick={handleLinkClick} className='flex p-1 ml-1 rounded-xl hover:bg-[#2e4263]'>
            <span><Image src={delivery_note} alt="delivery_note" className='w-[15px] h-[15px] ml-2 mt-1' /></span>
            <span className='ml-2'>Delivery Note</span>
        </Link>
        <Link href='/rfq' onClick={handleLinkClick} className='flex p-1 ml-1 rounded-xl hover:bg-[#2e4263]'>
            <span><Image src={rfq} alt="rfq" className='w-[15px] h-[15px] ml-2 mt-1' /></span>
            <span className='ml-2'>RFQ</span>
        </Link>
        <Link href='/purchase_order' onClick={handleLinkClick} className='flex p-1 ml-1 rounded-xl hover:bg-[#2e4263]'>
            <span><Image src={purchase_order} alt="purchase_order" className='w-[15px] h-[15px] ml-2 mt-1' /></span>
            <span className='ml-2'>Purchase Order</span>
        </Link>
    </div>

    <div className='mt-3 border-blue-200 border-t-[1px]'>
        <Link href='/payment' onClick={handleLinkClick} className='flex p-1 ml-1 rounded-xl hover:bg-[#2e4263]'>
            <span><Image src={payment} alt="payment" className='w-[15px] h-[15px] ml-2 mt-1' /></span>
            <span className='ml-2'>Payment</span>
        </Link>
        <Link href='/receipt' onClick={handleLinkClick} className='flex p-1 ml-1 rounded-xl hover:bg-[#2e4263]'>
            <span><Image src={receipt} alt="receipt" className='w-[15px] h-[15px] ml-2 mt-1' /></span>
            <span className='ml-2'>Receipt</span>
        </Link>
    </div>
    
    <div className='mt-3 border-blue-200 border-t-[1px]'>
        <Link href='/chart_of_accounts' onClick={handleLinkClick} className='flex p-1 ml-1 rounded-xl hover:bg-[#2e4263]'>
            <span><Image src={chart_of_accounts} alt="chart_of_accounts" className='w-[15px] h-[15px] ml-2 mt-1' /></span>
            <span className='ml-2'>Chart Of Accounts</span>
        </Link>
        <Link href='/journal_voucher' onClick={handleLinkClick} className='flex p-1 ml-1 rounded-xl hover:bg-[#2e4263]'>
            <span><Image src={journal_voucher} alt="journal_voucher" className='w-[15px] h-[15px] ml-2 mt-1' /></span>
            <span className='ml-2'>Journal Voucher</span>
        </Link>
    </div>
</aside>
)})
Sidebar.displayName = 'Sidebar'

export default Sidebar
