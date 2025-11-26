import React from "react";
import { motion } from "framer-motion";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function WhyChooseUs({ icon }) {
  const reasons = [
    {
      title: "Trusted Vendors",
      desc: "Work with verified vendors who have top ratings and reviews.",
      src: "https://lottie.host/79237df1-5b92-4433-9cde-f7d295836844/aIEv2Y5Wpc.lottie",
    },
    {
      title: "All-in-One Marketplace",
      desc: "Decoration, catering, photography, music, and more in one place.",
      src: "https://assets2.lottiefiles.com/packages/lf20_u4yrau.json",
    },
    {
      title: "Easy Booking",
      desc: "Instant quotations, chat, and booking without hassle.",
      src: "https://assets10.lottiefiles.com/packages/lf20_jbrw3hcz.json",
    },
    {
      title: "Secure Payments",
      desc: "Safe and secure transactions with full transparency.",
      src: "https://lottie.host/1defad4a-0a13-4e18-80ac-787ddf4a9129/lNRoaAoQbK.lottie",
    },
  ];

  return (
    <section className="relative py-32 overflow-hidden bg-gradient-to-br from-cream-50 to-beige-50">
      {/* 🌟 Floating shapes */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-10 -left-20 w-72 h-72 bg-yellow-200/20 blur-3xl rounded-full animate-pulse"></div>
        <div className="absolute top-10 right-0 w-96 h-96 bg-pink-200/20 blur-3xl rounded-full animate-spin-slow"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 text-center">
        {/* Header */}
        <h2 className="text-sm uppercase tracking-wider text-yellow-600 font-serif mb-2">
          Why Choose Us
        </h2>
        <h3 className="text-4xl md:text-5xl font-serif font-bold text-gray-800 mb-16 leading-snug">
          Elegant & Premium Event Experience
          <br />
          <span className="text-yellow-600">
            Luxury Weddings & Events, Perfectly Curated
          </span>
        </h3>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {reasons.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              viewport={{ once: true }}
              className="relative p-8 rounded-3xl bg-white shadow-2xl border border-beige-200 hover:shadow-3xl hover:scale-105 transition-transform cursor-pointer flex flex-col items-center"
            >
              {/* Optional Icon */}
              {icon && (
                <img
                  src={icon}
                  alt="icon"
                  className="w-12 h-12 mb-4 drop-shadow-md"
                />
              )}

              {/* Lottie Animation */}
              <div className="w-32 h-32 mb-4">
                <DotLottieReact
                  src={item.src}
                  loop
                  autoplay
                  style={{ width: "100%", height: "100%" }}
                />
              </div>

              {/* Title & Description */}
              <h4 className="font-serif font-semibold text-lg text-gray-800 mb-2">
                {item.title}
              </h4>
              <p className="text-gray-600 text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
