import axios from 'axios';
import { useContext } from 'react';
import dynamic from 'next/dynamic';
import styles from '../styles/Cart.module.css';
import { Store } from '../utils/Store';
import Layout from '../components/Layout';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { FaRegWindowClose } from 'react-icons/fa';
import { useSnackbar } from 'notistack';

const CartScreen = () => {
  const router = useRouter();
  const { state, dispatch } = useContext(Store);
  const {
    cart: { cartItems },
    darkMode,
  } = state;

  const { enqueueSnackbar } = useSnackbar();

  const count = cartItems.reduce((a, c) => a + c.quantity, 0);

  const removeItemHandler = (item) => {
    dispatch({ type: 'CART_REMOVE_ITEM', payload: item });
  };

  const updateCartHandler = async (item, quantity) => {
    const { data } = await axios.get(`/api/products/${item._id}`);

    if (data.countInStock < quantity) {
      enqueueSnackbar('Sorry, Product is out of Stock!', { variant: 'error' });
      return;
    }

    dispatch({ type: 'CART_ADD_ITEM', payload: { ...item, quantity } });
  };

  const checkoutHander = () => {
    router.push('/shipping');
  };

  return (
    <Layout title='Shopping Cart'>
      <h1 className={styles.heading}>Shopping Cart</h1>
      {cartItems.length === 0 ? (
        <div className={styles.empty}>
          Cart is empty.
          <span className={styles.link}>
            <Link href='/'> Back to shop</Link>
          </span>
        </div>
      ) : (
        <div className={styles.cartItem}>
          <div className={styles.overflow}>
            <table className={styles.table}>
              <thead className={styles.borderBottom}>
                <tr>
                  <th className={styles.left}>Item</th>
                  <th className={styles.left}>Name</th>
                  <th className={styles.right}>Qunatity</th>
                  <th className={styles.right}>Price</th>
                  <th className={styles.center}>Action</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item._id} className={styles.borderBottom}>
                    <td>
                      <Link href={`/product/${item.slug}`} className={styles.anchor}>
                        <Image src={item.image} alt={item.name} width={50} height={50}></Image>
                      </Link>
                    </td>
                    <td className={styles.name}>
                      <Link href={`/product/${item.slug}`} className={styles.anchor}>
                        {item.name}
                      </Link>
                    </td>
                    <td className={styles.quantity}>
                      <select value={item.quantity} onChange={(e) => updateCartHandler(item, +e.target.value)}>
                        {[...Array(item.countInStock).keys()].map((x) => (
                          <option key={x + 1} value={x + 1}>
                            {x + 1}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className={styles.price}>${item.price}</td>
                    <td className={styles.action}>
                      <button className={styles.remove} onClick={() => removeItemHandler(item)}>
                        <FaRegWindowClose className={styles.icon}></FaRegWindowClose>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={darkMode ? `${styles.checkout} ${styles.dark}` : styles.checkout}>
            <ul>
              <li>
                <div className={styles.subtotal}>
                  Subtotal ({count} {count === 1 ? 'item' : 'items'}) : $
                  {cartItems.reduce((a, c) => a + c.quantity * c.price, 0)}
                </div>
              </li>
              <li>
                <button className={styles.checkoutBtn} onClick={checkoutHander}>
                  Check Out
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default dynamic(() => Promise.resolve(CartScreen), { ssr: false });
