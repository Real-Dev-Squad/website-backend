const express = require('express')
const router = express.Router()
const authenticate = require('../middlewares/authenticate')
const auctionController = require('../controllers/auctionController')

router.get('/:id', auctionController.fetchAuctionById)

router.get('/', auctionController.fetchAvailableAuctions)

router.get('/seller/:id', auctionController.fetchAuctionBySeller)

router.post('/bid/:id', authenticate, auctionController.makeNewBid)

router.post('/', authenticate, auctionController.createNewAuction)

module.exports = router
