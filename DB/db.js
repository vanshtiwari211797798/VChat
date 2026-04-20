require("dotenv").config();
const mongoose = require("mongoose");

const DB_URL = process.env.DB_URL;


const ConnectDB = async () => {
    try {
        await mongoose.connect(DB_URL);
        console.log("Database connected successfully !");
    } catch (error) {
        console.log(`Error from the connecting the database and error is the ${error}`);
    }
}


module.exports = ConnectDB;