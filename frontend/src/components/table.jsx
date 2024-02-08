'use client'

import { cn } from '@/lib/utils'
import React from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { ComboField, NumberField, TextComboField, TextField } from './form_fields'
import { HTML5Backend } from 'react-dnd-html5-backend'

const Table = ({ headings, values }) => {
    return (
        <table className='text-sm font-sans border-collapse'>
        <thead>
            <tr className='border-b border-t border-slate-400'>
                <th className="w-[4%]">#</th>
                {headings.map((heading, index) => (
                    <th key={index} className={cn('border-l border-slate-400', heading.className)}>{heading.text}</th>
                    ))}
            </tr>
        </thead>
        <tbody>
        <DndProvider backend={HTML5Backend}>
            {values}
        </DndProvider>
        </tbody>
    </table>
)}

const DraggableRow = ({ index, moveRow, children }) => {
    const [{ isDragging }, drag] = useDrag({
        type: 'ROW',
        item: { index },
        collect: (monitor) => ({
        isDragging: monitor.isDragging(),
        }),
    });

    const [, drop] = useDrop({
        accept: 'ROW',
        hover: (item) => {
        const draggedIndex = item.index;
        const targetIndex = index;

        if (draggedIndex !== targetIndex) {
            moveRow(draggedIndex, targetIndex);
            item.index = targetIndex;
        }
        },
    });

    return (
        <tr ref={(node) => drag(drop(node))} style={{ opacity: isDragging ? 0.5 : 1 }}>
        {children}
        </tr>
    );
};

export const ProductTable = ({ tableData, inputChange, lastCellLeave, firstCellLeave, moveRow, control, units, isView=false }) => {
    const mulitpleControllerName = (index) => { 
        return {name: `tableData[${index}[1]].multiple`}
    }

    return (<Table
        headings={[
            { className: 'w-[45%]', text: 'Unit' },
            { className: 'w-[28%]', text: 'Multiple' },
            { className: 'w-[45%]', text: 'Multiple Value' },
        ]}
        values={isView?
            tableData.map((row, index) => (
                <tr key={index}>
                    <td className='flex justify-center border-b border-slate-400'>{index + 1}</td>
                    
                    <td className='border-l border-slate-400 border-b'>
                        <TextField
                        className="w-full ml-2 outline-none bg-[#e6ecf4] pointer-events-none"
                        tabIndex='-1'
                        readOnly
                        value={row.unit} />
                    </td>
                    
                    <td className='border-l border-slate-400 border-b'>
                        <TextField
                        className="w-full ml-2 outline-none bg-[#e6ecf4] pointer-events-none"
                        tabIndex='-1'
                        readOnly
                        value={row.multiple} />
                    </td>
                    
                    <td className='border-l border-slate-400 border-b'>
                        <TextField
                        className="w-full ml-2 outline-none bg-[#e6ecf4] pointer-events-none"
                        tabIndex='-1'
                        readOnly
                        value={row.multiple_value} />
                    </td>
                </tr>
            ))
            :
            tableData.map((row, index) => (
            <DraggableRow key={index} index={index} moveRow={moveRow}>
                <td className='flex justify-center border-b border-slate-400'>{index + 1}</td>
                <td className='border-l border-slate-400 border-b'>
                <TextComboField
                    className="w-full ml-2 outline-none bg-[#e6ecf4]"
                    name={`tableData[${index}[0]].unit`}
                    listName='units'
                    values={units}
                    onBlur={() => firstCellLeave(index)}
                    onChange={(e) => inputChange(e.target.value, index, 'unit')}
                    value={row.unit}
                />
                </td>
                <td className='border-l border-slate-400 border-b'>
                <ComboField
                    control={control}
                    className="w-full ml-2 outline-none bg-[#e6ecf4] uppercase"
                    name={mulitpleControllerName(index)}
                    values={['*', '/']}
                    onChange={(e) => inputChange(e.target.value, index, 'multiple')}
                    value={row.multiple}
                />
                </td>
                <td className='border-l border-b border-slate-400'>
                <NumberField
                    className="w-full ml-2 outline-none bg-[#e6ecf4] text-right"
                    onKeyDown={(e) => lastCellLeave(e, index)}
                    name={`tableData[${index}][2].multiple_value`}
                    onChange={(e) => inputChange(e.target.value, index, 'multiple_value')}
                    value={row.multiple_value}
                />
                </td>
            </DraggableRow>
            ))}
    />
    );
}

