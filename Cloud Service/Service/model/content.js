var db = require('./databaseConfig.js');

var contentDB = {

    uploadContent: function (companyName, user_id, content_title, content_desc, content_thumbnail, content, content_private, callback) {
		if (content_private == 'true') {
			content_private = 1;
		} else {
			content_private = 0
		}
        var conn = db.getConnection();
		conn.connect(function (err) {
			if (err) {
				console.log(err);
				return callback(err, null);
			}
			else {
				console.log("Connected!");
				var sql = 'INSERT INTO ??.content(creator_id, content_title, content_desc, content_thumbnail, content, content_private) values(?,?,?,?,?,?)';
				conn.query(sql, [companyName, user_id, content_title, content_desc, content_thumbnail, content, content_private], function (err, result) {
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

	retrievePublicContent: function (companyName, callback) {
		var conn = db.getConnection();
		conn.connect(function (err) {
			if (err) {
				console.log(err);
				return callback(err, null);
			} else {
				console.log("Connected!");
				var sql = 'SELECT * FROM ??.content WHERE content_private = 0';
				conn.query(sql, [companyName], function (err, result) {
				if (err) {
					console.log(err);
					return callback(err, null);
				} else {
					var contents = result;
					var sql = 'SELECT username FROM ??.users WHERE user_id = ?';
					// Create an array of promises for each query
					var promises = contents.map((content) => {
					return new Promise((resolve, reject) => {
						conn.query(sql, [companyName, content.creator_id], function (err, result) {
						if (err) {
							console.log(err);
							reject(err);
						} else {
							content.creator_username = result[0].username;
							resolve();
						}
						});
					});
					});
					// Wait for all promises to resolve
					Promise.all(promises)
					.then(() => {
						return callback(null, contents);
					})
					.catch((err) => {
						return callback(err, null);
					});
				}
				});
			}
		});
	}


}

module.exports = contentDB;