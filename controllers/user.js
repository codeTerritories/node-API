const userModel = require("../model/user");
const {staticContent,staticModel}=require("../model/staticUser")
const bcrypt = require("bcryptjs");
const nodeMailer = require("../commonFunction/nodeMailer");
const jwt = require("jsonwebtoken");
const secretKey = "$Aditya@#$";
const cloudinary = require("../commonFunction/claoudinary");
const speakeasy = require("speakeasy");
const secret = speakeasy.generateSecret({ length: 20 });
const secretBase32 = secret.base32;
var qrCode = require("qrcode");

const crypto = require('crypto');


const verificationToken = crypto.randomBytes(20).toString('hex');
const baseURL = 'http://localhost:5050/api/v1/user/verifyLink/'; 





module.exports = {
  //1. signup api.................................

  signUp: (req, res) => {
    try {
      const requiredFields = ["fullName", "email", "password", "mobileNumber"];

      const userData = req.body;
      const missingFields = requiredFields.filter((field) => !userData[field]);

      if (missingFields.length > 0) {
        console.log("missing fields!!");
        return res.status(400).send({
          responseCode: 400,
          resposneMessage: `Missing required fields: ${missingFields.join(
            ","
          )}`,
        });
      } else {
        userModel.findOne(
          {
            email: req.body.email,
            status: { $ne: "delete" },
            userType: "user",
          },
          async (err, result) => {
            if (err) {
              return res.status(500).send({
                responseMessage: "Internal server error",
                responseCode: 500,
                error: err,
              });
            } else if (result) {
              return res.status(409).send({
                responseMessage: "Email already exists",
                responseCode: 409,
              });
            } else {
              const otp = await nodeMailer.otpGenration();
              console.log(otp);
              req.body.otp = otp;
              req.body.name = req.body.fullName;
              let currrentTime = +new Date();

              let emailSend = await nodeMailer.sendMail(
                req.body.email,
                "otp Verification",
                `your otp ${otp}`
              );

              req.body.time = currrentTime;

              let password = bcrypt.hashSync(req.body.password);
              req.body.password = password;
              console.log(req.body);

              userModel(req.body).save((err1, res1) => {
                if (err1) {
                  return res.status(501).send({
                    responseMessage: "Internal server error",
                    responseCode: 501,
                    error: err1,
                  });
                } else {
                  return res.send({
                    responseMessage: "Signup success",
                    responseCode: 200,
                    result: res1,
                  });
                }
              });
            }
          }
        );
      }
    } catch (error) {
      console.log(error);
      return res.status(501).send({
        responseMessage: "Something went wrong",
        responseCode: 501,
        error: error,
      });
    }
  },

  //2. otp verify........................................................

  otpVerify: (req, res) => {
    try {
      userModel.findOne({ email: req.body.email }, (err, result) => {
        if (err) {
          return res.status(500).send({
            responseMessage: "Internal server error",
            responseCode: 500,
            error: err,
          });
        } else if (result) {
          if (result.otp === req.body.otp) {
            let timeNow = +new Date();
            if (timeNow - result.time <= 180000) {
              userModel.updateOne(
                { email: req.body.email },
                { $set: { isOtpVerify: true } },
                function (error, result) {
                  if (error) {
                    return res.status(500).send({
                      responseMessage: "Internal server error",
                      responseCode: 500,
                      error: err,
                    });
                  } else {
                    console.log("isoptverify: true");
                    return res.status(200).send({
                      responseMessage: "Otp verification success",
                      responseCode: 200,
                    });
                  }
                }
              );
            } else {
              return res.status(401).send({
                responseMessage: "Session expired !!",
                responseCode: 401,
              });
            }
          } else {
            return res.status(401).send({
              responseMessage: "Invalid OTP !!",
              responseCode: 401,
              error: err,
            });
          }
        }
      });
    } catch (error) {
      console.log(error);
      return res.status(501).send({
        responseMessage: "Something went wrong",
        responseCode: 501,
        error: error,
      });
    }
  },

  //3. Get one user from the data base

  getOne: async (req, res) => {
    try {
      await userModel.findOne({ _id: req.userId }, (err, result) => {
        // const user=await userModel.findById({result:params.id}.select("-password"))
        // console.log(user)
        if (result) {
          return res.status(200).send({
            responseMessage: "Data received",
            responseCode: 200,
            result: result,
          });
        } else {
          return res
            .status(404)
            .send({ responseCode: 404, responseMessage: "Data not found" });
        }
      });
    } catch (error) {
      console.log(error);
      return res.status(501).send({
        responseMessage: "Something went wrong",
        responseCode: 501,
        error: error,
      });
    }
  },

  //4. Edit profile.......

  editProfile: async (req, res) => {
    try {
      console.log(req.userId)
      const userDetails = await userModel.findOne({
        _id:req.userId,
        status: { $in: ["active", "BLOCK"] },
        userType: "user",
      });
      console.log(userDetails);

      if (!userDetails) {
        return res
          .status(404)
          .send({ responseMessage: "User not found", responseCode: 404 });
      }

      if (req.body.newPassword) {
        console.log(req.body.newPassword)
        req.body.password = bcrypt.hashSync(req.body.newPassword);

      
      }

      if (req.body.email && !req.body.mobileNumber) {
        const query = {
          $and: [
            { email: req.body.email },
            { _id: { $ne: req.userId } },
            { status: { $ne: "DELETE" } },
          ],
        };
        email=req.body.email

        const result = await userModel.findOne(query);
        if (result) {
          return res.send({
            responseCode: 409,
            responseMessage: "Email already in use.!!",
          });
        }
        
        
        const verificationLink = `${baseURL}${email}`;
        const emailTemplate = `
                                <h1>Email Verification</h1>
                                <p>Click the following link to verify your email:</p>
                                <a href="${ verificationLink}">${verificationLink}</a>
                              `;
                              console.log('Verification Link:', verificationLink);

                            
        if (!result) {
          const otp = await nodeMailer.otpGenration();
          let emailSend = await nodeMailer.sendMail(
            req.body.email,
            "OTP Verification",
            emailTemplate
          );

          const newTime = +new Date();
          const updateResult = await userModel.findByIdAndUpdate(
            { _id: userDetails._id },
            {
              $set: {
                email: req.body.email,
                isOtpVerify: false,
                otp: otp,
                time: newTime,
              },
            },
            { new: true }
          );
          return res.send({
            responseCode: 200,
            responseMessage: "Successfully updated.",
          });
        } else {
          return res.status(400).send({
            responseCode: 400,
            responseMessage: "Email already registered",
          });
        }
      }
      if (!req.body.email && req.body.mobileNumber) {
        const query = {
          $and: [
            { email: req.body.mobileNumber },
            { _id: { $ne: req.userId } },
            { status: { $ne: "DELETE" } },
          ],
        };

        const result = await userModel.findOne(query);
        if (result) {
          return res.send({
            responseCode: 409,
            responseMessage: "Mobile number already in use.!!",
          });
        }
        if (!result) {
          const updateResult = await userModel.findByIdAndUpdate(
            { _id: userDetails._id },
            { $set: req.body },
            { new: true }
          );
          return res.send({
            responseCode: 200,
            responseMessage: "Successfully updated.",
          });
        } 
      }
        else if (req.body.email && req.body.mobileNumber) {
          const query = {
            $and: [
              {
                $or: [
                  { email: req.body.email },
                  { mobileNumber: req.body.mobileNumber },
                ],
              },
              { _id: { $ne: req.userId } },
              { status: { $ne: "DELETE" } },
            ],
          };

          const result = await userModel.findOne(query);
          if (result) {
              if (result.email === req.body.email) {
                return res.send({
                  responseCode: 409,
                  responseMessage: "Email already in use.!!",
                });
              } else {
                return res.send({
                  responseCode: 409,
                  responseMessage: "Mobile number already in use",
                });
              }
          }

          const otp = await nodeMailer.otpGenration();
          let emailSend = await nodeMailer.sendMail(
            req.body.email,
            "OTP Verification",
            `Your OTP is: ${otp}`
          );

          const newTime = +new Date();

          

          const updateResult = await userModel.findByIdAndUpdate(
            { _id: userDetails._id },
            {
              $set: {
                email: req.body.email,
                mobileNumber:req.body.mobileNumber,
                isOtpVerify: false,
                otp: otp,
                time: newTime,
              },
            },
            { new: true }
          );
          return res.send({
            responseCode: 200,
            responseMessage: "Seccessfully updated!!",
            res: updateResult,
          });
        }
        else{
          const updateResult = await userModel.findByIdAndUpdate(
            { _id: userDetails._id },
            { $set: req.body },
            { new: true }
          );
          
          return res.send({
            responseCode: 200,
            responseMessage: "Successfully updated.",res:updateResult
          });
        } 
      } catch (error) {
      console.log(error);
      return res.status(501).send({
        responseMessage: "Something went wrong",
        responseCode: 501,
        error: error,
      });
    }
  },

  //5. list of all user..........
  getAll: async(req, res) => {
    try {
      // userModel.find({}, (err, res1) => {
      //   return res.status(200).send({
      //     responseMessage: "Data Received",
      //     responseCode: 200,
      //     result: res1,
      //   });
      // });
      console.log("giiigaaa");

      // Apllying Regex.............

      const query = { name: { $regex:/[aA]/} };
      var result=await userModel.find(query)
      console.log(result)
      return res.send({responseCode:200,responseMessage:"Success",res:result})
    } catch (error) {
      return res.status(501).send({
        responseMessage: "Something went wrong",
        responseCode: 501,
        error: err,
      });
    }
  },

  //6. login api...............................

  logIn: (req, res) => {
    try {
      userModel.findOne({ email: req.body.email }, (err, res1) => {
        console.log(res1)
        bcrypt.compare(req.body.password, res1.password, (err, data) => {
          if (err) throw err;

          if (data) {
            if (res1.isOtpVerify == true) {
              const payload = {
                email: res1.email,
                name: res1.name,
                id: res1.id,
              };

              const token = jwt.sign(payload, secretKey, { expiresIn: "3h" });
              // console.log(token);
              console.log("login success...");
              return res.status(200).send({
                responseMessage: "Login success !!",
                responseCode: 200,
                res: token,
              });
            } else {
              return res.status(403).send({
                responseMessage: "OTP not verified !!",
                responseCode: 403,
              });
            }
          } else {
            return res.status(401).send({
              responseMessage: "Invalid credential !!",
              responseCode: 401,
            });
          }
        });
      });
    } catch (error) {
      return res
        .status(501)
        .send({ resposneMessage: "Something went wrong", responseCode: 501 });
    }
  },

  //7. fogot api.............................................................

  forgot: async (req, res) => {
    try {
      const user = await userModel.findOne({ email: req.body.email });

      if (user) {
        const otp = nodeMailer.otpGenration();

        let mail = await transporter.sendMail(
          req.body.email,
          "OTP Verification",
          `Your OTP is :${otp}`
        );
        newTime = +new Date();

        const result = await userModel.findOneAndUpdate(
          { email: req.body.email },
          { $set: { isOtpVerify: false, otp: otp, time: newTime } }
        );

        return res.status(200).send({
          responseMessage: "OTP is send to your register email !!",
          responseCode: 200,
        });
      } else {
        console.log("User not found");
        return res
          .status(404)
          .send({ responseMessage: "User not found", responseCode: 404 });
      }
    } catch (err) {
      console.log("Error:", err);
      return res.status(500).send({
        responseMessage: "Internal server error",
        responseCode: 500,
        error: err,
      });
    }
  },

  //8. new password.......

  newPassword: async (req, res) => {
    try {
      userModel.findOne({ _id: req.userId }, async (err, result) => {
        // console.log("i am runnign here.......")
        if (result.isOtpVerify === true) {
          if (req.body.newPassword == req.body.confirmNewPassword) {
            let nPass = bcrypt.hashSync(req.body.newPassword);
            await userModel.updateOne(
              { _id: req.userId },
              { $set: { password: nPass } }
            );
            return res.status(200).send({
              responseMessage: "Password change succesful",
              responseCode: 200,
            });
          } else {
            return res.status(401).send({
              responseCode: 401,
              responseMessage:
                "Password and Confirm password does not match !!",
            });
          }
        } else {
          return res.status(403).send({
            responseCode: 403,
            responseMessage: "OTP not Verified !!",
          });
        }
      });
    } catch {
      return res
        .status(501)
        .send({ responseCode: 501, responseMessage: "Server error !!" });
    }
  },

  //9. Resend OTP...............................

  resendOtp: (req, res) => {
    userModel.findOne({ email: req.body.email }, async (err, result) => {
      if (result) {
        const otp = nodeMailer.otpGenration();
        const mail = await nodeMailer.sendMail(
          req.body.email,
          "OTP Verification",
          `Your OTP is: ${otp}`
        );
        console.log("Email sent: " + info.response);
        let newTime = +new Date();
        const update = await userModel.findOneAndUpdate(
          { email: req.body.email },
          { $set: { isOtpVerify: false, otp: otp, time: newTime } }
        );
        return res
          .status(200)
          .send({ responseMessage: "Otp send succesfull", responseCode: 200 });
      } else {
        return res
          .status(404)
          .send({ responseCode: 403, responseMessage: "Email not found !!" });
      }
    });
  },

  //10. reset password..........................................

  reset: async (req, res) => {
    const User = await userModel.findOne({ email: req.body.email });
    try {
      if (User) {
        const isMatchOldpass = bcrypt.compare(req.body.password, User.password);

        if (isMatchOldpass) {
          if (req.body.newpassword === req.body.confirmNewpassword) {
            User.password = bcrypt.hashSync(req.body.newpassword);
            await User.save();
            return res
              .status(200)
              .send({ responseMessage: "Password change successful !!" });
          } else {
            res.status(401).send({
              responseMessage: "Enter correct new password !!",
              responseCode: 401,
            });
          }
        } else {
          res.status(401).send({
            responseMessage: "Incorrect Password !!",
            responseCode: 401,
          });
        }
      } else {
        res
          .status(404)
          .send({ responseMessage: "User not found", responseCode: 404 });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).send({
        responseCode: 500,
        responseMessage: "Server error !!",
        res: error,
      });
    }
  },

  // Multer image upload....
  image: async (req, res) => {
    try {
      // if (!req.files || !req.files.image) {
      //   return res.status(400).send({ responseCode: 400, responseMessage: 'No file uploaded' });
      // }

      return res.status(200).send({ responseMessage: "File upload success" });
    } catch (error) {
      return res.status(500).send({
        responseCode: 500,
        responseMessage: "Server error !!",
        res: error,
      });
    }
  },

  

  // cloudinary API......

  uploadOnCloud: (req, res) => {
    try {
      // const file=req.file.image;
      // if(!file){
      //   return res.send({responseMessage:"Image field should not be empty.."})
      // }

      cloudinary.uploader.upload(req.body.base64, function (error, result) {
        if (result) {
          console.log("upload success");
          console.log(result);
          return res.status(200).send({
            responseCode: 200,
            responseMessage: "Image upload success",
            res: result,
          });
        } else {
          console.log("Something went wrong");
          return res.status(401).send({
            responseCode: 401,
            responseMessage: "Error in upload image",
          });
        }
      });
    } catch (error) {
      return res
        .status(500)
        .send({ responseCode: 500, responseMessage: "server error" });
    }
  },

  // 2 Factor Authentication genrator..............

  twoFacAuth: (req, res) => {
    try {
      const otp = speakeasy.totp({
        secret: secretBase32,
        encoding: "base32",
      });
      console.log(otp);

      qrCode.toDataURL(otp, (err, imageUrl) => {
        if (err) {
          console.error("Error generating QR code:", err);
          return;
        }
        console.log("QR code generated successfully");
        console.log(imageUrl);
        return res.status(200).send({
          responseCode: 200,
          responseMessage: "Genrate succes",
          res: imageUrl,
        });
      });
    } catch (error) {
      return res
        .status(500)
        .send({ responseCode: 500, responseMessage: "Server Error!!" });
    }
  },

  // Verify QR code- .......................................

  twoFacAuthVerify: (req, res) => {
    try {
      var tokenValidates = speakeasy.totp.verify({
        secret: secret.base32,
        encoding: "base32",
        token: req.body.token,
        window: 6,
      });

      if (tokenValidates) {
        console.log("2FA code is valid");
        return res
          .status(200)
          .send({ responseCode: 200, responseMessage: "2FA is valid" });
      } else {
        console.log("2FA code is invalid");
      }
    } catch (error) {
      return res
        .status(500)
        .send({ responseCode: 500, responseMessage: "Server Error!!" });
    }
  },

  // Pagination..........................................

  page:async(req,res)=>{
    try {

      // MATHOD 1 WITHOUT PAGINATION NPM................

      // const page = parseInt(req.query.page) || 1; 
      // const limit = parseInt(req.query.limit) || 2;
    
      // const skip = (page - 1) * limit;
    
  
      //   const users = await userModel.find()
      //     .skip(skip)
      //     .limit(limit);
    
        
      //   return res.send({responseCode:200,responseMessage:"",res:users});
      

 

    // MATHOD 2 BY USING PAGINATION NPM....................
 
      userModel.paginate({}, { page:req.query.page, limit: 3 }, function(err, result) {


       if(err){
        return res.send({responseCode:500,res:err});
       }
       else{
        return res.send({responseCode:200,res:result});
       }

      });
    
      
    } catch (error) {
      return res.send({responseCode:500,responseMessage:"Server error !!"})
    }
  },



  // Aggregate pagination............
  aggPage:async(req,res)=>{
    // const myCustomLabels=[{name:{ $regex:/^[aA]/,$options: "i" }}];

    try {

      // const options = {
      //   page:1,
      //   limit:10,
      //   customLabels: myCustomLabels
      // };
       console.log("i am on the top")
      const skip = (1 - 1) * 5;
    const limit = 5;

    const pipeline = [
      { $match: { name: { $regex: regexPattern } } },
      { $skip: skip },
      { $limit: limit }
    ];
  console.log("i am here..")
      // var myAggregate = userModel.aggregate();
  // await userModel.aggregatePaginate(myAggregate, options)
  await userModel.aggregate(pipeline)
  .then(function (results) {
    console.log(results);
    return res.send({responseCode:200,responseMessage:"Success",res:results})


  })
  .catch(function (err) {
    console.log(err);
  });
    } catch (error) {
      return res.send({responseCode:500,responseMessage:"Server error !!"})
    }
  },

  verifyLink:(req,res)=>{
    try {

      console.log(req.params.email)
      userModel.findOne({ email: req.params.email },(err, result) => {
        if (err) {
          return res.status(500).send({
            responseMessage: "Internal server error",
            responseCode: 500,
            error: err,
          });
          
        }
        else{
      
          userModel.updateOne(
            { email: req.params.email },
            { $set: { isOtpVerify: true } },
            function (error, result) {
              if (error) {
                return res.status(500).send({
                  responseMessage: "Internal server error",
                  responseCode: 500,
                  error: err,
                });
              } else {
                console.log("isoptverify: true");
                
                
              }
            }
          );

        }
        console.log(result)
        console.log("Verification success!!")
        return res.send('Verification Successful');
       
      })

    
      
      
    } catch (error) {
      return res.send('Server error');
      
    }
  },
// Static data List.....................

  staticList:async(req,res)=>{
    try {
        staticModel.find({},(err,result)=>{
          if(err){
            console.log("Something went wrong!!");
            return res.send({responseCode:500,responseMessage:"Something went wrong"})
          }else{
            console.log(result)
            return res.send({responseCode:200,responseMessage:"Success",res:result})
          }
        })
      
    } catch (error) {
      return res.status(500).send({responseCode:500,responseMessage:"Server error!!"})
    }
  },
// staic description edit............
  staticEdit:async(req,res)=>{
     try {
     const data= await staticModel.findOneAndUpdate({type:req.body.type},{$set:{description:req.body.description}});
     if(data){
      console.log(data);
      return res.send({responseCode:200,responseMessage:"Sucessfull !!",res:data})
     }else{
      return res.status(404).send({responseCode:404,responseMessage:"Something went wrong!!"})

     }
     } catch (error) {
      return res.status(500).send({responseCode:500,responseMessage:"Server error!!"})
      
     }
  },

  // Search by name ,email and mobileNumber.....
  searchBy:async(req,res)=>{
    try {
      let {email,name,mobileNumber}=req.body;

      if(email){
        const query = { email: { $in:email} };
        var result=await userModel.find(query);
        console.log(result)
        return res.send({responseCode:200,responseMessage:"Success",res:result})

      }if(name){
        const query = { name: { $in:name} };
        var result=await userModel.find(query);
        console.log(result)
        return res.send({responseCode:200,responseMessage:"Success",res:result})

      }if(mobileNumber){

        const query = {mobileNumber : { $in:mobileNumber} };
        var result=await userModel.find(query);
        console.log(result)
        return res.send({responseCode:200,responseMessage:"Success",res:result})

      }else{
        console.log("Please enter atleast one key to find profile");
        return res.send({responseCode:204,responseMessage:"Please enter atleast one key to find profile"})
      }
      
    } catch (error) {
      return res.status(500).send({responseCode:500,responseMessage:"Server error!!"})
      
    }
  },

  // userList api only key in resonse- email, number, id, name,userType
  userList:async(req,res)=>{
    try {
      const users= await userModel.find().select('name email mobileNumber userType');
      console.log(users)
      return res.send({responseCode:200,res:users})
      
    } catch (error) {
      return res.status(500).send({responseCode:500,responseMessage:"Server error!!"})
      
    }
  }
};
