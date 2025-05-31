"use client"

import ContactForm from './ContactForm';

import { useState, useEffect } from "react"
import { FaTelegram, FaInstagram, FaPhoneAlt } from "react-icons/fa"
import { X } from "lucide-react"
import productsJson from "./APi/products.json"

export default function Products() {
  const [open, setOpen] = useState(false)
  const [windowWidth, setWindowWidth] = useState(0)

  // Track window width for responsive adjustments
  useEffect(() => {
    // Set initial width
    setWindowWidth(window.innerWidth)

    // Update width on resize
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  function toggleVisitCard() {
    setOpen(!open)
    // Prevent scrolling when modal is open
    if (!open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
  }

  // Determine icon size based on screen width
  const getIconSize = () => {
    if (windowWidth < 640) return "w-16 h-16" // Mobile
    if (windowWidth < 1024) return "w-16 h-16" // Tablet
    return "w-12 h-12" // Desktop
  }

  // Determine text size based on screen width
  const getTextSize = () => {
    if (windowWidth < 640) return "text-xl" // Mobile
    if (windowWidth < 1024) return "text-2xl" // Tablet
    return "text-3xl" // Desktop
  }

  return (
    <div
      className="relative pb-16"
      id="portfolio"
      style={{
        backgroundImage:
          "url('https://media.istockphoto.com/photos/blank-front-real-black-chalkboard-background-texture-in-college-for-picture-id1201544779?b=1&k=20&m=1201544779&s=612x612&w=0&h=y6mp3OxUmB_Mh4QavW99g7NrUJqR7F05v8uBQ2_TqdI=')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Product Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {productsJson.map((product) => (
            <div
              key={product.id}
              className="bg-black rounded-lg overflow-hidden shadow-md hover:shadow-xl hover:shadow-slate-800 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="aspect-[6/5] overflow-hidden">
                <img
                  src={product.img || "/placeholder.svg"}
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="p-5">
                <h2 className="text-white text-xl md:text-2xl font-semibold text-center">{product.title}</h2>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Button - Matching the header component style */}
      <div className="flex justify-center mt-4 mb-10">
        <button
          onClick={toggleVisitCard}
          className="bg-yellow-400 py-3 px-8 rounded-full text-lg font-semibold hover:bg-yellow-300 active:scale-95 duration-200 shadow-lg"
        >
          Заказать сейчас
        </button>
      </div>

      {/* Contact Modal - Fixed positioning for consistent display across devices */}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-xl p-6 animate-slideUp">
            <div className="flex justify-end mb-2">
              <button
                onClick={toggleVisitCard}
                className="text-black hover:text-gray-700 active:scale-95 transition-all duration-200"
              >
                <X className="h-8 w-8" />
              </button>
            </div>

            <h1 className="font-bold text-2xl sm:text-3xl md:text-4xl text-center mb-6">Какое способ вам удобнее?</h1>

            {/* Social Icons - Responsive sizes */}
            <div className="flex justify-center space-x-8 my-6">
              <a
                href="https://t.me/folkprint_b2b"
                className="text-black hover:text-blue-500 transition-colors duration-200"
              >
                <FaTelegram className={getIconSize()} />
              </a>
              <a
                href="https://www.instagram.com/folkprint.b2b/"
                className="text-black hover:text-pink-600 transition-colors duration-200"
              >
                <FaInstagram className={getIconSize()} />
              </a>
            </div>

            {/* Phone Numbers - Matching header style */}
            <div className="space-y-4 mt-6">
              <a
                href="tel:+998957877755"
                className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full py-3 px-4 transition-colors duration-200"
              >
                <FaPhoneAlt className="mr-2 h-4 w-4" />
                <span className={`font-bold ${getTextSize()}`}>+998 95 787 77 55</span>
              </a>
              <a
                href="tel:+998333388608"
                className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full py-3 px-4 transition-colors duration-200"
              >
                <FaPhoneAlt className="mr-2 h-4 w-4" />
                <span className={`font-bold ${getTextSize()}`}>+998 33 338 86 08</span>
              </a>
            </div>
                  {/* Contact Form */}
            <ContactForm />
          </div>
        </div>
      )}
    </div>
  )
}
