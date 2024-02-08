import React, { forwardRef, useEffect, useState } from 'react';
import Button from './buttons';
import closeBtn from '../../public/close_btn.svg'
import Image from 'next/image';

export const MessageBox = forwardRef(({ message, onYes, isOpen, setIsOpen }, ref) => {

useEffect(() => {
        document.getElementById('btn_No').focus();
}, [])

return (
    <>
    <div className="absolute inset-0 backdrop-filter backdrop-blur-[1px]" />
    <div className="fixed inset-0 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" ref={ref}>
        <dialog className="bg-[#fafaf6] w-[15rem] md:w-[25rem] h-[10rem] p-4 rounded-lg border border-slate-400 shadow-2xl" open={isOpen}>
            <p className='flex justify-center items-center mt-3'>    
                {message}
            </p>
            <div className='flex gap-4 justify-center items-center mt-4'>
                <Button type="button" variant='danger' onClick={onYes} value='Yes' />
                <Button id='btn_No' type="button" variant='primary' onClick={() => setIsOpen(!isOpen)} value='No' />
            </div>
        </dialog>
    </div>
    </>
)});
MessageBox.displayName = "MessageBox"

export const ListBox = forwardRef(({ items, values, setSearchVal, setSearchIn }, ref) => {
    
useEffect(() => {
    document.getElementById('search-bar').focus();
}, [])

return (
    <>
    <div className="absolute inset-0 backdrop-filter backdrop-blur-[1px]" />
    <div className="fixed inset-0 mt-[-2rem] ml-[-5rem] z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" ref={ref}>
        <dialog className="bg-[#fafaf6] w-[25rem] md:w-[70rem] h-[33rem] p-4 rounded-lg overflow-auto list-scrollbar border border-slate-400 shadow-2xl"  open>
            <div className='flex w-full justify-between items-center'>
                <input id="search-bar"  placeholder='Search...' className='w-[75%] border-[1px] border-black rounded-md' type="text" onChange={(e) => setSearchVal(e.target.value)} />
                <select onChange={(e) => setSearchIn(e.target.value)} 
                    className='w-[20%] border-[1px] border-black rounded-md'>
                    <option value={''}>--</option>
                    {values.map((value, index) => (
                        <option value={value} key={index}>{value}</option>
                    ))}
                </select>
            </div>
            <table className='mt-2 w-full'>
                <tbody className='border-[1px] border-black'>
                    {items}
                </tbody>
            </table>
        </dialog>
    </div>
    </>
)});
ListBox.displayName = 'ListBox';

export const Toast = ({ message, onClose }) => {
    const [isOpen, setIsOpen] = useState(true);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
        setIsOpen(false);
        onClose();
        }, 2000);

        return () => clearTimeout(timeoutId);
    }, [onClose]);

    return (
        <dialog
        className="
        mx-[auto]
        w-[25rem]
        bottom-[2rem]
        z-[100]
        rounded-[15px] 
        shadow-[0px 0px 10px rgba(0, 0, 0, 0.2)]
        text-center fixed
        transition-bottom duration-500 ease-in-out"
        open={isOpen}
        >
        {message}
        </dialog>
    );
};

