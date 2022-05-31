const express = require('express')
const router = express.Router()
const db = require('../models')
const cryptoJS = require('crypto-js')
const bcrypt = require('bcryptjs')
const axios = require('axios')

router.get('/', async (req,res) => {
    try {
      const searchURL = `https://api.jikan.moe/v4/anime?q=${req.query.animeSearch}&sfw`
      
     const response = await axios.get(searchURL)
     const anime = response.data.data
     // destructoring array into variables
    //  const [a] = anime
    //  console.log(a)
  
      // console.log(response.data)
      res.render('results.ejs', {anime})
      // res.send('hi')
  
    } catch(err) {
      console.warn(err)
    }
    
  })
  
  router.get('/:id', async (req,res) => {
    try {
      // console.log(req.params.id)
      const idURL = `https://api.jikan.moe/v4/anime/${req.params.id}`
      // const idURL = `https://api.jikan.moe/v4/anime?i=${req.params.id}`
      const response = await axios.get(idURL)
      const anime = response.data.data
      // console.log(anime)
      // const animeDetails = Object.entries()
      // console.log(idURL)
      res.render('details.ejs', {anime})
      // res.send('hi')
    } catch(err) {
      console.warn(err)
    }
  })

  module.exports = router