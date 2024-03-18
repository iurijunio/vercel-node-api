const headers = { 'Content-Type': 'application/json' };
const selectCursos = document.getElementById('curso');
const user = {};

window.onload = function () {
  createSelectListaDeCursos();
  verifyCPFAluno();
};

function hideErrorMessage() {
  const htmlErrorMessage = document.getElementById('errorMessage');
  htmlErrorMessage.style.display = 'none';
}

function showErrorMessage(errorMessage) {
  hideErrorMessage();
  const htmlErrorMessage = document.getElementById('errorMessage');
  htmlErrorMessage.style.display = 'block';
  htmlErrorMessage.innerHTML = '';
  htmlErrorMessage.innerHTML = `<p>${errorMessage}</p>`;
}

function createSelectListaDeCursos() {
  const placeholderOption = document.createElement('option');
  placeholderOption.value = '';
  placeholderOption.text = 'Escolha um curso';
  selectCursos.appendChild(placeholderOption);
}


function verifyCPFAluno() {
  const urlParams = new URLSearchParams(window.location.search);
  const cpfAluno = urlParams.get('cpf');
  
  if(!cpfAluno || (cpfAluno && cpfAluno.length != 11 )) {
    showErrorMessage("CPF não informado. Verifique se a url está correta e tente novamente.");
    document.getElementById("cpf").disabled = true;
    document.getElementById("protocolo").disabled = true;
    document.getElementById("curso").disabled = true;
    document.getElementById("btnSubmit").disabled = true;
    return;
  }

  document.getElementById("cpf").value = cpfAluno;
  document.getElementById("cpf").disabled = true;
  getAluno(cpfAluno);
}

function getAluno(cpfAluno) {
  const body = JSON.stringify({ cpfAluno });

  fetch('/api/listarAluno', { headers,  method: 'POST', body }).then(response => response.json()).then(data => {
    if(data.login) {
      user.login = data.login;
      getCursosDoAluno(data.login);
    }
    else {
      const err = data.error ? data.error : data;
      showErrorMessage(err);
    }
  })
    .catch(error => console.error('Erro:', error));
}

function getCursosDoAluno(idAluno) {
  const body = JSON.stringify({ idAluno });
  fetch('/api/cursosDoAluno', { headers,  method: 'POST', body }).then(response => response.json()).then(data => {
    if (data.resultado != 'Sem cursos para mostrar') {
      const cursosDoAluno = [];
      for (c of data.resultado) {
        cursosDoAluno.push(c.Curso);
      }
      getCursos(cursosDoAluno);
    }
    else if (data.resultado === 'Sem cursos para mostrar') {
      getCursos([]);
    }
    else {
      const err = data.erro ? data.erro : data;
      console.log(err)
      showErrorMessage(err);
    }
  })
    .catch(error => console.error('Erro:', error));
}

function getCursos(cursosDoAluno) {
  fetch('/api/listarCursos').then(response => response.json()).then(data => {
    data.forEach(curso => {
      const option = document.createElement('option');
      option.value = curso.capa_image.split('imagemcursos/')[1].split('.')[0] ?? '';
      option.text = curso.nome;
      option.disabled = cursosDoAluno.includes(curso.nome);
      selectCursos.appendChild(option);
    });
  });
}

document.getElementById('form').addEventListener('submit', function (event) {
  hideErrorMessage();
  event.preventDefault();
  
  const protocolo = document.getElementById('protocolo').value;
  const idAluno = user.login;
  const cpfAluno = document.getElementById('cpf').value;
  const idCurso = document.getElementById('curso').value;
  const body = JSON.stringify({ protocolo, idAluno, cpfAluno, idCurso });
  
  fetch('/api/vincularAlunoAoCurso', { headers,  method: 'POST', body }).then(response => response.json()).then(data => {
    if(data.resultado) {
      validateFormSbmit(document.getElementById('curso').selectedOptions[0].textContent);
    }
    else {
      const err = data.error ? data.error : data;
      showErrorMessage(err);
    }
  })
    .catch(error => console.error('Erro:', error));
});

function validateFormSbmit(curso) {
  const form = document.getElementById('form');
      form.reset();
      form.style.display = 'none';
      const result = document.getElementById('result');
      result.innerHTML = `
          <p>Prontinho! O curso <b>${curso}</b> foi adquirido com sucesso!<br/>
          Você já pode acessá-lo clicando no botão abaixo:</p>
          <a href="https://videoead.com/nuclemig/metodo/login.php">Acessar plataforma</a>`;
}
