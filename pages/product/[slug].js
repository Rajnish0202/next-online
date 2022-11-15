import axios from 'axios';
import styles from '../../styles/ProductScreen.module.css';
import Link from 'next/link';
import Layout from '../../components/Layout';
import Image from 'next/image';
import { useContext } from 'react';
import { Store } from '../../utils/Store';
import db from '../../utils/db';
import Product from '../../model/Product';
import { useRouter } from 'next/router';

const ProductScreen = (props) => {
  const { product } = props;
  const { state, dispatch } = useContext(Store);
  const darkMode = { state };
  const router = useRouter();

  if (!product) {
    return <div>Product Not Found!</div>;
  }

  const addToCartHandler = async (product) => {
    const existItem = state.cart.cartItems.find((item) => item._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${product._id}`);

    if (data.countInStock < quantity) {
      alert('Sorry, Product is out of Stock!');
      return;
    }

    dispatch({ type: 'CART_ADD_ITEM', payload: { ...product, quantity } });
    router.push('/cart');
  };

  return (
    <Layout title={product.name} description={product.description}>
      <div className={styles.back}>
        <Link href='/'>&larr; back to products</Link>
      </div>
      <div className={styles.container}>
        <div className={styles.imgContainer}>
          <Image
            src={product.image}
            alt={product.name}
            width='640'
            height='640'
            layout='responsive'
            title={product.name}
          />
        </div>
        <div>
          <ul>
            <li className={styles.list}>
              <h1>{product.name}</h1>
            </li>
            <li className={styles.list}>
              <p>Category: {product.category}</p>
            </li>
            <li className={styles.list}>
              <p>Brand: {product.brand}</p>
            </li>
            <li className={styles.list}>
              <p>
                Rating: {product.rating} stars ({product.numReviews} reviews)
              </p>
            </li>
            <li className={styles.list}>
              <p>Description: {product.description}</p>
            </li>
          </ul>
        </div>
        <div className={darkMode ? `${styles.card} ${styles.darkShadow}` : `${styles.card}`}>
          <div className={styles.wrapper}>
            <div>Price</div>
            <div className={styles.price}>${product.price}</div>
          </div>
          <div className={styles.wrapper}>
            <div>Status</div>
            <div className={styles.status}>{product.countInStock > 0 ? 'In stock' : 'Unavailable'}</div>
          </div>
          <button className={styles.button} onClick={() => addToCartHandler(product)}>
            Add to cart
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default ProductScreen;

export async function getServerSideProps(context) {
  const { params } = context;
  const { slug } = params;
  await db.connect();
  const product = await Product.findOne({ slug }).lean();
  await db.disconnect();
  return {
    props: {
      product: db.convertDocToObj(product),
    },
  };
}
