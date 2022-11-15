import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import styles from '../styles/PlaceOrder.module.css';
import { Store } from '../utils/Store';
import Layout from '../components/Layout';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import CheckoutWizard from '../components/CheckoutWizard';
import { useSnackbar } from 'notistack';
import { getError } from '../utils/error';
import Cookies from 'js-cookie';

const PlaceOrder = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { state, dispatch } = useContext(Store);
  const {
    cart: { cartItems, shippingAddress, paymentMethod },
    darkMode,
    userInfo,
  } = state;

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100;

  const itemsPrice = round2(cartItems.reduce((a, c) => a + c.price * c.quantity, 0));
  const shippingPrice = itemsPrice > 200 ? 0 : 15;
  const taxPrice = round2(itemsPrice * 0.15);
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  useEffect(() => {
    if (!paymentMethod) {
      router.push('/payment');
    }

    if (cartItems.length === 0) {
      router.push('/cart');
    }
  }, []);

  const placeOrderHandler = async () => {
    closeSnackbar();
    try {
      setLoading(true);
      const { data } = await axios.post(
        '/api/orders',
        {
          orderItems: cartItems,
          shippingAddress,
          paymentMethod,
          itemsPrice,
          taxPrice,
          shippingPrice,
          totalPrice,
        },
        {
          headers: {
            authorization: `Bearer ${userInfo.token}`,
          },
        }
      );
      dispatch({ type: 'CART_CLEAR' });
      Cookies.remove('cartItems');
      setLoading(false);
      router.push(`/order/${data._id}`);
    } catch (error) {
      setLoading(false);
      enqueueSnackbar(getError(error), { variant: 'error' });
    }
  };

  return (
    <Layout title='Place Order'>
      <CheckoutWizard activeStep={3} />
      <h1 className={`${styles.heading} ${styles.mtop}`}>Place Order</h1>
      <div className={styles.cartItem}>
        <div className={styles.row}>
          <div className={styles.overflow}>
            <h2 className={styles.heading}>Shipping Address</h2>
            <p>
              {shippingAddress.fullName}, {shippingAddress.address}, {shippingAddress.city},{' '}
              {shippingAddress.postalCode},{shippingAddress.country}
            </p>
          </div>
          <div className={styles.overflow}>
            <h2 className={styles.heading}>Payment Method</h2>
            <p>{paymentMethod}</p>
          </div>
          <div className={styles.overflow}>
            <h2 className={styles.heading}>Order Items</h2>
            <table className={styles.table}>
              <thead className={styles.borderBottom}>
                <tr>
                  <th className={styles.left}>Item</th>
                  <th className={styles.left}>Name</th>
                  <th className={styles.right}>Qunatity</th>
                  <th className={styles.right}>Price</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item._id} className={styles.borderBottom}>
                    <td>
                      <Link href={`/product/${item.slug}`} className={styles.anchor}>
                        <Image src={item.image} alt={item.name} width={50} height={50}></Image>
                      </Link>
                    </td>
                    <td className={styles.name}>
                      <Link href={`/product/${item.slug}`} className={styles.anchor}>
                        {item.name}
                      </Link>
                    </td>
                    <td className={styles.quantity}>{item.quantity}</td>
                    <td className={styles.price}>${item.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className={darkMode ? `${styles.checkout} ${styles.dark}` : styles.checkout}>
          <ul>
            <li>
              <div className={styles.subtotal}>
                <h4 className={darkMode ? `${styles.heading} ${styles.darkText}` : `${styles.heading}`}>
                  Order Summary
                </h4>
                <div className={styles.box}>
                  <p>Items:</p>
                  <p>${itemsPrice}</p>
                </div>
                <div className={styles.box}>
                  <p>Tax:</p>
                  <p>${taxPrice}</p>
                </div>
                <div className={styles.box}>
                  <p>Shipping:</p>
                  <p>${shippingPrice}</p>
                </div>
                <div className={`${styles.box} ${styles.bold}`}>
                  <p>Total:</p>
                  <p>${totalPrice}</p>
                </div>
              </div>
            </li>
            <li>
              <button className={styles.checkoutBtn} onClick={placeOrderHandler} disabled={loading}>
                {loading ? 'Loading...' : 'Place Order'}
              </button>
              {loading}
            </li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default dynamic(() => Promise.resolve(PlaceOrder), { ssr: false });
