import ContactForm from './ContactForm';
import { useState } from "react";
import styles from "../styles/Count.module.scss";
import { FcIdea } from "react-icons/fc"
import { FaInstagram, FaTelegram, FaPhoneAlt } from "react-icons/fa"

import { X } from 'lucide-react'
function Count() {
  const [showContactModal, setShowContactModal] = useState(false);

  function toggleVisitCard() {
    setShowContactModal(!showContactModal)
  }

  // Helper functions for responsive sizing
  function getIconSize() {
    return "w-16 h-16 sm:w-10 sm:h-10 md:w-12 md:h-12"
  }

  function getTextSize() {
    return "text-base sm:text-lg md:text-xl"
  }

  return (
    <div className={styles.main}>
      <div className={styles.container}>
        <h1 id="about">О нас</h1>
        <div className={styles.content}>
          <div className={styles.box}>
            <img
              className="h-16 w-16"
              src="https://i.postimg.cc/5ttzTwV5/badge-1.png"
              alt="quality"
            />
            <p>
              Мы используем только высококачественные материалы, которые
              обеспечивают комфорт и долговечность нашей одежды. Кроме того,
              наши принты наносятся с использованием современных технологий, что
              гарантирует их яркость и насыщенность на длительный период
              времени.
            </p>
          </div>
          <div className={styles.box}>
            <FcIdea className="h-16 w-16" />
            <p>
              Независимо от того, какой бизнес вы ведете, наша одежда с принтами
              подходит для всех видов мероприятий, от встреч с клиентами до
              корпоративных мероприятий. Мы уверены, что наши уникальные принты
              помогут вашей компании привлечь внимание и создать неповторимый
              имидж.
            </p>
          </div>

          <div className={styles.boxTwo}>
            <img
              className="h-16 w-16"
              src="https://i.postimg.cc/zf9cfDpQ/shop.png"
              alt="order"
            />
            <p className="text-center">
              Закажите нашу одежду с принтами уже сегодня и сделайте ваш бизнес
              заметным и успешным!
            </p>
          </div>
        </div>
        <div className={styles.underContent}>
          <div className={styles.box}>
            <img
              className="h-16 w-16"
              src="https://i.postimg.cc/zf9cfDpQ/shop.png"
              alt="order"
            />
            <p className="text-center">
              Закажите нашу одежду с принтами уже сегодня и сделайте ваш бизнес
              заметным и успешным!
            </p>
          </div>
        </div>
        {/* Button Section */}
        <div className="w-11/12 lg:w-4/5 mx-auto mt-6 sm:mt-8 md:mt-12 lg:mt-20">
          <button
            className="text-black bg-yellow-400 py-2 sm:py-3 px-6 sm:px-8 rounded-full text-base sm:text-lg font-semibold hover:bg-yellow-300 active:scale-95 duration-200 shadow-lg"
            onClick={toggleVisitCard}
          >
            Заказать сейчас
          </button>
        </div>

        {/* Contact Modal - Fixed positioning for consistent display across devices */}
      {showContactModal && (
        <div className="fixed text-black inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
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
                href="tel:+998993333073"
                className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full py-3 px-4 transition-colors duration-200"
                onClick={() => {
                  if (typeof window !== "undefined" && window.gtag) {
                    window.gtag('event', 'click_phone', {
                      event_category: 'contact',
                      event_label: 'about_modal_phone'
                    });
                  }
                }}
              >
                <FaPhoneAlt className="mr-2 h-4 w-4" />
                <span className={`font-bold ${getTextSize()}`}>+998 95 787 77 55</span>
              </a>
              <a
                href="tel:+998957877755"
                className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full py-3 px-4 transition-colors duration-200"
                onClick={() => {
                  if (typeof window !== "undefined" && window.gtag) {
                    window.gtag('event', 'click_phone', {
                      event_category: 'contact',
                      event_label: 'about_modal_phone'
                    });
                  }
                }}
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
    </div>
  );
}

export default Count;
