var db = require('../model/databaseConfig.js')

var validationFn = {
    
    validateAPIkey: function(req, res, next) {
        var apiKey = req.headers.authorization;
        if(!apiKey || !apiKey.includes('Bearer')){
            return res.status(403).send('Unauthorized');
        } else {
            apiKey=apiKey.split('Bearer ')[1];
            var conn = db.getConnection();
            conn.connect(function(err) {
                if (err) {
                    return next(err);
                } else {
                    var sql = 'SELECT company_name, company_domain FROM siren_cloud.companies WHERE company_apikey = ?';
                    conn.query(sql, [apiKey], function(err, result) {
                        if (err) {
                            return next(err);
                        } else {
                            if (result.length == 1) {
                                req.companyName = result[0].company_name;
                                req.company_domain = result[0].company_domain;
                                next();
                            } else {
                                return res.status(403).send('API Key Invalid');
                            }
                        }
                        conn.end();
                    });
                }
            })
        }
    },

}

module.exports = validationFn;

