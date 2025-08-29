const cloudinary = require("cloudinary").v2;

exports.imageUploader = async (file, folder, height, width, quality) => {
  try {
    const options = { folder };

    if (height) options.height = height;
    if (width) options.width = width;
    if (quality) options.quality = quality;

    options.resource_type = "auto";
    options.crop = "fill"; // ensures correct sizing

    const result = await cloudinary.uploader.upload(file.tempFilePath, options);
    return result;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};
