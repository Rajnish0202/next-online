import { useContext } from 'react';
import Layout from '../components/Layout';
import ProductItem from '../components/ProductItem';
import Product from '../model/Product';
import styles from '../styles/Home.module.css';
import db from '../utils/db';
import { Store } from '../utils/Store';

export default function Home(props) {
  const { products } = props;
  const { state } = useContext(Store);
  const { darkMode } = state;
  return (
    <Layout title='Home Page' description='E-Commerce app with nextJs'>
      <h1 className={darkMode ? `${styles.heading} ${styles.dark}` : styles.heading}>Products</h1>
      <div className={styles.container}>
        {products.map((product) => (
          <ProductItem product={product} key={product.slug} />
        ))}
      </div>
    </Layout>
  );
}

export async function getServerSideProps() {
  await db.connect();
  const products = await Product.find({}).lean();
  await db.disconnect();
  return {
    props: {
      products: products.map(db.convertDocToObj),
    },
  };
}