export const SalesBasedTable = ({ tableData, inputChange, lastCellLeave, firstCellLeave, moveRow, products, isView=false }) => {
    return (<Table
        headings={[
            { className: 'w-[9%]', text: 'Product Code' },
            { className: 'w-[24%]', text: 'Product Name' },
            { className: 'w-[9%]', text: 'Unit' },
            { className: 'w-[9%]', text: 'Qty' },
            { className: 'w-[9%]', text: 'Price' },
            { className: 'w-[9%]', text: 'Discount' },
            { className: 'w-[9%]', text: 'VAT %' },
            { className: 'w-[9%]', text: 'VAT' },
            { className: 'w-[9%]', text: 'Total' },
        ]}
        values={isView?
            tableData.map((row, index) => (
                <tr key={index}>
                    <td className='flex justify-center border-b border-slate-400'>{index + 1}</td>
                    
                    <td className='border-l border-slate-400 border-b'>
                        <TextField
                        className="w-full ml-2 outline-none bg-[#e6ecf4] pointer-events-none"
                        tabIndex='-1'
                        readOnly
                        value={row.product_code} />
                    </td>
                    
                    <td className='border-l border-slate-400 border-b'>
                        <TextField
                        className="w-full ml-2 outline-none bg-[#e6ecf4] pointer-events-none"
                        tabIndex='-1'
                        readOnly
                        value={row.product_name} />
                    </td>
                    
                    <td className='border-l border-slate-400 border-b'>
                        <TextField
                        className="w-full ml-2 outline-none bg-[#e6ecf4] pointer-events-none"
                        tabIndex='-1'
                        readOnly
                        value={row.unit} />
                    </td>
                    
                    <td className='border-l border-slate-400 border-b'>
                        <TextField
                        className="w-full ml-2 outline-none bg-[#e6ecf4] pointer-events-none"
                        tabIndex='-1'
                        readOnly
                        value={row.qty} />
                    </td>
                    
                    <td className='border-l border-slate-400 border-b'>
                        <TextField
                        className="w-full ml-2 outline-none bg-[#e6ecf4] pointer-events-none"
                        tabIndex='-1'
                        readOnly
                        value={row.price} />
                    </td>
                    
                    <td className='border-l border-slate-400 border-b'>
                        <TextField
                        className="w-full ml-2 outline-none bg-[#e6ecf4] pointer-events-none"
                        tabIndex='-1'
                        readOnly
                        value={row.item_discount} />
                    </td>
                    
                    <td className='border-l border-slate-400 border-b'>
                        <TextField
                        className="w-full ml-2 outline-none bg-[#e6ecf4] pointer-events-none"
                        tabIndex='-1'
                        readOnly
                        value={row.vat_perc} />
                    </td>
                    
                    <td className='border-l border-slate-400 border-b'>
                        <TextField
                        className="w-full ml-2 outline-none bg-[#e6ecf4] pointer-events-none"
                        tabIndex='-1'
                        readOnly
                        value={row.item_vat} />
                    </td>
                    
                    <td className='border-l border-slate-400 border-b'>
                        <TextField
                        className="w-full ml-2 outline-none bg-[#e6ecf4] pointer-events-none"
                        tabIndex='-1'
                        readOnly
                        value={row.item_total} />
                    </td>
                </tr>
            ))
            :
            tableData.map((row, index) => (
            <DraggableRow key={index} index={index} moveRow={moveRow}>
                <td className='flex justify-center border-b border-slate-400'>{index + 1}</td>
                <td className='border-l border-slate-400 border-b'>
                <TextComboField 
                className="w-full ml-2 outline-none bg-[#e6ecf4]" 
                name={`tableData[${index}[0]].product_code`}
                listName='products'
                values={products}
                onBlur={(e) => firstCellLeave(e.target.value, index)}
                onChange={(e) => inputChange(e.target.value, index, 'product_code')}
                value={row.product_code} />
                </td>
                <td className='border-l border-slate-400 border-b'>
                <TextField 
                className="w-full ml-2 outline-none bg-[#e6ecf4]" 
                name={`tableData[${index}[1]].product_name`}
                onChange={(e) => inputChange(e.target.value, index, 'product_name')}
                value={row.product_name} />
                </td>
                <td className='border-l border-slate-400 border-b'>
                <TextComboField
                    className="w-full ml-2 outline-none bg-[#e6ecf4]"
                    name={`tableData[${index}[2]].unit`}
                    listName={`units${index}`}
                    values={row.units.map(unit => unit.unit)}
                    onChange={(e) => inputChange(e.target.value, index, 'unit')}
                    value={row.unit}
                />
                </td>
                <td className='border-l border-slate-400 border-b'>
                <NumberField
                    className="w-full ml-2 outline-none bg-[#e6ecf4]"
                    name={`tableData[${index}[3]].qty`}
                    onChange={(e) => inputChange(e.target.value, index, 'qty')}
                    value={row.qty}
                />
                </td>
                <td className='border-l border-slate-400 border-b'>
                <NumberField
                    className="w-full ml-2 outline-none pointer-events-none bg-[#e6ecf4]"
                    name={`tableData[${index}[4]].price`}
                    onChange={(e) => inputChange(e.target.value, index, 'price')}
                    value={row.price}
                />
                </td>
                <td className='border-l border-slate-400 border-b'>
                <NumberField
                    className="w-full ml-2 outline-none pointer-events-none bg-[#e6ecf4]"
                    name={`tableData[${index}[5]].item_discount`}
                    onChange={(e) => inputChange(e.target.value, index, 'item_discount')}
                    value={row.item_discount}
                    onKeyDown={(e) => lastCellLeave(e, index)}
                />
                </td>
                <td className='border-l border-slate-400 border-b'>
                <NumberField
                    className="w-full ml-2 outline-none pointer-events-none bg-[#e6ecf4]"
                    tabIndex="-1"
                    name={`tableData[${index}[6]].vat_perc`}
                    onChange={(e) => inputChange(e.target.value, index, 'vat_perc')}
                    value={row.vat_perc}
                />
                </td>
                <td className='border-l border-slate-400 border-b'>
                <NumberField
                    className="w-full ml-2 outline-none pointer-events-none bg-[#e6ecf4]"
                    tabIndex="-1"
                    name={`tableData[${index}[7]].item_vat`}
                    onChange={(e) => inputChange(e.target.value, index, 'item_vat')}
                    value={row.item_vat}
                />
                </td>
                <td className='border-l border-slate-400 border-b'>
                <NumberField
                    className="w-full ml-2 outline-none pointer-events-none bg-[#e6ecf4]"
                    tabIndex="-1"
                    name={`tableData[${index}[8]].item_total`}
                    onChange={(e) => inputChange(e.target.value, index, 'item_total')}
                    value={row.item_total}
                />
                </td>
            </DraggableRow>
            ))}
    />
    );
}

