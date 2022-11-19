import axios from 'axios';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import React, { useContext, useEffect, useReducer, useState } from 'react';
import { useForm } from 'react-hook-form';
import Layout from '../../../components/Layout';
import styles from '../../../styles/Dashboard.module.css';
import { getError } from '../../../utils/error';
import { Store } from '../../../utils/Store';

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST': {
      return { ...state, loading: true, error: '' };
    }
    case 'FETCH_SUCCESS': {
      return { ...state, loading: false, error: '' };
    }
    case 'FETCH_FAIL': {
      return { ...state, loading: false, error: action.payload };
    }
    case 'UPDATE_REQUEST': {
      return { ...state, loadingUpdate: true, errorUpdate: '' };
    }
    case 'UPDATE_SUCCESS': {
      return { ...state, loadingUpdate: false, errorUpdate: '' };
    }
    case 'UPDATE_FAIL': {
      return { ...state, loadingUpdate: false, errorUpdate: action.payload };
    }
    case 'UPLOAD_REQUEST': {
      return { ...state, loadingUpload: true, errorUpload: '' };
    }
    case 'UPLOAD_SUCCESS': {
      return { ...state, loadingUpload: false, errorUpload: '' };
    }
    case 'UPLOAD_FAIL': {
      return { ...state, loadingUpload: false, errorUpload: action.payload };
    }

    default:
      state;
  }
}

