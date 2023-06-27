var db = require('./databaseConfig.js');
var speakeasy = require('speakeasy');
var bcrypt = require('bcryptjs');
var mailer = require('nodemailer');

var userDB = {

    registerUser: function(companyName, username, user_email, user_password, user_role, callback) {
        var user_secret = speakeasy.generateSecret({length: 20});
        var conn = db.getConnection();
		conn.connect(function (err) {
			if (err) {
				console.log(err);
				return callback(err, null);
			}
			else {
				console.log("Connected!");
				var sql = 'INSERT INTO ??.users(username, user_email, user_password, user_role, user_secret) values(?,?,?,?,?)';
				conn.query(sql, [companyName, username, user_email, user_password, user_role, user_secret.base32], function (err, result) {
					conn.end();
					if (err) {
                        console.log(err);
						return callback(err, null);
					} else {
						return callback(null, result)
					} 
				});
			}
		});
    },

	loginUser: function(companyName, transporterConfig, user_email, user_password, callback) {
		var conn = db.getConnection();
		conn.connect(function (err) {
			if (err) {
				console.log(err);
				return callback(err, null);
			}
			else {
				console.log("Connected!");
				var sql = 'SELECT * FROM ??.users WHERE user_email = ?';
				conn.query(sql, [companyName, user_email], function (err, result) {
					conn.end();
					if (err) {
						return callback(err, null);
					} else {
						if (result.length == 1) {
							bcrypt.compare(user_password,result[0]['user_password'], function(err,res) {
								if (res) {
									const transporter = mailer.createTransport (transporterConfig);
									const otp = speakeasy.totp({
										secret: result[0].user_secret,
										encoding: 'base32',
									});
									const mailOptions = {
										from: `${transporter.options.auth.user}`,
										to: `${user_email}`,
										subject: 'OTP',
										text: `Your OTP is ${otp}`,
									}
									transporter.sendMail(mailOptions, function (err, info) {
										if (err) {
											console.log(err);
										} else {
											result = 'Email with OTP has been sent to you';
											return callback(null, result);
										}
									})
								} else {
									return callback(new Error('Password Invalid'), null);
								}
							})
						} else {
							return callback(new Error('Email Invalid'), null);
						}
					} 
				});
			}
		});
	},

	verifyOTP: function(companyName, otp, user_email, callback) {
		var conn = db.getConnection();
		conn.connect(function (err) {
			if (err) {
				console.log(err);
				return callback(err, null);
			}
			else {
				console.log("Connected!");
				var sql = 'SELECT * FROM ??.users WHERE user_email = ?';
				conn.query(sql, [companyName, user_email], function (err, result) {
					conn.end();
					if (err) {
						console.log(err);
						return callback(err, null);
					} else {
						const verified = speakeasy.totp.verify({
							secret: result[0].user_secret,
							encoding: 'base32',
							token: otp,
							window: 3,
						});
						if (verified == true) {
							return callback(null,result);
						} else {
							return callback(new Error('OTP Invalid'), null)
						}
					} 
				});
			}
		});
	},



















	deleteUser: function(companyName, user_id, callback) {
		var conn = db.getConnection();
		conn.connect(function (err) {
			if (err) {
				console.log(err);
				return callback(err, null);
			}
			else {
				console.log("Connected!");
				var sql = 'DELETE FROM ??.content WHERE creator_id = ?';
				conn.query(sql, [companyName, user_id], function (err, result) {
					if (err) {
                        console.log(err);
						return callback(err, null);
					} else {
						var sql = 'DELETE FROM ??.users WHERE user_id = ?';
						conn.query(sql, [companyName, user_id], function (err, result) {
							if (err) {
								console.log(err);
								return callback(err, null);
							} else {
								return callback(null, result);
							}
						})
					} 
				});
			}
		});
	},

	updateUserInfo: function(companyName, username, user_email, user_password, user_id, callback) {
		var conn = db.getConnection();
		conn.connect(function (err) {
			if (err) {
				console.log(err);
				return callback(err, null);
			}
			else {
				console.log("Connected!");
				var sql = 'UPDATE ??.users SET username = ?, user_email = ?, user_password = ? where user_id = ?';
				conn.query(sql, [companyName, username, user_email, user_password, user_id], function (err, result) {
					conn.end();
					if (err) {
                        console.log(err);
						return callback(err, null);
					} else {
						return callback(null, result)
					} 
				});
			}
		});
	},

	getAllUsers: function(companyName, callback) {
        var conn = db.getConnection();
		conn.connect(function (err) {
			if (err) {
				console.log(err);
				return callback(err, null);
			}
			else {
				console.log("Connected!");
				var sql = 'SELECT user_id, username, user_role FROM ??.users';
				conn.query(sql, [companyName], function (err, result) {
					conn.end();
					if (err) {
                        console.log(err);
						return callback(err, null);
					} else {
						return callback(null, result)
					} 
				});
			}
		});
	},

}

module.exports = userDB;