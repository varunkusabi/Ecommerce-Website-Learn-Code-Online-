const Product = require("../models/product");
const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");

exports.getProductById = (req, res, next, id) => {
  Product.findById(id)
    .populate("category")
    .exec((err, product) => {
      if (err) {
        return res.status(400).json({
          error: "error in findinf product",
        });
      }
      if (!product) {
        return res.status(400).json({
          error: "No product found in db",
        });
      }
      req.product = product;
      //res.json(product);
      next();
    });
};

exports.createProduct = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        error: "problem with image",
      });
    }
    // destructured the fileds
    const { name, description, price, category, stock } = fields;
    if (!name || !description || !price || !category || !stock) {
      return res.status(400).json({
        error: "Please include all fields",
      });
    }
    //to
    let product = new Product(fields);

    // handle file here
    if (file.photo) {
      if (file.photo.size > 3000000) {
        return res.status(400).json({
          error: "File size too big!",
        });
      }
    }

    product.photo.data = fs.readFileSync(file.photo.path);
    product.photo.contentType = file.photo.type;

    // save to the db
    product.save((err, product) => {
      if (err) {
        return res.status(400).json({
          error: "Saving tshirt in DB failed",
        });
      }
      res.json(product);
    });
  });
};

exports.getProduct = (req, res) => {
  req.product.photo = undefined;
  return res.json(req.product);
};

exports.photo = (req, res, next) => {
  if (req.product.photo.data) {
    res.set("Content-type", req.product.photo.contentType);
    return res.send(req.product.photo.data);
  }
  next();
};

exports.updateProduct = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        error: "problem with image",
      });
    }
    // destructured the fileds
    //const { name, description, price, category, stock } = fields;
    // if (!name || !description || !price || !category || !stock) {
    //   return res.status(400).json({
    //     error: "Please include all fields",
    //   });
    // }
    //to
    console.log("hello");
    let product = req.product;
    console.log(product);
    product=_.extend(product,fields);

    // handle file here
    if (file.photo) {
      if (file.photo.size > 3000000) {
        return res.status(400).json({
          error: "File size too big!",
        });
      }
    }

    product.photo.data = fs.readFileSync(file.photo.path);
    product.photo.contentType = file.photo.type;

    //save to the db
    product.save((err, product) => {
      if (err) {
        return res.status(400).json({
          error: "updation of product in DB failed",
        });
      }
      return res.json(product);
    });
    // Product.findByIdAndUpdate(
    //   { _id: req.product._id },
    //   {
    //     $set: req.body,
    //   },
    //   { new: true, useFindAndModify: false },
    //   (err, product) => {
    //     if (err || !product) {
    //       return res.status(400).json({
    //         error: "not able to update"
    //       });
    //     }
    //     // user.salt=undefined;
    //     // user.encry_password=undefined;
    //     res.json(product);
    //   }
    // );
  });
};

exports.deleteProduct = (req, res) => {
  let product = req.product;
  product.remove((err, deletedProduct) => {
    if (err) {
      return res.status(400).json({
        error: "Failed to delete the product",
      });
    }

     return res.status(200).json({

      message: "delettion was successfull",
      deletedProduct
    });
  });
  
};

exports.getAllProduct=(req,res)=>{
    let limit =req.query.limit ?parseInt(req.query.limit) :8
    let sortBy=req.query.sortBy ? req.query.sortBy:"_id";

    Product.find()
    .select("-photo")
    .populate("category")
    .sort([[sortBy,"asc"]])
    .limit(limit)
    .exec((err,products)=>{
        if(err)
        {
            return res.status(400).json({
                error:"No product Found"
            })
        }
       return res.json(products);
        
        
        
    })
    
    
}

exports.updateStock = (req, res, next) => {
    let myOperations = req.body.order.products.map(prod => {
      return {
        updateOne: {
          filter: { _id: prod._id },
          update: { $inc: { stock: -prod.count, sold: +prod.count } }
        }
      };
    });
  
    Product.bulkWrite(myOperations, {}, (err, products) => {
      if (err) {
        return res.status(400).json({
          error: "Bulk operation failed"
        });
      }
      next();
    });
  };

  exports.updateStock = (req, res, next) => {
  let myOperations = req.body.order.products.map(prod => {
    return {
      updateOne: {
        filter: { _id: prod._id },
        update: { $inc: { stock: -prod.count, sold: +prod.count } }
      }
    };
  });

  Product.bulkWrite(myOperations, {}, (err, products) => {
    if (err) {
      return res.status(400).json({
        error: "Bulk operation failed"
      });
    }
    next();
  });
};

exports.getAllUniqueCategories = (req, res) => {
    Product.distinct("category", {}, (err, category) => {
      if (err) {
        return res.status(400).json({
          error: "NO category found"
        });
      }
      res.json(category);
    });
  };