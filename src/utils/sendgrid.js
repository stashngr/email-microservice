'use strict';
//=============================================================================
/**
 * Module dependencies
 */
//=============================================================================
const
    path = require('path'),
    fs = require('fs'),
    EmailTemplate = require('email-templates').EmailTemplate,
    logger = require('../helpers/logger'),
    log = logger().getLogger("SendGrid");

//=============================================================================
/**
 * SGT OPTIONS
 */
//=============================================================================

   const  helper = require('sendgrid').mail,
    sg = require('sendgrid')(process.env.SENDGRID_API_KEY);
    console.log("SENDGRID_API_KEY");
    if(process.env.SENDGRID_API_KEY){
        console.log(process.env.SENDGRID_API_KEY.substring(0, 20));
    }

//=============================================================================
/**
 * Module functionality
 */
//=============================================================================
function sendMail(emailSettings, res) {

    const templatename = 'templates/' + emailSettings.templateName,
        templatesDir = path.join(process.cwd(), templatename),
        template = new EmailTemplate(templatesDir);

    template.render(emailSettings, (err, html) => {
        if(err) {
            log.error('Error rendering template ' + JSON.stringify(err));
            return res.status(409).json('template does not exists: ' + err.message);
        }
        else {

            let mail = new helper.Mail();
            var email = new helper.Email(emailSettings.from, emailSettings.company);
            mail.setFrom(email);
            mail.setSubject(emailSettings.subject);

            var personalization = new helper.Personalization();
            email = new helper.Email(emailSettings.to);
            personalization.addTo(email);
            mail.addPersonalization(personalization);

            var content = new helper.Content('text/html', html.html);
            mail.addContent(content);

            var request = sg.emptyRequest({
                method: 'POST',
                path: '/v3/mail/send',
                body: mail.toJSON()
            });

            sg.API(request, function(err, response) {
                if(err) {
                    log.error('sendgrid response: ', response && response.body && response.body.errors);
                    log.error('sendgrid error' + err);
                    return res.status(500).json({error: err.message});
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
module.exports = sendMail;
//=============================================================================

