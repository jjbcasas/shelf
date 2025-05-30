const express = require('express')
const router = express.Router()
const homeController = require('../controllers/home')
const authController = require('../controllers/auth')
const passport = require('passport')

// Home Routes
router.get('/', homeController.getIndex)
// Auth Routes
router.get('/login', authController.getLogin)
router.post('/login', authController.postLogin)
router.get('/logout', authController.logout)
router.get('/signup', authController.getSignup)
router.post('/signup', authController.postSignup)
// Google Routes
router.get('/auth/google', passport.authenticate('google', { scope: ['email','profile'], prompt: 'select_account'}))
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), authController.googleCallback)

module.exports = router