export const HelpBox = forwardRef(({ setHelpVisible }, ref) => {
    
    return (
        <>
        <div className="absolute inset-0 backdrop-filter backdrop-blur-[1px]" />
        <div className="fixed inset-0 mt-[-5rem] ml-[-5rem] z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" ref={ref}>
            <dialog className="bg-[#fafaf6] w-[25rem] md:w-[70rem] h-[40rem] p-4 rounded-lg overflow-auto list-scrollbar border border-slate-400 shadow-2xl"  open>
                <button type="button" className='float-right' onClick={() => setHelpVisible(false)}>
                <span><Image src={closeBtn} alt="close" className='w-[25px] h-[25px] ml-2 mt-1' /></span>
                </button>
                <h2 className='border-b border-slate-400 w-[9.5rem] mb-2'>🔶 Table Functions</h2>
                <p>🔹Tab =&gt; forward navigation</p>
                <p>🔹Shift + Tab =&gt; backward navigation</p>
                <p>🔹Dynamically added tables</p>
                <p>🔹Row is Added when leaving the current row with valid values</p>
                <p>🔹Rows are rearrangable by mouse drag and drop</p>
                <div className='border-2 border-gray-400 mt-2 mb-2' />
                <h2 className='border-b border-slate-400 w-[8.5rem] mb-2'>🔶 Shortcut Keys</h2>
                <p>🔹ctrl + G =&gt; Go To</p>
                <p>🔹ctrl + A =&gt; Add</p>
                <p>🔹ctrl + E =&gt; Edit</p>
                <p>🔹ctrl + D =&gt; Delete</p>
                <p>🔹ctrl + P =&gt; Print</p>
                <p>🔹ctrl + S =&gt; Save</p>
                <p>🔹ctrl + C =&gt; Cancel (Atleast 1 entry required)</p>
                <p>🔹ctrl + Arrow Left/Arrow Right =&gt; Previous And Next entry</p>
                <p>🔹ctrl + Arrow Up/Arrow Down =&gt; First And Last entry</p>
                <div className='border-2 border-gray-400 mt-2 mb-2' />
                <details>
                    <summary>Product</summary>
                    <p>🔹Save all the Products related to the business.</p>
                    <p>🔹Includes multiple types stockable, non-stockable, service and description-only.</p>
                    <p>🔹Includes multiple unit capability.</p>
                </details>
                <details>
                    <summary>Customer</summary>
                    <p>🔹Save customer informations related to the business.</p>
                    <p>🔹With Credit alert and block capability.</p>
                </details>
                <details>
                    <summary>Vendor</summary>
                    <p>🔹Save vendor informations related to the business.</p>
                    <p>🔹With Credit alert and block capability.</p>
                </details>
                <details>
                    <summary>Sales</summary>
                    <p>🔹Save sales to customers.</p>
                    <p>🔹Invoice Print capability.</p>
                </details>
                <details>
                    <summary>Purchase</summary>
                    <p>🔹Save purchase to vendors.</p>
                    <p>🔹Invoice Print capability.</p>
                </details>
                <details>
                    <summary>Sales Return</summary>
                    <p>🔹Save sales return from customers.</p>
                    <p>🔹Return Invoice Print capability.</p>
                </details>
                <details>
                    <summary>Purchase Return</summary>
                    <p>🔹Save purchase return from vendors.</p>
                    <p>🔹Return Invoice Print capability.</p>
                </details>
                <details>
                    <summary>Quotation</summary>
                    <p>🔹Quotation to customers.</p>
                    <p>🔹Quotation Print capability.</p>
                </details>
                <details>
                    <summary>Preforma</summary>
                    <p>🔹Preforma to customers.</p>
                    <p>🔹Preforma Print capability.</p>
                </details>
                <details>
                    <summary>Sales Order</summary>
                    <p>🔹Sales Orders from customers.</p>
                    <p>🔹Order Print capability.</p>
                </details>
                <details>
                    <summary>Delivery Note</summary>
                    <p>🔹Deliveries to customers.</p>
                    <p>🔹Delivery Note Print capability.</p>
                </details>
                <details>
                    <summary>RFQ</summary>
                    <p>🔹Request for Quotation to vendors.</p>
                    <p>🔹Request Print capability.</p>
                </details>
                <details>
                    <summary>Purchase Order</summary>
                    <p>🔹Purchase Orders to vendors.</p>
                    <p>🔹Order Print capability.</p>
                </details>
                <details>
                    <summary>Payment</summary>
                    <p>🔹Payment to vendors.</p>
                    <p>🔹Credit Balance and Accounts Payable view.</p>
                </details>
                <details>
                    <summary>Receipt</summary>
                    <p>🔹Receipt from customers.</p>
                    <p>🔹Credit Balance and Accounts Receivable view.</p>
                </details>
                <details>
                    <summary>Chart Of Accounts</summary>
                    <p>🔹List of All Accounts.</p>
                    <p>🔹Predefined non-deletable accounts.</p>
                    <p>🔹New Account creation.</p>
                </details>
                <details>
                    <summary>Journal Voucher</summary>
                    <p>🔹Saves Journal entries.</p>
                </details>
            </dialog>
        </div>
        </>
    )});
    HelpBox.displayName = 'HelpBox';

export const GoTo = forwardRef(({ items, values, setSearchVal, setSearchIn }, ref) => {
    
    return (
        <>
        <div className="absolute inset-0 backdrop-filter backdrop-blur-[1px]" />
        <div className="fixed inset-0 mt-[-2rem] ml-[-5rem] z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" ref={ref}>
            <dialog className="bg-[#fafaf6] w-[25rem] md:w-[70rem] h-[33rem] p-4 rounded-lg overflow-auto list-scrollbar border border-slate-400 shadow-2xl"  open>
                <div className='flex w-full justify-between items-center'>
                    <input  placeholder='Search...' className='w-[75%] border-[1px] border-black rounded-md' type="text" onChange={(e) => setSearchVal(e.target.value)} />
                    <select onChange={(e) => setSearchIn(e.target.value)} 
                        className='w-[20%] border-[1px] border-black rounded-md'>
                        <option value={''}>--</option>
                        {values.map((value, index) => (
                            <option value={value} key={index}>{value}</option>
                        ))}
                    </select>
                </div>
                
            </dialog>
        </div>
        </>
    )});
    GoTo.displayName = 'GoTo';