import nc from 'next-connect';
import { isAuth, isAdmin } from '../../../../utils/auth';
import Product from '../../../../model/Product';
import db from '../../../../utils/db';

const handler = nc();
handler.use(isAuth, isAdmin);

handler.get(async (req, res) => {
  await db.connect();
  const products = await Product.find({});
  await db.disconnect();
  res.send(products);
});

handler.post(async (req, res) => {
  await db.connect();
  const newProduct = new Product({
    name: 'sample name',
    slug: 'sample-slug-' + Math.random(),
    image: '/images/shirt1.jpg',
    price: 0,
    brand: 'sample brand',
    category: 'sample category',
    countInStock: 0,
    description: 'sample description',
    rating: 0,
    numReview: 0,
  });
  const product = await newProduct.save();
  await db.disconnect();
  res.send({ message: 'Product Created', product });
});

handler.put(async (req, res) => {
  await db.connect();
  const product = await Product.findById(req.query.id);
  if (product) {
    product.name = req.body.name;
    product.slug = req.body.slug;
    product.price = req.body.price;
    product.category = req.body.category;
    product.image = req.body.image;
    product.brand = req.body.brand;
    product.countInStock = req.body.countInStock;
    product.description = req.body.description;
    await product.save();
    await db.disconnect();
    res.send({ message: 'Product Updated Successfully!' });
  } else {
    await db.disconnect();
    res.status(404).send({ message: 'Product Not Found!' });
  }
});

export default handler;
