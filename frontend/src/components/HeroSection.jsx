import React from "react";
import { motion } from "framer-motion";
import { useLoop } from "../components/v1/skiper62";

const HeroSection = ({ heroImg, box1, box2, categories }) => {
  const { key } = useLoop(2000);
  const loop = categories || ["Decoration", "Catering", "Photography"];
  const currentItem = loop[key % loop.length];

  return (
    <div className="relative max-w-7xl mx-auto px-6 md:px-12 py-20 overflow-hidden">
      {/* WAVY SVG BACKGROUND */}
      {/* <div className="absolute inset-0 z-0 overflow-hidden">
        <svg
          className="absolute top-0 left-0 w-full -z-10"
          viewBox="0 0 1440 500"
        >
          <path
             fill="#a5f3fc"
             fillOpacity="0.35"
            d="M0,128L60,144C120,160,240,192,360,197.3C480,203,600,181,720,176C840,171,960,181,1080,202.7C1200,224,1320,256,1380,272L1440,288L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"
          ></path>
        </svg>

        <svg
          className="absolute top-20 left-0 w-full -z-10"
          viewBox="0 0 1440 500"
        >
          <path
            fill="#c4b5fd"
            fillOpacity="0.28"
            d="M0,192L60,208C120,224,240,256,360,272C480,288,600,288,720,256C840,224,960,160,1080,149.3C1200,139,1320,181,1380,202.7L1440,224V0H0Z"
          ></path>
        </svg>
      </div> */}
      {/* 🔵 VIBRANT BACKGROUND SHAPES */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-gradient-to-br from-yellow-400 to-pink-400 rounded-full blur-3xl opacity-20 animate-spin-slow"></div>
      </div>

      {/* MAIN HERO CONTENT */}
      <div className="flex flex-col md:flex-row items-center gap-12">

        {/* LEFT TEXT SIDE */}
        <div className="w-full md:w-1/2 text-center md:text-left">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-6xl font-extrabold leading-tight text-gray-900"
          >
            Discover the Best
            <br />
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              Event Vendors
            </span>
            <br /> In Your City
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-gray-700 text-lg max-w-md mx-auto md:mx-0"
          >
            Book top-rated decorators, caterers, photographers, venues, and more — all in one seamless marketplace.
          </motion.p>

          {/* BUTTONS */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
          >
            <button className="px-7 py-3 rounded-xl font-medium bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:scale-105 transition">
              I am a Client
            </button>

            <button className="px-7 py-3 rounded-xl font-medium bg-gray-900 text-white shadow-lg hover:scale-105 transition">
              I am a Vendor
            </button>
          </motion.div>
        </div>

        {/* RIGHT IMAGE SIDE */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative w-full md:w-1/2 flex justify-center"
        >
          {/* MAIN IMAGE CARD */}
          <div className="w-72 sm:w-80 md:w-96 h-96 rounded-3xl overflow-hidden shadow-2xl border-[6px] border-white backdrop-blur-xl bg-white/40">
            <img
              src={heroImg || "hero.png"}
              alt="Hero"
              className="w-full h-full object-cover"
            />
          </div>

          {/* FLOATING SMALL IMAGES */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="absolute -bottom-6 -left-6 w-32 h-20 rounded-xl overflow-hidden shadow-xl border-4 border-white"
          >
            <img src={box1 || "box1.png"} className="w-full h-full object-cover" />
          </motion.div>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute -top-6 -right-6 w-32 h-20 rounded-xl overflow-hidden shadow-xl border-4 border-white"
          >
            <img src={box2 || "box2.png"} className="w-full h-full object-cover" />
          </motion.div>
        </motion.div>
      </div>

      {/* ROTATING CATEGORY LINE */}
      <motion.div
        key={key}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-20 text-center text-3xl md:text-5xl font-extrabold"
      >
        <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
          {currentItem}
        </span>
      </motion.div>
    </div>
  );
 };

 export default HeroSection;



