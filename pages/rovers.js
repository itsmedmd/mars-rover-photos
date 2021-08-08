import Head from "next/head";
import styles from "styles/rovers.module.scss";
import { Layout } from "components";

export const getStaticProps = async () => {
  const rovers = ["perseverance", "curiosity", "opportunity", "spirit"];

  console.time("rovers manifest fetch");
  const promises = rovers.map(
    (rover) =>
      new Promise((resolve, reject) => {
        fetch(
          `https://api.nasa.gov/mars-photos/api/v1/manifests/${rover}?api_key=${process.env.NASA_API_KEY}`
        )
          .then((res) => res.json())
          .then((data) => resolve(data.photo_manifest));
      })
  );

  const data = await Promise.all(promises);
  console.timeEnd("rovers manifest fetch");

  if (!data) {
    return { notFound: true };
  }

  return {
    props: { data },
    revalidate: 10800,
  };
};

const Rovers = (props) => {
  const { data } = props;

  // sort array descending by newest photo date
  data.sort((a, b) => {
    return new Date(b.max_date) - new Date(a.max_date);
  });

  return (
    <Layout>
      <Head>
        <title>Deimantas Butėnas - Mars Rover Photos - Rovers</title>
      </Head>

      <div className={styles["background"]}></div>

      <div className={styles["content"]}>
        {data.map((rover) => (
          <div key={`${rover.name}-manifest`} className={styles["rover"]}>
            <h2 className={styles["rover__name"]}>
              {rover.name}
              <p
                className={`
                    ${styles["rover__status"]}
                    ${
                      rover.status === "active"
                        ? styles["rover__status--active"]
                        : styles["rover__status--inactive"]
                    }
                  `}
              >
                {rover.status}
              </p>
            </h2>
            <div className={styles["rover__data"]}>
              <div className={styles["rover__data-column"]}>
                <p className={styles["rover__data-text"]}>Launch date:</p>
                <p className={styles["rover__data-text"]}>Landing date:</p>
                <p className={styles["rover__data-text"]}>Total photos:</p>
                <p className={styles["rover__data-text"]}>Most recent photo:</p>
              </div>

              <div className={styles["rover__data-column"]}>
                <p className={styles["rover__data-text"]}>
                  {rover.launch_date}
                </p>
                <p className={styles["rover__data-text"]}>
                  {rover.landing_date}
                </p>
                <p className={styles["rover__data-text"]}>
                  {rover.total_photos}
                </p>
                <p className={styles["rover__data-text"]}>{rover.max_date}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default Rovers;
