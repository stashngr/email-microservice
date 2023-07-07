'use strict';
require('dotenv').config();
//=============================================================================
/**
 * Module dependencies
 */
//=============================================================================
const
    express = require('express'),
    bParser = require('body-parser'),
    log4js = require('log4js'),
    validateEmailBody = require('./utils/validateEmailBody'),
    logger = require('./helpers/logger'),
    log = logger().getLogger("APP");
//=============================================================================
/**
 * Express instance
 */
//=============================================================================
const app = express();
//=============================================================================
/**
 * Module config
 */
//=============================================================================
const
    port = process.env.PORT || 3030;

app.set('port', port);
//=============================================================================
/**
 * Module middleware
 */
//=============================================================================
app.use(log4js.connectLogger(log, { level: 'auto' }));
app.use(bParser.json());
app.use(bParser.urlencoded({extended: true}));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
    if(req.method == 'OPTIONS') {
        res.status(200).end();
    }
    else {
        next();
    }
});
//=============================================================================
/**
 * Routes
 */
//=============================================================================
app.get('/test', (req, res) => {
    return res.status(200).json('OK');
});
app.post('/emailManagement/send', (req, res) => {
    return validateEmailBody(req, res);
});
app.get('/health', (req, res) => {
    res.status(200).json({
      status: true,
      message: "Healthy",
    });
});
//=============================================================================
/**
 * Export module
 */
//=============================================================================
module.exports = app;
//=============================================================================
