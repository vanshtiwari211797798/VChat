const mongoose = require('mongoose');


const ContactSchema = new mongoose.Schema({
    phone: {
        type: Number,
        required: true
    },
    contact_phone: {
        type: Number,
        required: true
    },
    contact: {
        type: String,
        required: true
    }
})



const contactModel = new mongoose.model("contacts",ContactSchema);
module.exports = contactModel;