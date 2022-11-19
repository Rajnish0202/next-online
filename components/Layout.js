import Head from 'next/head';
import Link from 'next/link';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import styles from '../styles/Layout.module.css';
import { Store } from '../utils/Store';
import { FaToggleOff, FaToggleOn } from 'react-icons/fa';
import { HiBars3 } from 'react-icons/hi2';
import { IoMdCloseCircleOutline } from 'react-icons/io';
import { IoSearchCircleOutline } from 'react-icons/io5';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { getError } from '../utils/error';

const Layout = ({ children, title, description }) => {
  const [badge, setBadge] = useState(false);
  const [show, setShow] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState('');
  const { state, dispatch } = useContext(Store);
  const { darkMode, cart, userInfo } = state;
  const { enqueueSnackbar } = useSnackbar();

  const router = useRouter();

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`/api/products/categories`);
      setCategories(data);
    } catch (error) {
      enqueueSnackbar(getError(error), { variant: 'error' });
    }
  };

  const queryChangeHandler = (e) => {
    setQuery(e.target.value);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    router.push(`/search?query=${query}`);
  };

  useEffect(() => {
    cart ? setBadge(true) : setBadge(false);
    fetchCategories();
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

  const sidebarOpenHandler = () => {
    setSidebarVisible(true);
  };

  const sidebarCloseHandler = () => {
    setSidebarVisible(false);
  };

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
            <div className={styles.logoBox}>
              <button className={styles.bar} onClick={sidebarOpenHandler}>
                <HiBars3 size={30} />
              </button>
              <Link href='/' className={styles.logo}>
                Next Online
              </Link>
            </div>
            {sidebarVisible && (
              <div className={styles.sideBar}>
                <ul>
                  <li className={styles.top}>
                    <p>Shopping by category</p>
                    <button className={styles.close} onClick={sidebarCloseHandler}>
                      <IoMdCloseCircleOutline size={25} />
                    </button>
                  </li>
                  {categories.map((category) => (
                    <Link href={`/search?category=${category}`} key={category} passHref>
                      <li>{category}</li>
                    </Link>
                  ))}
                </ul>
              </div>
            )}
            <div className={styles.center}>
              <form className={styles.input} onSubmit={submitHandler}>
                <input type='text' placeholder='Search products' name='query' onChange={queryChangeHandler} />
                <button className={styles.searchBtn}>
                  <IoSearchCircleOutline />
                </button>
              </form>
            </div>
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
