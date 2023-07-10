const Product = require('../models/product');

const getAllProductsStatic = async (req, res) => {
  throw new Error('Testing express-async-errors');
  res.status(200).json({ msg: 'products testing route' });
};

const getAllProducts = async (req, res) => {
  const { featured, company, name, sort, fields, numericFilters } = req.query;
  const queryObject = {};
  // query params - strings
  if (featured) {
    queryObject.featured = featured === 'true' ? true : false;
  }
  if (company) {
    queryObject.company = company;
  }
  if (name) {
    queryObject.name = { $regex: name, $options: 'i' }; // search based on regex
  }
  // query params - numeric fields and filteration based on operators
  if (numericFilters) {
    const operatorMap = {
      '>': '$gt',
      '>=': '$gte',
      '=': '$eq',
      '<': '$lt',
      '<=': '$lte',
    };
    const regEx = /\b(<|>|>=|=|<|<=)\b/g;
    let filters = numericFilters.replace(
      regEx,
      (match) => `-${operatorMap[match]}-`
    );
    console.log(filters);
    const options = ['price', 'rating'];
    filters = filters.split(',').forEach((item) => {
      const [field, operator, value] = item.split('-');
      if (options.includes(field)) {
        queryObject[field] = { [operator]: Number(value) };
      }
    });
  }
  console.log(queryObject);
  let result = Product.find(queryObject);

  // sort
  if (sort) {
    const sortSpacedString = sort.split(',').join(' ');
    result = result.sort(sortSpacedString);
  } else {
    result = result.sort('createdAt');
  }

  // limited fields in response
  if (fields) {
    const fieldsSpacedString = fields.split(',').join(' ');
    result = result.select(fieldsSpacedString);
  }

  // pagination
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  result = result.skip(skip).limit(limit);

  const products = await result;
  res.status(200).json({ products, nbHits: products.length });
};
// URL with all options :
// http://localhost:3000/api/v1/products?name=a&featured=false&company=marcos&sort=name,-price&fields=name,price,company&limit=1&page=2&numericFilters=price>100,rating>=4

module.exports = { getAllProductsStatic, getAllProducts };
