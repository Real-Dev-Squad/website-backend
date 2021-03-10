const express = require('express')
const router = express.Router()
const auctionController = require('../controllers/auctionController')

router.get('/', auctionController.fetchOngoingAuctions)

router.post('/', auctionController.createNewAuction)

router.post('/:id', auctionController.makeNewBid)

module.exports = router
