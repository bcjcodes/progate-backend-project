const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
require('dotenv').config()
const { check, validationResult } = require('express-validator')
const admin = express.Router()
const multer = require('multer')
const authentication = require('./authentication')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/')
  },
  filename: function (req, file, cb) {
    const now = new Date().toISOString()
    const date = now.replace(/:/g, '-')
    cb(null, date + file.originalname)
  }
})

const fileFilter = (req, file, cb) => {
  //accept a file
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true)
  } else {
    //reject a file
    cb(null, false)
  }
}

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
})

//Model
const Admin = require('../model/admin')
const Product = require('../model/product')
const Sales = require('../model/sales')
const router = require('../routes/user.routes')

// exports.testingRoute = (req, res, next) => {
//   // return res.json({ msg: 'Route working....' })

admin.post(
  '/admin/signup',
  [
    check('name', 'Please Enter a Valid name')
      .not()
      .isEmpty(),
    check('email', 'Please enter a valid email').isEmail(),
    check('password', 'Please enter a valid password').isLength({
      min: 4
    }),
    check('cfmPassword', 'Please enter a valid password').isLength({
      min: 4
    })
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      })
    }

    const { name, email, password, cfmPassword, workExperience } = req.body

    //Validate password
    if (password !== cfmPassword) {
      return res.status(400).json({
        message: 'Password does not match!'
      })
    }

    try {
      let admin = await Admin.findOne({
        email
      })
      if (admin) {
        return res.status(400).json({
          msg: 'User Already Exists'
        })
      }

      admin = new Admin({
        name,
        email,
        password,
        cfmPassword,
        workExperience
      })

      const salt = await bcrypt.genSalt(10)
      admin.password = await bcrypt.hash(password, salt)
      admin.cfmPassword = await bcrypt.hash(cfmPassword, salt)

      if (admin.workExperience >= 10) {
        admin.adminAccess = true
      }

      await admin.save()

      const payload = {
        admin: {
          id: admin.id
        }
      }

      jwt.sign(
        payload,
        'secrettoken',
        {
          expiresIn: 10000
        },
        (err, token) => {
          if (err) throw err
          res.status(200).json({
            msg: 'Attendant created sucessfully'
          })
        }
      )
    } catch (err) {
      console.log(err.message)
      res.status(500).send('Error in Saving')
    }
  }
)

admin.post(
  '/admin/signin',

  async (req, res) => {
    try {
      const { email, password } = req.body
      const admin = await Admin.findOne({ email })

      if (!admin) res.json({ status: 400, message: 'User does not exist' })
      const IsMatch = await bcrypt.compare(password, admin.password)
      if (!IsMatch) {
        return res.json({
          status: 403,
          message:
            'Incorrect username or password, please review details and try again'
        })
      }
      const token = jwt.sign(
        {
          email: admin.email,
          id: admin.id,
          role: admin.role,
          adminAccess: admin.adminAccess
        },
        'secrettoken',
        { expiresIn: 3600 }
      )

      res.json({
        status: 200,
        data: {
          id: admin.id,
          token,
          message: 'User Logged in Sucessfully'
        }
      })
    } catch (err) {
      res.json({
        status: 'failed',
        message: err
      })
    }
  }
)

//@route    POST api/vi/products
//desc      Creating product route
//access     Private
//Create product
admin.post(
  '/product',
  authentication.authenticateAdmin,
  upload.single('image'),
  (req, res) => {
    const { name, quantity, price, image } = req.body

    newProduct = new Product({
      name,
      quantity,
      price
    })

    newProduct
      .save()
      .then(product => {
        return res
          .status(200)
          .json({ msg: 'Product Created Successfully', data: product })
      })
      .catch(err => console.log(err))
  }
)

//@route        GET api/v1/product
//@desc         Get all products
//@access       Private
admin.get('/product', authentication.authenticateAdmin, (req, res, next) => {
  Product.find({}).then(product => {
    res.json(product)
  })
})

//@route        GET api/v1/product/:id
//@desc         Get specific id
//@access       Private
admin.get(
  '/product/:id',
  authentication.authenticateAdmin,
  (req, res, next) => {
    Product.findById(req.params.id).then(product => {
      if (!product) {
        res.status(404).send('Product does not exist')
      } else {
        res.send(product)
      }
    })
  }
)

//@route        PUT api/v1/product/:id
//@desc         Update Products
//@access       Private
admin.put('/product/:id', authentication.authenticateAdmin, (req, res) => {
  const id = req.params.id
  Product.updateOne(
    { _id: req.params.id },
    {
      $set: {
        name: req.body.name,
        quantity: req.body.quantity,
        price: req.body.price
      }
    },
    { new: true, runValidators: true }
  )
    .then(product => res.json({ msg: 'Order Updated', data: product }))
    .catch(err => console.log(err))
})

//@route      DELETE api/product/:id
//@desc       Delete order
//access      Private
admin.delete('/product/:id', authentication.authenticateAdmin, (req, res) => {
  const id = req.params.id
  Product.findById(req.params.id)
    .then(product => {
      product.remove().then(() => res.json({ msg: 'Product Deleted' }))
    })
    .catch(err =>
      res.status(404).json({
        msg: 'Product does not exist'
      })
    )
})


//Get all sales
admin.get('/sales',
  authentication.authenticateAdmin,
  (req, res) => {
    Sales.find({}, function (err, sales) {
      res.json(sales);
    });
  })

//Get a specific sale by id
admin.get('/sales/:id',
  authentication.authenticateAdmin,
  (req, res) => {
    Sales.findById(req.params.id, function (err, item) {
      res.json(item);
    });
  })



module.exports = admin
