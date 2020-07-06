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
        check("name", "Please Enter a Valid Username")
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
        const isMatch = await bcrypt.compare(password, cfmPassword);
        if (!isMatch)
            return res.status(400).json({
                message: "Password does not match!"
            });


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


// }


module.exports = user;