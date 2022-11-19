import axios from 'axios';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { useContext, useEffect, useReducer, useState } from 'react';
import { useForm } from 'react-hook-form';
import Layout from '../../../components/Layout';
import styles from '../../../styles/Dashboard.module.css';
import { getError } from '../../../utils/error';
import { Store } from '../../../utils/Store';

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST': {
      return { ...state, loading: true, error: '' };
    }
    case 'FETCH_SUCCESS': {
      return { ...state, loading: false, error: '' };
    }
    case 'FETCH_FAIL': {
      return { ...state, loading: false, error: action.payload };
    }
    case 'UPDATE_REQUEST': {
      return { ...state, loadingUpdate: true, errorUpdate: '' };
    }
    case 'UPDATE_SUCCESS': {
      return { ...state, loadingUpdate: false, errorUpdate: '' };
    }
    case 'UPDATE_FAIL': {
      return { ...state, loadingUpdate: false, errorUpdate: action.payload };
    }
    case 'UPLOAD_REQUEST': {
      return { ...state, loadingUpload: true, errorUpload: '' };
    }
    case 'UPLOAD_SUCCESS': {
      return { ...state, loadingUpload: false, errorUpload: '' };
    }
    case 'UPLOAD_FAIL': {
      return { ...state, loadingUpload: false, errorUpload: action.payload };
    }

    default:
      state;
  }
}

const UserEdit = ({ params }) => {
  const userId = params.id;
  const { state } = useContext(Store);
  const { userInfo, darkMode } = state;
  const router = useRouter();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const [{ loading, error, loadingUpdate }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  const {
    handleSubmit,
    register,
    formState: { errors },
    setValue,
  } = useForm();

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!userInfo) {
      return router.push('/login');
    } else {
      const fetchData = async () => {
        try {
          dispatch({ type: 'FETCH_REQUEST' });
          const { data } = await axios.get(`/api/admin/users/${userId}`, {
            headers: { authorization: `Bearer ${userInfo.token}` },
          });
          setIsAdmin(data.isAdmin);
          dispatch({ type: 'FETCH_SUCCESS' });
          setValue('name', data.name);
        } catch (error) {
          dispatch({ type: 'FETCH_FAIL', payload: getError(error) });
        }
      };
      fetchData();
    }
  }, [router, userInfo]);

  const submitHandler = async ({ name }) => {
    closeSnackbar();

    try {
      dispatch({ type: 'UPDATE_REQUEST' });
      await axios.put(
        `/api/admin/users/${userId}`,
        {
          name,
          isAdmin,
        },
        {
          headers: { authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({ type: 'UPDATE_SUCCESS' });
      enqueueSnackbar('User updated successfully', { variant: 'success' });
      router.push('/admin/users');
    } catch (error) {
      dispatch({ type: 'UPDATE_FAIL', payload: getError(error) });
      enqueueSnackbar(getError(error), { variant: 'error' });
    }
  };

  return (
    <Layout title={`Edit User ${userId}`}>
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
              <li>Products</li>
            </Link>
            <Link href='/admin/users'>
              <li className={styles.active}>Users</li>
            </Link>
          </ul>
        </div>
        <div className={darkMode ? `${styles.dash} ${styles.dark} ${styles.darkMode}` : `${styles.dash}`}>
          <h1 className={styles.heading}>{`User ${userId}`}</h1>
          {loading ? (
            <p className={styles.loading}>Loading...</p>
          ) : error ? (
            <p className={styles.error}>{error}</p>
          ) : (
            <div>
              <h2 className={styles.heading}>users</h2>
              <form className={styles.form} onSubmit={handleSubmit(submitHandler)}>
                <div className={styles.input}>
                  <label htmlFor='name'>Name</label>
                  <input
                    type='text'
                    id='name'
                    placeholder='Name'
                    {...register('name', {
                      required: 'Name is required!',
                    })}
                  />
                  {errors.name && <div className={styles.error}>{errors.name.message}</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0 10px 0' }}>
                  <input
                    type='checkbox'
                    id='name'
                    name='isAdmin'
                    checked={isAdmin}
                    onClick={(e) => setIsAdmin(e.target.checked)}
                    style={{ height: '18px', width: '18px' }}
                  />
                  <label htmlFor='isAdmin' style={{ marginLeft: '10px', fontSize: '16px', fontWeight: '500' }}>
                    Is Admin
                  </label>
                </div>
                <div className={styles.input}>
                  <button className={styles.button} style={{ width: '100%' }}>
                    Update User
                  </button>
                  {loadingUpdate && <p className={styles.loading}>Loading...</p>}
                </div>
                <div className={styles.input}>
                  <Link href={`/admin/users`} passHref>
                    <button className={styles.button} style={{ width: '100%', background: 'gray' }}>
                      Back
                    </button>
                  </Link>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export async function getServerSideProps({ params }) {
  return {
    props: { params },
  };
}

export default dynamic(() => Promise.resolve(UserEdit), { ssr: false });