export const RFQTable = ({ tableData, inputChange, lastCellLeave, firstCellLeave, moveRow, products, isView=false }) => {
    return (<Table
        headings={[
            { className: 'w-[25%]', text: 'Product Code' },
            { className: 'w-[45%]', text: 'Product Name' },
            { className: 'w-[15%]', text: 'Unit' },
            { className: 'w-[15%]', text: 'Qty' },
        ]}
        values={isView ? 
            tableData.map((row, index) => (
                <tr key={index} index={index}>
                    <td className='flex justify-center border-b border-slate-400'>{index + 1}</td>
                    <td className='border-l border-slate-400 border-b'>
                    <TextField 
                    className="w-full ml-2 outline-none bg-[#e6ecf4] pointer-events-none" 
                    name={`tableData[${index}[0]].product_code`}
                    tabIndex='-1'
                    readOnly
                    defaultValue={row.product_code} />
                    </td>
                    <td className='border-l border-slate-400 border-b'>
                    <TextField 
                    className="w-full ml-2 outline-none bg-[#e6ecf4] pointer-events-none" 
                    name={`tableData[${index}[1]].product_name`}
                    tabIndex='-1'
                    readOnly
                    defaultValue={row.product_name} />
                    </td>
                    <td className='border-l border-slate-400 border-b'>
                    <TextField
                        className="w-full ml-2 outline-none bg-[#e6ecf4] pointer-events-none"
                        name={`tableData[${index}[2]].unit`}
                        tabIndex='-1'
                        readOnly
                        defaultValue={row.unit}
                    />
                    </td>
                    <td className='border-l border-slate-400 border-b'>
                    <NumberField
                        className="w-full ml-2 outline-none bg-[#e6ecf4] pointer-events-none"
                        name={`tableData[${index}[3]].qty`}
                        defaultValue={row.qty}
                        tabIndex='-1'
                        readOnly
                    />
                    </td>
                </tr>
                ))
            : 
            tableData.map((row, index) => (
                <DraggableRow key={index} index={index} moveRow={moveRow}>
                    <td className='flex justify-center border-b border-slate-400'>{index + 1}</td>
                    <td className='border-l border-slate-400 border-b'>
                    <TextComboField 
                    className="w-full ml-2 outline-none bg-[#e6ecf4]" 
                    name={`tableData[${index}[0]].product_code`}
                    listName='products'
                    values={products}
                    onBlur={(e) => firstCellLeave(e.target.value, index)}
                    onChange={(e) => inputChange(e.target.value, index, 'product_code')}
                    value={row.product_code} />
                    </td>
                    <td className='border-l border-slate-400 border-b'>
                    <TextField 
                    className="w-full ml-2 outline-none bg-[#e6ecf4]" 
                    name={`tableData[${index}[1]].product_name`}
                    onChange={(e) => inputChange(e.target.value, index, 'product_name')}
                    value={row.product_name} />
                    </td>
                    <td className='border-l border-slate-400 border-b'>
                    <TextComboField
                        className="w-full ml-2 outline-none bg-[#e6ecf4]"
                        name={`tableData[${index}[2]].unit`}
                        listName={`units${index}`}
                        values={row.units.map(unit => unit.unit)}
                        onChange={(e) => inputChange(e.target.value, index, 'unit')}
                        value={row.unit}
                    />
                    </td>
                    <td className='border-l border-slate-400 border-b'>
                    <NumberField
                        className="w-full ml-2 outline-none bg-[#e6ecf4]"
                        name={`tableData[${index}[3]].qty`}
                        onChange={(e) => inputChange(e.target.value, index, 'qty')}
                        value={row.qty}
                        onKeyDown={(e) => lastCellLeave(e, index)}
                    />
                    </td>
                </DraggableRow>
            ))}
    />
    );
}

