import axios from 'axios';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useReducer } from 'react';
import Layout from '../../components/Layout';
import styles from '../../styles/Dashboard.module.css';
import { getError } from '../../utils/error';
import { Store } from '../../utils/Store';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST': {
      return { ...state, loading: true, error: '' };
    }
    case 'FETCH_SUCCESS': {
      return { ...state, loading: false, summary: action.payload, error: '' };
    }
    case 'FETCH_FAIL': {
      return { ...state, loading: false, error: action.payload };
    }

    default:
      state;
  }
}

const AdminDashboard = () => {
  const { state } = useContext(Store);
  const { userInfo } = state;
  const router = useRouter();

  const [{ loading, error, summary }, dispatch] = useReducer(reducer, {
    loading: true,
    summary: { salesData: [] },
    error: '',
  });

  useEffect(() => {
    if (!userInfo) {
      router.push('/login');
    }
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/admin/summary`, {
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
    <Layout title='Admin Dashboard'>
      <div className={styles.container}>
        <div className={styles.sideBar}>
          <ul>
            <Link href='/admin/dashboard' passHref>
              <li className={styles.active}>Dashboard</li>
            </Link>
            <Link href='/admin/orders' passHref>
              <li>Orders</li>
            </Link>
            <Link href='/admin/products'>
              <li>Products</li>
            </Link>
            <Link href='/admin/users'>
              <li>Users</li>
            </Link>
          </ul>
        </div>
        <div className={styles.dash}>
          <h1 className={styles.heading}>Admin Dashboard</h1>
          {loading ? (
            <p className={styles.loading}>Loading...</p>
          ) : error ? (
            <p className={styles.error}>{error}</p>
          ) : (
            <div>
              <div className={styles.task}>
                <div className={styles.card}>
                  <p className={styles.count}>${summary.ordersPrice}</p>
                  <p className={styles.text}>Sales</p>
                  <Link href='/admin/orders'>View sales</Link>
                </div>
                <div className={styles.card}>
                  <p className={styles.count}>{summary.ordersCount}</p>
                  <p className={styles.text}>Orders</p>
                  <Link href='/admin/orders'>View orders</Link>
                </div>
                <div className={styles.card}>
                  <p className={styles.count}>{summary.productsCount}</p>
                  <p className={styles.text}>Products</p>
                  <Link href='/admin/products'>View products</Link>
                </div>
                <div className={styles.card}>
                  <p className={styles.count}>{summary.usersCount}</p>
                  <p className={styles.text}>Users</p>
                  <Link href='/admin/users'>View users</Link>
                </div>
              </div>
              <h2 className={styles.heading}>Sales Report</h2>
              <Bar
                data={{
                  labels: summary.salesData.map((x) => x._id),
                  datasets: [
                    {
                      label: 'Sales',
                      backgroundColor: 'rgba(162,222,208,1)',
                      data: summary.salesData.map((x) => x.totalSales),
                    },
                  ],
                }}
                options={{
                  legend: { display: true, position: 'right' },
                }}
              ></Bar>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default dynamic(() => Promise.resolve(AdminDashboard), { ssr: false });
