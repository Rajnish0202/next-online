/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import { useContext } from 'react';
import Layout from '../components/Layout';
import ProductItem from '../components/ProductItem';
import Product from '../model/Product';
import styles from '../styles/Home.module.css';
import db from '../utils/db';
import { Store } from '../utils/Store';
import 'react-responsive-carousel/lib/styles/carousel.min.css'; // requires a loader
import { Carousel } from 'react-responsive-carousel';
import Link from 'next/link';
import Image from 'next/image';

export default function Home(props) {
  const { topRatedProducts, featuredProducts } = props;
  const { state } = useContext(Store);
  const { darkMode } = state;

  return (
    <Layout title='Home Page' description='E-Commerce app with nextJs'>
      <Carousel
        className={styles.slider}
        autoPlay={true}
        infiniteLoop={true}
        interval={3000}
        showArrows={false}
        showThumbs={false}
        showStatus={false}
        stopOnHover={false}
      >
        {featuredProducts.map((product) => (
          <Link href={`/product/${product.slug}`} key={product._id}>
            <div>
              <Image src={product.featuredImage} width={800} height={480} objectFit='cover' />
            </div>
          </Link>
        ))}
      </Carousel>
      <h2 className={darkMode ? `${styles.heading} ${styles.dark}` : styles.heading}>Popular Products</h2>
      <div className={styles.container}>
        {topRatedProducts.map((product) => (
          <ProductItem product={product} key={product._id} />
        ))}
      </div>
    </Layout>
  );
}

export async function getServerSideProps() {
  await db.connect();
  const featuredProductsDocs = await Product.find({ isFeatured: true }, '-reviews').lean().limit(3);
  const topRatedProductsDocs = await Product.find({}, '-reviews')
    .lean()
    .sort({
      rating: -1,
    })
    .limit(6);
  await db.disconnect();
  return {
    props: {
      featuredProducts: featuredProductsDocs.map(db.convertDocToObj),
      topRatedProducts: topRatedProductsDocs.map(db.convertDocToObj),
    },
  };
}
