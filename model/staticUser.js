const { Schema, model,} = require('mongoose');

const staticSchema = new Schema({
  description: {
    type: String,
  },
  type: {
    type: String,
  },
});

const staticModel = model("StaticUser", staticSchema);

 const staticContent= async (req, res) => {
    try {
      // const query = { type: { $in:{'Privacy Policy' 'Terms and condition'}} };
        staticModel.find({},async(err,res)=>{
      if(err) {
        console.log("Static content already created");
        return res.status(200).json({ responseMessage: "Static content already created" });
      }
      if(!res) {
        const staticUser1 = {
          type: "Privacy Policy",
          description: "This is privacy policy",
        };

        const staticUser2 = {
          type: "Terms and Conditions",
          description: "This is Terms and Conditions",
        };

        const staticUser3 = {
          type: "About-US",
          description: "This is About-US",
        };

        const staticUser4 = {
          type: "Contact-US",
          description: "This is Contact-US",
        };

        await staticModel.insertMany(
          [staticUser1,
          staticUser2,
          staticUser3,
          staticUser4]
        );

        console.log("Successfully created static content!");
        // return res.status(200).json({ responseMessage: "Static content created successfully" });
      } if(res){
        console.log("Static content already created!!")
      }
    });
    } catch (error) {
      console.error("Error creating static content:", error);
    //   return res.status(500).json({ responseMessage: "Something went wrong while creating static content" });
    }
  };
  module.exports = {staticModel , staticContent}

