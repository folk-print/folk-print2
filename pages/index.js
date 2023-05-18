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
        <title>Folk Print</title>
        <meta name="Folk print" content="Фабрика принтов №1 в Узбекистане." />
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
