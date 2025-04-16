"use client";

import ContactForm from './ContactForm';

import { useState, useEffect } from "react";
import Link from "next/link";
import { FaTelegram, FaInstagram, FaPhoneAlt } from "react-icons/fa";
import { X } from "lucide-react";

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  // Handle scroll event to change navbar background
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function toggleMobileMenu() {
    if (mobileMenuOpen) {
      document.body.style.overflow = "auto";
    } else {
      document.body.style.overflow = "hidden";
    }
    setMobileMenuOpen(!mobileMenuOpen);
    setScrolled(true);
  }

  function toggleVisitCard() {
    setShowContactModal(!showContactModal);
  }

  // Helper functions for responsive sizing
  function getIconSize() {
    return "w-12 h-12 sm:w-10 sm:h-10 md:w-12 md:h-12";
  }

  function getTextSize() {
    return "text-base sm:text-lg md:text-xl";
  }

  useEffect(() => {
    console.log("Window width:", window.innerWidth);
    const handleResize = () => {
      console.log("Resized width:", window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <header className="relative w-full h-screen">
        {/* Background Image */}
        <img
          src="https://i.postimg.cc/qvK2ZYt1/2836242.jpg"
          alt="banner-img"
          className="w-full h-screen object-cover object-top"
        />
        <div className="absolute z-10 inset-0 bg-gray-900 bg-opacity-75">
          {/* DESKTOP HEADER - Always visible, but styled differently based on screen size */}
          <nav
            className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
              scrolled ? "bg-black py-2" : "bg-transparent py-6"
            }`}
          >
            <div className="w-11/12 lg:w-4/5 mx-auto flex items-center justify-between">
              {/* Logo */}
              <img
                src="https://i.postimg.cc/QdzFKJzz/001.png"
                alt="logo"
                className={`transition-all duration-300 ${
                  scrolled
                    ? "w-[120px] h-[55px] sm:w-[150px] sm:h-[70px]"
                    : "w-[160px] h-[75px] sm:w-[200px] sm:h-[90px]"
                }`}
              />

              {/* Navigation Links - Desktop Only */}

              <div className="nav-links-container items-center space-x-8">
                <Link
                  href="#portfolio"
                  className="text-white hover:text-yellow-400 transition-colors cursor-pointer"
                >
                  <div className="text-white hover:text-yellow-400 transition-colors font-semibold text-base cursor-pointer">
                    Каталог
                  </div>
                </Link>
                <Link
                  href="#partners"
                  className="text-white hover:text-yellow-400 transition-colors cursor-pointer"
                >
                  <div className="text-white hover:text-yellow-400 transition-colors font-semibold text-base cursor-pointer">
                    Партнеры
                  </div>
                </Link>
                <Link
                  href="#about"
                  className="text-white hover:text-yellow-400 transition-colors cursor-pointer"
                >
                  <div className="text-white hover:text-yellow-400 transition-colors font-semibold text-base cursor-pointer">
                    О Нас
                  </div>
                </Link>
              </div>

              {/* Right Side Content */}
              <div className="flex items-center space-x-4 lg:space-x-7">
                {/* Social Icons - Desktop Only */}
                <div className="nav-links-container items-center space-x-4">
                  <a
                    href="https://t.me/folkprint_b2b"
                    className="text-gray-200 hover:text-blue-500 transition-colors"
                  >
                    <FaTelegram className="w-8 h-8 cursor-pointer active:scale-95 duration-200" />
                  </a>
                  <a
                    href="https://www.instagram.com/folkprint.b2b/"
                    className="text-gray-200 hover:text-blue-700 transition-colors"
                  >
                    <FaInstagram className="w-8 h-8 cursor-pointer active:scale-95 duration-200" />
                  </a>
                </div>

                {/* Social Icons - Tablet Only */}
                <div className="hidden sm:flex lg:hidden items-center space-x-3">
                  <a
                    href="https://t.me/folkprint_b2b"
                    className="text-gray-200 hover:text-blue-500 transition-colors"
                  >
                    <FaTelegram className="w-6 h-6 cursor-pointer active:scale-95 duration-200" />
                  </a>
                  <a
                    href="https://www.instagram.com/folkprint.b2b/"
                    className="text-gray-200 hover:text-blue-700 transition-colors"
                  >
                    <FaInstagram className="w-6 h-6 cursor-pointer active:scale-95 duration-200" />
                  </a>
                </div>

                {/* Phone Numbers - Desktop Only */}
                <div className="nav-links-container">
                  <div className="flex flex-col space-y-2">
                    <a
                      className="bg-white rounded-full py-2 px-4 text-base text-black font-bold hover:bg-gray-100 transition-colors flex items-center"
                      href="tel:+998993333073"
                    >
                      <FaPhoneAlt className="mr-2 h-3 w-3" /> +998 99 333 30 73
                    </a>
                    <a
                      className="bg-white rounded-full py-2 px-4 text-base text-black font-bold hover:bg-gray-100 transition-colors flex items-center"
                      href="tel:+998957877755"
                    >
                      <FaPhoneAlt className="mr-2 h-3 w-3" /> +998 95 787 77 55
                    </a>
                  </div>
                </div>

                {/* Phone Button - Mobile and Tablet */}
                <div className="lg:hidden">
                  <a
                    className="bg-white rounded-full p-3 text-black flex items-center justify-center"
                    href="tel:+998993333073"
                  >
                    <FaPhoneAlt className="h-5 w-5" />
                  </a>
                </div>

                {/* Mobile Menu Button - Mobile and Tablet Only */}
                <button
                  className="lg:hidden text-white p-2"
                  onClick={toggleMobileMenu}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={
                        mobileMenuOpen
                          ? "M6 18L18 6M6 6l12 12"
                          : "M4 6h16M4 12h16M4 18h16"
                      }
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <div className="lg:hidden block bg-black bg-opacity-95 fixed top-[70px] left-0 right-0 bottom-0 overflow-y-auto px-4 py-4">
                <div className="flex flex-col space-y-4">
                  <Link
                    href="#portfolio"
                    className="text-white hover:text-yellow-400 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="text-white hover:text-yellow-400 transition-colors font-semibold text-lg">
                      Каталог
                    </div>
                  </Link>
                  <Link
                    href="#partners"
                    className="text-white hover:text-yellow-400 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="text-white hover:text-yellow-400 transition-colors font-semibold text-lg">
                      Партнеры
                    </div>
                  </Link>
                  <Link
                    href="#about"
                    className="text-white hover:text-yellow-400 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="text-white hover:text-yellow-400 transition-colors font-semibold text-lg">
                      О Нас
                    </div>
                  </Link>

                  {/* Social Icons - Mobile Menu */}
                  <div className="flex justify-center items-center space-x-6 py-2">
                    <a
                      href="https://t.me/folkprint_b2b"
                      className="text-gray-200 hover:text-blue-500 transition-colors"
                    >
                      <FaTelegram className="w-12 h-12 sm:w-8 sm:h-8" />
                    </a>
                    <a
                      href="https://www.instagram.com/folkprint.b2b/"
                      className="text-gray-200 hover:text-blue-700 transition-colors"
                    >
                      <FaInstagram className="w-12 h-12 sm:w-8 sm:h-8" />
                    </a>
                  </div>

                  {/* Phone Numbers - Mobile Menu */}
                  <div className="flex flex-col space-y-2 py-2">
                    <a
                      className="bg-white rounded-full py-1.5 sm:py-2 px-3 sm:px-4 text-sm sm:text-base text-black font-bold text-center flex items-center justify-center"
                      href="tel:+998993333073"
                    >
                      <FaPhoneAlt className="mr-2 h-2.5 w-2.5 sm:h-3 sm:w-3" />{" "}
                      +998 99 333 30 73
                    </a>
                    <a
                      className="bg-white rounded-full py-1.5 sm:py-2 px-3 sm:px-4 text-sm sm:text-base text-black font-bold text-center flex items-center justify-center"
                      href="tel:+998957877755"
                    >
                      <FaPhoneAlt className="mr-2 h-2.5 w-2.5 sm:h-3 sm:w-3" />{" "}
                      +998 95 787 77 55
                    </a>
                  </div>
                </div>
              </div>
            )}
          </nav>

          {/* Text Section */}
          <div className="w-11/12 lg:w-4/5 mx-auto pt-28 sm:pt-32 md:pt-40 space-y-3 sm:space-y-5">
            <h1 className="text-white text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
              Качественная корпоративная одежда с логотипом
            </h1>
            <h2 className="text-gray-300 text-xl sm:text-2xl md:text-2xl">
              От идеи до реализации
            </h2>
          </div>

          {/* Button Section */}
          <div className="w-11/12 lg:w-4/5 mx-auto mt-6 sm:mt-8 md:mt-12 lg:mt-20">
            <button
              className="bg-yellow-400 py-2 sm:py-3 px-6 sm:px-8 rounded-full text-base sm:text-lg font-semibold hover:bg-yellow-300 active:scale-95 duration-200 shadow-lg"
              onClick={toggleVisitCard}
            >
              Заказать сейчас
            </button>
          </div>
        </div>
      </header>

      {/* Contact Modal - Fixed positioning for consistent display across devices */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-xl p-6 animate-slideUp max-h-[90vh] overflow-y-auto">
            <div className="flex justify-end mb-2">
              <button
                onClick={toggleVisitCard}
                className="text-black hover:text-gray-700 active:scale-95 transition-all duration-200"
              >
                <X className="h-8 w-8" />
              </button>
            </div>
      
            <h1 className="font-bold text-2xl sm:text-3xl md:text-4xl text-center mb-6">
              Какое способ вам удобнее?
            </h1>
      
            {/* Social Icons */}
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
      
            {/* Phone Numbers */}
            <div className="space-y-4 mt-6">
              <a
                href="tel:+998993333073"
                className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full py-3 px-4 transition-colors duration-200"
              >
                <FaPhoneAlt className="mr-2 h-4 w-4" />
                <span className={`font-bold ${getTextSize()}`}>+998 99 333 30 73</span>
              </a>
              <a
                href="tel:+998957877755"
                className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full py-3 px-4 transition-colors duration-200"
              >
                <FaPhoneAlt className="mr-2 h-4 w-4" />
                <span className={`font-bold ${getTextSize()}`}>+998 95 787 77 55</span>
              </a>
            </div>
      
            {/* Contact Form */}
            <ContactForm />
          </div>
        </div>
      )}
    </>
  );
}

export default Header;
