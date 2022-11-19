import axios from 'axios';
import styles from '../../styles/ProductScreen.module.css';
import Link from 'next/link';
import Layout from '../../components/Layout';
import Image from 'next/image';
import { useContext, useEffect, useState } from 'react';
import { Store } from '../../utils/Store';
import db from '../../utils/db';
import Product from '../../model/Product';
import { useRouter } from 'next/router';
import StarRatings from 'react-star-ratings';
import { useSnackbar } from 'notistack';
import { getError } from '../../utils/error';

const ProductScreen = (props) => {
  const { product } = props;
  const { state, dispatch } = useContext(Store);
  const { darkMode, userInfo } = state;
  const router = useRouter();
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [star, setStar] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(
        `/api/products/${product._id}/reviews`,
        {
          rating,
          comment,
        },
        {
          headers: { authorization: `Bearer ${userInfo.token}` },
        }
      );
      setLoading(false);
      enqueueSnackbar('Review submitted successfully', { variant: 'success' });
      fetchReviews();
    } catch (error) {
      setLoading(false);
      enqueueSnackbar(getError(error), { variant: 'errorr' });
    }
  };

  const changeRatingHendler = (newRating) => {
    setRating(newRating);
  };

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(`/api/products/${product._id}/reviews`);
      setReviews(data);
    } catch (err) {
      enqueueSnackbar(getError(err), { variant: 'error' });
    }
  };

  useEffect(() => {
    setStar(true);
    fetchReviews();
  }, []);

  if (!product) {
    return <div>Product Not Found!</div>;
  }

  const addToCartHandler = async (product) => {
    const existItem = state.cart.cartItems.find((item) => item._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${product._id}`);

    if (data.countInStock < quantity) {
      enqueueSnackbar('Sorry, Product is out of Stock!', { variant: 'error' });
      return;
    }

    dispatch({ type: 'CART_ADD_ITEM', payload: { ...product, quantity } });
    router.push('/cart');
  };

  return (
    <Layout title={product.name} description={product.description}>
      <div className={styles.back}>
        <Link href='/'>&larr; back to products</Link>
      </div>
      <div className={styles.container}>
        <div className={styles.imgContainer}>
          <Image
            src={product.image}
            alt={product.name}
            width='640'
            height='640'
            layout='responsive'
            title={product.name}
          />
        </div>
        <div className={styles.center}>
          <ul className={styles.row}>
            <li className={styles.list}>
              <h1>{product.name}</h1>
            </li>
            <li className={styles.list}>
              <p>Category: {product.category}</p>
            </li>
            <li className={styles.list}>
              <p>Brand: {product.brand}</p>
            </li>
            <li className={styles.list}>
              <StarRatings
                rating={product.rating}
                starRatedColor='#dfa943'
                starDimension='25px'
                name='rating'
                starSpacing='0'
              />
              <Link href='#reviews' style={{ textDecoration: 'underline', color: '#f0c000' }}>
                ({product.numReviews} reviews)
              </Link>
            </li>
            <li className={styles.list}>
              <p>Description: {product.description}</p>
            </li>
          </ul>
          <div className={darkMode ? `${styles.card} ${styles.darkShadow}` : `${styles.card}`}>
            <div className={styles.wrapper}>
              <div>Price</div>
              <div className={styles.price}>${product.price}</div>
            </div>
            <div className={styles.wrapper}>
              <div>Status</div>
              <div className={styles.status}>{product.countInStock > 0 ? 'In stock' : 'Unavailable'}</div>
            </div>
            <button className={styles.button} onClick={() => addToCartHandler(product)}>
              Add to cart
            </button>
          </div>
        </div>
      </div>
      <div className={darkMode ? `${styles.reviews} ${styles.darkShadow}` : `${styles.reviews}`} id='reviews'>
        <div className={styles.listUl}>
          <div>
            <h2 className={styles.heading}>Customer Reviews</h2>
          </div>
          <div className={styles.noReview}>{reviews.length === 0 && <p>No review</p>}</div>
          {reviews.map((review) => (
            <div key={review._id} className={styles.commentList}>
              <div className={styles.rightBorder}>
                <strong>
                  <p>{review.name}</p>
                </strong>
                <p>{review.createdAt.substring(0, 10)}</p>
              </div>
              <div>
                <StarRatings
                  rating={review.rating}
                  starRatedColor='#dfa943'
                  starDimension='24px'
                  name='rating'
                  starSpacing='0'
                />
                <p>{review.comment}</p>
              </div>
            </div>
          ))}
          <div>
            {star && userInfo ? (
              <form onSubmit={submitHandler} className={styles.reviewForm}>
                <div className={styles.reviewRow}>
                  <div className={styles.reviewList}>
                    <p>Leave your review</p>
                  </div>
                  <div className={styles.reviewList}>
                    <label htmlFor='review'>Enter Comment</label>
                    <textarea
                      name='review'
                      id=''
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder='Enter Comment'
                    ></textarea>
                  </div>
                  <div>
                    <StarRatings
                      rating={rating}
                      changeRating={changeRatingHendler}
                      starRatedColor='#dfa943'
                      starDimension='30px'
                      name='rating'
                      starSpacing='0'
                      starHoverColor='#f0c000'
                    />
                  </div>
                  <div>
                    {loading && <p className={styles.loading}>Commenting...</p>}
                    <button className={styles.button} style={{ marginTop: 0 }}>
                      Submit
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className={styles.noReview} style={{ fontSize: '18px', fontWeight: 500, letterSpacing: '1px' }}>
                Please{' '}
                <Link
                  href={`/login?redirect=/product/${product.slug}`}
                  style={{ color: '#dfa943', textDecoration: 'underline' }}
                >
                  login
                </Link>{' '}
                to write a review
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export async function getServerSideProps(context) {
  const { params } = context;
  const { slug } = params;
  await db.connect();
  const product = await Product.findOne({ slug }, '-reviews').lean();
  await db.disconnect();
  return {
    props: {
      product: db.convertDocToObj(product),
    },
  };
}

export default ProductScreen;
