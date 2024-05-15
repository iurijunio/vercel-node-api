const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const axios = require('axios');
const api = "https://videoead.com/nuclemig/api/v2/index.php?";
const token = "99972.03217966246tokenavancada";
const config = { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } };

const db = require('../database/database');

router.use(bodyParser.json());

function getAPIParamsConfig(telefoneUsuario, cpfUsuario, nomeUsuario, protocolo) {
  const formData = new URLSearchParams();
  formData.append("token", token);
  formData.append("fone", telefoneUsuario);
  formData.append("cpf", cpfUsuario);
  formData.append("nome", nomeUsuario);
  return { formData };
}

router.post('/registraAtendimento', async (req, res) => {
  try {
    const { telefoneUsuario, cpfUsuario, nomeUsuario, protocolo } = req.body;
    const { formData } = getAPIParamsConfig(telefoneUsuario, cpfUsuario, nomeUsuario, protocolo);

    try {
      const escolaAvancadaAPI = await axios.post(`${api}usuarios/novo`, formData, config);
      const { erro, resultado } = escolaAvancadaAPI.data;
      
      if (resultado && resultado.login) {
        const resData = await saveUserProtocolDB(resultado.login, protocolo);
        if(resData.id && resData.id != -1) {
          res.status(200).json({
            codigo_retorno: "00",
            descricao_retorno: "Operação realizada com sucesso.",
            valor: "3500",
            texto_ticket: `
            Prontinho! Agora falta redefinir a sua Senha!+Acesse o link com as credenciais PROVISORIAS:+Login: ${resultado.login}+Senha: ${resultado.senha}+https://videoead.com/nuclemig/metodo/login.php+Na plataforma, no canto superior direito:+1 - Clique sobre seu NOME+2 - Selecione a opcao MEU PERFIL+3 - No campo SENHA, digite uma nova SENHA+4 - Clique em Salvar e guarde a nova senha+5 - Pronto! Sua nova senha foi redefinida!`,
            //"nuclemigcorreios.com.br?cpf=01944462635";
            chave_cliente: `${resultado.login}.${protocolo}`,
          });
        }
        else {
          res.status(400).json({
            codigo_retorno: "-1",
            descricao_retorno: `${resultado ? resultado : erro ? erro : "Os dados não foram armazenados."}`,
          });
        }
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

router.post('/confirmarAtendimento', async (req, res) => {
  try {
    const { numeroProtocolo, codigoConfirmacao } = req.body;
    if(codigoConfirmacao == "00") {
      const dbData = await getUserProtocolDB("", numeroProtocolo);
      
      if(dbData && dbData.length) {
        const userEA = await getUserEA(dbData[0].user_id);
        
        if(userEA && userEA.login) {
          // const delUser = await deleteUserDB(userEA.login);

          // if(delUser && delUser > 0) {
            res.status(200).json({ codigo: `${dbData[0].user_id}.${dbData[0].protocol}` });
          // }
          // res.status(400).json({ codigo_retorno: "99" });
        }
        else {
          res.status(400).json({ codigo: "99" });
        }

      }
      else {
        res.status(400).json({ codigo: "99" });
      }
    }
    else {
      res.status(400).json({ codigo: "99" });
    }

  } catch (error) {
    res.status(500).json({ codigo: 'Erro interno do servidor' });
  }
});

async function getUserEA(idAluno) {
  const formData = new URLSearchParams();
  formData.append("token", token);
  formData.append("id", idAluno);

  try {
    const escolaAvancadaAPI = await axios.post(`${api}usuarios/listar`, formData, config);
    const { erro, resultado } = escolaAvancadaAPI.data;
    return resultado ?? erro;
  } catch (error) {
    return { error };
  }
}

async function saveUserProtocolDB(userId, protocol) {
  return new Promise((resolve, reject) => {
      db.insertData(userId, protocol, (lastId) => {
          resolve({ id: lastId });
      });
  });
}

async function getUserProtocolDB(userId, protocol) {
  return new Promise((resolve, reject) => {
      db.getData(userId, protocol, (rows) => {
          resolve(rows);
      });
  });
}

async function deleteUserDB(userId) {
  return new Promise((resolve, reject) => {
    db.deleteDataByUserId(userId, (changes) => {
      resolve(changes);
    });
  });
}

async function getAluno(cpfAluno) {
  const formData = new URLSearchParams();
  formData.append('token', token);
  formData.append('cpf', cpfAluno);
  
  try {
    const response = await axios.post(`${api}usuarios/listar`, formData, config);
    return response.data.resultado;
  } catch (error) {
    throw error.response?.data?.erro || 'Erro desconhecido ao obter aluno.';
  }
}

router.post('/listarAluno', async (req, res) => {
  try {
    const resultado = await getAluno(req.body.cpfAluno);
    if (!resultado.login && resultado.aviso) {
      return res.status(404).json({ error: resultado.aviso }); // não foi encontrado nenhum aluno com este filtro.
    }
    res.json(resultado); // sucesso. Dados do aluno
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function getCursosDoAluno(idAluno) {
  const formData = new URLSearchParams();
  formData.append('token', token);
  formData.append('id_aluno', idAluno);
  try {
    const escolaAvancadaAPI = await axios.post(`${api}usuarios/cursosvinculados`, formData, config);
    return escolaAvancadaAPI.data.resultado;
  } catch (error) {
    throw error.response?.data?.erro || 'Erro desconhecido ao obter os cursos vinculados ao aluno.';
  }
}

router.post('/cursosDoAluno', async (req, res) => {
    try {
      const cursosAluno = await getCursosDoAluno(req.body.idAluno);
      return res.status(200).json({ resultado: cursosAluno });
    }
    catch(error) {
      return res.status(500).json({ error: error.message });
    }
});

router.get('/listarCursos', async (req, res) => {
  const formData = new URLSearchParams();
  formData.append('token', token);
  const escolaAvancadaAPI = await axios.post(`${api}cursos/listar`, formData, config);
  const { erro, resultado } = escolaAvancadaAPI.data;
  res.json(resultado);
});


async function editarAluno (aluno) {
  const formData = new URLSearchParams();
  formData.append('token', token);
  
  for (const key in aluno) {
    formData.append(key, aluno[key]);
  }
  formData.set('id_aluno', parseInt(aluno.login));
  formData.set('obs', '5555');
  formData.set('status', 'ativo');
  
  try {
    const response = await axios.post(`${api}usuarios/editar`, formData, config);
    return response.data.resultado;
  } catch (error) {
    throw error.response?.data?.erro || 'Erro desconhecido ao editar aluno.';
  }
}

async function vincularAlunoAoCurso(idAluno, idCurso) {
  const formData = new URLSearchParams();
  formData.append('token', token);
  formData.append('idcurso', idCurso);
  formData.append('aluno', idAluno);
  try {
    const response = await axios.post(`${api}usuarios/vinculocurso`, formData, config);
    console.log(response.data.resultado);
    return response.data;
  } catch (error) {
    throw error.response?.data?.erro || 'Erro desconhecido ao vincular aluno ao curso.';
  }
}

router.post('/vincularAlunoAoCurso', async (req, res) => {
  const { protocolo, cpfAluno, idCurso } = req.body;

  try {
    const aluno = await getAluno(cpfAluno);
    if (!aluno.login && aluno.aviso) {
      return res.status(404).json({ error: aluno.aviso });
    }

    if(protocolo == aluno.obs) {
      try {
        const editAluno = await editarAluno(aluno);
        if (editAluno.includes('sucesso')) {
          try {
            const vincAlunoCurso = await vincularAlunoAoCurso(aluno.login, idCurso);
            if(vincAlunoCurso.resultado.includes('sucesso')) {
              return res.status(200).json({ resultado: vincAlunoCurso.resultado });
            }
            else {
              return res.status(400).json({ error: vincAlunoCurso.resultado });
            }
          }
          catch (error) {
            return res.status(500).json({ error: error.message });
          }
        }
        else {
          return res.status(404).json({ error: editAluno });
        }
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
    }
    else {
      return res.status(404).json({ error: "O protocolo informado é incorreto. Verifique-o e tente novamente." });
    }
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;