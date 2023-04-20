const nodemailer = require("nodemailer");
const pug=require("pug")
const{convert} = require("html-to-text");
module.exports = class Email{
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(" ")[0];
        this.url = url;
        this.from = process.env.EMAIL;
        
    }
    newTransport() {
      console.log("from transport")


      if (process.env.NODE_ENV === 'production') {
        // Sendgrid
         
        return nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'raghebgamal111@gmail.com',
            pass: 'oboectrgbxkkvrua'
    

          }
        });
      
      }
    
      return nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "7038782d29cc27",
          pass: "9bcaf50c1a5312"
        }
      });
   
  
      
      

  
      

    }
//template,subject

 async  send(template,subject) {
        const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
        
      firstName: this.firstName,
      url: this.url,
      subject
    
        })
        
       const mailoption = {
           from: this.from,
           to: this.to,
           subject,
           html,
           Text: convert(html)
           
       }
    await this.newTransport().sendMail(mailoption);
   

    }


   async  sendWelcome() {
       await this.send("welcome","welcome to the natours family")
  }
  
  async sendPasswordReset() {
    await this.send("passwordReset","your password reset token (valid for 10 minuts)")
  }
}



