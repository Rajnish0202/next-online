import axios from 'axios';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useReducer } from 'react';
import Layout from '../../components/Layout';
import styles from '../../styles/Dashboard.module.css';
import { getError } from '../../utils/error';
import { Store } from '../../utils/Store';

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

const AdminOrders = () => {
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
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/admin/orders`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (error) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(error) });
      }
    };
    fetchData();
  }, [router, userInfo]);

  return (
    <Layout title='Orders'>
      <div className={styles.container}>
        <div className={darkMode ? `${styles.sideBar} ${styles.dark} ${styles.darkMode}` : `${styles.sideBar}`}>
          <ul>
            <Link href='/admin/dashboard' passHref>
              <li>Dashboard</li>
            </Link>
            <Link href='/admin/orders' passHref>
              <li className={styles.active}>Orders</li>
            </Link>
            <Link href='/admin/products'>
              <li>Products</li>
            </Link>
            <Link href='/admin/users'>
              <li>Users</li>
            </Link>
          </ul>
        </div>
        <div className={darkMode ? `${styles.dash} ${styles.dark} ${styles.darkMode}` : `${styles.dash}`}>
          <h1 className={styles.heading}>Admin Dashboard</h1>
          {loading ? (
            <p className={styles.loading}>Loading...</p>
          ) : error ? (
            <p className={styles.error}>{error}</p>
          ) : (
            <div className={styles.overflow}>
              <h2 className={styles.heading}>Orders</h2>
              <table className={styles.table}>
                <thead className={styles.borderBottom}>
                  <tr>
                    <th className={styles.left}>ID</th>
                    <th className={styles.left}>USER</th>
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
                      <td className={styles.name} title={order._id}>
                        {order._id.substring(20, 24)}
                      </td>
                      <td className={styles.name} title={order.user.name}>
                        {order.user ? order.user.name.split(' ')[0] : 'DELETED USER'}
                      </td>
                      <td className={styles.name}>{order.createdAt}</td>
                      <td className={styles.name}>${order.totalPrice}</td>
                      <td className={styles.name}>{order.isPaid ? `${order.paidAt}` : 'Not paid'}</td>
                      <td className={styles.name}>{order.isDelivered ? `${order.deliveredAt}` : 'Not delivered'}</td>
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
          )}
        </div>
      </div>
    </Layout>
  );
};

export default dynamic(() => Promise.resolve(AdminOrders), { ssr: false });
