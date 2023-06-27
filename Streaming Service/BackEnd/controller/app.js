var express = require('express');
var bodyParser = require('body-parser');
var FormData = require('form-data');
var cors = require('cors')
var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.options('*', cors());//Just use
app.use(cors());//Just use

const multer = require('multer');
const upload = multer();          


const apiKey = '0742bf5daa03fd3cfa39ab145cbfbe0b'; //company fills in their given API key
const sirenCloudSDK = require('../SDK/sirencloudSDK.js');
const sdk = new sirenCloudSDK(apiKey);


//////////////////////  USER ENDPOINTS  //////////////////////

//Endpoint 1 Register User(DONE)
app.post('/user/register', function(req,res) {

    const user_information = {
        username: req.body.username,
        user_email: req.body.user_email,
        user_password: req.body.user_password,
    }

    sdk.registerUser(user_information, function (err, result) {
        if (err) {
            res.status(500).json({ 'message' : 'Registration Unsuccessful, Email might be taken' });
        } else {
            res.status(201).json({ success: true });
        }
    })
});

//Endpoint 2 Check password and email + Send OTP (DONE)
app.post('/user/login', function (req, res) {
    const login_credentials = {
        user_email: req.body.user_email,
        user_password: req.body.user_password,
    }

    sdk.loginUser(login_credentials, function (err, result) {
        if (err) {
            res.status(500).json({ 'message' : 'Email/Password Invalid' });
        } else {
            res.status(200).json({ success: true, });
        }
    })
})

//Endpoint 3 Verify OTP (DONE)
app.post('/user/2FA', function (req, res) {
    
    const otp_input = {
        user_email: req.body.user_email,
        otp: req.body.otp,
    }

    sdk.verifyOTP(otp_input, function (err, result) {
        if (err) {
            res.status(500).json({ 'message' : 'OTP Invalid' });
        } else {
            res.status(200).json({ success: true, token: result});
        }
    })
})

//////////////////////  CONTENT ENDPOINTS  //////////////////////

//Endpoint 1 Upload Content (DONE)
app.post('/user/content/upload', sdk.validateLogin, upload.fields([{name: 'content', maxCount: 1}, {name: 'content_thumbnail', maxCount: 1}]), function (req, res) {
    
    const video_data = {...req.body, ...req.files, user_id: req.decodedToken.user_id};

    sdk.uploadUserContent(video_data, function (err, result) {
        if (err) {
            res.status(500).json({ 'message' : 'Failed to upload content' });
        } else {
            res.status(200).json({ success: true });
        }
    })

});

//Endpoint 2 Retrieve all public content (Semi-Done)
app.get('/content/public', sdk.validateLogin, function (req, res) {

    sdk.retrievePublicContent(function (err, result) {
        if (err) {
            res.status(500).json({ 'message' : 'Failed to retrieve content' });
        } else {
            res.status(200).json( result );
        }
    })

});























// //Endpoint 4
// app.get('/user/account', sdk.validateLogin, function (req, res) {
//     sdk.getUserInfo(req, res);
// })

// //Endpoint 5
// app.put('/user/account/update', sdk.validateLogin, sdk.validateEmail, sdk.validatePassword, function (req, res) {
//     sdk.updateUserInfo(req, res);
// })

// //Endpoint 6
// app.delete('/user/account/delete', sdk.validateLogin, function (req, res) {
//     sdk.userDeleteAccount(req, res)
// })



// //////////////////////  CONTENT ENDPOINTS  //////////////////////

// //Endpoint 1
// app.post('/user/content/upload',sdk.validateLogin, upload.fields([{name: 'content', maxCount: 1}, {name: 'content_thumbnail', maxCount: 1}]), function (req, res) {
//     sdk.uploadOwnContent(req, res);
// });

// //Endpoint 2 (In progress) ...


// //////////////////////  ADMIN USER ENDPOINTS  //////////////////////

// //Endpoint 1 
// app.get('/manage/users',sdk.validateLogin, sdk.validateAdminUser, function (req, res) {
//     sdk.getAllUsers(req, res);
// })

// //Endpoint 2 
// app.delete('/manage/users/delete', sdk.validateLogin, sdk.validateAdminUser, function (req, res) {
//     sdk.adminDeleteUser(req, res);
// })

 




module.exports = app;