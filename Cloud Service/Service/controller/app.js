var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
const multer = require('multer');
var fs = require('fs');
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.options('*', cors());//Just use
app.use(cors());//Just use

var validationFn = require('../validation/validation.js')
var content = require('../model/content.js');
var user = require('../model/user.js');
var path = require('path')

//Multer Configuration

// Create a Multer instance with custom storage configuration
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        let destinationFolder;
        if (file.fieldname === 'content') {
            destinationFolder = path.join(__dirname, `../Storage/${req.companyName}/contents/`);
        } else if (file.fieldname === 'content_thumbnail') {
            destinationFolder = path.join(__dirname, `../Storage/${req.companyName}/thumbnail/`);
        }
        // Check if the destination folder exists
        if (!fs.existsSync(destinationFolder)) {
            // Create the destination folder if it doesn't exist
            fs.mkdirSync(destinationFolder, { recursive: true });
        }
        // Pass the destination folder to the callback
        callback(null, destinationFolder);
    },
    filename: (req, file, callback) => {
        const originalFileName = file.originalname;
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const modifiedFileName = uniqueSuffix + '-' + originalFileName;
        callback(null, modifiedFileName);
    }
});
  
const upload = multer({ storage });
  

//////////////////////  USER ENDPOINTS  //////////////////////

//Register User (DONE)
app.post('/user/register', validationFn.validateAPIkey, function(req,res) {
    var user_email = req.body.user_email;
    var username = req.body.username;
    var user_password = req.body.user_password;
    var user_role = 'user';
    var companyName = req.companyName;
    user.registerUser(companyName, username, user_email, user_password, user_role, function(err, result) {
        if (err) {
            res.status(500).json({ 'message' : 'Registration Unsuccessful, Email might be taken' });
        }
        else {
            res.status(201).json({ 'message' : 'Registration Successful' });
        }
    });

});

//Check password and email + Send OTP (DONE)
app.post('/user/login', validationFn.validateAPIkey, function (req, res) {

    var user_email = req.body.data.user_email;
    var user_password = req.body.data.user_password;
    var transporterConfig = req.body.transporter;
    var companyName = req.companyName;

    user.loginUser(companyName, transporterConfig, user_email, user_password, function(err, result) {
        if (err) {
            res.status(500).json({ 'message' : 'Email/Password Invalid' });
        }
        else {
            res.status(200).json({ 'message' : 'OTP has been sent' });
        }
    });

});

//Verify OTP (DONE)
app.post('/user/verifyOTP', validationFn.validateAPIkey, function (req, res) {

    var otp = req.body.otp;
    var user_email = req.body.user_email;
    var companyName = req.companyName;

    user.verifyOTP(companyName, otp, user_email, function(err, result) {
        if (err) {
            res.status(500).json({ 'message' : 'OTP Invalid' });
        }
        else {
            delete result[0]['user_password'];
            delete result[0]['user_secret'];
            res.status(200).json(result);
        }
    });

});



//////////////////////  CONTENT ENDPOINTS  //////////////////////

//Upload Content (DONE)
app.post('/content/upload', validationFn.validateAPIkey, upload.fields([{name: 'content', maxCount: 1}, {name: 'content_thumbnail', maxCount: 1}]), function (req, res) {
    const content = req.files['content'][0].destination + req.files['content'][0].filename;
    const content_thumbnail = req.files['content_thumbnail'][0].destination + req.files['content_thumbnail'][0].filename;
    var { content_title, content_desc, content_private, user_id} = req.body;
    var companyName = req.companyName;
    content.uploadContent(companyName, user_id, content_title, content_desc, content_thumbnail, content, content_private, function(err, result) {
        if (err) {
            res.status(500).json({ 'message' : 'Upload Failed' });
        }
        else {
            res.status(200).json({ 'message' : 'Content Uploaded' });
        }
    });
});

//Retrieve Content (Semi-Done)
app.get('/content/retrieve', validationFn.validateAPIkey, function (req, res) {
    var companyName = req.companyName;
    content.retrievePublicContent(companyName, function(err, result) {
        if (err) {
            res.status(500).json({ 'message' : 'Retrieve Failed' });
        }
        else {
            res.status(200).json( result );
        }
    });
});













// app.put('/user/account/update', validationFn.validateAPIkey, function (req, res) {
//     var user_email = req.body.user_email;
//     var username = req.body.username;
//     var user_password = req.body.user_password;
//     var user_id = req.body.user_id
//     var companyName = req.companyName;
//     user.updateUserInfo (companyName, username, user_email, user_password, user_id, function (err, result) {
//         if (err) {
//             res.status(500).json({ 'message' : 'Failed to update user information, new email might be taken' });
//         }
//         else {
//             res.status(200).json({ 'message' : 'User information updated' });
//         }
//     })
// });

// app.delete('/user/account/delete', validationFn.validateAPIkey, function (req, res) {
//     var user_id = req.body.user_id;
//     var companyName = req.companyName;
//     user.deleteUser (companyName, user_id, function (err, result) {
//         if (err) {
//             res.status(500).json({ 'message' : 'Failed to delete account' });
//         }
//         else {
//             res.status(200).json({ 'message' : 'Account Deleted' });
//         }
//     })
// })

// app.get('/users', validationFn.validateAPIkey, function (req, res) {
//     var companyName = req.companyName;
//     user.getAllUsers (companyName, function (err, result) {
//         if (err) {
//             res.status(500).json({ 'message' : 'Retrieve Users Failed' });
//         }
//         else {
//             res.status(200).json(result);
//         }
//     })
// });




// //////////////////////  ADMIN ENDPOINTS  //////////////////////

// app.post('/admin/register', validationFn.validateAPIkey, function(req,res) {
//     var user_email = req.body.user_email;
//     var username = req.body.username;
//     var user_password = req.body.user_password;
//     var user_role = 'admin';
//     var companyName = req.companyName;
//     user.registerUser(companyName, username, user_email, user_password, user_role, function(err, result) {
//         if (err) {
//             res.status(500).json({ 'message' : 'Registration Unsuccessful, Email might be taken' });
//         }
//         else {
//             res.status(201).json({ 'message' : 'Registration Successful' });
//         }
//     });

// });


  
  
  




module.exports = app;