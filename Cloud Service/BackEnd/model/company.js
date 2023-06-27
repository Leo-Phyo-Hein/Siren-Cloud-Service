var db = require('./databaseConfig.js');
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var config = require('../middlewares/jwtconfig.js');

var companyDB = {

    register: function (company_name, company_email, company_password, company_domain, callback) {
        bcrypt.hash(company_password, 10, function(err, hash) {
			company_password = hash;
		});
        var company_apikey = crypto.randomBytes(16).toString('hex');
        var conn = db.getConnection();
        conn.connect(function (err) {
            if (err) {
                console.log(err);
                return callback(err, null);
            } else {
                console.log("Connected!");
                var sql = 'INSERT INTO siren_cloud.companies(company_name, company_email, company_password, company_apikey, company_domain) VALUES(?,?,?,?,?)';
                conn.query(sql, [company_name, company_email, company_password, company_apikey, company_domain], function (err, result) {
                    if (err) {
                        console.log(err);
                        return callback(err, null);
                    } else {
                        var sql = 'CREATE DATABASE ??';
                        conn.query(sql, [company_name], function (err, result) {
                            if (err) {
                                console.log(err);
                                return callback(err, null);
                            } else {
                                var filePath = path.join(__dirname, '.', 'createdatabase.sql');
                                var sql = fs.readFileSync(filePath, 'utf8').replace(/{DATABASE_NAME}/g, company_name);
                                const statements = sql.split(';');
                                executeStatements(statements, conn, callback);
                            }
                        });
                    }
                });
            }
        });
    
        function executeStatements(statements, conn, callback) {
            if (statements.length === 0) {
                conn.end();
                return callback(null, "Database created successfully.");
            }
    
            const statement = statements.shift().trim();
    
            if (statement !== '') {
                conn.query(statement, function (err, result) {
                    if (err) {
                        console.log(err);
                        conn.end();
                        return callback(err, null);
                    } else {
                        executeStatements(statements, conn, callback);
                    }
                });
            } else {
                executeStatements(statements, conn, callback);
            }
        }
    },

    login: function (company_email, company_password, callback) {
        var conn = db.getConnection();
		conn.connect(function (err) {
			if (err) {
				console.log(err);
				return callback(err, null);
			}
			else {
				console.log("Connected!");
				var sql = 'SELECT * FROM siren_cloud.companies WHERE company_email = ?';
				conn.query(sql, [company_email, company_password], function (err, result) {
					conn.end();
					if (err) {
						return callback(err, null);
					} else {
						if (result.length == 1) {
							bcrypt.compare(company_password,result[0]['company_password'], function(err,res) {
								if (res) {
                                    const payload = {
                                        company_id: result[0].company_id,
                                        company_name: result[0].company_name,
                                        company_email: result[0].company_email,
                                        company_apikey: result[0].company_apikey,
                                        created_on: result[0].created_on,
                                    }
                                    const token = jwt.sign(payload, config.key, {expiresIn: 86400});
                                    console.log("@@token " + token);
									return callback(null, token, result);
								} else {
                                    err = 'Email/Password is Invalid';
									return callback(err, null);
								}
							})
						} else {
                            err = 'Email/Password is Invalid'
							return callback(err, null);
						}
					} 
				});
			}
		});
    },

    
};

module.exports = companyDB;