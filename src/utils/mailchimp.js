/**
 *
 * This call sends a message to one recipient.
 *
 */
const mailchimpClient = require ('@mailchimp/mailchimp_transactional')(process.env.MAILCHIMP_PRIVATE),
path = require('path'),
EmailTemplate = require('email-templates').EmailTemplate;
//=============================================================================
/**
 * Module functionality
 */
//=============================================================================
function sendMail(emailSettings, res) {
    try{
        console.log('incoming', emailSettings);
        const templatename = 'templates/' + emailSettings.templateName,
        templatesDir = path.join(process.cwd(), templatename),
        template = new EmailTemplate(templatesDir);

        template.render(emailSettings, (err, html) => {
            if(err) {
                console.error('Error rendering template ' + JSON.stringify(err));
                return res.status(409).json('Error rendering template ' + err.message);
            }
            else {
                const fromField = emailSettings.senderName ?
                `"${emailSettings.senderName}" <${emailSettings.from}>` :
                `"STASH" <${emailSettings.from}>`;
                mailchimpClient
                .messages
                .send(
                    {
                        message: {
                            text: html.html,
                            html: html.html,
                            subject: emailSettings.subject,
                            from_email: fromField,
                            to: [{ email: emailSettings.to },],
                            important: true
                
                        }
                    })
                .then((result) => {
                    console.log(result.body)
                    return res.status(200).json(true);
                })
                .catch((err) => {
                    console.error(emailSettings.from + ', mailchimpClient response: ');
                    console.error(err.statusCode)
                      console.error('there was an mailchimpClient error' + err.message);
                      return res.status(400).json({ error: err.message });
                });
            }
        });
    }catch(mailchimpError){
        console.error(mailchimpError);
        return res.status(500).send('not ok');
    }
}
//=============================================================================
/**
 * Export module
 */
//=============================================================================
module.exports = sendMail;
//=============================================================================

