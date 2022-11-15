import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import styles from '../styles/Payment.module.css';
import React, { useContext, useEffect, useState } from 'react';
import CheckoutWizard from '../components/CheckoutWizard';
import Layout from '../components/Layout';
import { Store } from '../utils/Store';
import { useSnackbar } from 'notistack';

const Payment = () => {
  const [paymentMethod, setPaymentMethod] = useState('');
  const { state, dispatch } = useContext(Store);

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const {
    cart: { shippingAddress },
    darkMode,
  } = state;
  const router = useRouter();

  useEffect(() => {
    if (!shippingAddress.address) {
      return router.push('/shipping');
    } else {
      setPaymentMethod(Cookies.get('paymentMethod') || '');
    }
  }, [router, shippingAddress.address]);

  const submitHandler = (e) => {
    closeSnackbar();
    e.preventDefault();
    if (!paymentMethod) {
      enqueueSnackbar('Payment method is required', { variant: 'error' });
    } else {
      dispatch({ type: 'SAVE_PAYMENT_METHOD', payload: paymentMethod });
      Cookies.set('paymentMethod', paymentMethod);
      router.push('/placeorder');
    }
  };

  const backHandler = () => {
    router.push('/shipping');
  };

  return (
    <Layout titile='Payment Method'>
      <CheckoutWizard activeStep={2} />
      <form className={styles.form} onSubmit={submitHandler}>
        <h1 className={darkMode ? `${styles.heading} ${styles.dark}` : `${styles.heading}`}>Payment Method</h1>
        {['PayPal', 'Stripe', 'CashOnDelivery'].map((payment) => (
          <div className={darkMode ? `${styles.input} ${styles.dark}` : `${styles.input}`} key={payment}>
            <input
              type='radio'
              name='paymentMethod'
              id={payment}
              checked={paymentMethod === payment}
              onChange={() => setPaymentMethod(payment)}
            />
            <label htmlFor={payment} className={styles.label}>
              {payment}
            </label>
          </div>
        ))}
        <div className={styles.inputBtn}>
          <button className={styles.button} onClick={backHandler}>
            Back
          </button>
          <button className={styles.button}>Continue</button>
        </div>
      </form>
    </Layout>
  );
};

export default Payment;
