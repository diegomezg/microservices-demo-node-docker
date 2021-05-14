// ===========================
// Requires
// ===========================
const express = require("express");
const _ = require("underscore");
const { verifyToken } = require("../middleware/authentication");
const Product = require("../models/product");
var path = require("path");
const Mongoose = require("mongoose");
const fs = require('fs');
const { resizeImages } = require("../functions/commonFunctions");
var pdf = require('html-pdf');
//var { pdfReport } = require('../assets/reports/productReport');

const app = express();


/**
  * @api {GET} /product?token={token} Get All Products
  * @apiGroup Product
  * @apiDescription This method returns all the products registered in the database
  * @apiVersion  1.0.0
  * @apiParam  {String} token JWT
  * @apiParam  {String} from OPTIONAL VALUE: Send this parameter to do a pagination of the service. This param specify the number or row will start to return
  * @apiParam  {String} limit OPTIONAL VALUE:  Send this parameter to do a pagination of the service. Thhis param specify the total of rows to return.
  * 
  * @apiSuccessExample {type} Success-Response:
  * {
    "success": true,
    "total": 1,
    "products": [
        {
            "status": "A",
            "_id": "5f3707fe60e7a7454094f34d",
            "name": "T-Shirt AAAA",
            "description": "This is the description of the T-Shirt",
            "price": "450.00",
            "code": "7255",
            "sku": "ASQDAS",
            "subcategory": {
                "status": "A",
                "_id": "5f370798dc9f815010112c8c",
                "name": "Top",
                "category": {
                    "status": "A",
                    "_id": "5f3476a18f63011ca82ac57b",
                    "name": "Jogging",
                    "__v": 0
                },
                "__v": 0
            },
            "images": [
                {
                    "_id": "5f37158a2fe4c46a6008096e",
                    "filename": "5f3707fe60e7a7454094f34d-939.jpg",
                    "publicUrl": "https://firebasestorage.googleapis.com/v0/b/binnecatalog-286317.appspot.com/o/img%2Fproduct%2F5f3707fe60e7a7454094f34d-939.jpg?alt=media",
                    "priority": 5
                }
            ],
            "__v": 13
        }
    ]
}
  * 
  */
app.get("/product", (req, res) => {
    let from = req.query.from || 0;
    let limit = req.query.limit || null;

    from = Number(from);
    limit = Number(limit);

    Product.find({ status: { $ne: "D" } })
        .skip(from)
        .limit(limit)
        .populate("subcategory")
        .populate({ path: "subcategory", populate: { path: "category" } })
        .populate("addedBy", "-password")
        .exec((error, products) => {
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: "Error while waiting the products from database",
                    error,
                });
            }

            // Get total of documents
            Product.count({ status: { $ne: "D" } }, (error, total) => {
                if (error) {
                    return res.status(400).json({
                        success: false,
                        message: "Error counting the total of documents",
                        error,
                    });
                }

                return res.json({
                    success: true,
                    total,
                    products,
                });
            });
        });
});

/**
   * @api {GET} /product/{id} Get specific Product
   * @apiGroup Product
   * @apiDescription This method returns an product selected by ID
   * @apiVersion  1.0.0
   * * @apiParam  {String} id Id of the document to be returned
   * @apiParam  {String} token JWT
   * 
   * @apiSuccessExample {type} Success-Response:
   * 
   * {
    "success": true,
    "product": {
        "status": "A",
        "_id": "5f3707fe60e7a7454094f34d",
        "name": "T-Shirt AAAA",
        "description": "This is the description of the T-Shirt",
        "price": "450.00",
        "code": "7255",
        "sku": "ASQDAS",
        "subcategory": {
            "status": "A",
            "_id": "5f370798dc9f815010112c8c",
            "name": "Top",
            "category": {
                "status": "A",
                "_id": "5f3476a18f63011ca82ac57b",
                "name": "Jogging",
                "__v": 0
            },
            "__v": 0
        },
        "images": [
            {
                "_id": "5f37158a2fe4c46a6008096e",
                "filename": "5f3707fe60e7a7454094f34d-939.jpg",
                "publicUrl": "https://firebasestorage.googleapis.com/v0/b/binnecatalog-286317.appspot.com/o/img%2Fproduct%2F5f3707fe60e7a7454094f34d-939.jpg?alt=media",
                "priority": 5
            }
        ],
        "__v": 13
    }
}
   */
