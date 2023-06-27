var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');//Just use(security feature)
var app = express();

var company = require('../model/company.js');
var validateFn=require('../middlewares/validation.js');

var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.options('*', cors());//Just use
app.use(cors());//Just use
app.use(bodyParser.json());
app.use(urlencodedParser);

app.post('/company/register', validateFn.validateEmail, validateFn.validatePassword, function (req,res) {

    var {company_name, company_email, company_password, company_domain} = req.body;

    company.register(company_name, company_email, company_password, company_domain, function (err, result) {
        if (err) {
            if (err.errno == 1062) {
                res.status(409).json({'message' : 'Company Email/Name/Domain has been taken'});
            } else {
                res.status(500).json({success:false});
            }
        }
        else {
            res.setHeader('Content-Type', 'application/json');
            res.status(201).json({success: true});
        }
    })
});

app.post('/company/login', function (req, res) {
    var {company_email, company_password} = req.body;

    company.login(company_email, company_password, function (err, token, result) {
        if (err) {
            res.status(500).json({'message': err});
        }
        else {
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json({success: true, token: token});
        }
    })

});




module.exports = app;