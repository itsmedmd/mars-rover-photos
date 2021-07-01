import Head from "next/head";
import styles from "./layout.module.scss";

export default function Layout({ children }) {
  return (
    <div className={styles.layout}>
      <Head>
        <meta name="title" content="Front-end developer Deimantas Butėnas" />
        <meta
          name="description"
          content="Portfolio website of a front-end developer Deimantas Butėnas."
        />
        <meta
          name="keywords"
          content="deimantas butėnas, deimantas butenas, web development, frontend, front-end, front end, front end development, front end developer, portfolio, design, web design, react, gatsby, javascript, html, css, scss, sass, git, aws, graphql"
        />
        <link rel="canonical" href="https://www.deimantasb.com/" />

        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.deimantasb.com/" />
        <meta
          property="og:title"
          content="Front-end developer Deimantas Butėnas"
        />
        <meta
          property="og:description"
          content="Portfolio website of a front-end developer Deimantas Butėnas where you can see his work!"
        />
        <meta
          property="og:image"
          content="https://www.deimantasb.com/meta-image.png"
        />

        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://www.deimantasb.com/" />
        <meta
          property="twitter:title"
          content="Frontend developer Deimantas Butėnas"
        />
        <meta
          property="twitter:description"
          content="Portfolio website of a front-end developer Deimantas Butėnas where you can see his work!"
        />
        <meta
          property="twitter:image"
          content="https://www.deimantasb.com/meta-image.png"
        />
      </Head>
      <header className={styles.header}></header>
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}></footer>
    </div>
  );
}