app.get("/product/:id", (req, res) => {
    let id = req.params.id;
    Product.findById(id)
        .populate("subcategory")
        .populate({ path: "subcategory", populate: { path: "category" } })
        .populate("addedBy", "-password")
        .exec((error, product) => {
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: "Error while waiting the product from database",
                    error,
                });
            }

            return res.json({
                success: true,
                product,
            });
        });
});

/**
   * @api {POST} /product?token={token} Create new product
   * @apiGroup Product
   * @apiDescription This method adds a new product in the database
   * @apiVersion  1.0.0
   * @apiParam  {String} token JWT
   * 
    *  @apiParamExample  {type} Request-Example:
    {
        "name":"T-Shirt A",
        "description":"This is the description of the T-Shirt",
        "price":"450.00",
        "sku":"ASQDAS",
        "code":"7255",
        "subcategory":{
            "_id":"5f370798dc9f815010112c8c"
        }
    }
   *
   * @apiSuccessExample {type} Success-Response:
   *{
        "success": true,
        "product": {
            "status": "A",
            "_id": "5f3707fe60e7a7454094f34d",
            "name": "T-Shirt A",
            "description": "This is the description of the T-Shirt",
            "price": "450.00",
            "code": "7255",
            "sku": "ASQDAS",
            "subcategory": {
                "status": "A",
                "_id": "5f370798dc9f815010112c8c",
                "name": "Top",
                "category": "5f3476a18f63011ca82ac57b",
                "__v": 0
            },
            "images": [],
            "__v": 0
        }
    }
   */
app.post("/product", [verifyToken], (req, res) => {
    let body = req.body;

    let product = new Product({
        name: body.name,
        description: body.description,
        price: body.price,
        code: body.code,
        sku: body.sku,
        subcategory: body.subcategory._id || body.subcategory,
        addedBy: req.user._id,
        uploadDate: new Date().getTime(),
        images: body.images
    });


    product.save(async(error, productDB) => {
        if (error) {
            return res.status(400).json({
                success: false,
                message: "Error saving the product",
                error,
            });
        }

        await productDB
            .populate("subcategory")
            .populate({ path: "subcategory", populate: { path: "category" } })
            .populate("addedBy", "-password")
            .execPopulate();

        await resizeImages(productDB.images, 'product');

        return res.json({
            success: true,
            product: productDB,
        });
    });
});

/**
   * @api {PUT} /product/{id}?token={token} Update product
   * @apiGroup Product
   * @apiDescription This method updates a product in the database
   * @apiVersion  1.0.0
   * @apiParam  {String} id Id of the document to be updated
   * @apiParam  {String} token JWT
   * 
   *  @apiParamExample  {type} Request-Example:
 {
            "status": "A",
            "_id": "5f3707fe60e7a7454094f34d",
            "name": "T-Shirt AAAA",
            "description": "This is the description of the T-Shirt",
            "price": "450.00",
            "code": "7255",
            "sku": "ASQDAS",
            "subcategory": {
                "_id": "5f370798dc9f815010112c8c"
            },
            "images": [
                {
                    "filename": "5f3707fe60e7a7454094f34d-939.jpg",
                    "publicUrl": "https://firebasestorage.googleapis.com/v0/b/binnecatalog-286317.appspot.com/o/img%2Fproduct%2F5f3707fe60e7a7454094f34d-939.jpg?alt=media",
                    "priority": 5
                }
            ]
        }
   *
   * @apiSuccessExample {type} Success-Response:
   * 
   * 
   * {
        "success": true,
        "product": {
            "status": "A",
            "_id": "5f3707fe60e7a7454094f34d",
            "name": "T-Shirt AAAA",
            "description": "This is the description of the T-Shirt",
            "price": "450.00",
            "code": "7255",
            "sku": "ASQDAS",
            "subcategory": {
                "status": "A",
                "_id": "5f370798dc9f815010112c8c",
                "name": "Top",
                "category": {
                    "status": "A",
                    "_id": "5f3476a18f63011ca82ac57b",
                    "name": "Jogging",
                    "__v": 0
                },
                "__v": 0
            },
            "images": [
                {
                    "_id": "5f37158a2fe4c46a6008096e",
                    "filename": "5f3707fe60e7a7454094f34d-939.jpg",
                    "publicUrl": "https://firebasestorage.googleapis.com/v0/b/binnecatalog-286317.appspot.com/o/img%2Fproduct%2F5f3707fe60e7a7454094f34d-939.jpg?alt=media",
                    "priority": 5
                }
            ],
            "__v": 13
        }
    }
   */
