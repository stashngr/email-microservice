'use strict';
/**
 * Module dependencies
 */
//=============================================================================
const
    path = require('path'),
    sendgrid = require('./sendgrid'),
    aws_ses = require('./aws_ses'),
    logger = require('../helpers/logger')().getLogger('ValidateBody'),
    util = require('util');
//=============================================================================
/**
 * Module functionality
 */
//=============================================================================
function validateEmailBody(req, res) {

   let emailSettings = req.body;
    logger.info("Validating " + JSON.stringify(emailSettings));
        if(!emailSettings.transport) {
            return res.status(409).json('Please provide a valid Transport.');
        }
        else if(!emailSettings.from) {
            return res.status(409).json('Please provide a From address.');
        }
        else if(!emailSettings.to) {
            return res.status(409).json('Please provide a To address.');
        }
        else if(!emailSettings.subject) {
            return res.status(409).json('Please provide a subject.');
        }
        else if(!emailSettings.emailbody) {
            return res.status(409).json('Please provide a body.');
        }
        else if(!emailSettings.company) {
            return res.status(409).json('Please provide company.');
        }
        else if(!emailSettings.templateName) {
            return res.status(409).json('Please provide a templateName.');
        }
        else {
            if(emailSettings.transport.toLowerCase() == 'sendgrid') {
                return sendgrid(emailSettings,res);
            }
            else if(emailSettings.transport.toLowerCase() == 'ses') {
                return aws_ses(emailSettings, res);
            }
            else {
                return res.status(409).json('Please provide a valid Transport.');
            }
        }
}
//=============================================================================
/**
 * Export module
 */
//=============================================================================
module.exports = validateEmailBody;
//=============================================================================
