import styles from "styles/home.module.scss";
import { Layout, RoverImage } from "components";

/*export function getAllPostIds() {
  const fileNames = fs.readdirSync(postsDirectory)

  // Returns an array that looks like this:
  // [
  //   {
  //     params: {
  //       id: 'ssg-ssr'
  //     }
  //   },
  //   {
  //     params: {
  //       id: 'pre-rendering'
  //     }
  //   }
  // ]
  return fileNames.map(fileName => {
    return {
      params: {
        id: fileName.replace(/\.md$/, '')
      }
    }
  })
} */

export async function getStaticPaths() {
  const rovers = ["perseverance", "curiosity", "opportunity", "spirit"];
  let data = []; // latest photos from all rovers

  for (let rover of rovers) {
    //`https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/latest_photos?api_key=${process.env.NASA_API_KEY}`
    // fetch rover photos and add it to the array
    const res = await fetch(
      `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos?api_key=${process.env.NASA_API_KEY}&sol=1000`
    );
    const newData = await res.json();
    data = data.concat(newData.photos);
  }

  const pagesCount = data.length / 10;
  const paths = [];

  for (let i = 1; i <= pagesCount; i++) {
    paths.push({
      params: {
        page: `page-${i * 10}`,
      },
    });
  }

  console.log("all paths:", paths);

  return {
    paths,
    fallback: false,
  };
}

/*
export function getPostData(id) {
  const fullPath = path.join(postsDirectory, `${id}.md`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents)

  // Combine the data with the id
  return {
    id,
    ...matterResult.data
  }
} */

export async function getStaticProps({ params }) {
  const rovers = ["perseverance", "curiosity", "opportunity", "spirit"];
  let data = []; // latest photos from all rovers

  for (let rover of rovers) {
    //`https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/latest_photos?api_key=${process.env.NASA_API_KEY}`
    // fetch rover photos and add it to the array
    const res = await fetch(
      `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos?api_key=${process.env.NASA_API_KEY}&sol=1000`
    );
    const newData = await res.json();
    data = data.concat(newData.photos);
  }

  if (!data) {
    return { notFound: true };
  }

  let pageNumber = params.page.split("-");
  pageNumber = parseInt(pageNumber[1]);
  data = data.slice(pageNumber, pageNumber + 10);

  return {
    props: { data },
    revalidate: 3600,
  };
}

const Page = ({ data }) => {
  const photosToRender = data.map((photo) => {
    const imageProps = {
      src: photo.img_src,
      layout: "fill",
      quality: "35",
      alt: `${photo.rover.name} Mars rover image with ${photo.camera.full_name} on ${photo.earth_date}`,
    };

    return (
      <RoverImage key={`${photo.rover.name}-${photo.id}`} props={imageProps} />
    );
  });

  return (
    <Layout>
      <div className={styles.gallery}>{photosToRender}</div>
    </Layout>
  );
};

export default Page;
