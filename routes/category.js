const express = require('express')
const router = express.Router()
const upload = require('../middleware/multer')
const categoryController = require('../controllers/category')
const { ensureAuth } = require('../middleware/auth')

// Create and Read Category Routes
router.get('/', ensureAuth, categoryController.getCategory)
router.post('/createCategory', upload.single('file'), categoryController.createCategory)
router.post('/extractPhotoCategory', upload.single('file'), categoryController.extractPhotoCategory)

// Create and Read Item Routes
router.get('/getItem/:id', categoryController.getItem)
router.post('/createItem/:id', upload.single('file'), categoryController.createItem)

// Get Routes
router.get('/getLog', categoryController.getLog)
router.get('/getOutgoing', categoryController.getOutgoing)
router.get('/getInventory', categoryController.getInventory)
router.get('/getTransaction', categoryController.getTransaction)

// Updating Routes
router.put('/updateItem', categoryController.updateItem)
router.put('/deductItem', categoryController.deductItem)

// Deleting Routes
router.delete('/deleteItem/:id', categoryController.deleteItem)
router.delete('/deleteLog/:id', categoryController.deleteLog)
router.delete('/deleteSales/:id', categoryController.deleteSales)

// Profile Photo Routes
router.put('/uploadProfilePhoto', upload.single('file'), categoryController.uploadProfilePhoto)
router.put('/changeProfilePhoto', upload.single('file'), categoryController.changeProfilePhoto)

// Item Photo Route
router.put('/uploadItemPhoto/:id', upload.single('file'), categoryController.uploadItemPhoto)

module.exports = router