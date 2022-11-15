import Head from 'next/head';
import Link from 'next/link';
import { useContext, useEffect, useState } from 'react';
import styles from '../styles/Layout.module.css';
import { Store } from '../utils/Store';
import { FaToggleOff, FaToggleOn } from 'react-icons/fa';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';

const Layout = ({ children, title, description }) => {
  const [badge, setBadge] = useState(false);
  const [show, setShow] = useState(false);
  const { state, dispatch } = useContext(Store);
  const { darkMode, cart, userInfo } = state;

  const router = useRouter();

  useEffect(() => {
    cart ? setBadge(true) : setBadge(false);
  }, [cart]);

  const darkModeChangeHandler = () => {
    dispatch({ type: darkMode ? 'DARK_MODE_OFF' : 'DARK_MODE_ON' });
    const newDarkMode = !darkMode;
    Cookies.set('darkMode', newDarkMode ? 'ON' : 'OFF');
  };

  const logoutHandler = () => {
    dispatch({ type: 'USER_LOGOUT' });
    Cookies.remove('userInfo');
    Cookies.remove('cartItems');
    router.push('/');
  };

  const loginMenuCloseHandler = (redirect) => {
    if (redirect) {
      router.push(redirect);
    }
  };

  const userMenu = (
    <div className={styles.menu}>
      <ul>
        <li onClick={() => loginMenuCloseHandler('/profile')}>Profile</li>
        <li onClick={() => loginMenuCloseHandler('/order-history')}>Order History</li>
        {userInfo?.isAdmin && <li onClick={() => loginMenuCloseHandler('/admin/dashboard')}>Admin Dashboard</li>}
        <li onClick={logoutHandler}>Logout</li>
      </ul>
    </div>
  );

  return (
    <>
      <Head>
        <title>{title ? title + ' - Next-Online' : 'Next-Online'}</title>
        {description && <meta name='description' content={description} />}
        <link rel='icon' href='/favicon.png' />
      </Head>
      <div className={styles.layout}>
        <header className={styles.header}>
          <nav className={styles.nav}>
            <Link href='/' className={styles.logo}>
              Next Online
            </Link>
            <div className={styles.right}>
              <div className={styles.switch} onClick={darkModeChangeHandler}>
                {darkMode ? (
                  <button className={styles.off} title='Light Mode'>
                    <FaToggleOn />
                  </button>
                ) : (
                  <button className={styles.on} title='Dark Mode'>
                    <FaToggleOff />
                  </button>
                )}
              </div>
              <div className={styles.cart}>
                <Link href='/cart'>
                  Cart
                  {badge && cart.cartItems.length > 0 && <span className={styles.badge}>{cart.cartItems.length}</span>}
                </Link>
              </div>
              {badge && userInfo ? (
                <>
                  <button className={styles.user} onClick={() => setShow(!show)}>
                    {userInfo.name.split(' ')[0].slice(0).replace(userInfo.name[0], userInfo.name[0].toUpperCase())}
                  </button>
                  {show && userMenu}
                </>
              ) : (
                <Link href='/login'>Login</Link>
              )}
            </div>
          </nav>
        </header>
        <main className={darkMode ? `${styles.main} ${styles.dark}` : styles.main}>{children}</main>
        <footer className={darkMode ? `${styles.footer} ${styles.dark} ${styles.darkShadow}` : styles.footer}>
          Copyright &copy; 2022 - NextOnline
        </footer>
      </div>
    </>
  );
};

export default Layout;
