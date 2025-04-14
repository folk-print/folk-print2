import Head from "next/head";
import About from "../components/about";
import Count from "../components/countUp";
import Iframe from "../components/iFrame";
import Layout from "../components/Layout";
import Partners from "../components/partners";
import Products from "../components/products";
export default function Home() {
  return (
    <div>
      <Head>
    <!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-17006444297"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'AW-17006444297');
</script>
        <title>Качественная корпоративная одежда с логотипом в Узбекистане | Folk Print</title>
        <meta name="Folk print" content="Качественная корпоративная одежда с логотипом" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
        <link
          rel="icon"
          type="image/x-icon"
          href="https://i.postimg.cc/kMsnVdJS/001.png"
        ></link>
            
      </Head>
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
