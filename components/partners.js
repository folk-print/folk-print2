import partnersJson from "./APi/partners.json";
import styles from "../styles/Partners.module.scss";
function Partners() {

    const partners = partnersJson.map((partner) => {
        return (
            <div key={partner.id} className={styles.image}>
                <img src={partner.img} alt="partner img" />
            </div>
        )
    })

    return (
        <div className={styles.main} id="partners">
            <div className={styles.container}>
                <h1>Наши партнеры</h1>
                <div className={styles.content}>
                    {partners}
                </div>
            </div>
        </div>
    )
}

export default Partners