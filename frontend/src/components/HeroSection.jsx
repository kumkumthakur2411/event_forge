import React, { useState } from 'react';
import { motion } from 'framer-motion'
import { useLoop } from "../components/v1/skiper62";
// import { Carousel_002 } from "../components/v1/skiper48";

const HeroSection = ({ heroImg, box1, box2 , categories }) => {
    // const [showForm, setShowForm] = useState(false);
    const columns =6;
    const rows = 4;
    const items = Array.from({length:columns*rows});

      const { key } = useLoop(2000); // 2 second delay
    
      const loop = categories;
      const currentItem = loop[key % loop.length];

  //   const images = [
  //   {
  //     src: heroImg,
  //     alt: "Description 1",
  //   },
  //   {
  //     src: heroImg,
  //     alt: "Description 2",
  //   },
  // ];
    
  return (
    <>
    {/* main div */}
      <div className=' max-w-7xl h-[90vh] rounded-[4vh] mb-10 '>
        {/* heading and image */}
        <div className='flex flex-row w-full h-3/4 p-10   '>
          {/* heading */}
          <div className='w-[60vw] h-full font-[Georgia] z-10 '>
            <h1 className="text-2xl md:text-6xl font-extrabold text-secondary">
              Your 
              <span className='bg-gradient-to-r from-[#FAFAD6]  to-pink-200'> all-in-one </span> 
              <br></br>
              <span className='text-5xl font-[Georgia]'>Event Vendor Marketplace</span>
            </h1>
            <p className="p-4 pl-0 w-[38vw] text-sm font-semibold text-gray-400 ">
               Discover top event vendors for decoration, catering, music, and more — all in one place.
            </p>
            <button className='bg-[#000] m-2 px-6 py-1 text-white font-light text-md'>client</button>
            <button className='bg-[#000] m-2 px-6 py-1 text-white font-light text-md'>vendor</button>
          </div>
          {/* image */}
          <div className='w-[40vw] h-[50vh] absolute -z-10 top-0 right-36 grid grid-cols-6'>
            { items.map((_, index) => {
                const row = Math.floor(index / columns);
                const col = index % columns;
                const isTopRow = row === 0;
                const isBottomRow = row === rows - 1;
                const isTopCol = col === 0;
                const isBottomCol = col === columns - 1;
              return(
              <div 
              key={index} 
              className={`
              border border-gray-300
              ${isTopRow ? "border-t-0" : ""}
              ${isBottomRow ? "border-b-0" : ""}
              ${isTopCol ? "border-l-0" : ""}
              ${isBottomCol ? "border-r-0" : ""}
              `}>
            </div>);
            })}
          </div>
          
          <div className='w-[40vw]  h-96  relative items-center m-5 p-2  '>
            <div className='w-20 h-10 bg-green-700 absolute -top-5 left-10'></div>
            <div className='w-32 h-40 bg-red-200 absolute -bottom-4 right-0'></div>
            <div className='w-96 bg-green-200 h-[94%] absolute p-2 z-44 overflow-hidden border-8  border-red-200  '>
            <img src={heroImg || 'hero.png'} alt="Event Banner" className=" w-full h-full  shadow-lg object-cover" />
            </div>
          </div>
        </div>
        {/* two image and text  */}
        <div className=' flex flex-row w-full h-1/4 '>
          {/* image */}
          <div className='w-1/2 flex flex-row justify-center gap-10'>
             <div className='w-48 h-20 bg-red-200'><div className='w-24 h-full bg-green-200'>
              <img src={box1 || 'box1.png'} alt="Event Banner" className=" w-full h-full shadow-lg object-cover" />
              </div> </div>
             <div className='w-48 h-20 bg-red-200'><div className='w-24 h-full bg-green-200'>
              <img src={box2 || 'box2.png'} alt="Event Banner" className=" w-full h-full shadow-lg object-cover" />
              </div> </div>
          </div>
          {/* text */}
          <div className='w-1/2 p-12 pl-28'>
            <h1 className="text-2xl md:text-5xl font-extrabold  ">                                
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.2 }}
                      transition={{ duration: 0.5 }}
                    >
                      {currentItem}
                    </motion.div>                  
            </h1>
          </div>






{/*  
    <Carousel_002
      images={images}
      showPagination={true}
      showNavigation={true}
      loop={true}
      autoplay={true}
      spaceBetween={40}
    /> */}



        </div>
      </div>
    </>
  );
};

export default HeroSection;



