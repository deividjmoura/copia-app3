const functions = require('firebase-functions');
const cors = require('cors')({ origin: true });
const Busboy = require('busboy');
const os = require('os');
const path = require('path');
const fs = require('fs');

// The Firebase Admin SDK to access Firestore.
const admin = require('firebase-admin');
admin.initializeApp();

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
      const bucket = admin.storage().bucket();
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
          metadata: {
            contentType: type
          }
        }
      };

      bucket.upload(file, uploadOptions, (err, uploadedFile) => {
        if (err) {
          return res.status(500).json({
            error: err
          });
        }

        return res.status(200).json({
          message: 'File uploaded successfully',
          url: `https://storage.googleapis.com/${bucket.name}/${uploadedFile.name}`
        });
      });
    });

    busboy.end(req.rawBody);
  });
});
