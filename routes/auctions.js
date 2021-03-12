const express = require('express')
const router = express.Router()
const authenticate = require('../middlewares/authenticate')
const auctionController = require('../controllers/auctionController')
const auctionValidator = require('../middlewares/validators/auctions')

router.get('/:id', auctionController.fetchAuctionById)

router.get('/', auctionController.fetchAvailableAuctions)

router.get('/seller/:id', auctionController.fetchAuctionBySeller)

router.post('/bid/:id', authenticate, auctionValidator.placeBid, auctionController.makeNewBid)

router.post('/', authenticate, auctionValidator.createAuction, auctionController.createNewAuction)

module.exports = router
