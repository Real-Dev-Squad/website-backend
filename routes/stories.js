const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const stories = require("../controllers/stories");
const { authorizeUser } = require("../middlewares/authorization");
const { createStory, updateStory } = require("../middlewares/validators/stories");

/**
 * @swagger
 * /story:
 *  get:
 *   summary: Used to get all the stories
 *   tags:
 *     - Stories
 *   responses:
 *     200:
 *       description: returns stories
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/stories'
 *     500:
 *       description: badImplementation
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/errors/badImplementation'
 */

router.get("/", stories.fetchStories);

/**
 * @swagger
 * /story/id:
 *  get:
 *   summary: Get the details of story with provided id.
 *   tags:
 *     - Stories
 *   responses:
 *     200:
 *       description: returns story details
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/stories'
 *     404:
 *         description: notFound
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errors/notFound'
 *     500:
 *       description: badImplementation
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/errors/badImplementation'
 */
router.get("/:id", stories.fetchStories);

/**
 * @swagger
 * /story:
 *  post:
 *   summary: Used to create new story
 *   tags:
 *     - Stories
 *   requestBody:
 *     description: Story data
 *     content:
 *       application/json:
 *         schema:
 *           $ref: '#/components/schemas/stories'
 *   responses:
 *     200:
 *       description: returns newly created story
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/stories'
 *     500:
 *       description: badImplementation
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/errors/badImplementation'
 */
router.post("/", authenticate, authorizeUser("appOwner"), createStory, stories.addNewStory);

/**
 * @swagger
 * /story:
 *  patch:
 *   summary: Used to update story details
 *   tags:
 *     - Stories
 *   requestBody:
 *     description: Story data to be updated
 *     content:
 *       application/json:
 *         schema:
 *           $ref: '#/components/schemas/stories'
 *   responses:
 *     204:
 *       description: no content
 *     404:
 *       description: notFound
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/errors/notFound'
 *     500:
 *       description: badImplementation
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/errors/badImplementation'
 */
router.patch("/:id", authenticate, authorizeUser("appOwner"), updateStory, stories.updateStory);

module.exports = router;
