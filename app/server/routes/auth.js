require('dotenv').load();

const jwt                = require('jsonwebtoken');
const validator          = require('validator');
const express            = require('express');
const request            = require('request');

const User               = require('../models/User');
const UserController     = require('../controllers/UserController');

const permissions        = require('../services/permissions');
const logger             = require('../services/logger');

JWT_SECRET = process.env.JWT_SECRET;

function verifyRecaptcha(req, res, next) {
    request.post({
        uri: "https://www.google.com/recaptcha/api/siteverify",
        json: true,
        form: {
            secret: process.env.RECAPTCHA_SECRET_KEY,
            response: req.body.recaptchaToken
        }
    }, function (err, response, body) {
        if (err) {
            return res.status(500).json({message: "Something went wrong on our end :("});
        }

        if (!body.success) {
            return res.status(500).json({message: body["error-codes"].join(".")});
        }

        return next();
    });
}

module.exports = function(router) {
    router.use(express.json());

    // Register user
    router.post('/register', function (req, res) {
        var email = req.body.email;
        var password = req.body.password;
        var firstName = req.body.firstName;
        var lastName = req.body.lastName;

        if (!email) {
            return res.status(400).json({error: 'No email provided'});
        }

        if (!password) {
            return res.status(400).json({error: 'No password provided'});
        }

        if (!firstName) {
            return res.status(400).json({error: 'No first name provided'});
        }

        if (!lastName) {
            return res.status(400).json({error: 'No last name provided'});
        }

        UserController.createUser(email, firstName, lastName, password, function (err, token, user) {
                if (err || !user) {
                    if (err) {
                        return res.status(500).json(err);
                    }
                    return res.status(500).json({error: 'Unable to process request'});
                }

                console.log(req.body.email + ' registered.');

                return res.json({
                    token: token,
                    user: user
                });
        })
    });

    // Login and issue token
    router.post('/login', verifyRecaptcha, function (req, res) {
        var email = req.body.email;
        var password = req.body.password;

        console.log(req.body.email + ' attempting to login.');

        UserController.loginWithPassword(email, password, function (err, user, token) {

            if (err || !user) {
                console.log(err);
                return res.status(401).json(err);
            }

            return res.json({
                token: token,
                user: user
            });

        })

    });


    router.post('/tokenLogin', function (req, res) {
        var token = permissions.getToken(req);

        UserController.loginWithToken(token, function (err, token, user) {
            if (err || !user || !token) {
                if (err) {
                    console.log(err);
                    return res.status(400).json(err);
                }

                return res.status(401).json({error: 'Invalid Token'});
            }
            return res.json({
                token: token,
                user: user
            });
        })
    });

    router.post('/2FA', function (req, res) {
        var token = permissions.getToken(req);
        var code = req.body.code;

        console.log("2FA login detected");

        if (token && code) {
            console.log(token + " " + code);

            UserController.loginWith2FA(token, code, function (err, token, user) {
                if (err || !user || !token) {
                    if (err) {
                        console.log(err);
                        return res.status(401).json(err);
                    }

                    return res.status(401).json({error: 'Invalid Code'});
                }
                return res.json({
                    token: token,
                    user: user
                });
            });
        } else {
            res.status(401).json({error: "Error, no token and/or code received!"})
        }
    });

    // Password reset
    router.post('/reset', function (req, res) {
        var token = req.body.token;
        var password = req.body.password;

        if (!token) {
            return res.status(400).json({error: 'Invalid token'});
        }

        UserController.resetPassword(token, password, function (err, msg) {
            if (err || !msg) {
                if (err) {
                    return res.status(400).json(err);
                }

                return res.status(400).json({error: 'Invalid token'});
            }

            return res.json(msg);
        });
    });

    // Send password reset email
    router.post('/requestReset', function (req, res) {
        var email = req.body.email;

        console.log(req.body.email + ' requesting reset email.');

        if (!email || !validator.isEmail(email)) {
            return res.status(400).json({error: 'Invalid email'});
        }

        UserController.sendPasswordResetEmail(email, function (err) {
            if (err) {
                return res.status(400).json({error: 'Something went wrong.'});
            }

            return res.json({
                message: 'Success'
            });
        });
    });

    // Verify user
    router.post('/verify', function (req, res) {
        var token = req.body.token;

        if (!token) {
            return res.status(400).json({error: 'Invalid token'});
        }

        UserController.verify(token, function (err, msg) {
            if (err || !msg) {
                if (err) {
                    return res.status(400).json(err);
                }

                return res.status(400).json({error: 'Invalid token'});
            }

            return res.json({
                message: 'Success'
            });
        });
    });

    // Send verify email
    router.post('/requestVerify', function (req, res) {
        var token = permissions.getToken(req);

        if (!token) {
            return res.status(400).json({error: 'Invalid token'});
        }

        UserController.sendVerificationEmail(token, function (err) {
            if (err) {
                return res.status(err.code).json(err)
            }

            return res.json({
                message: 'Success'
            });
        });
    });
    
    // General
    // Change password
    router.post('/changePassword', permissions.isVerified, function (req, res) {
        var token = permissions.getToken(req);
        var newPassword = req.body.newPassword;
        var oldPassword = req.body.oldPassword;

        UserController.selfChangePassword(token, oldPassword, newPassword, logger.defaultResponse(req, res));
    });

    // Change password
    router.post('/adminChangePassword', permissions.isOwner, function (req, res) {
        var userID = req.body.userID;
        var password = req.body.password;
        UserController.adminChangePassword(req.userExecute, userID, password, logger.defaultResponse(req, res));
    });


    router.get('*', function (req, res) {
        res.json({'error' : 'lol what are you doing here?'});
    })
};