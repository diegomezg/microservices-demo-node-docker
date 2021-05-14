// ===========================
// Requires
// ===========================
const express = require("express");
const Post = require("../models/post");

const Mongoose = require("mongoose");
const fs = require("fs");
var User = require("../models/user");

const app = express();

/**
  * @api {GET} /post Get All Posts
  * @apiGroup Post
  * @apiDescription This method returns all the posts registered in the database
  * @apiVersion  1.0.0
  * @apiParam  {String} from OPTIONAL VALUE: Send this parameter to do a pagination of the service. This param specify the number or row will start to return
  * @apiParam  {String} limit OPTIONAL VALUE:  Send this parameter to do a pagination of the service. Thhis param specify the total of rows to return.
  * @apiSuccessExample {type} Success-Response:
  * {
    "success": true,
    "total": 1,
    "posts": [
        {
    "_id" : ObjectId("5fdd6595a8439326088e7f84"),
    "status" : "A",
    "title" : "New post",
    "brief" : "This is the brief of the post",
    "body" : "This is all the content of the post",
    "author" : "Post's author",
    "uploadDatetime" : "1608344981848",
    "coverImage" : {
        "filename" : null,
        "publicUrl" : null
    },
    "tags" : [ 
        {
            "_id" : ObjectId("5fdd6595a8439326088e7f85"),
            "tag" : "food"
        }
    ],
    "__v" : 0
    }
}
  * 
  */
app.get("/post", (req, res) => {
  let from = req.query.from || 0;
  let limit = req.query.limit || null;
  from = Number(from);
  limit = Number(limit);

  Post.find({ status: { $ne: "D" } })
    .sort('-uploadDatetime')
    .populate("author")
    .skip(from)
    .limit(limit)
    .exec((error, posts) => {
      if (error) {
        return res.status(400).json({
          success: false,
          message: "Error while waiting the posts from database",
          error,
        });
      }
      // Get total of documents
      Post.countDocuments({ status: { $ne: "D" } }, (error, total) => {
        if (error) {
          return res.status(400).json({
            success: false,
            message: "Error counting the total of documents",
            error,
          });
        }
        total = posts.length;
        return res.json({
          success: true,
          total,
          posts,
        });
      });
      //});
    });
});

/**
   * @api {GET} /post/{id} Get specific Post
   * @apiGroup Post
   * @apiDescription This method returns an post selected by ID
   * @apiVersion  1.0.0
   * @apiParam  {String} id Id of the document to be returned
   * @apiSuccessExample {type} Success-Response:
   * {
    "success": true,
    "total": 1,
    "posts": [
        {
            "coverImage": {
                "filename": null,
                "publicUrl": null
            },
            "status": "A",
            "_id": "5fdd6595a8439326088e7f84",
            "title": "New post",
            "brief": "This is the brief of the post",
            "body": "This is all the content of the post",
            "author": "Post's author",
            "uploadDatetime": "1608344981848",
            "tags": [
                {
                    "_id": "5fdd6595a8439326088e7f85",
                    "tag": "food"
                }
            ],
            "__v": 0
        }
    ]
}
   */
app.get("/post/:id", (req, res) => {
  let id = req.params.id;
  Post.findById(id).
    populate('author').
    exec((error, post) => {
      if (error) {
        return res.status(400).json({
          success: false,
          message: "Error while waiting the post from database",
          error,
        });
      }

      return res.json({
        success: true,
        post: post,
      });
    });
});

/**
   * @api {POST} /post?token={token} Create new post
   * @apiGroup Post
   * @apiDescription This method adds a new post in the database
   * @apiVersion  1.0.0
   * @apiParam  {String} token JWT
   * 
    *  @apiParamExample  {type} Request-Example:
    {
        "title":"New post",
        "brief":"This is the brief of the post",
        "body":"This is all the content of the post",
        "author":"Post's author",
        "uploadDatetime":"2013-10-02T01:11:18.965Z",
        "status":"A",
        "coverImage":
        {
           "filename":"image.jpg",
        },
        "tags":[
            {
                "tag":"food"
            }
        ]
    }
   *
   * @apiSuccessExample {type} Success-Response:
   *{
        "success": true,
        "post": {
             "title":"New post",
            "brief":"This is the brief of the post",
            "body":"This is all the content of the post",
            "author":"Post's author",
            "uploadDatetime":"2013-10-02T01:11:18.965Z",
            "status":"A",
            "coverImage":
            {
            "filename":"image.jpg",
            "publicUrl":"www.localstorahe.com/image.jpg"
            }
            "tags":[
                {
                    "tag":"food"
                }
            ],
                "__v": 0
            }
    }
   */
