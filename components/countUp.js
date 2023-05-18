import styles from "../styles/Count.module.scss";
import { FcIdea } from "react-icons/fc";
function Count() {
  return (
    <div className={styles.main}>
      <div className={styles.container}>
        <h1>О нас</h1>
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
      </div>
    </div>
  );
}

export default Count;
