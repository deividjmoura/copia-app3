const functions = require('firebase-functions');
const cors = require('cors')({ origin: true });
const Busboy = require('busboy');
const os = require('os');
const path = require('path');
const fs = require('fs');

// Vercel Storage
const { Storage } = require('@vercel/node');
const storage = new Storage({
  projectId: 'prj_Y3ZIJBg6kchm7jrnJlgz9bXK7a2U', // Substituir pelo ID do seu projeto Vercel
  token: process.env.VERCEL_TOKEN // Substituir pelo seu token Vercel, ou defina a variável de ambiente VERCEL_TOKEN
});

exports.upload = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    if (req.method !== 'POST') {
      return res.status(405).json({
        message: 'Method Not Allowed'
      });
    }

    const busboy = new Busboy({ headers: req.headers });
    let uploadData = null;

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
      const filepath = path.join(os.tmpdir(), filename);
      uploadData = { file: filepath, type: mimetype };
      file.pipe(fs.createWriteStream(filepath));
    });

    busboy.on('finish', () => {
      const { file, type } = uploadData;

      if (!file) {
        return res.status(400).json({
          error: {
            message: 'No file uploaded'
          }
        });
      }

      const uploadOptions = {
        destination: `${Date.now()}-${path.basename(file)}`,
        resumable: false,
        metadata: {
          contentType: type
        }
      };

      storage.bucket('vercel-storage-bucket-name') // Substituir pelo nome do bucket de armazenamento do Vercel
        .upload(file, uploadOptions)
        .then((uploadedFile) => {
          return res.status(200).json({
            message: 'File uploaded successfully',
            url: `https://vercel-storage-bucket-name.vercel.app/${uploadedFile[0].name}` // Substituir pelo nome do bucket de armazenamento do Vercel
          });
        })
        .catch((err) => {
          return res.status(500).json({
            error: err
          });
        });
    });

    busboy.end(req.rawBody);
  });
});
