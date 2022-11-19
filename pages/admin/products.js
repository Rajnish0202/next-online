import axios from 'axios';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
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
      return { ...state, loading: false, products: action.payload, error: '' };
    }
    case 'FETCH_FAIL': {
      return { ...state, loading: false, error: action.payload };
    }
    case 'CREATE_REQUEST': {
      return { ...state, loadingCreate: true };
    }
    case 'CREATE_SUCCESS': {
      return { ...state, loadingCreate: false };
    }
    case 'CREATE_FAIL': {
      return { ...state, loadingCreate: false };
    }
    case 'DELETE_REQUEST': {
      return { ...state, loadingDelete: true };
    }
    case 'DELETE_SUCCESS': {
      return { ...state, loadingDelete: false, successDelete: true };
    }
    case 'DELETE_FAIL': {
      return { ...state, loadingDelete: false };
    }
    case 'DELETE_RESET': {
      return { ...state, loadingDelete: false, successDelete: false };
    }

    default:
      state;
  }
}

const AdminProducts = () => {
  const { state } = useContext(Store);
  const { userInfo, darkMode } = state;
  const router = useRouter();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const [{ loading, error, products, loadingCreate, successDelete, loadingDelete }, dispatch] = useReducer(reducer, {
    loading: true,
    products: [],
    error: '',
  });

  useEffect(() => {
    if (!userInfo) {
      router.push('/login');
    }
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/admin/products`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (error) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(error) });
      }
    };
    if (successDelete) {
      dispatch({ type: 'DELETE_RESET' });
    } else {
      fetchData();
    }
  }, [router, userInfo, successDelete]);

  const createHandler = async () => {
    if (!window.confirm('Are you sure?')) {
      return;
    }
    closeSnackbar();
    try {
      dispatch({ type: 'CREATE_REQUEST' });
      const { data } = await axios.post(
        '/api/admin/products',
        {},
        {
          headers: {
            authorization: `Bearer ${userInfo.token}`,
          },
        }
      );
      dispatch({ type: 'CREATE_SUCCESS' });
      enqueueSnackbar('Product created successfully', { variant: 'success' });
      router.push(`/admin/product/${data.product._id}`);
    } catch (error) {
      dispatch({ type: 'CREATE_FAIL' });
      enqueueSnackbar(getError(error), { variant: 'error' });
    }
  };

  const deleteHandler = async (productId) => {
    if (!window.confirm('Are you sure?')) {
      return;
    }
    closeSnackbar();
    try {
      dispatch({ type: 'DELETE_REQUEST' });
      await axios.delete(`/api/admin/products/${productId}`, {
        headers: {
          authorization: `Bearer ${userInfo.token}`,
        },
      });
      dispatch({ type: 'DELETE_SUCCESS' });
      enqueueSnackbar('Product deleted successfully', { variant: 'success' });
    } catch (error) {
      dispatch({ type: 'DELETE_FAIL' });
      enqueueSnackbar(getError(error), { variant: 'error' });
    }
  };

  return (
    <Layout title='Products'>
      <div className={styles.container}>
        <div className={darkMode ? `${styles.sideBar} ${styles.dark} ${styles.darkMode}` : `${styles.sideBar}`}>
          <ul>
            <Link href='/admin/dashboard' passHref>
              <li>Dashboard</li>
            </Link>
            <Link href='/admin/orders' passHref>
              <li>Orders</li>
            </Link>
            <Link href='/admin/products'>
              <li className={styles.active}>Products</li>
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
            <div>
              <div className={styles.add}>
                <h2 className={styles.heading}>products</h2>
                {loadingDelete && <p className={styles.loading}>Deleting...</p>}
                <button className={styles.btn} onClick={createHandler}>
                  {loadingCreate ? 'Creating... ' : 'Create New Product'}
                </button>
              </div>
              <div className={styles.overflow}>
                <table className={styles.table}>
                  <thead className={styles.borderBottom}>
                    <tr>
                      <th className={styles.left}>ID</th>
                      <th className={styles.left}>NAME</th>
                      <th className={styles.left}>PRICE</th>
                      <th className={styles.left}>CATEGORY</th>
                      <th className={styles.left}>COUNT</th>
                      <th className={styles.left}>RATING</th>
                      <th className={styles.left}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product._id} className={styles.borderBottom}>
                        <td className={styles.name} title={product._id}>
                          {product._id.substring(20, 24)}
                        </td>
                        <td className={styles.name}>{product.name}</td>
                        <td className={styles.name}>${product.price}</td>
                        <td className={styles.name}>{product.category}</td>
                        <td className={styles.name}>{product.countInStock}</td>
                        <td className={styles.name}>{product.rating}</td>
                        <td className={`${styles.name} ${styles.action}`}>
                          <Link href={`/admin/product/${product._id}`} passHref>
                            <button className={`${styles.btn} ${styles.edit}`}>Edit</button>
                          </Link>
                          <button className={`${styles.btn} ${styles.del}`} onClick={() => deleteHandler(product._id)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default dynamic(() => Promise.resolve(AdminProducts), { ssr: false });
