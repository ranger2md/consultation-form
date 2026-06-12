import '../styles/globals.css'
import Head from 'next/head'

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Consultation Request Form | 4Ever Young Scottsdale</title>
        <meta name="description" content="Medical Director Consultation Request Form" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}

export default MyApp
