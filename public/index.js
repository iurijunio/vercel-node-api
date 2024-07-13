const headers = { 'Content-Type': 'application/json' };
const selectCursos = document.getElementById('curso');
const user = {};

window.onload = function () {
  createSelectListaDeCursos();
  getCursos([]);
};

function nextStep(nextStepIs2) {
  const step1 = document.getElementById('step1');
  const step2 = document.getElementById('step2');

  if(nextStepIs2) { 
    step1.classList.add('hide-step');
    step1.classList.remove('show-step');
    step2.classList.add('show-step');
    step2.classList.remove('hide-step');
  }
  else {
    step2.classList.add('hide-step');
    step2.classList.remove('show-step');
    step1.classList.add('show-step');
    step1.classList.remove('hide-step');
  }
}

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

function getAlunoEProtocolo() {
  hideErrorMessage();
  const login = document.getElementById('login').value;
  const protocolo = document.getElementById('protocolo').value;
  const body = JSON.stringify({ login, protocolo });
  if(user.login === login) {
    nextStep(true);
  }
  else {
    fetch('/api/listarAluno', { headers,  method: 'POST', body }).then(response => response.json()).then(data => {
      if(data.login) {
        user.login = data.login;
        nextStep(true);
      }
      else {
        const err = data.error ? data.error : data;
        showErrorMessage(err);
      }
    }).catch(error => console.error('Erro:', error))
  }
}

function getCursos(cursosDoAluno) {
  fetch('/api/listarCursos').then(response => response.json()).then(data => {
    data.forEach(curso => {
      const option = document.createElement('option');
      option.value = curso.capa_image.split('imagemcursos/')[1].split('.')[0] ?? '';
      option.text = curso.nome + ' (' + curso.carga_horaria + ' horas)';
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
  const idCurso = document.getElementById('curso').value;
  const name = document.getElementById('name').value;
  const cpf = document.getElementById('cpf').value;
  const tel = document.getElementById('telefone').value;
  const body = JSON.stringify({ protocolo, idAluno, idCurso, name, cpf, tel });

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
