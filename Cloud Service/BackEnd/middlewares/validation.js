var validationFn = {

    validatePassword: function (req, res, next) {
        var company_password = req.body.company_password;
        const rePassword = new RegExp(`^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*#?&])[a-zA-Z0-9@$!%*#?&]{8,}$`);
        if (rePassword.test(company_password)) {
            next();
        } else {
            res.status(400).json({'message' : 'Password does not fufil requirements'});
        }
    },

    validateEmail: function (req, res, next) {
        var company_email = req.body.company_email;
        const reEmail = new RegExp('^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$');
        if (reEmail.test(company_email)) {
            next();
        } else {
            res.status(400).json({'message' : 'Email does not fufil requirements'});
        }
    },

}

module.exports = validationFn;