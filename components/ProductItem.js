import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { useSnackbar } from 'notistack';
import { useContext } from 'react';
import StarRatings from 'react-star-ratings';
import styles from '../styles/ProductItem.module.css';
import { Store } from '../utils/Store';

const ProductItem = ({ product }) => {
  const { state, dispatch } = useContext(Store);
  const { darkMode } = state;
  const { enqueueSnackbar } = useSnackbar();

  const addToCartHandler = async (product) => {
    const existItem = state.cart.cartItems.find((item) => item._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${product._id}`);

    if (data.countInStock < quantity) {
      enqueueSnackbar('Sorry, Product is out of Stock!', { variant: 'error' });
      return;
    }
    dispatch({ type: 'CART_ADD_ITEM', payload: { ...product, quantity } });
    // router.push('/cart');
  };

  return (
    <div className={darkMode ? `${styles.card} ${styles.darkShadow}` : styles.card}>
      <Link href={`/product/${product.slug}`}>
        <Image
          src={product.image}
          alt={product.name}
          className={styles.image}
          height='300'
          width='300'
          title={product.name}
        />
      </Link>
      <div className={styles.row}>
        <Link href={`/product/${product.slug}`}>
          <h2 className={darkMode ? `${styles.heading} ${styles.dark}` : styles.heading}>{product.name}</h2>
        </Link>
        <StarRatings
          rating={product.rating}
          starRatedColor='#dfa943'
          starDimension='25px'
          name='rating'
          starSpacing='0'
        />
        <p className={darkMode ? `${styles.brand} ${styles.dark}` : styles.brand}>{product.brand}</p>
        <p className={darkMode ? `${styles.price} ${styles.dark}` : styles.price}>${product.price}</p>
        <button className={styles.button} onClick={() => addToCartHandler(product)}>
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductItem;
