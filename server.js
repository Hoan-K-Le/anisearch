require('dotenv').config()
// required packages
const express = require('express')
const rowdy = require('rowdy-logger')
const cookieParser = require('cookie-parser')
const db = require('./models')
const cryptoJS = require('crypto-js')
const axios = require('axios')
const { response } = require('express')
const methodOverride = require('method-override')

// app config
const PORT = process.env.PORT || 3000
const app = express()
app.set('view engine', 'ejs')

// middlewares
const rowdyRes = rowdy.begin(app)
app.use(require('express-ejs-layouts'))
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(methodOverride('_method'))
app.use(express.static(__dirname + '/public/')) // case sensitive for public folder // transfer asset

// DIY middleware
// happens on every request
app.use((req,res, next) => {
  // handy dandy debugging request logger
  console.log(`[${new Date().toLocaleDateString()}] incoming request: ${req.method} ${req.url}`)
  console.log('request body:', req.body)
  // modify the response to give data to the routes/middleware that is 'downstream'
  res.locals.myData = 'Hi, I came from a middleware!'
  // tell express that the middleware is done
  next()
})


// auth middleware
app.use(async (req, res, next) => {
  try {
     // if there is a cookie --
  if (req.cookies.userId) {
    // try to find that user in the database
    const userId = req.cookies.userId
    const decryptedId = cryptoJS.AES.decrypt(userId, process.env.ENC_KEY).toString(cryptoJS.enc.Utf8)
    const user = await db.user.findByPk(decryptedId)
    // mount the found user on the res.locals so that later routes can access the logged in user
    // any values on the res.locals is available to the layout.ejs
    res.locals.user = user
  } else {
    // the user is explicitly not logged in
    res.locals.user = null
  }
  next()
  } catch(err) {
    console.warn(err)
  } 
  
})



// routes
app.get('/', (req, res) => {
  // console.log(res.locals)
  res.render('index.ejs')
})

app.use('/users', require('./controllers/users'))
app.use('/anime', require('./controllers/anime'))

app.get('/search', (req,res) => {
  res.render('browse.ejs')
})







// 404 ERROR HANDLER -- NEEDS TO GO LAST
app.get('/*'), (req,res) => {
  // render your 404 template
}


app.use((req,res,next) => {
  // render a 404 template
  res.status(404).render('404.ejs')
})

// 500 error handler
// needs to have all 4 params
app.use((error, req, res, next) => {
  // log the error
  // console.log(error)
  // send a 500 error template
  res.status(500).render('500.ejs')
})

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
  rowdyRes.print()
})
