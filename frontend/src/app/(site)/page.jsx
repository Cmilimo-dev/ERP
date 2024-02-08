'use client';

import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2';
import "chart.js/auto";

const HomePageDetails = ({title, headings, details}) => {
    return  <div className='bg-white w-[20rem] md:w-[39rem] h-[20rem] rounded-md border-black border-[1px] p-1 shadow-lg overflow-auto list-scrollbar'>
                <h1 className='font-bold'>{title}</h1>
                <table className='w-full'>
                    <thead className='border-b-[1px] border-t-[1px] border-black'>
                        {headings}
                    </thead>
                    <tbody>
                        {details}
                    </tbody>
                </table>
            </div>
}

const HomePage = () => {

    const [orders, setOrders] = useState([])
    const [receivables, setReceivables] = useState([])
    const [payables, setPayables] = useState([])
    const [salesChange, setSalesChange] = useState([])

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}home_details`)
                setOrders(response.data.orders);
                setReceivables(response.data.receivables);  
                setPayables(response.data.payables);  
                setSalesChange(response.data.sales_change)
            } catch (error) {

            }
        }

        fetchData()
    }, [])

    // Extracting dates and amounts from salesChange
    const dates = salesChange.map(entry => entry.invoice_date);
    const amounts = salesChange.map(entry => parseFloat(entry.total_net_amount));

    // Creating data for Chart.js
    const data = {
        labels: dates,
        datasets: [
        {
            label: 'Total Sales',
            data: amounts,
            fill: false,
            borderColor: 'rgba(75,192,192,1)', // Line color
            pointBackgroundColor: 'rgba(75,192,192,1)', // Point color
            pointRadius: 6,
            pointHoverRadius: 8,
            borderWidth: 2,
        },
        ],
    };

    // Configuration options
    const options = {
        scales: {
        x: {
            type: 'category',
            labels: dates,
        },
        y: {
            beginAtZero: true,
            ticks: {
            callback: value => Math.ceil(value / 100) * 100, // Round to the next divisible number by 100
            },
        },
        },
    };


return (
    <>
        <div className='flex flex-col p-4 gap-5'>
            <div className='flex flex-col-reverse lg:flex-row gap-5'>
                <HomePageDetails title='Orders' 
                    headings={
                        <tr>
                            <th className='w-[5%]'>#</th>
                            <th className='border-l-[1px] border-black w-[15%]'>Order No</th>
                            <th className='border-l-[1px] border-black w-[20%]'>Order Date</th>
                            <th className='border-l-[1px] border-black w-[60%]'>Customer Name</th>
                        </tr>}
                    details={orders.map((order, index) => (
                        <tr key={index}>
                            <td>{index + 1}</td>
                            <td className='border-l-[1px] border-black p-1'>{order.order_no}</td>
                            <td className='border-l-[1px] border-black p-1'>{order.order_date}</td>
                            <td className='border-l-[1px] border-black p-1'>{order.customer_name}</td>
                        </tr>
                        ))} 
                />
                <div className='bg-white w-[20rem] md:w-[39rem] h-[20rem] rounded-xl border-[#15d52f] border-[1px] shadow-lg shadow-[#4c8b5532] p-1'>
                    <Line data={data} options={options} />
                </div>
            </div>
            <div className='flex flex-col lg:flex-row gap-5'>
            <HomePageDetails title='Accounts Receivables' 
                headings={
                    <tr>
                        <th className='w-[5%]'>#</th>
                        <th className='border-l-[1px] border-black w-[15%]'>Invoice No</th>
                        <th className='border-l-[1px] border-black w-[20%]'>Due Date</th>
                        <th className='border-l-[1px] border-black w-[60%]'>Customer Name</th>
                    </tr>}
                details={receivables.map((receivable, index) => (
                    <tr key={index}>
                        <td>{index + 1}</td>
                        <td className='border-l-[1px] border-black p-1'>{receivable.invoice.invoice_no}</td>
                        <td className='border-l-[1px] border-black p-1'>{receivable.due_date}</td>
                        <td className='border-l-[1px] border-black p-1'>{receivable.customer.customer_name}</td>
                    </tr>
                    ))} 
            />
            <HomePageDetails title='Accounts Payables' 
                headings={
                    <tr>
                        <th className='w-[5%]'>#</th>
                        <th className='border-l-[1px] border-black w-[15%]'>Invoice No</th>
                        <th className='border-l-[1px] border-black w-[20%]'>Due Date</th>
                        <th className='border-l-[1px] border-black w-[60%]'>Vendor Name</th>
                    </tr>}
                details={payables.map((payable, index) => (
                    <tr key={index}>
                        <td>{index + 1}</td>
                        <td className='border-l-[1px] border-black p-1'>{payable.invoice.invoice_no}</td>
                        <td className='border-l-[1px] border-black p-1'>{payable.due_date}</td>
                        <td className='border-l-[1px] border-black p-1'>{payable.vendor.vendor_name}</td>
                    </tr>
                    ))} 
            />
            </div>
        </div>
    </>
)}

export default HomePage


// import React, { useState, useEffect } from 'react';

// const VendorInput = ({ vendors }) => {
//   const [inputValue, setInputValue] = useState('');
//   const [suggestions, setSuggestions] = useState([]);

//   useEffect(() => {
//     // Filter vendors based on the input value
//     const filteredVendors = vendors.filter(
//       (vendor) =>
//         vendor.vendor_code.toLowerCase().includes(inputValue.toLowerCase()) ||
//         vendor.vendor_name.toLowerCase().includes(inputValue.toLowerCase())
//     );

//     setSuggestions(filteredVendors);
//   }, [inputValue, vendors]);

//   return (
//     <div>
//       <label htmlFor="vendorInput">Select a Vendor:</label>
//       <input
//         type="text"
//         id="vendorInput"
//         list="vendorSuggestions"
//         value={inputValue}
//         onChange={(e) => setInputValue(e.target.value)}
//       />
//       <datalist id="vendorSuggestions">
//         {suggestions.map((vendor) => (
//           <option key={vendor.id} value={vendor.vendor_name} />
//         ))}
//       </datalist>
//     </div>
//   );
// };

// const App = () => {
//   const vendors = [
//     {
//       id: 1,
//       vendor_code: 'V01',
//       vendor_name: 'VENDOR 1',
//       // ... other vendor properties
//     },
//     {
//       id: 2,
//       vendor_code: 'v110',
//       vendor_name: '001 vendor',
//       // ... other vendor properties
//     },
//     // ... additional vendors
//   ];

//   return (
//     <div>
//       <h1>Vendor Input Example</h1>
//       <VendorInput vendors={vendors} />
//       {/* Additional components or content */}
//     </div>
//   );
// };

// export default App;


// import React, { useEffect, useState } from 'react';


// import { TextField, NumberField, TextComboField, CheckBoxField, TextAreaField, ComboField } from '@/components/form_fields'
// import { useForm } from 'react-hook-form'
// import { zodResolver } from "@hookform/resolvers/zod"
// import { boolean, string, z } from 'zod'
// import axios from 'axios'
// import { Toast } from '@/components/popups'
// import Button from '@/components/buttons'
// import { ProductTable } from '@/components/table';

// const schema = z.object({
//     product_code: string().min(1, { message: 'jv no is required' }),
//     product_name: string().optional()
// })

// const Product = () => {
//   const { register, handleSubmit, control, formState } = useForm({ defaultValues: {}, resolver: zodResolver(schema) })

//     const { errors } = formState

//     const units = []
    
//     const [multipleUnit, setMultipleUnit] = useState(true);

//     const [tableData, setTableData] = useState([
//       { unit: '', multiple: '*', multiple_value: '' },
//     ]);

//   const handleInputChange = (value, rowIndex, col) => {
//     const newData = [...tableData];
//     newData[rowIndex][col] = value;
//     setTableData(newData);
//   };

//   const addRow = (event, rowIndex) => {
//     if (
//       event.key === 'Tab' &&
//       event.target.name === `tableData[${rowIndex}][2].multiple_value` &&
//       rowIndex === tableData.length - 1 &&
//       tableData[0].unit.trim() !== ''
//     ) {
//       const newData = [...tableData, { unit: '', multiple: '*', multiple_value: '' }];
//       setTableData(newData);
//     }
//   };

//   const removeRow = (rowIndex) => {
//     const newData = [...tableData];
//     const rowToDelete = newData[rowIndex];

//     // Check if the first column of the row is empty
//     if (!rowToDelete.unit.trim() && newData.length > 1) {
//       newData.splice(rowIndex, 1);
//       setTableData(newData);
//     }
//   };

//   const moveRow = (fromIndex, toIndex) => {
//     const newData = [...tableData];
//     const [movedRow] = newData.splice(fromIndex, 1);
//     newData.splice(toIndex, 0, movedRow);
//     setTableData(newData);
//   };

//   const cancelClick = () => {

//   };
    
//   const saveForm = async(formData) => {
//     console.log(formData, tableData);
//   };
  
//     return (
//       <>
//     <form method="POST" className='mt-4 ml-3' onSubmit={handleSubmit(saveForm)}>
//         <h1 className='font-black text-xl mb-4'>Product</h1>
//         <div className="flex justify-start">
//             <TextField label='Product Code' styles='w-[240px] rounded-[5px] uppercase' errors={errors.product_code} {...register('product_code')} />
//         </div>
//         <div className='w-[760px]'>
//         <ProductTable
//           tableData={tableData}
//           handleInputChange={handleInputChange}
//           addRow={addRow}
//           removeRow={removeRow}
//           moveRow={moveRow}
//           units={units}
//         />
//     </div>
//     <div className="flex justify-start mt-5">
//         <TextField label='Product Name' styles='w-[760px] rounded-[5px] uppercase' errors={errors.product_name} {...register('product_name')} />
//     </div>
//     <div className="flex justify-center items-center gap-4 mt-5 w-[760px]">
//         <Button type="submit" value='Save' variant='primary' />
//         <Button type="button" value='Cancel' variant='danger' />
//     </div>
// </form>
// </>
// )}

// export default Product



        
        
    // const addRow = (event, index) => {
    //   if (index === tableLength && event.key === 'Tab' && !event.shiftKey) {
    //     setTableData((prevData) => [
    //       ...prevData,
    //       { unit: '', multiple: '*', multiple_value: '' },
    //     ]);
    //     setTableLength(tableLength + 1);
    //   }
    // };

    // const [csrfToken, setCsrfToken] = useState('');
    
    // const getCookie = async () => {
    //     try {
    //     const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}get_cookie`);
    //     const data = await response.json();
    //     setCsrfToken(data.cookie);
    //     } catch (error) {
    //     console.error('Error fetching CSRF token:', error);
    //     }
    // };
    
    // // Call the function to fetch the CSRF token
    // useEffect(() => {
    //     getCookie();
    // }, []); // Run the effect only once on component mount
    // useEffect(() => {
    //   console.log(tableData)
    // }, [tableData])
    
    // const removeRow = (value) => {
    //   if (value === '' && tableLength > 1) {
    //     setTableData((prevData) => {
    
    //       let updatedData = prevData.filter((i) => {
    //         return i.unit !== '';
    //       });
    
    //       setTableLength(tableLength - 1);
    //       return updatedData.length > 0 ? updatedData : [{ unit: '', multiple: '*', multiple_value: '' }];
    //     });
    //   }
    // };

    // const unitInput = (value, index) => {
    //   setTableData((prevData) => {
    //     const updatedData = [...prevData];
    //     updatedData[index] = { ...updatedData[index], unit: value };
    //     return updatedData;
    //   });
    // };

    // const multipleChange = (value, index) => {
    //   setTableData((prevData) => {
    //     const updatedData = [...prevData];
    //     updatedData[index] = { ...updatedData[index], multiple: value };
    //     return updatedData;
    //   });
    // };

    // const multipleValueInput = (value, index) => {
    //   setTableData((prevData) => {
    //     const updatedData = [...prevData];
    //     updatedData[index] = { ...updatedData[index], multiple_value: value };
    //     return updatedData;
    //   });
    // };

    // const cancelClick = () => {
        
    // };
    
    // const saveForm = async(formData) => {
    //   console.log(formData);
    // };

    // return (
    // <>
    // <form method="POST" className='mt-4 ml-3' onSubmit={handleSubmit(saveForm)}>
    //     <h1 className='font-black text-xl mb-4'>Product</h1>
    //     <div className="flex justify-start">
    //         <TextField label='Product Code' styles='w-[240px] rounded-[5px] uppercase' errors={errors.product_code} {...register('product_code')} />
    //         <TextComboField styles='w-[240px] rounded-[5px]' label="Main Unit" {...register(`main_unit`)} values={units} />
    //         <CheckBoxField checked={multipleUnit? true:false}
    //             label="Multiple Units" 
    //             control={control}
    //             onChange={() => setMultipleUnit(!multipleUnit)} 
    //             name={register('multiple_units')} 
    //         />
    //     </div>
    //     <div className='w-[760px]'>
    //     {multipleUnit && <Table
    //       headings={[
    //         { styles: 'w-[45%]', text: 'Unit' },
    //         { styles: 'w-[28%]', text: 'Multiple' },
    //         { styles: 'w-[45%]', text: 'Multiple Value' },
    //       ]}
    //       values={tableData.map((rowData, index) => (
    //       <DraggableRow className='border-b-[1px] border-slate-400' key={index}>
          
    //       </DraggableRow>))}
    //     />}
        {/* </div>
        <div className="flex justify-start mt-5">
            <TextField label='Product Name' styles='w-[760px] rounded-[5px] uppercase' errors={errors.product_name} {...register('product_name')} />
        </div>
        <div className="flex justify-start mt-5">
            <TextAreaField label='Description' styles='w-[760px] rounded-[5px]' errors={errors.description} {...register('description')} />
        </div>
        <div className="flex justify-start mt-4">
          <NumberField label='Stock' styles='w-[240px] rounded-[5px]' errors={errors.stock} {...register('stock')} />
          <NumberField label='Cost Price' styles='w-[240px] rounded-[5px]' errors={errors.cost_price} {...register('cost_price')} />
          <NumberField label='Selling Price' styles='w-[240px] rounded-[5px]' errors={errors.selling_price} {...register('selling_price')} />
        </div>
        <div className="flex justify-start mt-5">
            <TextField label='Vendor' styles='w-[500px] rounded-[5px]' errors={errors.vendor} {...register('vendor')} />
        </div>
        <div className="flex justify-start mt-5">
            <TextField label='Category' styles='w-[500px] rounded-[5px]' errors={errors.category} {...register('category')} />
        </div>
        <div className="flex justify-center items-center gap-4 mt-5 w-[760px]">
            <Button type="submit" value='Save' variant='primary' />
            <Button type="button" value='Cancel' variant='danger' />
        </div>
    </form>
    </>
)}

export default Product */}



