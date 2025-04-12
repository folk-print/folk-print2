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
