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
import { getError } from '../utils/error';

const Register = () => {
  const {
    handleSubmit,
    register,
    getValues,
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

  const submitHandler = async ({ name, email, password, confirmPassword }) => {
    closeSnackbar();

    if (password !== confirmPassword) {
      enqueueSnackbar(`Password don't match!`, { variant: 'error' });
      return;
    }

    try {
      const { data } = await axios.post('/api/users/register', {
        name,
        email,
        password,
      });
      dispatch({ type: 'USER_LOGIN', payload: data });
      Cookies.set('userInfo', JSON.stringify(data));
      router.push(redirect || '/');
    } catch (error) {
      enqueueSnackbar(getError(error), { variant: 'error' });
    }
  };

  return (
    <Layout title='Register'>
      <form
        className={darkMode ? `${styles.form} ${styles.dark}` : `${styles.form}`}
        onSubmit={handleSubmit(submitHandler)}
      >
        <h1 className={styles.heading}>Register</h1>
        <div className={darkMode ? `${styles.input} ${styles.dark}` : `${styles.input}`}>
          <label htmlFor='name'>Name</label>
          <input
            type='text'
            id='name'
            placeholder='Name'
            {...register('name', {
              required: 'Name is required!',
              minLength: { value: 2, message: 'Name must have at least 2 characters' },
              maxLength: { value: 30, message: 'Name not more than 30 characters' },
            })}
          />
          {errors.name && <div className={styles.error}>{errors.name.message}</div>}
        </div>
        <div className={styles.input}>
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
        <div className={styles.input}>
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
          <label htmlFor='confirmPassword'>Confirm Password</label>
          <input
            type='password'
            id='confirmPassword'
            placeholder='Confirm Password'
            {...register('confirmPassword', {
              required: 'Confirm Password is required!',
              validate: (value) => value === getValues('password'),
              minLength: { value: 6, message: 'Password must have at least 6 characters' },
            })}
          />
          {errors.confirmPassword && <div className={styles.error}>{errors.confirmPassword.message}</div>}
          {errors.confirmPassword && errors.confirmPassword.type === 'validate' && (
            <div className={styles.error}>Password do not match</div>
          )}
        </div>
        <div className={styles.input}>
          <button className={styles.button}>Register</button>
        </div>
        <div className={styles.forget}>
          Already have an account? &nbsp;
          <Link href={`/login?redirect=${redirect || '/'}`}>Login</Link>
        </div>
      </form>
    </Layout>
  );
};

export default Register;
