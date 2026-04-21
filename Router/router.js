require("dotenv").config();
const express = require("express");
const userModel = require('../ModeL/UserModel');
const router = express.Router();
const MessageModel = require("../ModeL/Message");
const bcrypt = require('bcryptjs');
const jwttoken = require('jsonwebtoken');
const contactModel = require("../ModeL/ContatModel");



const SECRET_KEY = process.env.SECRET_KEY;



//Register new user 
router.post(('/register'), async (req, res) => {
    try {
        const { name, phone, email, password } = req.body;

        if (!name || !phone || !email || !password) {
            return res.status(400).json({ msg: "All fields is required" })
        }

        //check that phone is allready exist or not 
        const check_user_exist = await userModel.findOne({ phone: phone });

        if (check_user_exist) {
            return res.status(409).json({ msg: "User allready registered !" });
        }

        const SaltRound = 10;
        const newPass = await bcrypt.hash(password, SaltRound);

        const newUser = new userModel({ name, phone, email, password: newPass });
        await newUser.save();
        return res.status(200).json({ msg: "Registered successfully !" });

    } catch (error) {
        console.error(`Errpor from the register new user and error is the ${error}`)
    }
})


//login api
router.post(('/login'), async (req, res) => {
    try {
        const { phone, password } = req.body;

        if (!phone || !password) {
            return res.status(400).json({ msg: 'All fields is required' })
        }

        const is_exist = await userModel.findOne({ phone: phone });

        if (!is_exist) {
            return res.status(404).json({ msg: "User Not Exist" });
        }

        //check user password is valid or not
        const is_valid_password = await bcrypt.compare(password, is_exist.password);

        if (!is_valid_password) {
            return res.status(401).json({ msg: 'Invalid creadential' })
        }

        const new_jwt = jwttoken.sign({ phone: is_exist.phone }, SECRET_KEY, { expiresIn: "365d" });
        return res.status(200).json({ token: new_jwt });

    } catch (error) {
        console.error(`Error from the login user and error is the ${error}`)
    }
})


//get old messages 
router.get(('/get-message/:sender_id/:receiver_id'), async (req, res) => {
    try {
        const { sender_id, receiver_id } = req.params;

        if (!sender_id || !receiver_id) {
            return res.status(400).json({ msg: "All fields is required !" })
        }

        const getMessage = await MessageModel.find({
            $or: [
                { sender: sender_id, receiver: receiver_id },
                { sender: receiver_id, receiver: sender_id }
            ]
        }).sort({ createdAt: 1 });

        return res.status(200).json({ msg: "All message fetched successfully !", message: getMessage })

    } catch (error) {
        console.error(`Error from the getting old message and error is the ${error}`)
    }
})

//add to the contact api
router.post(('/add-contact'), async (req, res) => {
    try {
        const { phone, contact_phone, name } = req.body;

        if (!phone || !contact_phone || !name) {
            return res.status(400).json({ msg: "All fields is required !" })
        }

        //check that contact phone number is valid mins registered on the VChat
        const check_valid_phone = await userModel.findOne({ phone: contact_phone });

        if (!check_valid_phone) {
            return res.status(409).json({ msg: "User is not using the VChat, Please Refer" })
        }


        //check that user allready added the contact
        const check_allready_contact = await contactModel.findOne({ phone: phone, contact_phone: contact_phone });
        if (check_allready_contact) {
            return res.status(409).json({ msg: "Allready in the contact" })
        }

        //if user is exist then 
        const new_contact_add = new contactModel({ phone, contact_phone, name });
        await new_contact_add.save();
        return res.status(201).json({ msg: 'Contact Saved Successfully !' })

    } catch (error) {
        console.error(`Error from the add new contact ${error}`)
        return res.status(500).json({ msg: "Internal Server Error" });
    }
})

module.exports = router;