// import { DndProvider, useDrag, useDrop } from 'react-dnd';
// import { HTML5Backend } from 'react-dnd-html5-backend';

// const DraggableRow = ({ index, moveRow, children }) => {
//   const [{ isDragging }, drag] = useDrag({
//     type: 'ROW',
//     item: { index },
//     collect: (monitor) => ({
//       isDragging: monitor.isDragging(),
//     }),
//   });

//   const [, drop] = useDrop({
//     accept: 'ROW',
//     hover: (item) => {
//       const draggedIndex = item.index;
//       const targetIndex = index;

//       if (draggedIndex !== targetIndex) {
//         moveRow(draggedIndex, targetIndex);
//         item.index = targetIndex;
//       }
//     },
//   });

//   return (
//     <tr ref={(node) => drag(drop(node))} style={{ opacity: isDragging ? 0.5 : 1 }}>
//       {children}
//     </tr>
//   );
// };

// const DynamicTable = () => {
//   const [tableData, setTableData] = useState([{ col1: '', col2: '', col3: '' }]);

//   const handleInputChange = (value, rowIndex, colIndex) => {
//     const newData = [...tableData];
//     newData[rowIndex][colIndex] = value;
//     setTableData(newData);
//   };

//   const handleTabPress = (event, rowIndex) => {
//     if (
//       event.key === 'Tab' &&
//       event.target.name === `col${rowIndex}-2` &&
//       rowIndex === tableData.length - 1 &&
//       tableData[0].col1.trim() !== ''
//     ) {
//       const newData = [...tableData, { col1: '', col2: '', col3: '' }];
//       setTableData(newData);
//     }
//   };

