const express = require('express');
const multer = require('multer');
const admin = require('firebase-admin');
const path = require('path');
const serviceAccount = require('./path/to/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'copiaecia-app.appspot.com' // o nome do seu bucket do Firebase Storage
});

const bucket = admin.storage().bucket();

const app = express();

const storage = multer.memoryStorage();

const upload = multer({ storage });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/upload', upload.array('arquivos'), async (req, res) => {
  const nomeDaPasta = req.body.nomeDaPasta;

  const pastaCliente = `clientes/${nomeDaPasta}`;

  const uploads = req.files.map(file => ({
    originalname: file.originalname,
    buffer: file.buffer
  }));

  const uploadPromises = uploads.map(upload => {
    const extensao = path.extname(upload.originalname);
    const nomeArquivo = `${upload.originalname}-${Date.now()}${extensao}`;
    const file = bucket.file(`${pastaCliente}/${nomeArquivo}`);
    return file.save(upload.buffer, { metadata: { contentType: upload.mimetype }});
  });

  await Promise.all(uploadPromises);

  console.log(`Arquivos salvos em: ${uploads.map(upload => `${pastaCliente}/${upload.originalname}`).join(', ')}`);
  res.send('Arquivos recebidos!');
});

app.listen(4000, () => {
  console.log('Servidor rodando na porta 4000');
});