app.put("/product/:id", [verifyToken], (req, res) => {
    let id = req.params.id;
    let body = _.omit(req.body, "_id");

    Product.findById(id)
        .populate("subcategory")
        .exec(async(error, product) => {
            if (error) {
                return res.status(500).json({
                    success: false,
                    message: "Error on update product",
                    error,
                });
            }

            //Get current images
            var currentImages = product.images;

            //Remove images from server if has been removed
            var imageFound = false;
            for (let currentImage of currentImages) {
                for (let bodyImage of body.images) {
                    if (bodyImage.filename === currentImage.filename) {
                        imageFound = true;
                    }
                }
                if (!imageFound) {
                    let fileToDelete = path.join(__dirname, '../' + `uploads/images/product/${currentImage.filename || ''}`);
                    if (fs.existsSync(fileToDelete)) {
                        fs.unlinkSync(fileToDelete);
                    }
                }

                imageFound = false;
            }



            product.name = body.name;
            product.description = body.description;
            product.price = body.price;
            product.code = body.code;
            product.sku = body.sku;
            product.subcategory = body.subcategory._id || body.subcategory;
            product.images = body.images;



            product.save({}, async(error, product) => {
                if (error) {
                    return res.status(400).json({
                        success: false,
                        message: "Error on update product",
                        error,
                    });
                }

                await product.populate("subcategory").execPopulate();
                await product.populate("subcategory.category").execPopulate();
                await product.populate("addedBy", "-password").execPopulate();

                return res.json({
                    success: true,
                    product,
                });
            });
        });
});

/**
   * @api {DELETE} /product/{id}?token={token} Delete product
   * @apiGroup Product
   * @apiDescription This method do a logical delete of the product from de database
   * @apiVersion  1.0.0
   * @apiParam  {String} id Id of the document to be deleted
   * @apiParam  {String} token JWT
   * 
   * @apiSuccessExample {type} Success-Response:
   * {
    "success": true,
    "product": {
        "status": "A",
        "_id": "5f3707fe60e7a7454094f34d",
        "name": "T-Shirt AAAA",
        "description": "This is the description of the T-Shirt",
        "price": "450.00",
        "code": "7255",
        "sku": "ASQDAS",
        "subcategory": {
            "status": "A",
            "_id": "5f370798dc9f815010112c8c",
            "name": "Top",
            "category": {
                "status": "A",
                "_id": "5f3476a18f63011ca82ac57b",
                "name": "Jogging",
                "__v": 0
            },
            "__v": 0
        },
        "images": [
            {
                "_id": "5f37158a2fe4c46a6008096e",
                "filename": "5f3707fe60e7a7454094f34d-939.jpg",
                "publicUrl": "https://firebasestorage.googleapis.com/v0/b/binnecatalog-286317.appspot.com/o/img%2Fproduct%2F5f3707fe60e7a7454094f34d-939.jpg?alt=media",
                "priority": 5
            }
        ],
        "__v": 13
    }
}
   */
app.delete("/product/:id", [verifyToken], (req, res) => {
    let id = req.params.id;

    Product.findById(id, async(error, productDB) => {
        if (error) {
            return res.status(400).json({
                success: false,
                message: "Error removing the product from database",
                error,
            });
        }

        //Remove images from server if has been deleted
        for (image of productDB.images) {
            let fileToDelete = path.join(__dirname, '../' + `uploads/images/product/${image.filename || ''}`);
            if (fs.existsSync(fileToDelete)) {
                fs.unlinkSync(fileToDelete);
            }
        }

        Product.findByIdAndUpdate(id, { status: "D" }, async(error, product) => {
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: "Error removing the product from database",
                    error,
                });
            }

            await product.populate("subcategory").execPopulate();
            await product.populate("subcategory.category").execPopulate();
            await product.populate("addedBy", "-password").execPopulate();

            return res.json({
                success: true,
                product,
            });
        });
    });
});

/**
   * @api {GET} /product/search/{term}?token={token} Search products
   * @apiGroup Product
   * @apiDescription This method search the term sent in the product name and email parameters.  
   * @apiVersion  1.0.0
   * @apiParam  {String} term Term to be used to search in products document
   * @apiParam  {String} token JWT
   * 
   * @apiSuccessExample {type} Success-Response:
   * 
   * 
   * {
    "success": true,
    "product": [
        {
            "status": "A",
            "_id": "5f3707fe60e7a7454094f34d",
            "name": "T-Shirt AAAA",
            "description": "This is the description of the T-Shirt",
            "price": "450.00",
            "code": "7255",
            "sku": "ASQDAS",
            "subcategory": {
                "status": "A",
                "_id": "5f370798dc9f815010112c8c",
                "name": "Top",
                "category": {
                    "status": "A",
                    "_id": "5f3476a18f63011ca82ac57b",
                    "name": "Jogging",
                    "__v": 0
                },
                "__v": 0
            },
            "images": [
                {
                    "_id": "5f37158a2fe4c46a6008096e",
                    "filename": "5f3707fe60e7a7454094f34d-939.jpg",
                    "publicUrl": "https://firebasestorage.googleapis.com/v0/b/binnecatalog-286317.appspot.com/o/img%2Fproduct%2F5f3707fe60e7a7454094f34d-939.jpg?alt=media",
                    "priority": 5
                }
            ],
            "__v": 13
        }
    ]
}
   */
