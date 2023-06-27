//Create transporter configurations
const transporterConfig = {
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
    auth: {
        user: 'sirencloudservices@outlook.com', //Change to company's email
        pass: 'SirenCloud123', //Change to company's email address
    },
};

module.exports = transporterConfig;