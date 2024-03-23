'use client'

import Lottie from 'react-lottie';
import loader from '../../public/loader.json';
const Loader = () => {
    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: loader,
        rendererSettings: {
            preserveAspectRatio: "xMidYMid slice"
        }
    };
    
    return (
        <div className='fixed inset-0 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
            <Lottie 
            options={defaultOptions}
            height={200}
            width={200}
            />
        </div>
    );

};

export default Loader