app.get("/product/search/:term", [verifyToken], (req, res) => {
    let collection = req.params.collection;
    let term = req.params.term;
    let regex = new RegExp(term, "i");

    Product.find({ status: { $ne: "D" } })
        .or([{ name: regex }])
        .populate("subcategory")
        .populate({ path: "subcategory", populate: { path: "category" } })
        .populate("addedBy", "-password")
        .exec(async(error, product) => {
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: "Error searching the product on database",
                    error,
                });
            }

            return res.json({
                success: true,
                product,
            });
        });
});

/**
  * @api {PUT} /product/toggleStatus{id}?token={token} Toggle product status
  * @apiGroup Product
  * @apiDescription This method set the product status on active or deactivated
  * @apiVersion  1.0.0
  * @apiParam  {String} id Id of the document to be updated
  * @apiParam  {String} token JWT
  * 
  *
  * @apiSuccessExample {type} Success-Response:
  * {
       "success": true,
       "product": {
           "login_type": "basic",
           "status": "A",
           "_id": "5f3736d9acb1b63098dd59a1",
           "name": "Jhon",
           "email": "jhony@mail.com",
           "password": ":D",
           "gender": "Male",
           "birthday": "1994-02-02",
           "role": {
               "status": "A",
               "_id": "5f2c0a0be98f807e78b15f17",
               "name": "DEFAULT_ROLE"
           },
           "mobile": "333333333",
           "phone": "333333330",
           "__v": 0
       }
   }
  */
app.put("/product/toggleStatus/:id", [verifyToken], (req, res) => {
    let id = req.params.id;

    Product.findById(id, async(error, product) => {
        if (error) {
            return res.status(400).json({
                success: false,
                message: "Error on update product",
                error,
            });
        }

        if (!product) {
            return res.status(500).json({
                success: false,
                message: "Product not found",
                error,
            });
        }

        if (product.status == "A") {
            product.status = "I";
        } else if (product.status == "I") {
            product.status = "A";
        }

        product.save({ new: true }, async(error, product) => {
            await product.populate("subcategory")
                .populate({ path: "subcategory", populate: { path: "category" } })
                .populate("addedBy", "-password")

            return res.json({
                success: true,
                product,
            });
        });
    });
});

