const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto');
const path = require('path');

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

/**
 * Upload a file to Cloudflare R2
 * @param {Buffer} fileBuffer - The file buffer
 * @param {string} originalName - Original filename
 * @param {string} mimeType - File MIME type
 * @param {string} folder - Folder path (e.g., 'products', 'ads')
 * @returns {Object} { key, url }
 */
const uploadToR2 = async (fileBuffer, originalName, mimeType, folder = 'uploads') => {
  const ext = path.extname(originalName);
  const uniqueName = `${folder}/${crypto.randomUUID()}${ext}`;

  const params = {
    Bucket: process.env.R2_BUCKET_NAME,
    Key: uniqueName,
    Body: fileBuffer,
    ContentType: mimeType,
  };

  await s3Client.send(new PutObjectCommand(params));

  return {
    key: uniqueName,
    url: `${process.env.R2_PUBLIC_URL}/${uniqueName}`,
  };
};

/**
 * Delete a file from Cloudflare R2
 * @param {string} key - The file key/path in R2
 */
const deleteFromR2 = async (key) => {
  const params = {
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
  };

  await s3Client.send(new DeleteObjectCommand(params));
};

module.exports = { s3Client, uploadToR2, deleteFromR2 };
