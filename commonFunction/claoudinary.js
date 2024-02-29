const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: "xxxxxx",
    api_key: "xxxxxx",
    api_secret: "xxxxxxx"
  });

module.exports = cloudinary;