app.post("/post" , (req, res) => {
  let body = req.body;
  //console.log(body);
  let post = new Post({
    author: body.author._id,
    title: body.title,
    brief: body.brief,
    body: body.body,
    uploadDatetime: new Date().getTime(),
    status: body.status,
    coverImage: body.coverImage || {
      filename: "",
      publicUrl: "",
    },
    tags: body.tags,
  });
  // post.findOne({ _id: body.author }).populate('author').exec((error, post) => {
  //   if (error) {
  //     return res.status(500).json({
  //       success: false,
  //       message: "Error on find user",
  //       error,
  //     });
  //   }
  // })

  //Check old image vs new Image
  // if (post.image.filename) {
  //   if (post.image.filename != body.image.filename) {
  //     var fileToDelete = path.join(
  //       __dirname,
  //       "../" + `uploads/images/post/${post.image.filename || "5465"}`
  //     );
  //     if (fs.existsSync(fileToDelete)) {
  //       fs.unlinkSync(fileToDelete);
  //     }
  //   }
  // }

  post.save(async (error, post) => {
    if (error) {
      return res.status(500).json({
        success: false,
        message: "Error saving the post",
        error,
      });
    }
    await post.populate('author').execPopulate();
    return res.json({
      success: true,
      post: post,
    });
  });
});

/**
   * @api {PUT} /post/{id}?token={token} Update post
   * @apiGroup Post
   * @apiDescription This method adds a new post in the database
   * @apiVersion  1.0.0
   * @apiParam  {String} id Id of the document to be updated
   * @apiParam  {String} token JWT
   * 
   *  @apiParamExample  {type} Request-Example:
    {
            "coverImage": {
                "filename": "",
                "publicUrl": ""
            },
            "status": "A",
            "_id": "5fde567b4d6b714a8c79831b",
            "title": "Post edited again final",
            "brief": "This is the brief of the post edited",
            "body": "This is all the content of the post edited",
            "author": "Post's author edited",
            "uploadDatetime": "1608406651640",
            "tags": [
                {
                    "_id": "5fde59ab9b90af18d0c4e55a",
                    "tag": "food"
                }
            ],
            "__v": 0
}
   *
   * @apiSuccessExample {type} Success-Response:
    * {
        "success": true,
        "post": {
            "coverImage": {
                "filename": "",
                "publicUrl": ""
            },
            "status": "A",
            "_id": "5fde567b4d6b714a8c79831b",
            "title": "Post edited again final",
            "brief": "This is the brief of the post edited",
            "body": "This is all the content of the post edited",
            "author": "Post's author edited",
            "uploadDatetime": "1608406651640",
            "tags": [
                {
                    "_id": "5fde59ab9b90af18d0c4e55a",
                    "tag": "food"
                }
            ],
            "__v": 0
        }
    }
   */
app.put("/post/:id" , (req, res) => {
  let id = req.params.id;
  let body = req.body;

  Post.findById(id, (error, post) => {
    if (error) {
      return res.status(500).json({
        success: false,
        message: "Error on update post",
        error,
      });
    }

    //Check old image vs new Image
    // if (post.image.filename) {
    //     if (post.image.filename != body.image.filename) {
    //         var fileToDelete = path.join(__dirname, '../' + `uploads/images/post/${post.image.filename || '5465'}`);
    //         if (fs.existsSync(fileToDelete)) {
    //             fs.unlinkSync(fileToDelete);
    //         }
    //     }
    // }

    Post.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true },
      (error, post) => {
        return res.json({
          success: true,
          post: post,
        });
      }
    );
  });
});

