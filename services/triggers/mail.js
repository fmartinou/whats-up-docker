const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'manfred.martin@gmail.com',
        pass: 'todo',
    },
});

function notify(image) {
    const message = `
    <p>Organization: ${image.organization}</p>
    <p>Image: ${image.image}</p>
    <p>CurrentVersion: ${image.currentVersion}</p>
    <p>New version: ${image.newVersion}</p>
    `;
    const mailOptions = {
        from: 'manfred.martin@gmail.com', // sender address
        to: 'manfred.martin@gmail.com', // list of receivers
        subject: 'Subject of your email', // Subject line
        html: message,
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err)
            console.log(err)
        else
            console.log(info);
    });
}

module.exports = {
    name: 'email',
    notify,
};
