let controler = 0;
let score = 0;
let correctAlternative = "";
const opcoes = document.getElementById('options')

const resultado = document.getElementById('result')
const options = {
    method: 'GET'
};

function gerarIndice() {
    let currentQuestionIndex = Math.floor(Math.random() * (180 - 0 + 1));

    return currentQuestionIndex;
}

function gerarAno() {
    let ano = Math.floor(Math.random() * (2023 - 2009 + 1)) + 2009;
    return ano;
}

function processarTexto(texto, imagemQuestao) {
    if (texto)
        texto = texto.replace(/!\[.*?\]\(.*?\.(png|jpe?g|webp|gif)\)/gi, "").trim();


    imagemQuestao.classList.replace("none", "flex");

    return texto;
}


function loadQuestion() {
    const alternativas = document.getElementsByClassName('alternativas');
    const imagemDaQuestao = document.getElementsByClassName('imagemDaQuestao');
    const ano = gerarAno();
    const index = gerarIndice();
    const imagemsQuestao = document.getElementById('imagemsQuestao');
    for (let i = alternativas.length - 1; i >= 0; i--) {
        alternativas[i].remove();
    }

    for (let i = imagemDaQuestao.length - 1; i >= 0; i--) {
        imagemDaQuestao[i].remove();
    }
    for (let i = 0; i < document.getElementsByClassName('alternativas').length; i++) {
        document.getElementsByClassName('alternativas')[i].classList.remove('incorrect', 'correct');
        document.getElementsByClassName('alternativas')[i].disabled = false
    }
    console.log(ano, index);

    imagemsQuestao.classList.add('none')
    fetch(`https://api.enem.dev/v1/exams/${ano}/questions/${index}`, options)
        .then(response => response.json())
        .then(data => {
            if (data.discipline === "ciencias-humanas") {
                let texto = data.context;
                texto = processarTexto(texto, imagemsQuestao)


                for (let i = 0; i <= data.files.length - 1; i++) {

                    const imgQuestao = document.createElement("img")
                    imgQuestao.classList.add('imagemDaQuestao')
                    imgQuestao.src = data.files[i];
                    imgQuestao.alt = "imagem questão"
                    imagemsQuestao.appendChild(imgQuestao)
                }
                document.getElementById('textoApoio').innerHTML = texto;

                document.getElementById('questao').innerHTML = data.alternativesIntroduction;

                if (data.alternatives[0].file != null) {

                    for (let i = 0; i <= data.alternatives.length - 1; i++) {
                        const alternativa = document.createElement("button");
                        alternativa.classList.add('alternativas')
                        alternativa.setAttribute("onclick", `checkopcao('${data.alternatives[i].letter}')`);
                        alternativa.setAttribute("id", `${data.alternatives[i].letter}`)

                        alternativa.innerHTML = `<img src = ${data.alternatives[i].file}>`
                        opcoes.appendChild(alternativa)


                    }
                }
                else {
                    for (let i = 0; i <= data.alternatives.length - 1; i++) {
                        const alternativa = document.createElement("button");
                        alternativa.classList.add('alternativas')
                        alternativa.setAttribute("onclick", `checkopcao('${data.alternatives[i].letter}')`);
                        alternativa.setAttribute("id", `${data.alternatives[i].letter}`)

                        alternativa.innerHTML = `<p>${data.alternatives[i].text}</p>`
                        opcoes.appendChild(alternativa)
                    }

                }



                correctAlternative = data.correctAlternative;
            } else {
                loadQuestion();
            }
        })
        .catch(err => console.error('Erro ao buscar questões:', err));
}

function checkopcao(selectedOption) {

    for (let i = 0; i < document.getElementsByClassName('alternativas').length; i++) {
        document.getElementsByClassName('alternativas')[i].classList.add('incorrect');
        document.getElementsByClassName('alternativas')[i].disabled = true
        document.getElementById(correctAlternative).classList.add('correct')

    }

    if (selectedOption === correctAlternative) {
        score++;
        fetch('/api/salvar_acertos/enem', {
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
window.onload = function () {
    loadQuestion();
};
