const express = require("express")
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
require('dotenv').config()
const { check, validationResult } = require("express-validator")
const admin = express.Router();

//Model
const Admin = require("../model/admin");

// exports.testingRoute = (req, res, next) => {
//   // return res.json({ msg: 'Route working....' })

admin.post(
    "/admin/signup",
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
            let admin = await Admin.findOne({
                email
            });
            if (admin) {
                return res.status(400).json({
                    msg: "User Already Exists"
                });
            }

            admin = new Admin({
                name,
                email,
                password,
                cfmPassword
            });

            const salt = await bcrypt.genSalt(10);
            admin.password = await bcrypt.hash(password, salt);
            admin.cfmPassword = await bcrypt.hash(cfmPassword, salt);

            await admin.save();

            const payload = {
                admin: {
                    id: admin.id
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


module.exports = admin;