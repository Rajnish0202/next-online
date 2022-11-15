import axios from 'axios';
import { useContext, useEffect, useReducer } from 'react';
import dynamic from 'next/dynamic';
import styles from '../../styles/Order.module.css';
import { Store } from '../../utils/Store';
import Layout from '../../components/Layout';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { getError } from '../../utils/error';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { useSnackbar } from 'notistack';

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST': {
      return { ...state, loading: true, error: '' };
    }
    case 'FETCH_SUCCESS': {
      return { ...state, loading: false, order: action.payload, error: '' };
    }
    case 'FETCH_FAIL': {
      return { ...state, loading: false, error: action.payload };
    }
    case 'PAY_REQUEST': {
      return { ...state, loadingPay: true };
    }
    case 'PAY_SUCCESS': {
      return { ...state, loadingPay: false, successPay: true };
    }
    case 'PAY_FAIL': {
      return { ...state, loadingPay: false, errorPay: action.payload };
    }
    case 'PAY_RESET': {
      return { ...state, loadingPay: false, successPay: false, errorPay: '' };
    }
    case 'DELIVER_REQUEST': {
      return { ...state, loadingDeliver: true };
    }
    case 'DELIVER_SUCCESS': {
      return { ...state, loadingDeliver: false, successDeliver: true };
    }
    case 'DELIVER_FAIL': {
      return { ...state, loadingDeliver: false, errorDeliver: action.payload };
    }
    case 'DELIVER_RESET': {
      return { ...state, loadingDeliver: false, successDeliver: false, errorDeliver: '' };
    }

    default:
      state;
  }
}

const Order = ({ params }) => {
  const orderId = params.id;
  const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();
  const router = useRouter();
  const { state } = useContext(Store);
  const { darkMode, userInfo } = state;

  const { enqueueSnackbar } = useSnackbar();

  const [{ loading, error, order, successPay, successDeliver, loadingDeliver }, dispatch] = useReducer(reducer, {
    loading: true,
    order: {},
    error: '',
  });

  const {
    shippingAddress,
    paymentMethod,
    orderItems,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    isPaid,
    paidAt,
    isDelivered,
    deliveredAt,
  } = order;

  useEffect(() => {
    if (!userInfo) {
      return router.push('/login');
    }

    const fetchOrder = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/orders/${orderId}`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (error) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(error) });
      }
    };

    if (!order._id || successPay || successDeliver || (order._id && order._id !== orderId)) {
      fetchOrder();
      if (successPay) {
        dispatch({ type: 'PAY_RESET' });
      }
      if (successDeliver) {
        dispatch({ type: 'DELIVER_RESET' });
      }
    } else {
      const loadPaypalScript = async () => {
        const { data: clientId } = await axios.get('/api/keys/paypal', {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        paypalDispatch({
          type: 'resetOptions',
          value: {
            'client-id': clientId,
            currency: 'USD',
          },
        });
        paypalDispatch({ type: 'setLoadingStatus', value: 'pending' });
      };
      loadPaypalScript();
    }
  }, [order, successPay, successDeliver]);

  function createOrder(data, actions) {
    return actions.order
      .create({
        purchase_units: [
          {
            amount: { value: totalPrice },
          },
        ],
      })
      .then((orderID) => {
        return orderID;
      });
  }

  function onApprove(data, actions) {
    return actions.order.capture().then(async function (details) {
      try {
        dispatch({ type: 'PAY_REQUEST' });
        const { data } = await axios.put(`/api/orders/${order._id}/pay`, details, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'PAY_SUCCESS', payload: data });
        enqueueSnackbar('Order is paid', { variant: 'success' });
      } catch (error) {
        dispatch({ type: 'PAY_FAIL', payload: getError(error) });
        enqueueSnackbar(getError(error), { variant: 'error' });
      }
    });
  }

  function onError(error) {
    enqueueSnackbar(getError(error), { variant: 'error' });
  }

  async function deliverOrderHandler() {
    try {
      dispatch({ type: 'DELIVER_REQUEST' });
      const { data } = await axios.put(
        `/api/orders/${order._id}/deliver`,
        {},
        {
          headers: { authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({ type: 'DELIVER_SUCCESS', payload: data });
      enqueueSnackbar('Order is delivered!', { variant: 'success' });
    } catch (error) {
      dispatch({ type: 'DELIVER_FAIL', payload: getError(error) });
      enqueueSnackbar(getError(error), { variant: 'error' });
    }
  }

  return (
    <Layout title={`Order ${orderId}`}>
      <h1 className={`${styles.heading} ${styles.mtop}`}>Order {orderId}</h1>
      {loading ? (
        <p className={styles.loading}>Loading...</p>
      ) : error ? (
        <p className={styles.error}>{error}</p>
      ) : (
        <div className={styles.cartItem}>
          <div className={styles.row}>
            <div className={styles.overflow}>
              <h2 className={styles.heading}>Shipping Address</h2>
              <p>
                {shippingAddress.fullName}, {shippingAddress.address}, {shippingAddress.city},{' '}
                {shippingAddress.postalCode},{shippingAddress.country}
              </p>
              <p>Status: {isDelivered ? `delivered at ${deliveredAt}` : 'not delivered'}</p>
            </div>
            <div className={styles.overflow}>
              <h2 className={styles.heading}>Payment Method</h2>
              <p>{paymentMethod}</p>
              <p>Status: {isPaid ? `paid at ${paidAt}` : 'not paid'}</p>
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
                  {orderItems.map((item) => (
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
                  {!isPaid && (
                    <div className={styles.box}>
                      {isPending ? (
                        <p className={styles.loading}>Loading...</p>
                      ) : (
                        <div className={styles.payBtn}>
                          <PayPalButtons
                            createOrder={createOrder}
                            onApprove={onApprove}
                            onError={onError}
                          ></PayPalButtons>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </li>
              {userInfo.isAdmin && order.isPaid && !order.isDelivered && (
                <li>
                  <div className={styles.box}>
                    {loadingDeliver ? (
                      <p className={styles.loading}>Loading...</p>
                    ) : (
                      <button onClick={deliverOrderHandler} className={styles.checkoutBtn}>
                        Deliver Order
                      </button>
                    )}
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </Layout>
  );
};

export async function getServerSideProps({ params }) {
  return { props: { params } };
}

export default dynamic(() => Promise.resolve(Order), { ssr: false });
