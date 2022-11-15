import Cookies from 'js-cookie';
import styles from '../styles/Login.module.css';
import Layout from '../components/Layout';
import { useContext, useEffect } from 'react';
import { Store } from '../utils/Store';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import CheckoutWizard from '../components/CheckoutWizard';

const Shipping = () => {
  const {
    handleSubmit,
    register,
    formState: { errors },
    setValue,
  } = useForm();

  const { state, dispatch } = useContext(Store);
  const router = useRouter();
  const {
    userInfo,
    cart: { shippingAddress },
  } = state;

  useEffect(() => {
    if (!userInfo) {
      router.push('/login?redirect=/shipping');
    }
    setValue('fullName', shippingAddress.fullName);
    setValue('address', shippingAddress.address);
    setValue('city', shippingAddress.city);
    setValue('postalCode', shippingAddress.postalCode);
    setValue('country', shippingAddress.country);
  }, []);

  const submitHandler = ({ fullName, address, city, postalCode, country }) => {
    dispatch({ type: 'SAVE_SHIPPING_ADDRESS', payload: { fullName, address, city, postalCode, country } });
    Cookies.set('shippingAddress', JSON.stringify({ fullName, address, city, postalCode, country }));
    router.push('/payment');
  };

  return (
    <Layout title='Shipping Address'>
      <CheckoutWizard activeStep={1} />
      <form className={styles.form} onSubmit={handleSubmit(submitHandler)}>
        <h1 className={styles.heading}>Shipping Address</h1>
        <div className={styles.input}>
          <label htmlFor='fullName'>Full Name</label>
          <input
            type='text'
            id='fullName'
            placeholder='Full Name'
            {...register('fullName', {
              required: 'Full Name is required!',
              minLength: { value: 2, message: 'Full Name must have at least 2 characters' },
              maxLength: { value: 30, message: 'Full Name not more than 30 characters' },
            })}
          />
          {errors.fullName && <div className={styles.error}>{errors.fullName.message}</div>}
        </div>
        <div className={styles.input}>
          <label htmlFor='address'>Address</label>
          <input
            type='text'
            id='address'
            placeholder='Address'
            {...register('address', {
              required: 'Address is required!',
              minLength: { value: 2, message: 'Address must have at least 2 characters' },
              maxLength: { value: 200, message: 'Address not more than 200 characters' },
            })}
          />
          {errors.address && <div className={styles.error}>{errors.address.message}</div>}
        </div>
        <div className={styles.input}>
          <label htmlFor='city'>City</label>
          <input
            type='text'
            id='city'
            placeholder='City'
            {...register('city', {
              required: 'City is required!',
              minLength: { value: 2, message: 'City must have at least 2 characters' },
            })}
          />
          {errors.city && <div className={styles.error}>{errors.city.message}</div>}
        </div>
        <div className={styles.input}>
          <label htmlFor='postalCode'>Postal Code</label>
          <input
            type='text'
            id='postalCode'
            placeholder='Postal Code'
            {...register('postalCode', {
              required: 'Postal Code is required!',
              minLength: { value: 6, message: 'Postal must have at least 6 characters' },
            })}
          />
          {errors.postalCode && <div className={styles.error}>{errors.postalCode.message}</div>}
        </div>
        <div className={styles.input}>
          <label htmlFor='country'>Country</label>
          <input
            type='text'
            id='country'
            placeholder='Country'
            {...register('country', {
              required: 'Country is required!',
              minLength: { value: 2, message: 'Postal must have at least 2 characters' },
            })}
          />
          {errors.country && <div className={styles.error}>{errors.country.message}</div>}
        </div>
        <div className={styles.input}>
          <button className={styles.button}>Continue</button>
        </div>
      </form>
    </Layout>
  );
};

export default Shipping;
