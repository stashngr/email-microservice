/**
 *
 * This call sends a message to one recipient.
 *
 */
const Mailjet = require ('node-mailjet'),
path = require('path'),
EmailTemplate = require('email-templates').EmailTemplate;

const mailjet = new Mailjet({
    apiKey: process.env.MAILJET_APIKEY_PUBLIC,
    apiSecret: process.env.MAILJET_PRIVATE
});
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
                const request = mailjet
                .post("send", {'version': 'v3.1'})
                .request({
                    "Messages":[
                        {
                                "From": {
                                        "Email": emailSettings.from,
                                        // "Name": "Mailjet Pilot"
                                },
                                "To": [
                                        {
                                                "Email": emailSettings.to,
                                                // "Name": "passenger 1"
                                        }
                                ],
                                "Subject": emailSettings.subject,
                                // "TextPart": "Dear passenger 1, welcome to Mailjet! May the delivery force be with you!",
                                "HTMLPart": html.html
                        }
                    ]
                });
                request
                .then((result) => {
                    console.log(result.body)
                    return res.status(200).json(true);
                })
                .catch((err) => {
                    console.error(emailSettings.from + ', mailjet response: ');
                    console.error(err.statusCode)
                      console.error('there was an mailjet error' + err.message);
                      return res.status(400).json({ error: err.message });
                });
            }
        });
    }catch(mailjetError){
        console.error(mailjetError);
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

