const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.S3_REGION,
});

const getPresignedUrl = async (req, res) => {
  try {
    const { filename, fileType } = req.query;
    
    // Generate unique key for file to avoid collisions
    const key = `chat_media/${uuidv4()}_${filename}`;

    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      ContentType: fileType,
      Expires: 60 * 5 // URL valid for 5 minutes
    };

    const uploadUrl = await s3.getSignedUrlPromise('putObject', params);
    
    // Compute the final URL the file will be accessible at
    const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.S3_REGION}.amazonaws.com/${key}`;

    res.json({
      uploadUrl,
      fileUrl,
      key
    });
  } catch (error) {
    console.error('S3 Signed URL Error:', error);
    res.status(500).json({ error: 'Could not generate upload URL' });
  }
};

module.exports = { getPresignedUrl };
