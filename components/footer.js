import styles from "../styles/Footer.module.scss";
import { FaTelegram, FaFacebook, FaInstagram } from "react-icons/fa";
function Footer() {
  const date = new Date();
  return (
    <>
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.content}>
            <div className={styles.logo}>
              <img
                src="https://i.postimg.cc/rsHQKPnd/001.png"
                alt="logo"
                className="w-[180px] h-[80px] md-w-[200px] md-h-[60px] lg-w-[200px] lg-h-[60px] cursor-pointer active:scale-95 duration-200"
              />

              <div className={styles.socialIcons}>
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
            </div>
            <div className={styles.address}>
              <p>
                Адрес: г.Ташкент, Чиланзарский р-н, Квартал 1, дом 59
              </p>
              <a href="#map">Показать на карте</a>
            </div>
            <div className={styles.contact}>
              <h1>
                Наш номер:
                <span>
                  <a href="tel:+998993333073">+998 99 333 30 73</a>
                </span>
              </h1>
              <h1>
                Присылайте заявки на
                <span className="ml-3">
                  <a href="https://t.me/folkprint_b2b">folkprint.uz</a>
                </span>
              </h1>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Footer;
