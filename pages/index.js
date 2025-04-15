import Head from "next/head";
import Script from "next/script";

import Layout from "../components/Layout";
import About from "../components/about";
import Products from "../components/products";
import Partners from "../components/partners";
import Count from "../components/countUp";
import Iframe from "../components/iFrame";

export default function Home() {
  return (
    <>
      <Head>
        <title>Корпоративная одежда с логотипом в Узбекистане | Folk Print</title>
        <meta
          name="description"
          content="Изготовление корпоративной одежды с логотипом в Узбекистане. Высокое качество, индивидуальный подход, выгодные цены. Folk Print — стиль для вашей команды."
        />
        <meta
          name="keywords"
          content="корпоративная одежда, логотип, одежда с логотипом, узбекистан, folk print"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="icon"
          href="https://i.postimg.cc/kMsnVdJS/001.png"
          type="image/png"
        />

        {/* Open Graph for social media sharing */}
        <meta property="og:title" content="Корпоративная одежда с логотипом | Folk Print" />
        <meta
          property="og:description"
          content="Закажите корпоративную одежду с логотипом в Узбекистане от Folk Print. Идеально для вашей команды."
        />
        <meta property="og:image" content="https://i.postimg.cc/kMsnVdJS/001.png" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://yourwebsite.uz" />
        <meta name="robots" content="index, follow" />
      </Head>

      {/* Google Tag Manager Global Site Script */}
      <Script
        strategy="afterInteractive"
        src="https://www.googletagmanager.com/gtag/js?id=AW-17006444297"
      />

      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-17006444297');
            gtag('config', 'G-01ZJXKDZ9D');
            gtag('event', 'conversion', {
              'send_to': 'AW-17006444297/8kVNCOCJprgaEIn-pq0_',
              'value': 1.0,
              'currency': 'USD'
            });
          `,
        }}
      />

      <Layout>
        <About />
        <Products />
        <Partners />
        <Count />
        <Iframe />
      </Layout>
    </>
  );
}
