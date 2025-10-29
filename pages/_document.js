import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* DevFun Verification Meta Tag */}
        <meta name="devfun-verification" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
