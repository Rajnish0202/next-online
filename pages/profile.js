import axios from 'axios';
import dynamic from 'next/dynamic';
import styles from '../styles/Login.module.css';
import { useRouter } from 'next/router';
import { useContext, useEffect } from 'react';
import Layout from '../components/Layout';
import { getError } from '../utils/error';
import { Store } from '../utils/Store';
import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import Cookies from 'js-cookie';
import Link from 'next/link';

const Profile = () => {
  const { state, dispatch } = useContext(Store);
  const { userInfo, darkMode } = state;
  const router = useRouter();

  const {
    handleSubmit,
    register,
    getValues,
    formState: { errors },
    setValue,
  } = useForm();

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  useEffect(() => {
    if (!userInfo) {
      return router.push('/login');
    }

    setValue('name', userInfo.name);
    setValue('email', userInfo.email);
  }, []);

  const submitHandler = async ({ name, email, password, confirmPassword }) => {
    closeSnackbar();

    if (password !== confirmPassword) {
      enqueueSnackbar(`Password don't match!`, { variant: 'error' });
      return;
    }

    try {
      const { data } = await axios.put(
        '/api/users/profile',
        {
          name,
          email,
          password,
        },
        {
          headers: { authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({ type: 'USER_LOGIN', payload: data });
      Cookies.set('userInfo', JSON.stringify(data));
      enqueueSnackbar('Profile updated successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(getError(error), { variant: 'error' });
    }
  };

  return (
    <Layout title={`Profile`}>
      <div className={styles.container}>
        <div className={darkMode ? `${styles.sideBar} ${styles.dark}` : `${styles.sideBar}`}>
          <ul>
            <Link href='/profile' passHref>
              <li className={styles.active}>Update Profile</li>
            </Link>
            <Link href='/order-history' passHref>
              <li>My Orders</li>
            </Link>
          </ul>
        </div>
        <div className={darkMode ? `${styles.formSection} ${styles.dark}` : `${styles.formSection}`}>
          <form className={styles.form} onSubmit={handleSubmit(submitHandler)}>
            <h1 className={styles.heading}>Update Profile</h1>

            <div className={styles.input}>
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
              <button className={styles.button} style={{ width: '100%' }}>
                Update Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default dynamic(() => Promise.resolve(Profile), { ssr: false });