export const JVTable = ({ tableData, inputChange, lastCellLeave, firstCellLeave, moveRow, accounts, isView=false }) => {
    return (<Table
        headings={[
            { className: 'w-[20%]', text: 'Account Code' },
            { className: 'w-[35%]', text: 'Account Name' },
            { className: 'w-[15%]', text: 'Name' },
            { className: 'w-[15%]', text: 'Debit' },
            { className: 'w-[15%]', text: 'Credit' },
        ]}
        values={isView?
            tableData.map((row, index) => (
                <tr key={index}>
                    <td className='flex justify-center border-b border-slate-400'>{index + 1}</td>
                    
                    <td className='border-l border-slate-400 border-b'>
                        <TextField
                        className="w-full ml-2 outline-none bg-[#e6ecf4] pointer-events-none"
                        tabIndex='-1'
                        readOnly
                        value={row.account_code} />
                    </td>
                    
                    <td className='border-l border-slate-400 border-b'>
                        <TextField
                        className="w-full ml-2 outline-none bg-[#e6ecf4] pointer-events-none"
                        tabIndex='-1'
                        readOnly
                        value={row.account_name} />
                    </td>
                    
                    <td className='border-l border-slate-400 border-b'>
                        <TextField
                        className="w-full ml-2 outline-none bg-[#e6ecf4] pointer-events-none"
                        tabIndex='-1'
                        readOnly
                        value={row.name} />
                    </td>
                    
                    <td className='border-l border-slate-400 border-b'>
                        <TextField
                        className="w-full ml-2 outline-none bg-[#e6ecf4] pointer-events-none"
                        tabIndex='-1'
                        readOnly
                        value={row.debit} />
                    </td>
                    
                    <td className='border-l border-slate-400 border-b'>
                        <TextField
                        className="w-full ml-2 outline-none bg-[#e6ecf4] pointer-events-none"
                        tabIndex='-1'
                        readOnly
                        value={row.credit} />
                    </td>
                </tr>
            ))
            :
            tableData.map((row, index) => (
            <DraggableRow key={index} index={index} moveRow={moveRow}>
                <td className='flex justify-center border-b border-slate-400'>{index + 1}</td>
                
                <td className='border-l border-slate-400 border-b'>
                <TextComboField 
                className="w-full ml-2 outline-none bg-[#e6ecf4]" 
                name={`tableData[${index}[0]].account_code`}
                listName='accounts'
                values={accounts}
                onBlur={(e) => firstCellLeave(e.target.value, index)}
                onChange={(e) => inputChange(e.target.value, index, 'account_code')}
                value={row.account_code} />
                </td>
                
                <td className='border-l border-slate-400 border-b'>
                <TextField 
                className="w-full ml-2 outline-none bg-[#e6ecf4]" 
                name={`tableData[${index}[1]].account_name`}
                onChange={(e) => inputChange(e.target.value, index, 'account_name')}
                value={row.account_name} />
                </td>
                
                <td className='border-l border-slate-400 border-b'>
                <TextComboField
                    className="w-full ml-2 outline-none bg-[#e6ecf4]"
                    name={`tableData[${index}[2]].name`}
                    listName={`names${index}`}
                    values={row.names.map(name => name.name)}
                    onChange={(e) => inputChange(e.target.value, index, 'name')}
                    value={row.name}
                />
                </td>
                
                <td className='border-l border-slate-400 border-b'>
                <NumberField
                    className="w-full ml-2 outline-none bg-[#e6ecf4]"
                    name={`tableData[${index}[3]].debit`}
                    onChange={(e) => inputChange(e.target.value, index, 'debit')}
                    value={row.debit}
                />
                </td>
                
                <td className='border-l border-slate-400 border-b'>
                <NumberField
                    className="w-full ml-2 outline-none bg-[#e6ecf4]"
                    name={`tableData[${index}[4]].credit`}
                    onChange={(e) => inputChange(e.target.value, index, 'credit')}
                    value={row.credit}
                    onKeyDown={(e) => lastCellLeave(e, index)}
                />
                </td>
            </DraggableRow>
            ))}
    />
    );
}

