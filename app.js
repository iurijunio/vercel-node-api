const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.post('/registraAtendimento', (req, res) => {
  // Obtenha os dados do corpo da solicitação
  const { campo1, campo2, campoN, protocolo } = req.body;

  // Lógica para processar os dados e gerar a resposta
  const codigoRetorno = "123";
  const descricaoRetorno = "Sucesso";
  const valor = "100.00";
  const textoTicket = "Ticket gerado com sucesso";
  const chaveCliente = "cliente123";

  // Construa o objeto de resposta
  const resposta = {
    codigo_retorno: codigoRetorno,
    descricao_retorno: descricaoRetorno,
    valor: valor,
    texto_ticket: textoTicket,
    chave_cliente: chaveCliente
  }; 


  // Envie a resposta
  res.json(resposta);
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
