'use strict';
//=============================================================================
/**
 * Module dependencies
 */
//=============================================================================
const
    fs = require('fs'),
    path = require('path'),
    aws = require('aws-sdk'),
    nodemailer = require('nodemailer'),
    sesTransport = require('nodemailer-ses-transport'),
    EmailTemplate = require('email-templates').EmailTemplate,
    logger = require('../helpers/logger'),
    log = logger().getLogger("AWS_SES");
//=============================================================================
/**
 * Module config
 */
//=============================================================================
aws.config.update({
    region: process.env.SESRegion
});

const ses = new aws.SES();

let mailer = nodemailer.createTransport(sesTransport({
    ses: ses
}));
//=============================================================================
/**
 * Module functionality
 */
//=============================================================================
function sesMail(emailSettings, res) {
    let attachments;
 
    const templatename = 'templates/' + emailSettings.templateName,
        templatesDir = path.join(process.cwd(), templatename),
        template = new EmailTemplate(templatesDir);

    template.render(emailSettings, (err, html) => {
        if(err) {
            log.error('Error rendering template ' + JSON.stringify(err));
            return res.status(409).json('Error rendering template ' + err.message);
        }
        else {
            const msg = {
              to: emailSettings.to,
              from: emailSettings.from,
              subject: emailSettings.subject,
              html: html.html
            };
            if(attachments) {
                msg['attachments'] = attachments;
            }
            mailer.sendMail(msg, (err, response) => {
              if(err) {
                  log.error(emailSettings.from + ', ses response: ', response && response.body && response.body.errors);
                  log.error('there was an ses error' + err.message);
                  return res.status(400).json({ error: err.message });
              }
                return res.status(200).json(true);
            });
        }
    });
}
//=============================================================================
/**
 * Export module
 */
//=============================================================================
module.exports = sesMail;
//=============================================================================
