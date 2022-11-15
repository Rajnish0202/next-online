import axios from 'axios';
import Cookies from 'js-cookie';
import Link from 'next/link';
import styles from '../styles/Login.module.css';
import Layout from '../components/Layout';
import { useContext, useEffect } from 'react';
import { Store } from '../utils/Store';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';

const LoginScreen = () => {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm();

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const { state, dispatch } = useContext(Store);
  const router = useRouter();
  const { redirect } = router.query;
  const { userInfo, darkMode } = state;

  useEffect(() => {
    if (userInfo) {
      router.push('/');
    }
  }, []);

  const submitHandler = async ({ email, password }) => {
    closeSnackbar();
    try {
      const { data } = await axios.post('/api/users/login', {
        email,
        password,
      });
      dispatch({ type: 'USER_LOGIN', payload: data });
      Cookies.set('userInfo', JSON.stringify(data));
      router.push(redirect || '/');
    } catch (error) {
      enqueueSnackbar(error.response.data ? error.response.data.message : error.message, { variant: 'error' });
    }
  };

  return (
    <Layout title='User Login'>
      <form className={styles.form} onSubmit={handleSubmit(submitHandler)}>
        <h1 className={darkMode ? `${styles.heading} ${styles.dark}` : `${styles.heading}`}>Login</h1>
        <div className={darkMode ? `${styles.input} ${styles.dark}` : `${styles.input}`}>
          <label htmlFor='email'>Email</label>
          <input
            type='email'
            id='email'
            placeholder='Email'
            {...register('email', {
              required: 'Email is required!',
              pattern: {
                value: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/i,
                message: 'Email is not valid!',
              },
            })}
          />
          {errors.email && <div className={styles.error}>{errors.email.message}</div>}
        </div>
        <div className={darkMode ? `${styles.input} ${styles.dark}` : `${styles.input}`}>
          <label htmlFor='password'>Password</label>
          <input
            type='password'
            id='password'
            placeholder='Password'
            {...register('password', {
              required: 'Password is required!',
              minLength: { value: 6, message: 'Password must have at least 6 characters' },
            })}
          />
          {errors.password && <div className={styles.error}>{errors.password.message}</div>}
        </div>
        <div className={styles.input}>
          <button className={styles.button}>Login</button>
        </div>
        <div className={styles.forget}>
          Don&apos;t have an account? &nbsp;
          <Link href={`/register?redirect=${redirect || '/'}`}>Register</Link>
        </div>
      </form>
    </Layout>
  );
};

export default LoginScreen;
