const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: "ddyanby11",
    api_key: "938126834644282",
    api_secret: "0uErcwihZG_XO_yv9RZ8Kg40YPI"
  });

module.exports = cloudinary;
