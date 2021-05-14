const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let productSchema = new Schema({
    name: {
        type: String,
        required: [true, "Name is requierd"]
    },
    description: {
        type: String
    },
    price: {
        type: Number,
    },
    code: {
        type: String,
    },
    sku: {
        type: String,
    },
    images: [{
        filename: {
            type: String
        },
        publicUrl: {
            type: String
        },
        priority: {
            type: Number
        }
    }],
    subcategory: {
        type: Schema.Types.ObjectId,
        ref: 'Subcategory'
    },
    status: {
        type: String,
        default: 'A'
    },
    addedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'

    },
    uploadDate: {
        type: String
    }
});


module.exports = mongoose.model('Product', productSchema);