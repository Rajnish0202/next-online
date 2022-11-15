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
      return { ...state, loading: false, users: action.payload, error: '' };
    }
    case 'FETCH_FAIL': {
      return { ...state, loading: false, error: action.payload };
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

const AdminUsers = () => {
  const { state } = useContext(Store);
  const { userInfo } = state;
  const router = useRouter();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const [{ loading, error, users, successDelete, loadingDelete }, dispatch] = useReducer(reducer, {
    loading: true,
    users: [],
    error: '',
  });

  useEffect(() => {
    if (!userInfo) {
      router.push('/login');
    }
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/admin/users`, {
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

  const deleteHandler = async (userId) => {
    if (!window.confirm('Are you sure?')) {
      return;
    }
    closeSnackbar();
    try {
      dispatch({ type: 'DELETE_REQUEST' });
      await axios.delete(`/api/admin/users/${userId}`, {
        headers: {
          authorization: `Bearer ${userInfo.token}`,
        },
      });
      dispatch({ type: 'DELETE_SUCCESS' });
      enqueueSnackbar('User deleted successfully', { variant: 'success' });
    } catch (error) {
      dispatch({ type: 'DELETE_FAIL' });
      enqueueSnackbar(getError(error), { variant: 'error' });
    }
  };

  return (
    <Layout title='Users'>
      <div className={styles.container}>
        <div className={styles.sideBar}>
          <ul>
            <Link href='/admin/dashboard' passHref>
              <li>Dashboard</li>
            </Link>
            <Link href='/admin/orders' passHref>
              <li>Orders</li>
            </Link>
            <Link href='/admin/products'>
              <li>Products</li>
            </Link>
            <Link href='/admin/users'>
              <li className={styles.active}>Users</li>
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
              <h2 className={styles.heading}>users</h2>
              {loadingDelete && <p className={styles.loading}>Deleting...</p>}
              <table className={styles.table}>
                <thead className={styles.borderBottom}>
                  <tr>
                    <th className={styles.left}>ID</th>
                    <th className={styles.left}>NAME</th>
                    <th className={styles.left}>EMAIL</th>
                    <th className={styles.left}>ISADMIN</th>
                    <th className={styles.left}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className={styles.borderBottom}>
                      <td className={styles.name} title={user._id}>
                        {user._id.substring(20, 24)}
                      </td>
                      <td className={styles.name}>{user.name}</td>
                      <td className={styles.name}>{user.email}</td>
                      <td className={styles.name}>{user.isAdmin ? 'Yes' : 'No'}</td>
                      <td className={`${styles.name} ${styles.action}`}>
                        <Link href={`/admin/user/${user._id}`} passHref>
                          <button className={`${styles.btn} ${styles.edit}`}>Edit</button>
                        </Link>
                        <button className={`${styles.btn} ${styles.del}`} onClick={() => deleteHandler(user._id)}>
                          Delete
                        </button>
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

export default dynamic(() => Promise.resolve(AdminUsers), { ssr: false });
