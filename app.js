const express = require('express');
const axios = require('axios');

const app = express();
const api = "https://videoead.com/nuclemig/api/v2/index.php?";
const token = "7507.93248870969tokenavancada";
const port = 3000;

app.use(express.json());

app.post('/registraAtendimento', async (req, res) => {
  try {
    const { telefoneUsuario, cpfUsuario, nomeUsuario, protocolo } = req.body;
    const { formData, config } = getAPIParamsConfig(telefoneUsuario, cpfUsuario, nomeUsuario, protocolo);

    try {
      const escolaAvancadaAPI = await axios.post(`${api}usuarios/novo`, formData, config);
      const { erro, resultado } = escolaAvancadaAPI.data;

      if (resultado && resultado.login) {
        res.status(200).json({
          codigo_retorno: "00",
          descricao_retorno: "Operação realizada com sucesso.",
          valor: "10000",
          texto_ticket: `Usuário: ${resultado.nome}+Login: ${resultado.login}+Senha: ${resultado.senha}`,
          chave_cliente: `${cpfUsuario}${protocolo}${new Date().getTime()}`,
        });
      }
      else {
        res.status(400).json({
          codigo_retorno: "-1",
          descricao_retorno: `${resultado ? resultado : erro ? erro : "Código Inválido."}`,
        });
      }
    } catch (error) {
      res.status(500).json({
        codigo_retorno: "-2",
        descricao_retorno: "Falha no processamento.",
      });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});


function getAPIParamsConfig(telefoneUsuario, cpfUsuario, nomeUsuario, protocolo) {
  // Dados do formulário
  const formData = new URLSearchParams();
  formData.append("token", token);
  formData.append("fone", telefoneUsuario);
  formData.append("cpf", cpfUsuario);
  formData.append("nome", nomeUsuario);
  formData.append("obs", protocolo);

  // Configurações da solicitação
  const config = {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  };

  return { formData, config };
}

app.get('/listarCursos', async (req, res) => {

  // Dados do formulário
  const formData = new URLSearchParams();
  formData.append('token', token);

  // Configurações da solicitação
  const config = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };

  // Fazendo a solicitação POST
  const escolaAvancadaAPI = await axios.post(`${api}cursos/listar`, formData, config);

  const { erro, resultado } = escolaAvancadaAPI.data;
  res.json(resultado);
});


app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});