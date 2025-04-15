// pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="ru"> {/* Sets the language to Russian */}
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
