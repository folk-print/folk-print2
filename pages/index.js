import Head from "next/head";
import About from "../components/about";
import Count from "../components/countUp";
import Iframe from "../components/iFrame";
import Layout from "../components/Layout";
import Partners from "../components/partners";
import Products from "../components/products";
import Script from "next/script";

export default function Home() {
  return (
    <div>
      <Head>
        <title>Качественная корпоративная одежда с логотипом в Узбекистане | Folk Print</title>
        <meta name="Folk print" content="Качественная корпоративная одежда с логотипом" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          rel="icon"
          type="image/x-icon"
          href="https://i.postimg.cc/kMsnVdJS/001.png"
        />
      </Head>

      {/* Google Tag Manager Global Site Script */}
      <Script 
        strategy="afterInteractive" 
        src={`https://www.googletagmanager.com/gtag/js?id=AW-17006444297`}
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
    </div>
  );
}
