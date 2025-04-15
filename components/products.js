"use client";

import { useState, useEffect, useCallback } from "react";
import { FaTelegram, FaInstagram, FaPhoneAlt } from "react-icons/fa";
import { X } from "lucide-react";
import Image from "next/image";
import productsJson from "./APi/products.json";

export default function Products() {
  const [open, setOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    setWindowWidth(window.innerWidth);

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleVisitCard = () => {
    setOpen(!open);
    document.body.style.overflow = !open ? "hidden" : "auto";
  };

  const getIconSize = () => {
    if (windowWidth < 640) return "w-16 h-16";
    if (windowWidth < 1024) return "w-16 h-16";
    return "w-12 h-12";
  };

  const getTextSize = () => {
    if (windowWidth < 640) return "text-xl";
    if (windowWidth < 1024) return "text-2xl";
    return "text-3xl";
  };

  return (
    <section
      className="relative pb-16"
      id="portfolio"
      style={{
        backgroundImage:
          "url('https://media.istockphoto.com/photos/blank-front-real-black-chalkboard-background-texture-in-college-for-picture-id1201544779?b=1&k=20&m=1201544779&s=612x612&w=0&h=y6mp3OxUmB_Mh4QavW99g7NrUJqR7F05v8uBQ2_TqdI=')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {productsJson.map((product) => (
            <article
              key={product.id}
              className="bg-black rounded-lg overflow-hidden shadow-md hover:shadow-xl hover:shadow-slate-800 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="aspect-[6/5] overflow-hidden relative">
                <Image
                  src={product.img || "/placeholder.svg"}
                  alt={product.title || "Product image"}
                  fill
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="p-5">
                <h2 className="text-white text-xl md:text-2xl font-semibold text-center">
                  {product.title}
                </h2>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="flex justify-center mt-4 mb-10">
        <button
          onClick={toggleVisitCard}
          className="bg-yellow-400 py-3 px-8 rounded-full text-lg font-semibold hover:bg-yellow-300 active:scale-95 duration-200 shadow-lg"
        >
          Заказать сейчас
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Контактная информация"
        >
          <div className="bg-white w-full max-w-md rounded-xl p-6 animate-fadeIn">
            <div className="flex justify-end mb-2">
              <button
                onClick={toggleVisitCard}
                className="text-black hover:text-gray-700 active:scale-95 transition-all duration-200"
                aria-label="Закрыть модальное окно"
              >
                <X className="h-8 w-8" />
              </button>
            </div>

            <h1 className="font-bold text-2xl sm:text-3xl md:text-4xl text-center mb-6">
              Какой способ вам удобнее?
            </h1>

            <div className="flex justify-center space-x-8 my-6">
              <a
                href="https://t.me/folkprint_b2b"
                className="text-black hover:text-blue-500 transition-colors duration-200"
                aria-label="Связаться через Telegram"
              >
                <FaTelegram className={getIconSize()} />
              </a>
              <a
                href="https://www.instagram.com/folkprint.b2b/"
                className="text-black hover:text-pink-600 transition-colors duration-200"
                aria-label="Связаться через Instagram"
              >
                <FaInstagram className={getIconSize()} />
              </a>
            </div>

            <div className="space-y-4 mt-6">
              <a
                href="tel:+998993333073"
                className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full py-3 px-4 transition-colors duration-200"
              >
                <FaPhoneAlt className="mr-2 h-4 w-4" />
                <span className={`font-bold ${getTextSize()}`}>
                  +998 99 333 30 73
                </span>
              </a>
              <a
                href="tel:+998957877755"
                className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full py-3 px-4 transition-colors duration-200"
              >
                <FaPhoneAlt className="mr-2 h-4 w-4" />
                <span className={`font-bold ${getTextSize()}`}>
                  +998 95 787 77 55
                </span>
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