const ProductEdit = ({ params }) => {
  const productId = params.id;
  const { state } = useContext(Store);
  const { userInfo, darkMode } = state;
  const router = useRouter();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const [{ loading, error, loadingUpdate, loadingUpload }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  const {
    handleSubmit,
    register,
    formState: { errors },
    setValue,
  } = useForm();

  useEffect(() => {
    if (!userInfo) {
      return router.push('/login');
    } else {
      const fetchData = async () => {
        try {
          dispatch({ type: 'FETCH_REQUEST' });
          const { data } = await axios.get(`/api/admin/products/${productId}`, {
            headers: { authorization: `Bearer ${userInfo.token}` },
          });
          dispatch({ type: 'FETCH_SUCCESS' });
          setValue('name', data.name);
          setValue('slug', data.slug);
          setValue('price', data.price);
          setValue('image', data.image);
          setValue('featuredImage', data.featuredImage);
          setIsFeaturd(data.isFeatured);
          setValue('category', data.category);
          setValue('brand', data.brand);
          setValue('countInStock', data.countInStock);
          setValue('description', data.description);
        } catch (error) {
          dispatch({ type: 'FETCH_FAIL', payload: getError(error) });
        }
      };
      fetchData();
    }
  }, [router, userInfo]);

  const submitHandler = async ({
    name,
    slug,
    price,
    image,
    category,
    brand,
    countInStock,
    description,
    featuredImage,
  }) => {
    closeSnackbar();

    try {
      dispatch({ type: 'UPDATE_REQUEST' });
      await axios.put(
        `/api/admin/products/${productId}`,
        {
          name,
          slug,
          price,
          image,
          category,
          brand,
          isFeatured,
          featuredImage,
          countInStock,
          description,
        },
        {
          headers: { authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({ type: 'UPDATE_SUCCESS' });
      enqueueSnackbar('Product updated successfully', { variant: 'success' });
      router.push('/admin/products');
    } catch (error) {
      dispatch({ type: 'UPDATE_FAIL', payload: getError(error) });
      enqueueSnackbar(getError(error), { variant: 'error' });
    }
  };

  const uploadHandler = async (e, imageField = 'image') => {
    const file = e.target.files[0];
    const bodyFormData = new FormData();
    bodyFormData.append('file', file);
    try {
      dispatch({ type: 'UPLOAD_REQUEST' });
      const { data } = await axios.post('/api/admin/upload', bodyFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          authorization: `Bearer ${userInfo.token}`,
        },
      });
      dispatch({ type: 'UPLOAD_SUCCESS' });
      setValue(imageField, data.secure_url);
      enqueueSnackbar('File uploaded successfully', { variant: 'success' });
    } catch (error) {
      dispatch({ type: 'UPLOAD_FAIL', payload: getError(error) });
      enqueueSnackbar(getError(error), { variant: 'error' });
    }
  };
  const [isFeatured, setIsFeaturd] = useState(false);

  return (
    <Layout title={`Edit Product ${productId}`}>
      <div className={styles.container}>
        <div className={darkMode ? `${styles.sideBar} ${styles.dark} ${styles.darkMode}` : `${styles.sideBar}`}>
          <ul>
            <Link href='/admin/dashboard' passHref>
              <li>Dashboard</li>
            </Link>
            <Link href='/admin/orders' passHref>
              <li>Orders</li>
            </Link>
            <Link href='/admin/products'>
              <li className={styles.active}>Products</li>
            </Link>
            <Link href='/admin/users'>
              <li>Users</li>
            </Link>
          </ul>
        </div>
        <div className={darkMode ? `${styles.dash} ${styles.dark} ${styles.darkMode}` : `${styles.dash}`}>
          <h1 className={styles.heading}>{`Product ${productId}`}</h1>
          {loading ? (
            <p className={styles.loading}>Loading...</p>
          ) : error ? (
            <p className={styles.error}>{error}</p>
          ) : (
            <div>
              <h2 className={styles.heading}>products</h2>
              <form className={styles.form} onSubmit={handleSubmit(submitHandler)}>
                <div className={styles.input}>
                  <label htmlFor='name'>Name</label>
                  <input
                    type='text'
                    id='name'
                    placeholder='Name'
                    {...register('name', {
                      required: 'Name is required!',
                    })}
                  />
                  {errors.name && <div className={styles.error}>{errors.name.message}</div>}
                </div>
                <div className={styles.input}>
                  <label htmlFor='slug'>Slug</label>
                  <input
                    type='text'
                    id='slug'
                    placeholder='Slug'
                    {...register('slug', {
                      required: 'Slug is required!',
                    })}
                  />
                  {errors.slug && <div className={styles.error}>{errors.slug.message}</div>}
                </div>
                <div className={styles.input}>
                  <label htmlFor='price'>Price</label>
                  <input
                    type='text'
                    id='price'
                    placeholder='Price'
                    {...register('price', {
                      required: 'Price is required!',
                    })}
                  />
                  {errors.price && <div className={styles.error}>{errors.price.message}</div>}
                </div>
                <div className={styles.input}>
                  <label htmlFor='image'>Image</label>
                  <input
                    type='text'
                    id='image'
                    placeholder='Image'
                    {...register('image', {
                      required: 'Image is required!',
                    })}
                  />
                  {errors.image && <div className={styles.error}>{errors.image.message}</div>}
                </div>
                <div className={styles.input}>
                  <label htmlFor='imageFile'>Upload Image</label>
                  <input type='file' id='imageFile' onChange={uploadHandler} style={{ cursor: 'pointer' }} />
                  {loadingUpload && <p>Uploading...</p>}
                </div>
                <div className={styles.input}>
                  <label htmlFor='featuredImage'>Featured Image</label>
                  <input
                    type='text'
                    id='featuredImage'
                    placeholder='Featured Image'
                    {...register('featuredImage', {
                      required: 'Featured Image is required!',
                    })}
                  />
                  {errors.featuredImage && <div className={styles.error}>{errors.featuredImage.message}</div>}
                </div>
                <div className={styles.input}>
                  <label htmlFor='imageFile'>Upload Featired Image</label>
                  <input
                    type='file'
                    id='featuredImageFile'
                    onChange={(e) => uploadHandler(e, 'featuredImage')}
                    style={{ cursor: 'pointer' }}
                  />
                  {loadingUpload && <p>Uploading...</p>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0 10px 0' }}>
                  <input
                    type='checkbox'
                    id='name'
                    name='isFeatured'
                    checked={isFeatured}
                    onClick={(e) => setIsFeaturd(e.target.checked)}
                    style={{ height: '18px', width: '18px' }}
                  />
                  <label htmlFor='isFeatured' style={{ marginLeft: '10px', fontSize: '16px', fontWeight: '500' }}>
                    Is Featured
                  </label>
                </div>
                <div className={styles.input}>
                  <label htmlFor='category'>Category</label>
                  <input
                    type='text'
                    id='category'
                    placeholder='Category'
                    {...register('category', {
                      required: 'Category is required!',
                    })}
                  />
                  {errors.category && <div className={styles.error}>{errors.category.message}</div>}
                </div>
                <div className={styles.input}>
                  <label htmlFor='brand'>Brand</label>
                  <input
                    type='text'
                    id='brand'
                    placeholder='Brand'
                    {...register('brand', {
                      required: 'Brand is required!',
                    })}
                  />
                  {errors.brand && <div className={styles.error}>{errors.brand.message}</div>}
                </div>
                <div className={styles.input}>
                  <label htmlFor='countInStock'>Count In Stock</label>
                  <input
                    type='text'
                    id='countInStock'
                    placeholder='Count In Stock'
                    {...register('countInStock', {
                      required: 'Count In Stock is required!',
                    })}
                  />
                  {errors.countInStock && <div className={styles.error}>{errors.countInStock.message}</div>}
                </div>
                <div className={styles.input}>
                  <label htmlFor='description'>Description</label>
                  <textarea
                    type='texta'
                    id='description'
                    placeholder='Description'
                    {...register('description', {
                      required: 'Description is required!',
                    })}
                  />
                  {errors.description && <div className={styles.error}>{errors.description.message}</div>}
                </div>
                <div className={styles.input}>
                  <button className={styles.button} style={{ width: '100%' }}>
                    Update Product
                  </button>
                  {loadingUpdate && <p className={styles.loading}>Loading...</p>}
                </div>
                <div className={styles.input}>
                  <Link href={`/admin/products`} passHref>
                    <button className={styles.button} style={{ width: '100%', background: 'gray' }}>
                      Back
                    </button>
                  </Link>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export async function getServerSideProps({ params }) {
  return {
    props: { params },
  };
}

export default dynamic(() => Promise.resolve(ProductEdit), { ssr: false });
