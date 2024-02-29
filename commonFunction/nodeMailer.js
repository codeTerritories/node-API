const nodemailer=require("nodemailer");


module.exports={


sendMail: async(email,subject,html)=>{

    try {
        
        
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'xxxxxxxxxxx',
              pass: 'xxxxx'
            }
          });
          
          var mailOptions = {
            from: `xxxxcccccc`,
            to: email,
            subject: subject,
            text: html
          };

          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });

    } catch (error) {
        return error;
        
    }
},

 otpGenration: async()=>{
    const otp = Math.floor(10000000 + Math.random() * 90000000);
    return otp;

 },

 
 
 
}

