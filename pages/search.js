import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import styles from '../styles/Search.module.css';
import db from '../utils/db';
import Product from '../model/Product';
import ProductItem from '../components/ProductItem';
import { IoMdCloseCircleOutline } from 'react-icons/io';

const prices = [
  {
    name: '$1 to $50',
    value: '1-50',
  },
  {
    name: '$51 to $200',
    value: '51-200',
  },
  {
    name: '$201 to $1000',
    value: '201-1000',
  },
];

const ratings = [1, 2, 3, 4, 5];

function Search(props) {
  const router = useRouter();
  const {
    query = 'all',
    category = 'all',
    brand = 'all',
    price = 'all',
    rating = 'all',
    sort = 'featured',
  } = router.query;

  const { products, countProducts, categories, brands } = props;

  const filterSearch = ({ page, category, brand, sort, min, max, searchQuery, price, rating }) => {
    const path = router.pathname;
    const { query } = router;
    if (page) query.page = page;
    if (searchQuery) query.searchQuery = searchQuery;
    if (sort) query.sort = sort;
    if (category) query.category = category;
    if (brand) query.brand = brand;
    if (price) query.price = price;
    if (rating) query.rating = rating;
    if (min) query.min ? query.min : query.min === 0 ? 0 : min;
    if (max) query.max ? query.max : query.max === 0 ? 0 : max;

    router.push({
      pathname: path,
      query: query,
    });
  };

  const categoryHandler = (e) => {
    filterSearch({ category: e.target.value });
  };

  const brandHandler = (e) => {
    filterSearch({ brand: e.target.value });
  };
  const sortHandler = (e) => {
    filterSearch({ sort: e.target.value });
  };
  const priceHandler = (e) => {
    filterSearch({ price: e.target.value });
  };
  const ratingHandler = (e) => {
    filterSearch({ rating: e.target.value.split(' ')[0] });
  };

  return (
    <Layout title='Serach'>
      <div className={styles.container}>
        <div className={styles.side}>
          <ul>
            <li>
              <div className={styles.box}>
                <p className={styles.text}>Categories</p>
                <select value={category} onChange={categoryHandler} className={styles.select}>
                  <option value='all'>All</option>
                  {categories &&
                    categories.map((category) => (
                      <option value={category} key={category}>
                        {category}
                      </option>
                    ))}
                </select>
              </div>
            </li>
            <li>
              <div className={styles.box}>
                <p className={styles.text}>Brands</p>
                <select value={brand} onChange={brandHandler} className={styles.select}>
                  <option value='all'>All</option>
                  {brands &&
                    brands.map((brand) => (
                      <option value={brand} key={brand}>
                        {brand}
                      </option>
                    ))}
                </select>
              </div>
            </li>
            <li>
              <div className={styles.box}>
                <p className={styles.text}>Prices</p>
                <select value={price} onChange={priceHandler} className={styles.select}>
                  <option value='all'>All</option>
                  {prices.map((price) => (
                    <option value={price.value} key={price.value}>
                      {price.name}
                    </option>
                  ))}
                </select>
              </div>
            </li>
            <li>
              <div className={styles.box}>
                <p className={styles.text}>Rating</p>
                <select value={rating} onChange={ratingHandler} className={styles.select}>
                  <option value='all'>All</option>
                  {ratings.map((rating) => (
                    <option key={rating}>
                      {rating} {rating > 1 ? 'Stars' : 'Star'} &amp; Up
                    </option>
                  ))}
                </select>
              </div>
            </li>
          </ul>
        </div>

        <div className={styles.span}>
          <div className={styles.filterMenu}>
            <div className={styles.filterResults}>
              {products.length === 0 ? 'No' : countProducts} Results
              {query !== 'all' && query !== '' && ' : ' + query}
              {category !== 'all' && ' : ' + category}
              {brand !== 'all' && ' : ' + brand}
              {price !== 'all' && ' : Price ' + price}
              {rating !== 'all' && ' : Rating ' + rating + ' & up'}
              {(query !== 'all' && query !== '') ||
              category !== 'all' ||
              brand !== 'all' ||
              rating !== 'all' ||
              price !== 'all' ? (
                <button className={styles.removeFilter}>
                  <IoMdCloseCircleOutline onClick={() => router.push('/search')} />
                </button>
              ) : null}
            </div>
            <div className={styles.sortMenu}>
              <p className={styles.text}>Sort by</p>
              <select value={sort} onChange={sortHandler} className={styles.select}>
                <option value='featured'>Featured</option>
                <option value='lowest'>Price: Low to High</option>
                <option value='highest'>Price: High to Low</option>
                <option value='toprated'>Customer Reviews</option>
                <option value='newest'>Newest Arrivals</option>
              </select>
            </div>
          </div>
          <div className={styles.productList}>
            {products.map((product) => (
              <ProductItem product={product} key={product._id} />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export async function getServerSideProps({ query }) {
  await db.connect();
  const page = query.page || 1;
  const category = query.category || '';
  const brand = query.brand || '';
  const price = query.price || '';
  const rating = query.rating || '';
  const sort = query.sort || '';
  const searchQuery = query.searchQuery || '';

  const queryFilter =
    searchQuery && searchQuery !== 'all'
      ? {
          name: {
            $reqex: searchQuery,
            $options: 'i',
          },
        }
      : {};

  const categoryFilter = category && category !== 'all' ? { category } : {};
  const brandFilter = brand && brand !== 'all' ? { brand } : {};
  const ratingFilter =
    rating && rating !== 'all'
      ? {
          rating: {
            $gte: Number(rating),
          },
        }
      : {};
  const priceFilter =
    price && price !== 'all'
      ? {
          price: {
            $gte: Number(price.split('-')[0]),
            $lte: Number(price.split('-')[1]),
          },
        }
      : {};
  const order =
    sort === 'featured'
      ? { featured: -1 }
      : sort === 'lowest'
      ? { price: 1 }
      : sort === 'highest'
      ? { price: -1 }
      : sort === 'toprated'
      ? { rating: -1 }
      : sort === 'newest'
      ? { createdAt: -1 }
      : { _id: -1 };

  const categories = await Product.find().distinct('category');
  const brands = await Product.find().distinct('brand');
  const productDocs = await Product.find(
    {
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...brandFilter,
      ...ratingFilter,
    },
    '-reviews'
  )
    .sort(order)
    .lean();

  const countProducts = await Product.countDocuments({
    ...queryFilter,
    ...categoryFilter,
    ...priceFilter,
    ...brandFilter,
    ...ratingFilter,
  });
  await db.disconnect();
  const products = productDocs.map(db.convertDocToObj);

  return {
    props: {
      products,
      countProducts,
      page,
      categories,
      brands,
    },
  };
}

export default Search;
