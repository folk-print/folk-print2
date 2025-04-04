import { useState, useEffect } from "react";
import Link from "next/link";
import { FaTelegram, FaInstagram, FaPhoneAlt } from "react-icons/fa";

function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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

  function toggleMenu() {
    setOpen(!open);
    setScrolled(true);
  }

  return (
    <>
      {/* Desktop Header */}
      <header className="relative w-full h-screen">
        {/* Background Image */}
        <img
          src="https://i.postimg.cc/qvK2ZYt1/2836242.jpg"
          alt="banner-img"
          className="w-full h-screen object-cover object-top"
        />
        <div className="absolute z-10 inset-0 bg-gray-900 bg-opacity-75">
          {/* Navbar - Fixed on scroll */}
          <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
              scrolled ? "bg-black py-2" : "bg-transparent py-6"
            }`}
          >
            <div className="w-11/12 lg:w-4/5 mx-auto flex items-center justify-between">
              {/* Logo */}
              <img
                src="https://i.postimg.cc/QdzFKJzz/001.png"
                alt="logo"
                className={`transition-all duration-300 ${
                  scrolled ? "w-[150px] h-[70px]" : "w-[200px] h-[90px]"
                }`}
              />

              {/* Navigation Links - Desktop */}
              <div className="hidden md:flex items-center space-x-8">
                <Link
                  href="#catalog"
                  className="text-white hover:text-yellow-400 transition-colors"
                >
                  <div className="text-white hover:text-yellow-400 transition-colors font-semibold">
                    Каталог
                  </div>
                </Link>
                <Link
                  href="#partners"
                  className="text-white hover:text-yellow-400 transition-colors"
                >
                  <div className="text-white hover:text-yellow-400 transition-colors font-semibold">
                    Партнеры
                  </div>
                </Link>
                <Link
                  href="#about"
                  className="text-white hover:text-yellow-400 transition-colors"
                >
                  <div className="text-white hover:text-yellow-400 transition-colors font-semibold">
                    О Нас
                  </div>
                </Link>
              </div>

              {/* Social Icons and Phone */}
              <div className="flex items-center space-x-4 lg:space-x-7">
                {/* Social Icons */}
                <div className="hidden sm:flex items-center space-x-4">
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

                {/* Phone Numbers - Desktop */}
                <div className="hidden md:block">
                  <div className="flex flex-col space-y-2">
                    <a
                      className="bg-white rounded-full py-2 px-4 text-black font-bold hover:bg-gray-100 transition-colors flex items-center"
                      href="tel:+998993333073"
                    >
                      <FaPhoneAlt className="mr-2 h-3 w-3" /> +998 99 333 30 73
                    </a>
                    <a
                      className="bg-white rounded-full py-2 px-4 text-black font-bold hover:bg-gray-100 transition-colors flex items-center"
                      href="tel:+998957877755"
                    >
                      <FaPhoneAlt className="mr-2 h-3 w-3" /> +998 95 787 77 55
                    </a>
                  </div>
                </div>

                {/* Phone Button - Mobile */}
                <div className="md:hidden">
                  <a
                    className="bg-white rounded-full p-3 text-black flex items-center justify-center"
                    href="tel:+998993333073"
                  >
                    <FaPhoneAlt className="h-5 w-5" />
                  </a>
                </div>

                {/* Mobile Menu Button */}
                <button className="md:hidden text-white" onClick={toggleMenu}>
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
                        open
                          ? "M6 18L18 6M6 6l12 12"
                          : "M4 6h16M4 12h16M4 18h16"
                      }
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Mobile Menu */}
            {open && (
              <div className="md:hidden bg-black bg-opacity-95 h-screen  px-4 py-4 mt-4">
                
                <div className="flex flex-col space-y-5">
                <Link
                  href="#catalog"
                  className="text-white hover:text-yellow-400 transition-colors"
                >
                  <div className="text-white hover:text-yellow-400 transition-colors font-semibold">
                    Каталог
                  </div>
                </Link>
                <Link
                  href="#partners"
                  className="text-white hover:text-yellow-400 transition-colors"
                >
                  <div className="text-white hover:text-yellow-400 transition-colors font-semibold">
                    Партнеры
                  </div>
                </Link>
                <Link
                  href="#about"
                  className="text-white hover:text-yellow-400 transition-colors"
                >
                  <div className="text-white hover:text-yellow-400 transition-colors font-semibold">
                    О Нас
                  </div>
                </Link>

                  {/* Social Icons - Mobile Menu */}
                  <div className="flex justify-center items-center space-x-6 py-2">
                    <a
                      href="https://t.me/folkprint_b2b"
                      className="text-gray-200 hover:text-blue-500 transition-colors"
                    >
                      <FaTelegram className="w-8 h-8" />
                    </a>
                    <a
                      href="https://www.instagram.com/folkprint.b2b/"
                      className="text-gray-200 hover:text-blue-700 transition-colors"
                    >
                      <FaInstagram className="w-8 h-8" />
                    </a>
                  </div>

                  {/* Phone Numbers - Mobile Menu */}
                  <div className="flex flex-col space-y-2 py-2">
                    <a
                      className="bg-white rounded-full py-2 px-4 text-black font-bold text-center flex items-center justify-center"
                      href="tel:+998993333073"
                    >
                      <FaPhoneAlt className="mr-2 h-3 w-3" /> +998 99 333 30 73
                    </a>
                    <a
                      className="bg-white rounded-full py-2 px-4 text-black font-bold text-center flex items-center justify-center"
                      href="tel:+998957877755"
                    >
                      <FaPhoneAlt className="mr-2 h-3 w-3" /> +998 95 787 77 55
                    </a>
                  </div>
                </div>
              </div>
            )}
          </nav>

          {/* Text Section */}
          <div className="w-11/12 lg:w-4/5 mx-auto pt-40 md:pt-32 space-y-5">
            <h1 className="text-white text-4xl md:text-4xl font-bold">
              Качественная корпоративная одежда с логотипом
            </h1>
            <h2 className="text-gray-300 text-2xl md:text-xl">
              От идеи до реализации
            </h2>
          </div>

          {/* Button Section */}
          <div className="w-11/12 lg:w-4/5 mx-auto mt-10 md:mt-20">
            <button className="bg-yellow-400 py-3 px-8 rounded-full text-lg font-semibold hover:bg-yellow-300 active:scale-95 duration-200 shadow-lg">
              Заказать сейчас
            </button>
          </div>
        </div>
      </header>
    </>
  );
}

export default Header;
