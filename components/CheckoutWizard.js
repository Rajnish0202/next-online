import styles from '../styles/Wizard.module.css';

const CheckoutWizard = ({ activeStep = 0 }) => {
  return (
    <div className={styles.container}>
      {['User Login', 'Shipping Address', 'Payment Method', 'Place Order'].map((step, index) => (
        <div key={step} className={index <= activeStep ? `${styles.step} ${styles.active}` : `${styles.step}`}>
          {step}
        </div>
      ))}
    </div>
  );
};

export default CheckoutWizard;
