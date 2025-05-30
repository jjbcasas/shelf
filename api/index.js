const express = require('express')
// initializes express
const app = express()
// requiring mongoose to connect to mongodb.
const mongoose = require('mongoose')
// package that helps us with our authentication or login
const passport = require('passport')
// to make a session for our users to stay logged in and then store our session info to mongodb
// express-session creates the cookie
const session = require('express-session')
// mongostore stores the session object to our mongodb
const MongoStore = require('connect-mongo')
// let us override the form and use put and delete request on it
const methodOverride = require('method-override')
// it shows alert msg when logging in/verification is a success or an error
const flash = require('express-flash')
// helps us log everything thats happening. to see all the requests coming thru
const logger = require('morgan')
const connectDB = require('../config/database')
const mainRoutes = require('../routes/main')
const categoryRoutes = require('../routes/category')
const path = require('path')

// use .env file in config folder
require('dotenv').config({ path: '../config/.env' })

// passport config
require('../config/passport')(passport)

// Passport google-oauth20 config
require('../config/passport-google')(passport)

// connect to the Database
connectDB()

// using ejs for views
app.set('view engine', 'ejs')

app.set('views', path.join(__dirname, '../views'))

// static folder
app.use(express.static('public'))

// body parsing, so we can pull something from the request
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// logging
app.use(logger('dev'))

// use forms for put / delete
app.use(methodOverride('_method'))

// setup sessions - stored in mongodb
app.use(
    session({
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.DB_STRING
        })
    })
)

// passport middleware
app.use(passport.initialize())
app.use(passport.session())

// use flash messages for errors, info, etc.
app.use(flash())

// set up routes
app.use('/', mainRoutes)
app.use('/category', categoryRoutes)


// server running
app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT} you better catch it!`)
})