/**
   * @api {DELETE} /post/{id}?token={token} Delete post
   * @apiGroup Post
   * @apiDescription This method do a logical delete of the post from de database
   * @apiVersion  1.0.0
   * @apiParam  {String} id Id of the document to be deleted
   * @apiParam  {String} token JWT
   * 
   * @apiSuccessExample {type} Success-Response:
   * {
    "success": true,
    "post": {
        "coverImage": {
            "filename": "",
            "publicUrl": ""
        },
        "status": "D",
        "_id": "5fde3c376d2bf03eacbbfe41",
        "title": "New post 3 edited again",
        "brief": "This is the brief of the post edited",
        "body": "This is all the content of the post edited",
        "author": "Post's author edited",
        "uploadDatetime": "1608399927455",
        "tags": [
            {
                "_id": "5fde42d39ffe4a33344c7678",
                "tag": "food"
            }
        ],
        "__v": 0
    }
}
   */
app.delete("/post/:id" , (req, res) => {
  let id = req.params.id;

  Post.findByIdAndUpdate(
    id,
    { status: "D" },
    { new: true },
    (error, postDB) => {
      if (error || !postDB) {
        return res.status(400).json({
          success: false,
          message: "Error earesing the post from database",
          error,
        });
      }

      //Check old image vs new Image
      // if (postDB.image.filename) {
      //     let fileToDelete = path.join(__dirname, '../' + `uploads/images/post/${image.filename || ''}`);
      //     if (fs.existsSync(fileToDelete)) {
      //         fs.unlinkSync(fileToDelete);
      //     }
      // }

      return res.json({
        success: true,
        post: postDB,
      });
    }
  );
});

/**
   * @api {GET} /post/search/{term}?token={token} Search posts
   * @apiGroup Post
   * @apiDescription This method search the term sent in the post title.  
   * @apiVersion  1.0.0
   * @apiParam  {String} term Term to be used to search in posts document
   * @apiParam  {String} token JWT
   * 
   * @apiSuccessExample {type} Success-Response:
   * {
    "success": true,
    "size": 1,
    "posts": [
        {
            "coverImage": {
                "filename": null,
                "publicUrl": null
            },
            "_id": "5fdd6595a8439326088e7f84",
            "title": "New post",
            "brief": "This is the brief of the post",
            "body": "This is all the content of the post",
            "author": "Post's author",
            "uploadDatetime": "1608344981848",
            "tags": [
                {
                    "_id": "5fdd6595a8439326088e7f85",
                    "tag": "food"
                }
            ]
        }
    ]
}
   */
app.get("/post/search/:term", (req, res) => {
  let collection = req.params.collection;
  let term = req.params.term;
  let regex = new RegExp(term, "i");

  Post.find(
    { status: { $ne: "D" } },
    "title brief body author uploadDatetime coverImage tags"
  )
    .or([{ title: regex }, { email: regex }])
    .exec((error, post) => {
      if (error) {
        return res.status(400).json({
          success: false,
          message: "Error searching the post on database",
          error,
        });
      }

      return res.json({
        success: true,
        size: post.length,
        posts: post,
      });
    });
});

/**
  * @api {PUT} /post/toggleStatus{id}?token={token} Toggle post status
  * @apiGroup Post
  * @apiDescription This method set the post status on active or deactivated
  * @apiVersion  1.0.0
  * @apiParam  {String} id Id of the document to be updated
  * @apiParam  {String} token JWT
  * 
  *
  * @apiSuccessExample {type} Success-Response:
  * {
       "success": true,
       "post": {
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
app.put("/post/toggleStatus/:id" , (req, res) => {
  let id = req.params.id;

  Post.findById(id, (error, post) => {
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Error on update post",
        error,
      });
    }

    if (!post) {
      return res.status(500).json({
        success: false,
        message: "Post not found",
        error,
      });
    }

    if (post.status == "A") {
      post.status = "I";
    } else if (post.status == "I") {
      post.status = "A";
    }

    post.save({ new: true }, (error, post) => {
      if (error) {
        return res.json({
          success: false,
          message: 'Error saving the post',
          error
        })
      }
      return res.json({
        success: true,
        post,
      });
    });
  });
});

module.exports = app;
