import styles from "../styles/Iframe.module.scss";
function Iframe() {
    return (
        <div className={styles.main} id="location">
            <div id="map" className={styles.container}>
                <h1>Наша локация</h1>
                <iframe className={styles.img} src="https://yandex.ru/map-widget/v1/?um=constructor%3Aea8ab171310c7a0ded42c8feca2454baf4b9a20944786bf949feeb20dd71ad46&amp;source=constructor" width="600" height="450" style={{ border: '0' }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
            </div>
        </div>
    )
}

export default Iframe