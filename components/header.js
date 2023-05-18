import styles from "../styles/Header.module.scss";
import { FaTelegram, FaFacebook, FaInstagram } from "react-icons/fa";
import { useState } from "react";
import Link from "next/link";
function Header() {
  const [open, setOpen] = useState(false);
  function openMenu() {
    open ? setOpen(false) : setOpen(true);
  }
  return (
    <>
      <header className={styles.header}>
        <img
          className={styles.bannerImg}
          src="https://i.postimg.cc/qvK2ZYt1/2836242.jpg"
          alt="banner-img"
        />
        <div className={styles.darker}>
          <nav className={styles.navbar}>
            <img src="https://i.postimg.cc/QdzFKJzz/001.png" alt="logo" />
            <div className={styles.socialIcon}>
              <div>
                <a href="https://t.me/folkprint_b2b">
                  <FaTelegram className="w-10 h-10 cursor-pointer active:scale-95 duration-200" />
                </a>
              </div>

              <div>
                <a href="https://www.instagram.com/folkprint.b2b/">
                  <FaInstagram className="w-10 h-10 cursor-pointer active:scale-95 duration-200" />
                </a>
              </div>
              <div>
                <a
                  className="bg-white rounded-[50px] py-3 px-5 text-black font-bold "
                  href="tel:+998993333073"
                >
                  +998 99 333 30 73
                </a>
              </div>
            </div>
          </nav>
          <div className={styles.textSection}>
            <h1>Фабрика принтов №1 в Узбекистане.</h1>
            <h2>
              Добро пожаловать в нашу коллекцию одежды с принтами для бизнеса!
              <br/>
              Мы предлагаем уникальные и стильные варианты, которые помогут вам
             <br/> выделиться на фоне конкурентов.
            </h2>
          </div>
          <div className={styles.buttons}>
            <h1 className="bg-yellow-400 py-3 px-5 rounded-[50px]  text-lg font-semibold hover:cursor-pointer hover:bg-yellow-300 active:scale-95 duration-200">
              <Link href="#portfolio">
                <a> Наш каталог </a>
              </Link>
            </h1>
            <h1 className="text-white text-lg border-2 py-3 px-5 rounded-[50px] font-semibold hover:cursor-pointer hover:bg-white hover:text-black active:scale-95 duration-200">
              <Link href="#partners">
                <a> Наши партнеры </a>
              </Link>
            </h1>
          </div>
        </div>
      </header>

      {/* Mobile header */}
      <header className={styles.mobileHeader}>
        <img
          className={styles.bannerImg}
          src="https://i.postimg.cc/qvK2ZYt1/2836242.jpg"
          alt="banner-img"
        />
        <div className={styles.darker}>
          <nav className={styles.navbar}>
            <img src="https://i.postimg.cc/QdzFKJzz/001.png" alt="logo" />
            <div className={styles.textSection}>
              <h1>Фабрика принтов №1 в Узбекистане.</h1>
              <h2>
                Добро пожаловать в нашу коллекцию одежды с принтами для бизнеса!
                Мы предлагаем уникальные и стильные варианты, которые помогут
                вам выделиться на фоне конкурентов.
              </h2>
            </div>
            <div className={styles.socialIcon}>
              <div>
                <a href="https://t.me/folkprint_b2b">
                  <FaTelegram className="w-10 h-10 cursor-pointer active:scale-95 duration-200" />
                </a>
              </div>

              <div>
                <a href="https://www.instagram.com/folkprint.b2b/">
                  <FaInstagram className="w-10 h-10 cursor-pointer active:scale-95 duration-200" />
                </a>
              </div>
            </div>
            <div>
              <a
                className="bg-white py-3 px-5 rounded-[50px]  text-lg font-semibold hover:cursor-pointer active:scale-95 duration-200  "
                href="tel:+998 99 333 30 73"
              >
                +998 99 333 30 73
              </a>
            </div>
          </nav>

          <div className={styles.buttons}>
            <a href="#portfolio">
              <h1 className="bg-yellow-400 py-3 px-5 rounded-[50px]  text-lg font-semibold hover:cursor-pointer hover:bg-yellow-300 active:scale-95 duration-200">
                Наш каталог
              </h1>
            </a>
          </div>
        </div>
      </header>
      {/* Mobile header */}
    </>
  );
}

export default Header;
