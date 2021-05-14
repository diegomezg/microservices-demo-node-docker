 // ===========================
 // Requires
 // ===========================
 const express = require("express");
 const User = require("../models/user");
 const path = require("path");
 var fs = require("fs");

 const app = express();


 /**
  * @api {GET} /user?token={token} Get All Users
  * @apiGroup User
  * @apiDescription This method returns all the users registered in the data base
  * @apiVersion  1.0.0
  * @apiParam  {String} token JWT
  * @apiParam  {String} from OPTIONAL VALUE: Send this parameter to do a pagination of the service. This param specify the number or row will start to return
  * @apiParam  {String} limit OPTIONAL VALUE:  Send this parameter to do a pagination of the service. Thhis param specify the total of rows to return.
  * 
  * @apiSuccessExample {type} Success-Response:
  * {
     "success": true,
     "total": 1,
     "users": [
         {
             "login_type": "basic",
             "_id": "5f2c0b5f9230921234a8b20a",
             "name": "Default User",
             "email": "admin@mail.com",
             "gender": "Male",
             "birthday": "1994-02-02",
             "role": {
                 "status": "A",
                 "_id": "5f2c0a0be98f807e78b15f17",
                 "name": "DEFAULT_ROLE"
             },
             "mobile": null,
             "phone": null
         }
     ]
 }
  * 
  */
 app.get("/user" , (req, res) => {
     let from = req.query.from || 0;
     let limit = req.query.limit || null;

     from = Number(from);
     limit = Number(limit);

     User.find({ status: { "$ne": "D" } },
             "name email image gender login_type role mobile phone birthday status"
         )
         .skip(from)
         .limit(limit)
         .populate("role")
         .exec((error, users) => {
             if (error) {
                 return res.status(400).json({
                     success: false,
                     message: "Error while waiting the users from database",
                     error,
                 });
             }

             // Get total of documents
             User.count({ status: { "$ne": "D" } }, (error, total) => {
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
                     users,
                 });
             });
         });
 });



 /**
   * @api {GET} /user/{id}?token={token} Get specific User
   * @apiGroup User
   * @apiDescription This method returns an user selected by ID
   * @apiVersion  1.0.0
   * @apiParam  {String} id Id of the document to be returned
   * @apiParam  {String} token JWT
   * 
   * @apiSuccessExample {type} Success-Response:
   * {
    "success": true,
    "user": {
        "login_type": "basic",
        "status": "A",
        "_id": "5f2c0b5f9230921234a8b20a",
        "name": "Default User",
        "email": "admin@mail.com",
        "password": ":D",
        "gender": "Male",
        "birthday": "1994-02-02",
        "role": "5f2c0a0be98f807e78b15f17",
        "mobile": null,
        "phone": null,
        "__v": 0,
        "last_access": "2020-08-11T14:22:09.795Z"
    }
}
   */
 app.get("/user/:id", async(req, res) => {
     let id = req.params.id;
     User.findById(id, async(error, user) => {
         if (error) {
             return res.status(400).json({
                 success: false,
                 message: "Error while waiting the user from database",
                 error,
             });
         }

         user.password = ":D";
         await user.populate("role").execPopulate();

         return res.json({
             success: true,
             user,
         });
     });
 });



 /**
   * @api {POST} /user?token={token} Create new user
   * @apiGroup User
   * @apiDescription This method adds a new user in the database
   * @apiVersion  1.0.0
   * @apiParam  {String} token JWT
   * 
   *  @apiParamExample  {type} Request-Example:
    {
        "name":"Jhon",
        "email":"jhon@mail.com",
        "gender":"Male",
        "birthday":"1994-02-02",
        "password":"123456",
        "role":{
            "_id":"5f2c0a0be98f807e78b15f17"
        },
        "mobile":"333333333",
        "phone":"333333330"
    }
   *
   * @apiSuccessExample {type} Success-Response:
   * {
        "success": true,
        "user": {
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
 app.post("/user" , (req, res) => {
     let body = req.body;

     let user = new User({
         name: body.name,
         email: body.email,
         gender: body.gender,
         birthday: body.birthday || null,
         role: body.role,
         mobile: body.mobile || null,
         phone: body.phone || null,
         image: body.image || '',
     });

    //  Settings.find({})
    //      .limit(1)
    //      .exec((error, settings) => {

    //          if (error) {
    //              return res.status(400).json({
    //                  success: false,
    //                  message: "There are not default settings setted",
    //                  error,
    //              });
    //          }

             //If role is not sent get the default role value


             user.save(async(error, userDB) => {
                 if (error) {
                     return res.status(400).json({
                         success: false,
                         message: "Error saving the user",
                         error,
                     });
                 }

                 userDB.password = ":D";
                 await userDB.populate("role").execPopulate();
                 return res.json({
                     success: true,
                     user: userDB,
                 });
             });
         });


 /**
   * @api {PUT} /user/{id}?token={token} Update user
   * @apiGroup User
   * @apiDescription This method adds a new user in the database
   * @apiVersion  1.0.0
   * @apiParam  {String} id Id of the document to be updated
   * @apiParam  {String} token JWT
   * 
   *  @apiParamExample  {type} Request-Example:
    {
        "name":"Jhony",
        "gender":"Male",
        "birthday":"1994-02-02",
        "role":{
            "_id":"5f2c0a0be98f807e78b15f17"
        },
        "phone":"333333330"
    }
   *
   * @apiSuccessExample {type} Success-Response:
   * {
        "success": true,
        "user": {
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
 app.put("/user/:id" , (req, res) => {

     let id = req.params.id;
     let body = _.omit(req.body, [
         "password",
         "login_type",
         "status",
         "last_access",
         "email",
         "_id",
     ]);

     User.findById(id, async(error, user) => {
         if (error) {
             return res.status(500).json({
                 success: false,
                 message: "Error on update user",
                 error,
             });
         }

         //Check old image vs new Image
         if (user.image.filename) {
             if (user.image.filename != body.image.filename) {
                 var fileToDelete = path.join(__dirname, '../' + `uploads/images/user/${user.image.filename || '5465'}`);
                 if (fs.existsSync(fileToDelete)) {
                     fs.unlinkSync(fileToDelete);
                 }
             }
         }


         User.findByIdAndUpdate(id, body, { new: true, runValidators: true }, async(error, user) => {
             user.password = ":D";
             await user.populate("role").execPopulate();

             return res.json({
                 success: true,
                 user,
             });
         })


     });
 });

 /**
   * @api {DELETE} /user/{id}?token={token} Delete user
   * @apiGroup User
   * @apiDescription This method do a logical delete of the user from de database
   * @apiVersion  1.0.0
   * @apiParam  {String} id Id of the document to be deleted
   * @apiParam  {String} token JWT
   * 
   * @apiSuccessExample {type} Success-Response:
   * {
    "success": true,
    "user": {
        "login_type": "basic",
        "status": "D",
        "_id": "5f2c0b5f9230921234a8b20a",
        "name": "Default User",
        "email": "admin@mail.com",
        "password": ":D",
        "gender": "Male",
        "birthday": "1994-02-02",
        "role": {
            "status": "A",
            "_id": "5f2c0a0be98f807e78b15f17",
            "name": "DEFAULT_ROLE"
        },
        "mobile": null,
        "phone": null,
        "__v": 0,
        "last_access": "2020-08-15T01:12:10.589Z",
        "image": "5f2c0b5f9230921234a8b20a-671.jpg"
    }
}
   */
 app.delete("/user/:id" , (req, res) => {
     let id = req.params.id;

     User.findByIdAndUpdate(
         id, { status: "D" }, { new: true },
         async(error, userDB) => {
             if (error) {
                 return res.status(400).json({
                     success: false,
                     message: "Error earesing the user from database",
                     error,
                 });
             }

             //Check old image vs new Image
             if (userDB.image.filename) {
                 let fileToDelete = path.join(__dirname, '../' + `uploads/images/user/${image.filename || ''}`);
                 if (fs.existsSync(fileToDelete)) {
                     fs.unlinkSync(fileToDelete);
                 }
             }

             await userDB.populate('role').execPopulate();
             userDB.password = ":D";

             return res.json({
                 success: true,
                 user: userDB,
             });
         }
     );
 });


 /**
   * @api {GET} /user/search/{term}?token={token} Search users
   * @apiGroup User
   * @apiDescription This method search the term sent in the user name and email parameters.  
   * @apiVersion  1.0.0
   * @apiParam  {String} term Term to be used to search in users document
   * @apiParam  {String} token JWT
   * 
   * @apiSuccessExample {type} Success-Response:
   * {
        "success": true,
        "user": [
            {
                "login_type": "basic",
                "_id": "5f2c0b5f9230921234a8b20a",
                "name": "Default User",
                "email": "admin@mail.com",
                "gender": "Male",
                "role": {
                    "status": "A",
                    "_id": "5f2c0a0be98f807e78b15f17",
                    "name": "DEFAULT_ROLE"
                },
                "mobile": null,
                "phone": null
            },
            {
                "login_type": "basic",
                "_id": "5f32af84712c9f0a50a7e62e",
                "name": "Jhon",
                "email": "jhon@mail.com",
                "gender": "Male",
                "role": null,
                "mobile": "333333333",
                "phone": "333333330"
            }
        ]
    }
   */
 app.get('/user/search/:term' , (req, res) => {
     let collection = req.params.collection;
     let term = req.params.term;
     let regex = new RegExp(term, "i");

     User.find({ status: { "$ne": "D" } },
             "name email image gender login_type role mobile phone status"
         )
         .or([{ name: regex }, { email: regex }])
         .populate("role")
         .exec((error, user) => {
             if (error) {
                 return res.status(400).json({
                     success: false,
                     message: "Error searching the user on database",
                     error,
                 });
             }

             return res.json({
                 success: true,
                 user,
             });
         });
 });





 /**
   * @api {PUT} /user/toggleStatus{id}?token={token} Toggle user status
   * @apiGroup User
   * @apiDescription This method set the user status on active or deactivated
   * @apiVersion  1.0.0
   * @apiParam  {String} id Id of the document to be updated
   * @apiParam  {String} token JWT
   * 
   *
   * @apiSuccessExample {type} Success-Response:
   * {
        "success": true,
        "user": {
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
 app.put("/user/toggleStatus/:id" , (req, res) => {
     let id = req.params.id;

     User.findById(id, async(error, user) => {
         if (error) {
             return res.status(400).json({
                 success: false,
                 message: "Error on update user",
                 error,
             });
         }

         if (!user) {
             return res.status(500).json({
                 success: false,
                 message: "User not found",
                 error,
             });
         }

         if (user.status == 'A') {
             user.status = 'I'
         } else if (user.status == 'I') {
             user.status = 'A'
         }

         user.save({ new: true }, async(error, user) => {
             user.password = ":D";
             await user.populate("role").execPopulate();

             return res.json({
                 success: true,
                 user,
             });
         })
     });
 });


 module.exports = app;