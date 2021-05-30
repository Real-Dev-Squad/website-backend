# **Backend Flow 🕸️**

<br>

> ## Explaining the flow using `Users` created in the project ✌️

<br>

- [**Backend Flow 🕸️**](#backend-flow-️)
  - [server.js](#serverjs)
  - [Base or Global Route](#base-or-global-route)
  - [Different HTTP Routes](#different-http-routes)
  - [Middlewares](#middlewares)
  - [Controllers](#controllers)
  - [Models](#models)
  - [config.js](#configjs)
  - [test](#test)
  - [package.json file](#packagejson-file)
  - [Want to Contribute ??](#want-to-contribute-)

## server.js

<br>

> Entry point for the project

- `Config` and `logger` are added to the global object
- Creating the server, and other server helper functions
- Makes use of `http` module of node.js

💡 Know How: [Build http-server](https://nodejs.dev/learn/build-an-http-server "Create Http-server")

<br>

## Base or Global Route

- In project, base route `'/users'` means this is the base for every users route
  [ From: `routes> index.js` ]

👀 Example:

`routes/index.js`

```
app.use('/users', require('./users.js'))
```

Description:

- To access details of user with `userId`, the route will be `/users/userId` and so on.

👀 Example:

`router.get('/:username', users.getUser)`

<br>

## Different HTTP Routes

- Defines the path of the users request (can be, `GET` | `POST` | `PUT` | `PATCH` | `DELETE` etc.)
- Each route can have one or more handler functions, which are executed when the route is matched

<br>

More on HTTP Methods: [MDN HTTP Methods](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods "HTTP Methods") <br>
Routing Basics: [Express Router](https://expressjs.com/en/guide/routing.html "Express way Routing")

<br>

👀 Example:

`GET /users Route`

```
router.get('/', authenticate, usersController.getUsers)
```

<br>

## Middlewares

- Middleware function has access to request object and response object
- And it has the `next()` [ mandatory to add ] which calls to the next middleware, if any assigned

💡 Know How: [Express Middleware](https://expressjs.com/en/guide/writing-middleware.html "Middleware Docs")

<br>

👀 Example:

`authenticate middleware`

```JS
module.exports = async (req, res, next) => {
  try {
    let token = req.cookies[config.get('userToken.cookieName')]

    /**
     * Enable Bearer Token authentication for NON-PRODUCTION environments
     * This is enabled as Swagger UI does not support cookie authe
     */
    if (process.env.NODE_ENV !== 'production' && !token) {
      token = req.headers.authorization.split(' ')[1]
    }

    const { userId } = authService.verifyAuthToken(token)

    // add user data to `req.userData` for further use
    const userData = await users.fetchUser({ userId })
    req.userData = userData.user

    return next()
  } catch (err) {
    logger.error(err)

    if (err.name === 'TokenExpiredError') {
      const refreshTtl = config.get('userToken.refreshTtl')
      const token = req.cookies[config.get('userToken.cookieName')]
      const { userId, iat } = authService.decodeAuthToken(token)
      const newToken = authService.generateAuthToken({ userId })
      const rdsUiUrl = new URL(config.get('services.rdsUi.baseUrl'))

      // add new JWT to the response if it satisfies the refreshTtl time
      if (Math.floor(Date.now() / 1000) - iat <= refreshTtl) {
        res.cookie(config.get('userToken.cookieName'), newToken, {
          domain: rdsUiUrl.hostname,
          expires: new Date(Date.now() + config.get('userToken.ttl') * 1000),
          httpOnly: true,
          secure: true
        })

        // add user data to `req.userData` for further use
        req.userData = await users.fetchUser({ userId })

        return next()
      } else {
        return res.boom.unauthorized('Unauthenticated User')
      }
    } else {
      return res.boom.unauthorized('Unauthenticated User')
    }
  }
}
```

<br>

## Controllers

- Contains the business logic
- Here the request and response are handled

👀 Example:

`getUsers Controller`

```JS
const getUsers = async (req, res) => {
  try {
    const allUsers = await userQuery.fetchUsers(req.query)
    return res.json({
      message: 'Users returned successfully!',
      users: allUsers
    })
  } catch (error) {
    logger.error(`Error while fetching all users: ${error}`)
    return res.boom.serverUnavailable('Something went wrong please contact admin')
  }
}
```

<br>

## Models

- Interacts with the database, Ex. [Firebase](https://firebase.google.com/docs/guides "Firebase Docs")
- Triggers database calls

👀 Example:

`fetchUsers Model`

```JS
const fetchUsers = async (query) => {
  try {
    const snapshot = await userModel
      .limit(parseInt(query.size) || 100)
      .offset((parseInt(query.size) || 100) * (parseInt(query.page) || 0))
      .get()

    const allUsers = []

    snapshot.forEach((doc) => {
      allUsers.push({
        id: doc.id,
        ...doc.data(),
        phone: undefined,
        email: undefined,
        tokens: undefined
      })
    })

    return allUsers
  } catch (err) {
    logger.error('Error retrieving user data', err)
    throw err
  }
}
```

<br>

## config.js

- Configuring Environmental Variables
  <br>

💡 Know How: [Config](https://github.com/lorenwest/node-config/wiki/Configuration-Files "Setup the Configuration files")
<br>

## test

<br>

> Includes Integration and Unit Test for the backend routes

Tests are written using:

- [mocha](https://mochajs.org/ "Mocha Framework") : Test Framework
- [chai](https://www.chaijs.com/ "Chai Library") : Asserion Library
- [sinon](https://sinonjs.org/ "Sinon") : JavaScript test spies, stubs and mocks
- [nock](https://github.com/nock/nock/blob/main/README.md "Nock") : HTTP requests mocking

<br>

## package.json file

<br>

> Gives the overiew of the project requirements

- `scripts` : For different scripts needed for development & others
- `Dependencies` : Modules needed for the project to work/ be functional
- `devDependencies` : Dependencies only needed for the devlopment purpose
 
<br>

---

## Want to Contribute ??

[Guide](https://github.com/Real-Dev-Squad/website-backend/blob/develop/CONTRIBUTING.md "Follow the guidelines")