export const PettyCashTable = ({ tableData, inputChange, lastCellLeave, firstCellLeave, moveRow, accounts, isView=false }) => {
    return (<Table
        headings={[
            { className: 'w-[20%]', text: 'Account Code' },
            { className: 'w-[30%]', text: 'Account Name' },
            { className: 'w-[20%]', text: 'Amount' },
            { className: 'w-[30%]', text: 'Remarks' },
        ]}
        values={isView?
            tableData.map((row, index) => (
                <tr key={index}>
                    <td className='flex justify-center border-b border-slate-400'>{index + 1}</td>
                    
                    <td className='border-l border-slate-400 border-b'>
                        <TextField
                        className="w-full ml-2 outline-none bg-[#e6ecf4] pointer-events-none"
                        tabIndex='-1'
                        readOnly
                        value={row.account_code} />
                    </td>
                    
                    <td className='border-l border-slate-400 border-b'>
                        <TextField
                        className="w-full ml-2 outline-none bg-[#e6ecf4] pointer-events-none"
                        tabIndex='-1'
                        readOnly
                        value={row.account_name} />
                    </td>
                    
                    <td className='border-l border-slate-400 border-b'>
                        <TextField
                        className="w-full ml-2 outline-none bg-[#e6ecf4] pointer-events-none"
                        tabIndex='-1'
                        readOnly
                        value={row.amount} />
                    </td>
                    
                    <td className='border-l border-slate-400 border-b'>
                        <TextField
                        className="w-full ml-2 outline-none bg-[#e6ecf4] pointer-events-none"
                        tabIndex='-1'
                        readOnly
                        value={row.remarks} />
                    </td>
                </tr>
            ))
            :
            tableData.map((row, index) => (
            <DraggableRow key={index} index={index} moveRow={moveRow}>
                <td className='flex justify-center border-b border-slate-400'>{index + 1}</td>
                
                <td className='border-l border-slate-400 border-b'>
                <TextComboField 
                className="w-full ml-2 outline-none bg-[#e6ecf4]" 
                name={`tableData[${index}[0]].account_code`}
                listName='accounts'
                values={accounts}
                onBlur={(e) => firstCellLeave(e.target.value, index)}
                onChange={(e) => inputChange(e.target.value, index, 'account_code')}
                value={row.account_code} />
                </td>
                
                <td className='border-l border-slate-400 border-b'>
                <TextField 
                className="w-full ml-2 outline-none bg-[#e6ecf4]" 
                name={`tableData[${index}[1]].account_name`}
                onChange={(e) => inputChange(e.target.value, index, 'account_name')}
                value={row.account_name} />
                </td>
                
                <td className='border-l border-slate-400 border-b'>
                <NumberField
                    className="w-full ml-2 outline-none bg-[#e6ecf4]"
                    name={`tableData[${index}[3]].amount`}
                    onChange={(e) => inputChange(e.target.value, index, 'amount')}
                    value={row.amount}
                />
                </td>
                
                <td className='border-l border-slate-400 border-b'>
                <TextField
                    className="w-full ml-2 outline-none bg-[#e6ecf4]"
                    name={`tableData[${index}[4]].remarks`}
                    onChange={(e) => inputChange(e.target.value, index, 'remarks')}
                    value={row.remarks}
                    onKeyDown={(e) => lastCellLeave(e, index)}
                />
                </td>
            </DraggableRow>
            ))}
    />
    );
}
