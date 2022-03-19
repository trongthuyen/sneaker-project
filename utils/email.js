// const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
const pug = require('pug');
const path = require('path');

const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.url = url;
    this.firstname = user.name.split(' ')[0];
    this.from = `${process.env.FROM}`;
    sgMail.setApiKey(`${process.env.SENDGRID_API_KEY}`);
    console.log(user.email, url, user.name, this.from);
  }

  async sendEmail(template, subject) {
    console.log(path.join(__dirname, `/../views/emails/${template}.pug`));
    const html = pug.renderFile(
      path.join(__dirname, `/../views/emails/${template}.pug`),
      {
        firstname: this.firstname,
        url: this.url,
        subject
      }
    );

    const msg = {
      to: this.to, // Change to your recipient
      from: this.from, // Change to your verified sender
      subject,
      html,
      text: htmlToText.convert(html, {
        wordwrap: 130
      })
    };

    //Send email
    await sgMail.send(msg);
  }

  async sendEmailNormal(text, subject) {
    const msg = {
      to: this.to, // Change to your recipient
      from: this.from, // Change to your verified sender
      subject,
      text
    };

    //Send email
    await sgMail.send(msg);
  }

  async sendWelcome() {
    // 1.Call sendEmail() function by 2 parameters : template and subject
    await this.sendEmail('welcome', 'Welcome to Natours-Big Family !');
  }

  async sendPasswordReset() {
    // 1.Call sendEmail() function by 2 parameters : template and subject

    await this.sendEmail(
      'passwordReset',
      'Your password reset token valid for 5 minutes'
    );
  }
};
