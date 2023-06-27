var axios = require('axios');
var bcrypt = require('bcryptjs');
var FormData = require('form-data');
var {generateToken, verifytoken} = require('./jwtConfig.js');
var transporterConfig = require('./mailConfig.js'); 

class sirenCloudSDK {

    constructor(apiKey) {
        this.apiKey = apiKey;
    }

    //////////////////////  MIDDLEWARES //////////////////////

    //To ensure strong password (DONE)
    validatePassword (req, res, next) {
        const user_password = req.body.user_password;
        const rePassword = new RegExp(`^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*#?&])[a-zA-Z0-9@$!%*#?&]{8,}$`);
        if (rePassword.test(user_password)) {
            next();
        } else {
            res.status(500).json({ 'message' : 'Password does not fufil requirements'});
        }
    }

    //Validate Email Input (DONE)
    validateEmail (req, res, next) {
        const user_email = req.body.user_email;
        const reEmail = new RegExp('^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$');
        if (reEmail.test(user_email)) {
            next();
        } else {
            res.status(500).json({ 'message' : 'Email does not fufil requirements'});
        }
    }

    //Verify if user is logged in and has valid JWT token (DONE)
    validateLogin(req, res, next) {
        const decodedToken = verifytoken(req.headers.authorization);
        if (decodedToken) {
            req.decodedToken = decodedToken;
            next();
        } else {
            res.status(403).json({ 'message' : 'Invalid Token' });
        }
    }

    //Verify if user is an admin
    validateAdminUser(req, res, next) {
        if (req.decodedToken.user_role != 'admin') {
            res.status(403).json({ 'message' : 'Not enough permission' })
        } else {
            next()
        }
    }


    //////////////////////  FOR USER ACTIONS  //////////////////////

    //Register User (DONE)
    registerUser(data, callback) {
        var apiKey = this.apiKey;
        bcrypt.hash(data.user_password, 10, function(err, hash) {
            if (err) {
                return callback(err, null)
            } else {
                data.user_password = hash;
                axios.post('http://localhost:8081/user/register', data, {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`
                    }
                })
                .then(result => {
                    return callback(null, result);
                })
                .catch(err => {
                    console.log(err)
                    return callback(err, null);
                });
            }
        });
    }

    //User Login + Send OTP (DONE)
    loginUser(data, callback) {
        axios.post('http://localhost:8081/user/login', 
            {
                data: data,
                transporter: transporterConfig,
            }, 
            {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            }
        )
        .then(result => {
            return callback(null, result);
        })
        .catch(err => {
            return callback (err, null)
        });
    }

    //Verify OTP (DONE)
    verifyOTP (data, callback) {
        axios.post('http://localhost:8081/user/verifyOTP', data, 
            {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            }
        )
        .then(result => {
            console.log(result.data[0]);
            const token = generateToken(result.data[0]);
            console.log(token);
            return callback(null, token);
        })
        .catch(err => {
            return callback(err, null);
        });
    }


    //////////////////////  FOR CONTENT ACTIONS //////////////////////

    //Uploading Content (DONE)
    uploadUserContent (data, callback) {
        const formData = new FormData();
        formData.append('content', data.content[0].buffer, {filename: data.content[0].originalname});
        formData.append('content_thumbnail', data.content_thumbnail[0].buffer, {filename: data.content_thumbnail[0].originalname});
        formData.append('content_title', data.content_title);
        formData.append('content_desc', data.content_desc);
        formData.append('content_private', data.content_private);
        formData.append('user_id', data.user_id);
        axios.post('http://localhost:8081/content/upload', formData, 
            {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    ...formData.getHeaders()
                }
            }
        )
        .then(result => {
            return callback(null, result)
        })
        .catch(err => {
            console.log(err);
            return callback(err, null);
        });
    }

    //Uploading Content (Semi-Done)
    retrievePublicContent (callback) {
        axios.get('http://localhost:8081/content/retrieve',
            {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                }
            }
        )
        .then(result => {
            return callback(null, result.data);
        })
        .catch(err => {
            console.log(err);
            return callback(err, null);
        });
    }




















    // //Get user account information
    // getUserInfo (req, res) {
    //     const user_to_get = {
    //         user_id: req.decodedToken.user_id,
    //     };
          
    //     axios.get('http://localhost:8081/user/account', {
    //         data: user_to_get,
    //         headers: {
    //             'Authorization': `Bearer ${this.apiKey}`,
    //         },
    //     })
    //     .then(result => {
    //         res.status(200).json(result.data[0]);
    //     })
    //     .catch(err => {
    //         console.log(err);
    //         res.status(500).json({ 'message' : 'Failed to retrieve user information' });
    //     });
          
    // }

    // //For user to update their information
    // updateUserInfo (req, res) {
    //     const newUserInfo = {
    //         user_id: req.decodedToken.user_id,
    //         username: req.body.username,
    //         user_email: req.body.user_email,
    //         user_password: req.body.user_password,
    //     };
      
    //     axios.put('http://localhost:8081/user/account/update', newUserInfo,
    //         {
    //             headers: {
    //                 'Authorization': `Bearer ${this.apiKey}`,
    //             }
    //         }
    //     )
    //     .then(result => {
    //         res.status(200).json({ 'message' : 'User information updated' });
    //     })
    //     .catch(err => {
    //         console.log(err);
    //         res.status(500).json({ 'message' : 'Failed to update user information, new email might be taken' });
    //     });
    // }

    // //For user to delete their own account
    // userDeleteAccount (req, res) {
    //     const account_to_delete = {
    //         user_id: req.decodedToken.user_id
    //     };
      
    //     axios.delete('http://localhost:8081/user/account/delete', {
    //         data: account_to_delete,
    //         headers: {
    //             'Authorization': `Bearer ${this.apiKey}`
    //         }
    //     })
    //     .then(result => {
    //         res.status(200).json({ 'message': 'Account Deleted' });
    //     })
    //     .catch(err => {
    //         console.log(err);
    //         res.status(500).json({ 'message' : 'Failed to delete account' });
    //     });
    // }

    // //Admin retrieve all users
    // getAllUsers (req, res) {
    //     axios.get('http://localhost:8081/users',
    //         {
    //             headers: {
    //                 'Authorization': `Bearer ${this.apiKey}`,
    //             }
    //         }
    //     )
    //     .then(result => {
    //         console.log(result.data)
    //         res.status(200).json({ 'message' : 'All Users Retrieved' });
    //     })
    //     .catch(err => {
    //         console.log(err);
    //         res.status(500).json({ 'message' : 'Retrieve Users Failed' });
    //     });
    // }

    // //Admin to delete users
    // adminDeleteUser (req, res) {
    //     const account_to_delete = {
    //         user_id: req.body.user_id
    //     };
      
    //     axios.delete('http://localhost:8081/user/account/delete', {
    //         data: account_to_delete,
    //         headers: {
    //             'Authorization': `Bearer ${this.apiKey}`
    //         }
    //     })
    //     .then(result => {
    //         res.status(200).json({ 'message': 'User Deleted' });
    //     })
    //     .catch(err => {
    //         console.log(err);
    //         res.status(500).json({ 'message': 'Failed to delete user' });
    //     });
    // }



}

module.exports = sirenCloudSDK;