//   const handleInputBlur = (rowIndex) => {
//     const newData = [...tableData];
//     const rowToDelete = newData[rowIndex];

//     // Check if the first column of the row is empty
//     if (!rowToDelete.col1.trim() && newData.length > 1) {
//       newData.splice(rowIndex, 1);
//       setTableData(newData);
//     }
//   };

//   const moveRow = (fromIndex, toIndex) => {
//     const newData = [...tableData];
//     const [movedRow] = newData.splice(fromIndex, 1);
//     newData.splice(toIndex, 0, movedRow);
//     setTableData(newData);
//   };

//   return (
//     <DndProvider backend={HTML5Backend}>
//     <table>
//       <thead>
//         <tr>
//           <th>Column 1</th>
//           <th>Column 2</th>
//           <th>Column 3</th>
//         </tr>
//       </thead>
//       <tbody>
//         {tableData.map((row, index) => (
//           <DraggableRow key={index} index={index} moveRow={moveRow}>
//             <td>
//               <input
//                 type="text"
//                 name={`col${index}-0`}
//                 onChange={(e) => handleInputChange(e.target.value, index, 'col1')}
//                 onBlur={() => handleInputBlur(index)}
//                 value={row.col1}
//                 />
//             </td>
//             <td>
//               <input
//                 type="text"
//                 name={`col${index}-1`}
//                 onChange={(e) => handleInputChange(e.target.value, index, 'col2')}
//                 value={row.col2}
//                 />
//             </td>
//             <td>
//               <input
//                 type="text"
//                 name={`col${index}-2`}
//                 onChange={(e) => handleInputChange(e.target.value, index, 'col3')}
//                 onKeyDown={(e) => handleTabPress(e, index)}
//                 value={row.col3}
//                 />
//             </td>
//           </DraggableRow>
//         ))}
//       </tbody>
//     </table>
//     </DndProvider>
//   );
// };

