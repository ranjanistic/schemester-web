const nodemailer = require("nodemailer"),
    ejs = require("ejs"),
    path = require("path"),
    config = require("../../config/config.json"),
    { code, client, clog } = require("../../public/script/codes");

class Mailer {
  constructor() {}
  async sendVerificationEmail(body) {
    const data = await ejs.renderFile(path.join(__dirname+"/../../views/mail/verification.ejs"), { username: body.username,email:body.to,link:body.link });
    return await Promise.resolve(sendEmail(body.to,'Schemester Account Verification',data));
  }
  async sendPasswordResetEmail(body){
    const data = await ejs.renderFile(path.join(__dirname+"/../../views/mail/passreset.ejs"), { username: body.username,email:body.to,link:body.link });
    return await Promise.resolve(sendEmail(body.to,'Schemester Password Reset',data));
  }
  async sendInvitationEmail(invitee, body) {
    switch (invitee) {
      case client.teacher:{
        const data = await ejs.renderFile(path.join(__dirname+"/../../views/mail/invitation.ejs"), { institute:body.institute, invitor:body.invitor, email:body.to,link:body.link,usertype:invitee });
        return await Promise.resolve(sendEmail(body.to,`${body.institute} Teacher Invitation · Schemester`,data));
      };
      case client.student:{
        const data = await ejs.renderFile(path.join(__dirname+"/../../views/mail/invitation.ejs"), { institute:body.institute, invitor:body.invitor, email:body.to,link:body.link,usertype:invitee });
        return await Promise.resolve(sendEmail(body.to,`${body.institute} Student Invitation · Schemester`,data));
      };
      case client.admin:{
        const data = await ejs.renderFile(path.join(__dirname+"/../../views/mail/invitation.ejs"), { institute:body.institute, invitor:body.invitor, email:body.to,link:body.link,usertype:invitee });
        return await Promise.resolve(sendEmail(body.to,`${body.institute} Admin Invitation · Schemester`,data));
      };
    }
  }
}

async function sendEmail(to, subject, html) {
  const doc = nodemailer.createTransport(config.mailconfig).sendMail({
    from: config.email,
    to: to,
    subject: subject,
    html: html,
  }).then(info=>{
    return code.event(info.accepted.includes(to)?code.mail.MAIL_SENT:code.mail.ERROR_MAIL_NOTSENT);
  }).catch(error=>{
    return code.event(code.mail.ERROR_MAIL_NOTSENT);
  });
  return doc;
}

module.exports = new Mailer();
