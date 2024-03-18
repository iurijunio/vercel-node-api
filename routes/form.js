const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
var path = require('path');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.get('/', (req, res) => {
  res.sendFile(path.resolve('public/index.html'));
});

router.post('/submit', (req, res) => {
  
  const cpf = req.body.cpf;
  const protocolo = req.body.protocolo;
  const curso = req.body.curso;

  // Processar o formulário ou enviar os dados para outra API

  res.status(200).json({
    success: true,
    message: 'Formulário recebido com sucesso!',
    data: {
      cpf,
      protocolo,
      curso
    }
  });

});


module.exports = router;
