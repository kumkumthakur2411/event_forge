import React from "react";
import { motion } from "framer-motion";

export default function HowItWorks({ icon }) {
  const steps = [
    { title: "Post your event", desc: "Tell us your event details & needs." },
    {
      title: "Get vendor proposals",
      desc: "Vendors send you pricing & offers instantly.",
    },
    { title: "Choose your vendor", desc: "Compare, chat & select your favorite." },
    {
      title: "Approve & manage",
      desc: "Track progress & manage everything in one place.",
    },
  ];

  // Tiny particles
  const particles = Array.from({ length: 30 });

  return (
    <section className="relative py-32  overflow-hidden">
          {/* WAVY SVG BACKGROUND */}
      <div className="absolute inset-0 z-0 overflow-hidden">
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
      </div>
      {/* 🌌 Background Neon Blobs */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-purple-400/40 blur-3xl animate-spin-slow rounded-full"></div>
        <div className="absolute top-20 right-0 w-[28rem] h-[28rem] bg-pink-400/30 blur-3xl animate-pulse rounded-full"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-400/30 blur-2xl animate-spin-reverse rounded-full"></div>
        <div className="absolute -top-10 right-1/2 w-72 h-72 bg-green-400/25 blur-2xl animate-pulse rounded-full"></div>

        {/* 🌟 Floating Particles */}
        {particles.map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full opacity-70`}
            style={{
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              background: `hsl(${Math.random() * 360}, 80%, 60%)`,
              animation: `float ${2 + Math.random() * 3}s ease-in-out infinite alternate`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          ></div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
        <h2 className="text-sm uppercase tracking-wider text-pink-400 font-bold mb-3">
          How It Works
        </h2>
        <h3 className="text-4xl md:text-5xl font-extrabold text-white mb-16">
          Plan your event in simple steps
          <br />
          <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            discover, book, and celebrate
          </span>
        </h3>

        {/* 🔗 Steps Grid */}
        <div className="relative flex flex-col lg:flex-row justify-between items-center lg:items-start gap-12 lg:gap-0">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="relative group p-6 bg-white/10 backdrop-blur-xl border border-purple-300 rounded-3xl shadow-2xl cursor-pointer transform perspective-1000 hover:rotate-x-3 hover:rotate-y-3 hover:scale-105 transition-transform duration-500"
            >
              {/* Neon Step Circle */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.2 + 0.2 }}
                className="absolute -top-7 left-1/2 lg:left-auto lg:-left-7 w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 text-white font-bold shadow-xl"
              >
                {index + 1}
              </motion.div>

              {/* Glow Hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-60 transition bg-gradient-to-br from-purple-400/50 via-pink-400/30 to-blue-400/20 blur-2xl rounded-3xl pointer-events-none"></div>

              {/* Icon */}
              <img
                src={icon}
                className="w-12 h-12 mb-4 relative z-10 mx-auto drop-shadow-lg"
                alt="icon"
              />

              {/* Title & Description */}
              <h4 className="text-white font-semibold text-lg relative z-10">
                {step.title}
              </h4>
              <p className="text-gray-200 text-sm mt-1 relative z-10">{step.desc}</p>
            </motion.div>
          ))}

          {/* 🔗 Neon Connecting Line */}
          <div className="hidden lg:block absolute top-7 left-0 right-0 h-2 flex justify-between z-0">
            {steps.slice(0, -1).map((_, i) => (
              <div
                key={i}
                className="w-full h-0.5 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mx-2 opacity-50 rounded-full"
              ></div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating particle animation keyframes */}
      <style>
        {`
          @keyframes float {
            0% { transform: translateY(0px); opacity: 0.7; }
            50% { transform: translateY(-10px); opacity: 0.9; }
            100% { transform: translateY(0px); opacity: 0.7; }
          }
        `}
      </style>
    </section>
  );
}


