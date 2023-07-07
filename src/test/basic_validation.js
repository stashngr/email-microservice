'use strict';
process.env.NODE_ENV = 'test';
//=============================================================================
/**
 * dependencies
 */
//=============================================================================
const
    server = require('../server'),
    should = require('chai').should(),
    path = require('path');
let request = require('supertest');
//=============================================================================
/**
 * config
 */
//=============================================================================
request = request(server);
function errorHandler(err, done) {
    console.log('There was an error running the test');
    console.error(err);
    return done(err);
}
let attachment_path = path.join(process.cwd(), 'assets/test_img/books.jpg');
console.log('attchment path', attachment_path);
//=============================================================================
/**
 * variables
 */
//=============================================================================
const
    valid_data = {
        "transport":"sendgrid",
        "from":"noreply@stashng.com",
        "to":"stashngr@gmail.com",
        "subject":"testing testing",
        "emailbody":"Your Stash Money App!",
        "templateName":"GenericEmail",
        "company": "Stashbox"
    },
    no_transport = {
        "from":"test@wejustdo.com",
        "to":"dev@percayso.com",
        "subject":"testing testing",
        "emailbody":"Node.js rockzzzz!",
        "company": "StashBox"
    },
    no_from = {
        "transport":"sendgrid",
        "to":"dev@percayso.com",
        "subject":"testing testing",
        "emailbody":"Node.js rockzzzz!",
        "company": "StashBox"
    },
    no_to = {
        "transport":"sendgrid",
        "from":"test@wejustdo.com",
        "subject":"testing testing",
        "emailbody":"Node.js rockzzzz!",
        "company": "StashBox"
    },
    no_subject = {
        "transport":"sendgrid",
        "from":"test@wejustdo.com",
        "to":"dev@percayso.com",
        "emailbody":"Node.js rockzzzz!",
        "company": "StashBox"
    },
    no_body = {
        "transport":"sendgrid",
        "from":"test@wejustdo.com",
        "to":"dev@percayso.com",
        "subject":"testing testing",
        "company": "StashBox"
    },
    no_company = {
        "transport":"sendgrid",
        "from":"test@wejustdo.com",
        "to":"dev@percayso.com",
        "emailbody":"Node.js rockzzzz!",
        "subject":"testing testing",
    },
    valid_data_ses = {
        "transport":"ses",
        "from":"notify@stashng.com",
        "to":"retnan@stashng.com",
        "subject":"testing testing",
        "emailbody":"Your Stash Money App!",
        "templateName":"GenericEmail",
        "company": "StashBox"
    },
    valid_data_mailjet = {
        "transport":"mailjet",
        "from":"notify@stashng.com",
        "to":"alewamedia@gmail.com",
        "subject":"testing testing",
        "emailbody":"Your Stash Money App!",
        "templateName":"GenericEmail",
        "company": "StashBox"
    };
//=============================================================================
/**
 * Tests
 */
//=============================================================================
describe('Email Management App, Sendgrid and SES Transport Tests', function () {
    this.timeout(10000);
    describe('POST /emailManagement/send', function () {
        it('should return HTTP 409 and "Please provide a valid Transport"', function (done) {
            request.post('/emailManagement/send')
                .send(no_transport)
                .expect(409).end(function (err, res) {
                if (err) {
                    return errorHandler(err, done);
                }
                else {
                    res.text.should.equal(JSON.stringify('Please provide a valid Transport.'));
                    res.header['content-type'].should.include('application/json');
                    done();
                }
            });
        });
        it('should return HTTP 409 and "Please provide a From address"', function (done) {
            request.post('/emailManagement/send').send(no_from).expect(409).end(function (err, res) {
                if (err) {
                    return errorHandler(err, done);
                }
                else {
                    res.text.should.equal(JSON.stringify("Please provide a From address."));
                    res.header['content-type'].should.include('application/json');
                    done();
                }
            });
        });
        it('should return HTTP 409 and "Please provide a To address"', function (done) {
            request.post('/emailManagement/send').send(no_to).expect(409).end(function (err, res) {
                if (err) {
                    return errorHandler(err, done);
                }
                else {
                    res.text.should.equal(JSON.stringify("Please provide a To address."));
                    res.header['content-type'].should.include('application/json');
                    done();
                }
            });
        });
        it('should return HTTP 409 and "Please provide a subject"', function (done) {
            request.post('/emailManagement/send').send(no_subject).expect(409).end(function (err, res) {
                if (err) {
                    return errorHandler(err, done);
                }
                else {
                    res.text.should.equal(JSON.stringify("Please provide a subject."));
                    res.header['content-type'].should.include('application/json');
                    done();
                }
            });
        });
        it('should return HTTP 409 and "Please provide a body"', function (done) {
            request.post('/emailManagement/send').send(no_body).expect(409).end(function (err, res) {
                if (err) {
                    return errorHandler(err, done);
                }
                else {
                    res.text.should.equal(JSON.stringify("Please provide a body."));
                    res.header['content-type'].should.include('application/json');
                    done();
                }
            });
        });

        it('should return HTTP 409 and "Please provide a company"', function (done) {
            request.post('/emailManagement/send').send(no_company).expect(409).end(function (err, res) {
                if (err) {
                    return errorHandler(err, done);
                }
                else {
                    res.text.should.equal(JSON.stringify("Please provide company."));
                    res.header['content-type'].should.include('application/json');
                    done();
                }
            });
        });


        it('should return HTTP 200 and an object (result) with value of "success"', function (done) {
            request.post('/emailManagement/send').send(valid_data_ses).expect(200).end(function (err, res) {
                if (err) {
                    console.log('fish', err);
                    return errorHandler(err, done);
                }
                else {
                    console.log('gwarimp',res.text);
                    res.text.should.equal('true');
                    res.header['content-type'].should.include('application/json');
                    done();
                }
            });
        });

        it('should return HTTP 200 and an object (result) valid_data_mailjet with value of "success"', function (done) {
            request.post('/emailManagement/send').send(valid_data_mailjet).expect(200).end(function (err, res) {
                if (err) {
                    console.log('fish', err);
                    return errorHandler(err, done);
                }
                else {
                    console.log('gwarimp',res.text);
                    res.text.should.equal('true');
                    res.header['content-type'].should.include('application/json');
                    done();
                }
            });
        });

        it('should return HTTP 200 and an object (result) with value of "success"', function (done) {
            request.post('/emailManagement/send').send(valid_data).expect(200).end(function (err, res) {
                if (err) {
                    return errorHandler(err, done);
                }
                else {
                    res.text.should.equal('true');
                    res.header['content-type'].should.include('application/json');
                    done();
                }
            });
        });
    });
});
//=============================================================================
