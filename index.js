const Mailgun = require('mailgun-es6');

const SimpleMailgunAdapter = mailgunOptions => {
  if (!mailgunOptions || !(mailgunOptions.publicApi || mailgunOptions.privateApi) ||
      !mailgunOptions.domainName || !mailgunOptions.fromAddress) {
    throw 'SimpleMailgunAdapter requires an API Key, domain, and fromAddress.';
  }

  mailgunOptions.verificationSubject =
    mailgunOptions.verificationSubject ||
    'Please verify your e-mail for %appname%';
  mailgunOptions.verificationBody =
    mailgunOptions.verificationBody ||
    'Hi,\n\nYou are being asked to confirm the e-mail address %email% ' +
    'with %appname%\n\nClick here to confirm it:\n%link%';
  mailgunOptions.passwordResetSubject =
    mailgunOptions.passwordResetSubject ||
    'Password Reset Request for %appname%';
  mailgunOptions.passwordResetBody =
    mailgunOptions.passwordResetBody ||
    'Hi,\n\nYou requested a password reset for %appname%.\n\nClick here ' +
    'to reset it:\n%link%';

  const mailgun = new Mailgun(mailgunOptions);

  function escapeRegExp(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');
  }

  function replaceAll(str, find, replace) {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
  }

  function fillVariables(text, options) {
    text = replaceAll(text, '%username%', options.user.get('username'));
    text = replaceAll(text, '%email%', options.user.get('email'));
    text = replaceAll(text, '%appname%', options.appName);
    text = replaceAll(text, '%link%', options.link);
    return text;
  }

  function getRecipient(user) {
    return user.get('email') || user.get('username');
  }

  function combineNameEmail(name, email) {
    if (!name) return email;
    return `"${name}" <${email}>`;
  }

  const sendVerificationEmail = options => {
    const name = mailgunOptions.displayName ?
      mailgunOptions.displayName :
      options.appName;
    const fromInput = combineNameEmail(name, mailgunOptions.fromAddress);

    if (mailgunOptions.verificationBodyHTML) {
      const data = {
        from: fromInput,
        to: getRecipient(options.user),
        subject: fillVariables(mailgunOptions.verificationSubject, options),
        text: fillVariables(mailgunOptions.verificationBody, options),
        html: fillVariables(mailgunOptions.verificationBodyHTML, options)
      };
      return mailgun.sendEmail(data);
    } else {
      const data = {
        from: fromInput,
        to: getRecipient(options.user),
        subject: fillVariables(mailgunOptions.verificationSubject, options),
        text: fillVariables(mailgunOptions.verificationBody, options)
      };
      return mailgun.sendEmail(data);
    }
  };

  const sendPasswordResetEmail = options => {
    const name = mailgunOptions.displayName ?
      mailgunOptions.displayName :
      options.appName;
    const fromInput = combineNameEmail(name, mailgunOptions.fromAddress);

    if (mailgunOptions.passwordResetBodyHTML) {
      const data = {
        from: fromInput,
        to: getRecipient(options.user),
        subject: fillVariables(mailgunOptions.passwordResetSubject, options),
        text: fillVariables(mailgunOptions.passwordResetBody, options),
        html: fillVariables(mailgunOptions.passwordResetBodyHTML, options)
      };
      return mailgun.sendEmail(data);
    } else {
      const data = {
        from: fromInput,
        to: getRecipient(options.user),
        subject: fillVariables(mailgunOptions.passwordResetSubject, options),
        text: fillVariables(mailgunOptions.passwordResetBody, options)
      };
      return mailgun.sendEmail(data);
    }
  };

  const sendMail = mail => {
    const name = mailgunOptions.displayName ?
      mailgunOptions.displayName :
      options.appName;
    const fromInput = combineNameEmail(name, mailgunOptions.fromAddress);

    if (mail.html) {
      const data = {
        from: fromInput,
        to: mail.to,
        subject: mail.subject,
        text: mail.text,
        html: mail.html
      };
      return mailgun.sendEmail(data);
    } else {
      var data = {
        from: fromInput,
        to: mail.to,
        subject: mail.subject,
        text: mail.text
      };
      return mailgun.sendEmail(data);
    }
  };

  return Object.freeze({
    sendVerificationEmail: sendVerificationEmail,
    sendPasswordResetEmail: sendPasswordResetEmail,
    sendMail: sendMail
  });
};

module.exports = SimpleMailgunAdapter;
