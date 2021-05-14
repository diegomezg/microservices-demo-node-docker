const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let userSchema = new Schema({
    name: {
        type: String,
        required: [true, "Name is requierd"]
    },
    email: {
        type: String,
        required: [true, "Email is requierd"],
        unique: true
    },
    password: {
        type: String,
    },
    birthday: {
        type: String
    },
    gender: {
        type: String,
    },
    login_type: {
        type: String,
        default: 'basic'
    },
    status: {
        type: String,
        default: 'A'
    },
    mobile: {
        type: String
    },
    phone: {
        type: String
    }
});

module.exports = mongoose.model('User', userSchema);