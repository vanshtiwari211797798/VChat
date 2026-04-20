const express = require("express");
const userModel = require('../ModeL/UserModel');
const router = express.Router();
const MessageModel = require("../ModeL/Message");
const bcrypt = require('bcryptjs');


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

        const newUser = new userModel({ name, phone, email, password:newPass });
        await newUser.save();
        return res.status(200).json({ msg: "Registered successfully !" });

    } catch (error) {
        console.error(`Errpor from the register new user and error is the ${error}`)
    }
})


//login api



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

module.exports = router;