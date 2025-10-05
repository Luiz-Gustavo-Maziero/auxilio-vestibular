const resultado = document.getElementById('result')
correctAlternative = ""
let score = 0;

function loadQuestion() {
    fetch('/api/question_uel')
        .then(response => response.json())
        .then(data => {
            if (data.erro) {
                alert(data.erro);
                return;
            }
            console.log(data.indice)
            document.getElementById('textoApoio').textContent = data.contexto;
            const opcao = document.getElementById('options');
            opcao.innerHTML = "";
            correctAlternative = data.correcao;
            correctAlternative = correctAlternative.split(": ")[1]
            for (const [letra, texto] of Object.entries(data.alternativas)) {
                const alternativa = opcao.cloneNode(false)
                alternativa.textContent = `\n ${texto}`;
                alternativa.classList.add('alternativas')
                alternativa.setAttribute("onclick", `checkopcao('${letra}')`);
                alternativa.setAttribute("id", `${letra}`)
                opcao.appendChild(alternativa);
            }
        })
        .catch(error => console.error("Erro ao carregar a questão:", error));
}

function checkopcao(selectedOption) {

    for (let i = 0; i < document.getElementsByClassName('alternativas').length; i++) {
        document.getElementsByClassName('alternativas')[i].classList.add('incorrect');
        document.getElementsByClassName('alternativas')[i].disabled = true
        document.getElementById(correctAlternative).classList.add('correct')

    }

    if (selectedOption === correctAlternative) {
        score++;
          fetch('/api/salvar_acertos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ acertos: 1 }) // envia 1 acerto a mais
    })
    .then(response => response.json())
    .then(data => {
        if (data.sucesso) {
            console.log('Acerto salvo com sucesso!');
        } else {
            console.error('Erro ao salvar acertos:', data.erro);
        }
    })
    .catch(err => console.error('Erro na requisição:', err));
    }
    
        
        resultado.innerHTML = `Pontuação: ${score}`;




}

 


// Carrega a primeira questão ao abrir a página
loadQuestion();
