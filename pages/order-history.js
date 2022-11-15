import axios from 'axios';
import dynamic from 'next/dynamic';
import styles from '../styles/History.module.css';
import { useRouter } from 'next/router';
import { useContext, useEffect, useReducer } from 'react';
import Layout from '../components/Layout';
import { getError } from '../utils/error';
import { Store } from '../utils/Store';
import Link from 'next/link';

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST': {
      return { ...state, loading: true, error: '' };
    }
    case 'FETCH_SUCCESS': {
      return { ...state, loading: false, orders: action.payload, error: '' };
    }
    case 'FETCH_FAIL': {
      return { ...state, loading: false, error: action.payload };
    }

    default:
      state;
  }
}

const OrderHistory = () => {
  const { state } = useContext(Store);
  const { userInfo, darkMode } = state;
  const router = useRouter();

  const [{ loading, error, orders }, dispatch] = useReducer(reducer, {
    loading: true,
    orders: [],
    error: '',
  });

  useEffect(() => {
    if (!userInfo) {
      router.push('/login');
    }
    const fetchOrders = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/orders/history`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (error) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(error) });
      }
    };
    fetchOrders();
  }, []);

  return (
    <Layout title={`Orders History`}>
      <h1 className={styles.heading}>Order History</h1>
      {loading ? (
        <p className={styles.loading}>Loading...</p>
      ) : error ? (
        <p className={styles.error}>{error}</p>
      ) : (
        <div className={styles.cartItem}>
          <div className={darkMode ? `${styles.overflow} ${styles.dark}` : styles.overflow}>
            <table className={styles.table}>
              <thead className={styles.borderBottom}>
                <tr>
                  <th className={styles.left}>ID</th>
                  <th className={styles.left}>DATE</th>
                  <th className={styles.left}>TOTAL</th>
                  <th className={styles.left}>PAID</th>
                  <th className={styles.left}>DELIVERED</th>
                  <th className={styles.left}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className={styles.borderBottom}>
                    <td className={styles.name}>{order._id.substring(20, 24)}</td>
                    <td className={styles.name}>{order.createdAt.substring(0, 10)}</td>
                    <td className={styles.name}>${order.totalPrice}</td>
                    <td className={styles.name}>{order.isPaid ? `${order.paidAt.substring(0, 10)}` : 'Not paid'}</td>
                    <td className={styles.name}>
                      {order.isDelivered ? `${order.deliveredAt.substring(0, 10)}` : 'Not delivered'}
                    </td>
                    <td className={styles.name}>
                      <Link href={`/order/${order._id}`} passHref>
                        <button className={styles.btn}>Details</button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default dynamic(() => Promise.resolve(OrderHistory), { ssr: false });

{
  /* <div className={darkMode ? `${styles.checkout} ${styles.dark}` : styles.checkout}>
  <ul>
    <li>
      <div className={styles.subtotal}>
        <h4 className={darkMode ? `${styles.heading} ${styles.darkText}` : `${styles.heading}`}>Order Summary</h4>
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
        {!isPaid && (
          <div className={styles.box}>
            {isPending ? (
              <p className={styles.loading}>Loading...</p>
            ) : (
              <div className={styles.payBtn}>
                <PayPalButtons createOrder={createOrder} onApprove={onApprove} onError={onError}></PayPalButtons>
              </div>
            )}
          </div>
        )}
      </div>
    </li>
  </ul>
</div>; */
}