app.get("/product/filter/find", (req, res) => {
    let category = req.query.category || null;
    let subcategory = req.query.subcategory || null;
  //  let price = Number(req.query.price) || null;
   // let minPrice = Number(req.query.minPrice) || null;
    //let term = req.query.term || null;
   // let regex = new RegExp(term, "i");
    let sort = req.query.sort || null;
    let randomize = req.query.randomize || null;

    let from = req.query.from || 0;
    let limit = req.query.limit || null;

    from = Number(from);
    limit = Number(limit);

    //value used to substract the filter parameter to total
    let subValue = 0;

    let aggregateObject = [{
            $match: {
                status: {
                    $ne: "D",
                },
            },
        },
        {
            $lookup: {
                from: "subcategories",
                localField: "subcategory",
                foreignField: "_id",
                as: "subcategory",
            },
        },
        {
            $unwind: {
                path: "$subcategory",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $lookup: {
                from: "categories",
                localField: "subcategory.category",
                foreignField: "_id",
                as: "subcategory.category",
            },
        },
        {
            $unwind: {
                path: "$subcategory.category",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "agent",
                foreignField: "_id",
                as: "agent",
            },
        },
        {
            $unwind: {
                path: "$agent",
                preserveNullAndEmptyArrays: true,
            },
        },
    ];

    //Searching term
    // if (term) {
    //     aggregateObject.push({
    //         $match: {
    //             $or: [{ name: regex }, { code: regex }],
    //         },
    //     });
    // }

    //Price filter
    // (minPrice) ? aggregateObject.push({ $match: { price: { $gte: minPrice } } }): null;
    // (price) ? aggregateObject.push({ $match: { price: { $lte: price } } }): null;
    (category) ? aggregateObject.push({ $match: { "subcategory.category._id": Mongoose.Types.ObjectId(category) } }): null;
    (subcategory) ? aggregateObject.push({ $match: { "subcategory._id": Mongoose.Types.ObjectId(subcategory) } }): null;

    //Sort params
    // if (sort) {
    //     switch (sort) {
    //         case 'priceExpensive':
    //             aggregateObject.push({ $sort: { 'price': -1 } });
    //             break;

    //         case 'priceCheaper':
    //             aggregateObject.push({ $sort: { 'price': 1 } });
    //             break;

    //         case 'date':
    //             aggregateObject.push({ $sort: { 'uploadDate': 1 } });
    //             break;
    //     }
    // } else {
    //     aggregateObject.push({ $sort: { 'uploadDate': 1 } });
    // }

    //Randomize
    (randomize) ? aggregateObject.push({ $sample: { 'size': Number(randomize) } }): null;


    // ===========================
    // Get the total of documents
    // ===========================
    let total = 0;
    // Set count parameter
    aggregateObject.push({ $count: 'total' });

    Product.aggregate(aggregateObject, (error, products) => {
        if (error) {
            return res.status(400).json({
                success: false,
                message: "Error while waiting the products from database",
                error,
            });
        }

        (products[0]) ? total = products[0].total: total = 0;


        //Delete count parameter
        aggregateObject.pop();

        //Pagination parameters
        from ? aggregateObject.push({ $skip: from }) : null;
        limit ? aggregateObject.push({ $limit: limit }) : null;


        Product.aggregate(aggregateObject, (error, products) => {
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: "Error while waiting the products from database",
                    error,
                });
            }

            return res.json({
                success: true,
                products,
                total
            });
        });

    });



});

app.get("/product/get/last", (req, res) => {
    let from = req.query.from || 0;
    let limit = req.query.limit || null;

    from = Number(from);
    limit = Number(limit);

    Product.find({ status: { $ne: "D" } })
        .skip(from)
        .limit(limit)
        .sort({ uploadDate: "desc" })
        .populate("subcategory")
        .populate({ path: "subcategory", populate: { path: "category" } })
        .populate("addedBy")
        .exec((error, products) => {
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: "Error while waiting the products from database",
                    error,
                });
            }

            // Get total of documents
            Product.count({ status: { $ne: "D" } }, (error, total) => {
                if (error) {
                    return res.status(400).json({
                        success: false,
                        message: "Error counting the total of documents",
                        error,
                    });
                }

                return res.json({
                    success: true,
                    total,
                    products,
                });
            });
        });
});


app.get("/product/get/pdf", (req, res) => {
    let id = req.query.id || null;

    if (id) {
        Product.findById(id)
            .populate("subcategory")
            .populate({ path: "subcategory", populate: { path: "category" } })
            .populate("addedBy", "-password")
            .exec((error, product) => {
                if (error) {
                    return res.status(400).json({
                        success: false,
                        message: "Error getting product",
                        error,
                    });
                }


                //DELETE OLD PDF
                bucket.getFiles({
                    prefix: 'pdf/'
                }).then((files) => {
                    var files = files[0]
                    files.forEach(file => {
                        file.getMetadata().then((data) => {
                            let created = new Date(data[0].timeCreated);
                            created.setDate(created.getDate() + 1);
                            if (created.getTime() <= new Date().getTime()) {
                                bucket.file(file.name).delete();
                            }
                        })

                    });
                });

                //CREATE PDF AND STORE 
                var contenido = pdfReport(product);
                const tmpFilePath = path.join(__dirname, '../' + `tmp/${product._id}.pdf`);
                pdf.create(contenido, {
                    format: 'Letter',
                    "border": {
                        "top": "0.4in", // default is 0, units: mm, cm, in, px
                        "right": "0.40in",
                        "bottom": "0.4in",
                        "left": "0.4in"
                    }
                }).toFile(tmpFilePath, function(err, response) {
                    if (error) {
                        return res.status(400).json({
                            success: false,
                            message: "Error creating PDF",
                            error,
                        });
                    } else {
                        var filepath = path.join(__dirname, '../' + `uploads/pdf/${product._id}.pdf`);
                        fs.renameSync(tmpFilePath, filepath);
                        return res.status(200).json({
                            success: true,
                            url: `${product._id}.pdf`
                        })

                    }
                });
            })
    } else {
        return res.status(400).json({
            success: false,
            message: "Error searching the product"
        });
    }
});


module.exports = app;