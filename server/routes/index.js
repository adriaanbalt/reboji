// var router = require('express').Router();

// module.exports = (router) => {
const express = require('express');
const router = express.Router();

// routes
const puzzleRoutes = require('./puzzle')(router);
const userRoutes = require('./user')(router);

module.exports = router;

