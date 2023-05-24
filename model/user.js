const {Types,Schema,model} = require('mongoose')
const bcrypt = require("bcryptjs");
var aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const paginate = require('mongoose-paginate-v2');
const staticUser = require('./staticUser');
const { staticContent } = require('./staticUser');
// require('./staticUser')

const user = new Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        unique:true
    },
    mobileNumber:{
        type:Number,
        unique:true
    },
    otp:{
        type:String
        
    },
    password:{
        type:String
    },
    isOtpVerify:{
        type:Boolean,
        default:false
    },
    time:{
        type:Number

    },
    userType:{
        type:String,
        enum:['USER','ADMIN'],
        default:'USER'
    },
    status:{
        type:String,
        enum:['ACTIVE','DELETED','BLOCKED'],
        default:'ACTIVE'
    }
  
},{timestamps:true}
);
user.plugin(paginate);
user.plugin(aggregatePaginate);
module.exports = model('user',user);

(async()=>{
    const adminCheck=await model("user",user).findOne({userType:"ADMIN"});
    if(adminCheck){
        console.log({responseCode:409,responseMessage:"Default admin alrady created."})
    }else{
     await model("user",user).create({

        name:"Aditya Dubey",
        email:"aditya.dubey@indicchain.com",
        password:bcrypt.hashSync("Adiyogi109"),
        isOtpVerify: true,
        userType: 'ADMIN',
        status:'ACTIVE',
        mobileNumber:9800000011
      

     });
     console.log("Succesfully default admin created.");
    }

}).call();


staticUser.staticContent();