// export default DynamicTable;



// 'use client'

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const Index = () => {
//   const [data, setData] = useState([]);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await axios.get('http://127.0.0.1:8000/get_field_details/tblProduct/product_code/p01');
//         setData(response.data);
//       } catch (error) {
//         console.error('Error fetching data:', error);
//       }
//     };

//     fetchData();
//   }, []);

//   return (
//     <div>
//       <h1>Next.js Index Page</h1>
//       <pre>{JSON.stringify(data, null, 2)}</pre>
//     </div>
//   );
// };

// export default Index;

// import React from 'react';
// import { useForm, Controller } from 'react-hook-form';

// const MyForm = () => {
//   const { control } = useForm();

//   const handleSelectChange = (selectedValue) => {
//     console.log('Selected value:', selectedValue);
//   };

//   return (
//     <form>
//       <div>
//         <label htmlFor="mySelect">Select an option:</label>
//         <Controller
//           name="mySelect"
//           control={control}
//           defaultValue=""
//           render={({ field }) => (
//             <select {...field} onChange={(e) => {
//               field.onChange(e);
//               handleSelectChange(e.target.value);
//             }}>
//               <option value="">Select an option</option>
//               <option value="option1">Option 1</option>
//               <option value="option2">Option 2</option>
//               <option value="option3">Option 3</option>
//             </select>
//           )}
//         />
//       </div>
//     </form>
//   );
// };

// export default MyForm;





// TableRow.jsx
// import React from 'react';
// import { TextComboField, ComboField, NumberField } from '@/components/form_fields';

// const TableRow = ({ rowData, index, register, units, addRow, removeRow }) => (
//   <div key={index}>
//     <TextComboField
//       styles='w-full ml-2 outline-none bg-[#e6ecf4]'
//       {...register(`tableData[${index}][0].unit`)}
//       values={units}
//       onBlur={(e) => removeRow(index + 1, e.target.value)}
//     />
//     <ComboField
//       control={control}
//       styles='w-full ml-2 outline-none bg-[#e6ecf4] uppercase'
//       name={register(`tableData[${index}][1].multiple`)}
//       values={['*', '/']}
//     />
//     <NumberField
//       styles="w-full ml-2 outline-none bg-[#e6ecf4] text-right"
//       onKeyDown={(e) => addRow(e, index + 1)}
//       {...register(`tableData[${index}][2].multiple_value`)}
//     />
//   </div>
// );

// export default TableRow;


// Your main component
// import TableRow from './TableRow'; // Import the TableRow component

// // ...

// const addRow = (event, index) => {
//   if (index === tableLength && event.key === 'Tab' && !event.shiftKey) {
//     event.preventDefault();

//     const newRowData = {
//       unit: '',
//       multiple: '',
//       multiple_value: '',
//     };

//     setTableData((prevData) => [...prevData, newRowData]);
//     tableLength = index + 1;
//   }
// };

// // ...

// {/* Render the table using TableRow component */}
// {tableData.map((rowData, rowIndex) => (
//   <TableRow
//     key={rowIndex}
//     index={rowIndex}
//     rowData={rowData}
//     register={register}
//     units={units}
//     addRow={addRow}
//     removeRow={removeRow}
//   />
// ))}
