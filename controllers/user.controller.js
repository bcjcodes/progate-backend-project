const express = require("express")
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
require('dotenv').config()
const { check, validationResult } = require("express-validator")
const user = express.Router();

//Model
const User = require("../model/user");

// exports.testingRoute = (req, res, next) => {
//   // return res.json({ msg: 'Route working....' })

user.post(
    "/signup",
    [
        check("name", "Please Enter a Valid name")
            .not()
            .isEmpty(),
        check("email", "Please enter a valid email").isEmail(),
        check("password", "Please enter a valid password").isLength({
            min: 4
        }),
        check("cfmPassword", "Please enter a valid password").isLength({
            min: 4
        })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        const {
            name,
            email,
            password,
            cfmPassword
        } = req.body;

         //Validate password
         if (password !== cfmPassword){
            return res.status(400).json({
                message: "Password does not match!"
            });
        }

        try {
            let user = await User.findOne({
                email
            });
            if (user) {
                return res.status(400).json({
                    msg: "User Already Exists"
                });
            }

            user = new User({
                name,
                email,
                password,
                cfmPassword
            });

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            user.cfmPassword = await bcrypt.hash(cfmPassword, salt);

            await user.save();

            const payload = {
                user: {
                    id: user.id
                }
            };

            jwt.sign(
                payload,
                "randomString", {
                expiresIn: 10000
            },
                (err, token) => {
                    if (err) throw err;
                    res.status(200).json({
                        token
                    });
                }
            );
        } catch (err) {
            console.log(err.message);
            res.status(500).send("Error in Saving");
        }
    }
);

user.post(
    "/signin",

    async (req, res)=> {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) res.json({ status: 400, message: 'User does not exist' });
        const IsMatch = await bcrypt.compare(password, user.password);
        if (!IsMatch) {
            return res.json({ status: 403, message: 'Incorrect username or password, please review details and try again' });
        }
        const token = jwt.sign(
            { email: user.email, id: user.id },
            "random string",
            { expiresIn: 3600 }
        );

        res.json({
            status: 200,
            data: {
                id: user.id,
                token,
                message: 'User Logged in Sucessfully'
            }
        });

    } catch (err) {
        res.json({
            status: 'failed',
            message: err
        })
    }
}
);

// }


module.exports = user;