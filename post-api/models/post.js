const mongoose = require("mongoose");

let Schema = mongoose.Schema;

let postSchema = new Schema({
  title: {
    type: String,
    required: [true, "Name is requierd"],
  },
  brief: {
    type: String,
    required: [true, "Brief is requierd"],
  },
  body: {
    type: String,
    required: [true, "Body is required"],
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
    // required: [true, "Author is required"],
  }
});

module.exports = mongoose.model("Post", postSchema);
