const port = 3003

const bodyParser = require('body-parser')
const express = require('express')
const server  = express()
const allowCors = require('./cors')
const queryParser = require('express-query-int') // esse cara serve para usar na paginação

//middleware
server.use(bodyParser.urlencoded({ extended: true }))
server.use(bodyParser.json())
server.use(allowCors)
// vai dar um parser na query string e converter o que estive lá como número para inteiro
server.use(queryParser())

server.listen(port, function(){
  console.log(`BACKEND is running on port ${port}.`)
})

module.exports = server
