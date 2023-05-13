const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const nomeDaPasta = req.body.nomeDaPasta;
    const pastaUploads = path.join(__dirname, 'uploads');

    if (!fs.existsSync(pastaUploads)) {
      fs.mkdirSync(pastaUploads);
    }

    const pastaCliente = path.join(pastaUploads, nomeDaPasta);

    if (!fs.existsSync(pastaCliente)) {
      fs.mkdirSync(pastaCliente);
    }

    cb(null, pastaCliente);
  },
  filename: (req, file, cb) => {
    const extensao = path.extname(file.originalname);
    cb(null, `${file.originalname}-${Date.now()}${extensao}`);
  },
});

const upload = multer({ storage });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/upload', upload.array('arquivos'), (req, res) => {
  console.log(`Arquivos salvos em: ${req.files.map(file => file.path).join(', ')}`);
  res.send('Arquivos recebidos!');
});

app.listen(4000, () => {
  console.log('Servidor rodando na porta 4000');
});
