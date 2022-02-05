// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'express'.
const express = require('express')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'router'.
const router = express.Router()
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'authentica... Remove this comment to see the full error message
const authenticate = require('../middlewares/authenticate')
// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const auction = require('../controllers/auction')
// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const auctionValidator = require('../middlewares/validators/auctions')

/**
 * @swagger
 * /auctions/:id:
 *   get:
 *     summary: Fetches auction details for given auctionId
 *     tags:
 *       - Auctions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Auction details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/auctions'
 *       404:
 *         description: notFound
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/notFound'
 *       500:
 *         description: badImplementation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/badImplementation'
 */
router.get('/:id', auction.fetchAuctionById)

/**
 * @swagger
 * /auctions:
 *   get:
 *     summary: Get all the active (ongoing) auctions
 *
 *     tags:
 *       - Auctions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All ongoing auctions
 *         content:
 *           application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: Auctions returned successfully!
 *                  auctions:
 *                    type: array
 *                    items:
 *                      $ref: '#/components/schemas/auctions'
 *       404:
 *         description: notFound
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/notFound'
 *       503:
 *         description: serverUnavailable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/serverUnavailable'
 */
router.get('/', auction.fetchAvailableAuctions)

/**
 * @swagger
 * /auctions/bid/:id:
 *   post:
 *     summary: Makes a new bid given auctionId
 *     tags:
 *       - Auctions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: New bid
 *         content:
 *           application/json:
 *             schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: Successfully placed bid!
 *                  id:
 *                    type: string
 *       401:
 *         description: unAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/unAuthorized'
 *       403:
 *         description: forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/forbidden'
 *       404:
 *         description: notFound
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/notFound'
 *       500:
 *         description: badImplementation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/badImplementation'
 */
router.post('/bid/:id', authenticate, auctionValidator.placeBid, auction.makeNewBid)

/**
 * @swagger
 * /auctions:
 *   post:
 *     summary: Creates a new auction
 *     tags:
 *       - Auctions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: New auction
 *         content:
 *           application/json:
 *             schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: Auction created successfully!
 *                  id:
 *                    type: string
 *       401:
 *         description: unAuthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/unAuthorized'
 *       500:
 *         description: badImplementation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/badImplementation'
 */
router.post('/', authenticate, auctionValidator.createAuction, auction.createNewAuction)

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = router
