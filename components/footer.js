"use client"

import { FaTelegram, FaInstagram } from "react-icons/fa"

export default function Footer() {
  const date = new Date()
  const year = date.getFullYear()

  return (
    <footer className="bg-black py-10 px-4 w-full">
      <div className="container mx-auto max-w-7xl">
        {/* Main Content - Stack on mobile, row on desktop */}
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-10 md:gap-6">
          {/* Logo Section */}
          <div className="flex flex-col items-center text-center">
            <img
              src="https://i.postimg.cc/rsHQKPnd/001.png"
              alt="Folk Print logo"
              className="w-[180px] h-[80px] mb-4 transition-transform duration-200 active:scale-95"
            />

            {/* Social Icons */}
            <div className="flex items-center space-x-5 text-gray-300 mt-2">
              <a href="https://t.me/folkprint_b2b" className="transition-colors duration-200 hover:text-blue-500">
                <FaTelegram className="w-8 h-8 md:w-10 md:h-10 active:scale-95" />
                <span className="sr-only">Telegram</span>
              </a>

              <a
                href="https://www.instagram.com/folkprint.b2b/"
                className="transition-colors duration-200 hover:text-pink-600"
              >
                <FaInstagram className="w-8 h-8 md:w-10 md:h-10 active:scale-95" />
                <span className="sr-only">Instagram</span>
              </a>
            </div>
          </div>

          {/* Address Section */}
          <div className="flex flex-col items-center text-center md:text-left max-w-xs">
            <p className="text-white text-base md:text-lg leading-relaxed">
              Адрес: г.Ташкент, Учтепинский район, массив Чиланзар, 11-й квартал, 51/1
            </p>
            <a
              href="#map"
              className="text-yellow-400 font-semibold underline hover:text-yellow-500 transition-colors mt-3"
            >
              Показать на карте
            </a>
          </div>

          {/* Contact Section */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="text-gray-500 text-lg md:text-xl mb-3">
              Наши номера: <br />
              <a
                href="tel:+998993333073"
                className="text-yellow-500 font-semibold hover:text-yellow-400 transition-colors"
              >
                +998 99 333 30 73
              </a>
              <br />
              <a
                href="tel:+998957877755"
                className="text-yellow-500 font-semibold hover:text-yellow-400 transition-colors"
              >
                +998 95 787 77 55
              </a>
            </div>

            <div className="text-gray-500 text-lg md:text-xl">
              Присылайте заявки на
              <a
                href="https://t.me/folkprint_b2b"
                className="text-yellow-500 font-semibold ml-2 hover:text-yellow-400 transition-colors"
              >
                folkprint.uz
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-gray-500 text-sm mt-10">&copy; {year} Folk Print. Все права защищены.</div>
      </div>
    </footer>
  )
}
