const { verify } = require("jsonwebtoken");
const jwt=require("jsonwebtoken")
const secretKey = '$Aditya@#$';
const userModel = require("../model/user");

module.exports = {
    verifyToken:async(req,res,next)=>{
        try {
           
            let token = req.headers['token'];
            // console.log(token)
            // const verification=verify(token,secretKey)
            // console.log(verification)



            verify(token, secretKey, (err, decoded) => {
                if (err) {
                    console.log("error in auth/auth.verifytoken_error");
                    return res.status(401).json({ message: "error.******..." });


                }


                //    else if(err.response === "JwtExpire"){
                //         console.log("token expire")
                //     }
                // _id:decoded.
                if(decoded){
                    
                    userModel.findOne({ email:decoded.email },(err, res1) => {
                        if (err) {
                            console.log("error in auth database....");

                        }
                        else if (!res) {
                            console.log("Unauthorized");
                            return res.status(401).json({ message: "Unauthorized" });

                        }
                        else {
                            console.log("from findone result^^^^^^^^^^^^^^^^^");
                            req.userId = res1._id;
                            // console.log(req.userId)
                            next();
                        }
                    });
                }
            })
        } catch (error) {
            return res.json({message:"something went wrong. in verify token -from catch"

            })
        }
    }
}


// {
//     _id:"djgfdfdjfhdj",
//     email:"g@mial.cpm",
//     phone:"7639834364"
// }


// ghjkhlkhlkhklhklhklhik