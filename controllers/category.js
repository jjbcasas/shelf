const { format } = require('morgan')
const cloudinary = require('../middleware/cloudinary')
const Category = require('../models/Category')
const Item = require('../models/Item')
const Log = require('../models/Log')
const Sales = require('../models/Sales')
const User = require('../models/User')

module.exports = {
    getCategory: async( req, res ) => {
        try {
            // Get all Categories
            const categories = await Category.find({ user: req.user.id }).sort({ createdAt: 'asc'}).lean()

            res.render('category.ejs', { categories: categories, user: req.user })
        } catch (error) {
            console.log(error)
        }
    },
    createCategory: async ( req, res ) => {
        try {
            // if a file is present
            if (req.file){
                const uploadResult = await cloudinary.uploader.upload(req.file.path)
                
                // Create a category
                await Category.create({
                    name: req.body.categoryName,
                    description: req.body.description,
                    user: req.user.id,
                    items: 0,
                    categoryPhoto: uploadResult.secure_url,
                    cloudinaryId: uploadResult.public_id,
                })
            } else {
                // Create a category
                await Category.create({
                    name: req.body.categoryName,
                    description: req.body.description,
                    user: req.user.id,
                    items: 0,
                })
            }
            
            console.log('Added new category!')
            res.redirect('/category')
        } catch (error) {
            console.log(error)
        }
    },
    getItem: async ( req, res ) => {
        try {
            // Get all items under that category
            const items = await Item.find({ categoryId: req.params.id }).sort({ createdAt: 'asc'}).lean()
            // Get the category
            const categories = await Category.find({ _id: req.params.id }).sort({ createdAt: 'asc'}).lean()

            res.render('item.ejs', { items: items, user: req.user, categories: categories })
        } catch (error) {
            console.log(error)
        }
    },
    createItem: async ( req, res ) => {
        try {
            const totalAmount = req.body.cost
            const totalQuantity = req.body.quantity

            // if a file is present
            if (req.file){
                const uploadResult = await cloudinary.uploader.upload(req.file.path)
                
                // Create an item
                await Item.create({
                    itemLabelOne: req.body.itemLabelOne,
                    itemValueOne: req.body.itemValueOne,
                    itemLabelTwo: req.body.itemLabelTwo,
                    itemValueTwo: req.body.itemValueTwo,
                    // for objects
                    // itemLabelOne: {
                    //     name: req.body.itemLabelOne, value: req.body.itemValueOne
                    // },
                    // itemLabelTwo: {
                    //     name: req.body.itemLabelTwo, value: req.body.itemValueTwo
                    // },
                    // for arrays
                    // itemLabelValue: [
                    //     { name: req.body.itemLabelOne, value: req.body.itemValueOne },
                    //     { name: req.body.itemLabelTwo, value: req.body.itemValueTwo }
                    // ],
                    description: req.body.description,
                    status: req.body.status,
                    categoryId: req.params.id,
                    totalCost: req.body.cost,
                    currency: req.body.currency,
                    quantity: req.body.quantity,
                    unit: req.body.unit,
                    costPerUnit: totalAmount / totalQuantity,
                    itemPhoto: uploadResult.secure_url,
                    cloudinaryId: uploadResult.public_id
                })

                // update the category at the same time
                await Category.findOneAndUpdate(
                    {
                        _id: req.params.id
                    },
                    {
                        $inc: { items: 1 }
                    }
                )
            } else {
                // Create an item
                await Item.create({
                    itemLabelOne: req.body.itemLabelOne,
                    itemValueOne: req.body.itemValueOne,
                    itemLabelTwo: req.body.itemLabelTwo,
                    itemValueTwo: req.body.itemValueTwo,
                    description: req.body.description,
                    status: req.body.status,
                    categoryId: req.params.id,
                    totalCost: req.body.cost,
                    currency: req.body.currency,
                    quantity: req.body.quantity,
                    unit: req.body.unit,
                    costPerUnit: totalAmount / totalQuantity
                })

                // update the category at the same time
                await Category.findOneAndUpdate(
                    {
                        _id: req.params.id
                    },
                    {
                        $inc: { items: 1 }
                    }
                )
            }

            // if a file is present
            if (req.file){
                const uploadResult = await cloudinary.uploader.upload(req.file.path)
                
                // Create a Log
                await Log.create({
                    itemLabelOne: req.body.itemLabelOne,
                    itemValueOne: req.body.itemValueOne,
                    itemLabelTwo: req.body.itemLabelTwo,
                    itemValueTwo: req.body.itemValueTwo,
                    description: req.body.description,
                    status: req.body.status,
                    categoryId: req.params.id,
                    totalCost: req.body.cost,
                    currency: req.body.currency,
                    quantity: req.body.quantity,
                    unit: req.body.unit,
                    costPerUnit: totalAmount / totalQuantity,
                    itemPhoto: uploadResult.secure_url,
                    cloudinaryId: uploadResult.public_id
                })
            } else {
                // Create a Log
                await Log.create({
                    itemLabelOne: req.body.itemLabelOne,
                    itemValueOne: req.body.itemValueOne,
                    itemLabelTwo: req.body.itemLabelTwo,
                    itemValueTwo: req.body.itemValueTwo,
                    description: req.body.description,
                    status: req.body.status,
                    categoryId: req.params.id,
                    totalCost: req.body.cost,
                    currency: req.body.currency,
                    quantity: req.body.quantity,
                    unit: req.body.unit,
                    costPerUnit: totalAmount / totalQuantity,
                })
            }

            console.log('Added new Item and Log!')
            res.redirect(`/category/getItem/${req.params.id}`)
        } catch (error) {
            console.log(error)
        }
    },
    getLog: async ( req, res ) => {
        try {
            // Get all the category under the user and get just the category field
            const categories = await Category.find({ user: req.user.id }, { _id: 1 }).lean()
            // use map to extract all the id and onto an array
            const categoriesId = categories.map( cat => cat._id )
            // Get all logs and then aggregate
            const dateLogs = await Log.aggregate([
                {
                    // Add $match STAGE to filter Log using categoryId
                    $match: {
                        categoryId: { $in: categoriesId } // Use $in operator to match against an array of IDs
                    }
                },
                {
                    // First Grouping - by Day AND itemLabelOne
                    // We'll create a composite _id for this intermediate grouping
                    $group: {
                        _id:  { 
                            date: { $dateToString: { format: '%m-%d-%Y', date: '$createdAt' } },
                            label: '$itemLabelOne'
                        },
                        logsPerLabel: { $push: '$$ROOT'}
                    }
                },
                {
                    // Second Grouping - Re-assemble by Day
                    // Now, group the results from Stage 1 by date only
                    $group: {
                        _id: '$_id.date',
                        labels: {
                            $push: {
                                labelName: '$_id.label',
                                items: '$logsPerLabel'
                            }
                        }
                    }
                },
                    {
                        // Sort the top-level by date
                        $sort: {
                            _id: 1 // sort by date ascending
                        }
                    }
            ])

            res.render('log.ejs', { user: req.user, dateLogs: dateLogs })
        } catch (error) {
            console.log(error)
        }
    },
    getOutgoing: async ( req, res ) => {
        try {
            // Get all sales and then aggregate
            const dateLogs = await Sales.aggregate([
                {
                    // First Grouping - by Day AND itemLabelOne
                    // We'll create a composite _id for this intermediate grouping
                    $group: {
                        _id:  { 
                            date: { $dateToString: { format: '%m-%d-%Y', date: '$createdAt' } },
                            label: '$itemLabelOne'
                        },
                        logsPerLabel: { $push: '$$ROOT'}
                    }
                },
                {
                    // Second Grouping - Re-assemble by Day
                    // Now, group the results from Stage 1 by date only
                    $group: {
                        _id: '$_id.date',
                        labels: {
                            $push: {
                                labelName: '$_id.label',
                                items: '$logsPerLabel'
                            }
                        }
                    }
                },
                    {
                        // Sort the top-level by date
                        $sort: {
                            _id: 1 // sort by date ascending
                        }
                    }
            ])

            res.render('outgoing.ejs', { user: req.user, dateLogs: dateLogs })
        } catch (error) {
            console.log(error)
        }
    },
    getInventory: async ( req, res ) => {
        try {
            // Get all Categories
            const categories = await Category.find({ user: req.user.id }).sort({ name: 1}).lean()
            // Get all items and then aggregate
            const items = await Item.aggregate([
                {
                    // First Grouping - by categoryId AND itemLabelOne
                    // We'll create a composite _id for this intermediate grouping
                    $group: {
                        _id: {
                            category: '$categoryId',
                            label: '$itemLabelOne'
                        },
                        logsPerLabel: { $push: '$$ROOT'}
                    }
                },
                {
                    // Second Grouping - Re-assemble by categroyId
                    // Now, group the results from Stage 1 by category only
                    $group: {
                        _id: '$_id.category',
                        labels: {
                            $push: {
                                labelName: '$_id.label',
                                items: '$logsPerLabel'
                            }
                        }
                    }
                },
                {
                    // Sort the top-level by label
                    $sort: {
                        labels: 1 // sort the labels by alphabetical order
                    }
                }
            ])

            res.render('inventory.ejs', { categories: categories, user: req.user, items: items})
        } catch (error) {
            console.log(error)
        }
    },
    getTransaction: async ( req, res ) => {
        try {
            // Get all items and sort it
            const items = await Item.find().sort({ itemValueOne: 1, itemValueTwo: 1 }).lean()
            // Get all categories
            const categories = await Category.find().sort({ name: 1 }).lean()

            res.render('transaction.ejs', { user: req.user, categories: categories, items: items })
        } catch (error) {
            console.log(error)
        }
    },
    updateItem: async ( req, res ) => {
        try {
            // Find the specific item
            const items = await Item.findOne(
                {
                    categoryId: req.body.itemCategory,
                    _id: req.body.allItems
                }
            ).sort({ createdAt: 'asc'}).lean()

            const average = (parseFloat(items.totalCost) + parseFloat(req.body.cost)) / (parseFloat(items.quantity) + parseFloat(req.body.quantity))

            // Update that specific item
            await Item.findOneAndUpdate(
                {
                    categoryId: req.body.itemCategory,
                    _id: req.body.allItems
                },
                {
                    $inc: { 
                        totalCost: req.body.cost,
                        quantity: req.body.quantity,
                    },
                    $set : { costPerUnit: average }
                }
            )

            if (req.file){
                const uploadResult = await cloudinary.uploader.upload(req.file.path)
                
                await Log.create({
                    itemLabelOne: items.itemLabelOne,
                    itemValueOne: items.itemValueOne,
                    itemLabelTwo: items.itemLabelTwo,
                    itemValueTwo: items.itemValueTwo,
                    description: req.body.description,
                    status: req.body.status,
                    categoryId: items.categoryId,
                    totalCost: req.body.cost,
                    currency: req.body.currency,
                    quantity: req.body.quantity,
                    unit: req.body.unit,
                    costPerUnit: req.body.cost / req.body.quantity,
                    itemPhoto: uploadResult.secure_url,
                    cloudinaryId: uploadResult.public_id
                })
            } else {
                await Log.create({
                    itemLabelOne: items.itemLabelOne,
                    itemValueOne: items.itemValueOne,
                    itemLabelTwo: items.itemLabelTwo,
                    itemValueTwo: items.itemValueTwo,
                    description: req.body.description,
                    status: req.body.status,
                    categoryId: items.categoryId,
                    totalCost: req.body.cost,
                    currency: req.body.currency,
                    quantity: req.body.quantity,
                    unit: req.body.unit,
                    costPerUnit: req.body.cost / req.body.quantity,
                })
            }

            console.log('Updated an Item and added new Incoming Log')
            res.redirect('/category/getTransaction')
        } catch (error) {
            console.log(error)
        }
    },
    deductItem: async ( req, res ) => {
        try {
            // Find specific item
            const items = await Item.findOne(
                {
                    categoryId: req.body.itemCategory,
                    _id: req.body.allItems
                }
            ).sort({ createdAt: 'asc'}).lean()

            const total = (parseFloat(items.costPerUnit) * parseFloat(req.body.quantity))
            const amount = parseFloat(items.totalCost) - parseFloat(total)
            const remainingStock = parseFloat(items.quantity) - parseFloat(req.body.quantity)

            // Update Specific item
            await Item.findOneAndUpdate(
                {
                    categoryId: req.body.itemCategory,
                    _id: req.body.allItems
                },
                {
                    $inc: { 
                        
                        quantity: -parseFloat(req.body.quantity),
                    },
                    $set : { 
                        totalCost: amount,
                    }
                }
            )

            // if a file is present
            if (req.file){
                const uploadResult = await cloudinary.uploader.upload(req.file.path)
                
                // if a value is present on totalAmount
                if ( req.body.totalAmount ) {

                    await Sales.create({
                        itemLabelOne: items.itemLabelOne,
                        itemValueOne: items.itemValueOne,
                        itemLabelTwo: items.itemLabelTwo,
                        itemValueTwo: items.itemValueTwo,
                        description: req.body.description,
                        status: req.body.status,
                        categoryId: items.categoryId,
                        quantity: req.body.quantity,
                        unit: req.body.unit,
                        itemPhoto: uploadResult.secure_url,
                        cloudinaryId: uploadResult.public_id,
                        totalAmount: req.body.totalAmount,
                        currency: req.body.currency,
                        unitPrice: req.body.totalAmount / req.body.quantity,
                        profit: (req.body.totalAmount / req.body.quantity) - items.costPerUnit,
                        remainingStock: remainingStock
                    })
                } else {
                    await Sales.create({
                        itemLabelOne: items.itemLabelOne,
                        itemValueOne: items.itemValueOne,
                        itemLabelTwo: items.itemLabelTwo,
                        itemValueTwo: items.itemValueTwo,
                        description: req.body.description,
                        status: req.body.status,
                        categoryId: items.categoryId,
                        quantity: req.body.quantity,
                        unit: req.body.unit,
                        remainingStock: remainingStock,
                        itemPhoto: uploadResult.secure_url,
                        cloudinaryId: uploadResult.public_id,
                    })
                }
            } else {

                if ( req.body.totalAmount ) {
                    await Sales.create({
                        itemLabelOne: items.itemLabelOne,
                        itemValueOne: items.itemValueOne,
                        itemLabelTwo: items.itemLabelTwo,
                        itemValueTwo: items.itemValueTwo,
                        description: req.body.description,
                        status: req.body.status,
                        categoryId: items.categoryId,
                        quantity: req.body.quantity,
                        unit: req.body.unit,
                        totalAmount: req.body.totalAmount,
                        currency: req.body.currency,
                        unitPrice: req.body.totalAmount / req.body.quantity,
                        profit: (req.body.totalAmount / req.body.quantity) - items.costPerUnit,
                        remainingStock: remainingStock
                    })
                } else {
                    await Sales.create({
                    itemLabelOne: items.itemLabelOne,
                    itemValueOne: items.itemValueOne,
                    itemLabelTwo: items.itemLabelTwo,
                    itemValueTwo: items.itemValueTwo,
                    description: req.body.description,
                    status: req.body.status,
                    categoryId: items.categoryId,
                    quantity: req.body.quantity,
                    unit: req.body.unit,
                    remainingStock: remainingStock
                })
                }
            }

            console.log('Deducted to an Item and added new Outgoing Log')
            res.redirect('/category/getTransaction')
        } catch (error) {
            console.log(error)
        }
    },
    deleteItem: async ( req, res ) => {
        try {
            // Find specific item
            let item = await Item.findById({ _id: req.params.id})
    
            if ( item.cloudinaryId ) {
            
                await cloudinary.uploader.destroy(item.cloudinaryId)

            } 

            // Delete an item
            await Item.deleteOne({ _id: req.params.id })

            // Update a Category
            await Category.findOneAndUpdate(
                {
                    _id: item.categoryId
                },
                {
                    $inc: { items: -1 }
                }
            )
    
            console.log('Deleted an Item')
            res.redirect(`/category/getItem/${item.categoryId}`)
        } catch (error) {
            console.log(error)
        }
    },
    deleteLog: async ( req, res ) => {
        try {
            // Find a specific log
            let log = await Log.findById({ _id: req.params.id})
    
            if ( log.cloudinaryId ) {
            
                await cloudinary.uploader.destroy(log.cloudinaryId)

            } 

            // Delete a specific log
            await Log.deleteOne({ _id: req.params.id })
    
            console.log('Deleted Incoming Log')
            res.redirect(`/category/getLog`)
        } catch (error) {
            console.log(error)
        }
    },
    deleteSales: async ( req, res ) => {
        try {
            // Find a specific sales
            let sale = await Sales.findById({ _id: req.params.id})
    
            if ( sale.cloudinaryId ) {
            
                await cloudinary.uploader.destroy(sale.cloudinaryId)

            } 

            // Delete specific sales
            await Sales.deleteOne({ _id: req.params.id })
    
            console.log('Deleted Outgoing Log')
            res.redirect(`/category/getOutgoing`)
        } catch (error) {
            console.log(error)
        }
    },
    uploadProfilePhoto: async ( req, res ) => {
        try {
            const uploadResult = await cloudinary.uploader.upload(req.file.path)

            // Update a user
            await User.findOneAndUpdate(
                { _id: req.user.id },
                {
                    $set: {
                        profileImage: uploadResult.secure_url,
                        cloudinaryId: uploadResult.public_id
                    }
                }
            )
                
            console.log('Profile Photo has been added!')
            res.redirect('/category')
        } catch (error) {
            console.log(error)
        }
    },
    changeProfilePhoto: async ( req, res ) => {
        try {
            const uploadResult = await cloudinary.uploader.upload(req.file.path)

            // Update a user
            await User.findOneAndUpdate(
                { _id: req.user.id },
                {
                    $set: {
                        profileImage: uploadResult.secure_url,
                        cloudinaryId: uploadResult.public_id
                    }
                }
            )
                
            console.log('Profile Photo has been changed!')
            res.redirect('/category')
        } catch (error) {
            console.log(error)
        }
    },
    uploadItemPhoto: async ( req, res ) => {
        try {
            // Find the item
            const item = await Item.findById({ _id: req.params.id }).lean()

            const uploadResult = await cloudinary.uploader.upload(req.file.path)

            // Update the profileImage of the item
            await Item.findOneAndUpdate(
                { _id: req.params.id },
                {
                    $set: {
                        itemPhoto: uploadResult.secure_url,
                        cloudinaryId: uploadResult.public_id
                    }
                }
            )

            console.log('Item Photo has been uploaded')
            res.redirect(`/category/getItem/${item.categoryId}`)
        } catch (error) {
            console.log(error)
        }
    }
}