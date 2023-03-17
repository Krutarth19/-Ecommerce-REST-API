const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Product = require("../models/product");
const checkAuth = require("../middleware/check-auth");

// for image storage
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString() + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    // reject a file
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});

router.get("/", (req, res, next) => {
    Product.find({}, { __v: 0 })
        .exec()
        .then(doc => {
            const response = {
                count: doc.length,
                products: doc.map(doc => {
                    return {
                        name: doc.name,
                        price: doc.price,
                        _id: doc._id,
                        request: {
                            type: "GET",
                            url: "http://localhost:3000/products/" + doc._id
                        }
                    }
                })
            }
            console.log(doc);
            // if(doc.length>=0){
            res.status(200).json(response);
            // }
            // else{
            // res.status(404).json({message:"No Entries Found!"});
            // }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
});

router.post("/",checkAuth,(req, res, next) => {
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price
    })

    product.save()
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: "Created Product Successfully!",
                createdProduct: {
                    name: result.name,
                    price: result.price,
                    _id: result._id,
                    request: {
                        type: "POST",
                        url: "http://localhost:3000/products" + result._id
                    }
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });

});
  
router.get("/:productId", (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id, { __v: 0 })
        .exec()
        .then(doc => {
            console.log("From database", doc);
            if (doc) {
                res.status(200).json({
                    product: doc,
                    request: {
                        type: "GET",
                        url: "http://localhost:3000/products" + doc._id
                    }
                });
            } else {
                res.status(404).json({ message: "No Valid Entry Found For provided ID!" });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        })
});

router.patch('/:id', (req, res, next) => {
    const id = req.params.id;
    Product.findByIdAndUpdate(id, { $set: req.body }, { new: true })
        .then(result => res.status(200).json({
            message: "Product Updated!",
            request: {
                type: "PATCH",
                url: "http://localhost:3000/products" + id
            }
        }))
        .catch(err => res.status(500).json({ error: err }))
})

router.delete("/:productId", (req, res, next) => {
    const id = req.params.productId;
    Product.findByIdAndDelete(id)
        .exec()
        .then(result => {
            res.status(200).json({
                message: "Product Deleted",
                request: {
                    url: "http://localhost:3000/products",
                    type: "POST",
                    body: { name: "String", price: "Number" }
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
});


module.exports = router;