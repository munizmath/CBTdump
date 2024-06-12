document.addEventListener('DOMContentLoaded', function () {
    const quizContainer = document.getElementById('quiz');
    const resultsContainer = document.getElementById('results');
    const correctCounter = document.getElementById('correct-counter');
    const incorrectCounter = document.getElementById('incorrect-counter');
    const statusMessage = document.getElementById('status-message');
    const restartButton = document.getElementById('restart');

    let correctCount = 0;
    let incorrectCount = 0;
    let allQuestions = [];
    let currentQuestions = [];
    let passingPercentage = 75;
    const totalQuestions = 150;
    let selectedParts = [];
    let remainingTime = 0;  // Em segundos
    let timerInterval = null;

    fetch('questions.json')
        .then(response => response.json())
        .then(data => {
            allQuestions = data.questions;
           // selectPart(1); // Show first part by default
            updateStatusMessage();
        });

        function buildQuiz(questions) {
            // Se não houver perguntas, retorne imediatamente
    if (questions.length === 0) {
        quizContainer.innerHTML = '';
        return;
    }
            const output = [];
            correctCount = 0;
            incorrectCount = 0;
            correctCounter.textContent = correctCount;
            incorrectCounter.textContent = incorrectCount;
    
            questions.forEach((currentQuestion, questionNumber) => {
                const answers = [];
                for (let letter in currentQuestion.options) {
                    answers.push(
                        `<label class="answer">
                            <input type="radio" name="question${questionNumber}" value="${letter}">
                            ${letter} :
                            ${currentQuestion.options[letter]}
                        </label>`
                    );
                }
                output.push(
                    `<div class="question"> 
                        <h3>${currentQuestion.id}. ${currentQuestion.question}</h3> 
                    </div>
                    <div class="answers"> ${answers.join('<br>')} </div>`
                );
            });
    
            quizContainer.innerHTML = output.join('');
    
            // Add event listeners to check answers immediately after selection
            questions.forEach((currentQuestion, questionNumber) => {
                const answerContainer = quizContainer.querySelector(`.answers:nth-child(${questionNumber * 2 + 2})`);
                let attempts = 0;
                let answeredCorrectly = false;
    
                answerContainer.addEventListener('change', function(event) {
                    if (answeredCorrectly) return;
    
                    const selectedOption = event.target.value;
                    const allInputs = answerContainer.querySelectorAll('input');
                    
                    if (selectedOption === currentQuestion.correctAnswer) {
                        correctCount++;
                        correctCounter.textContent = correctCount;
                        answerContainer.style.color = 'green';
                        answeredCorrectly = true;
                        allInputs.forEach(input => input.disabled = true);
                    } else {
                        attempts++;
                        if (attempts >= 3) {
                            incorrectCount++;
                            incorrectCounter.textContent = incorrectCount;
                            answerContainer.style.color = 'red';
                            allInputs.forEach(input => input.disabled = true);
                            const correctLabel = answerContainer.querySelector(`input[value=${currentQuestion.correctAnswer}]`).parentElement;
                            correctLabel.style.backgroundColor = 'yellow';
                        } else {
                            event.target.disabled = true;
                        }
                    }
                    updateStatusMessage();
                });
            });
        }

        function updateStatusMessage() {
            if (currentQuestions.length === 0) {
                statusMessage.textContent = "Selecione os quizes para começar";
            } else {
                const totalQuestionsInCurrentPart = currentQuestions.length;
                const requiredCorrectAnswers = Math.ceil((passingPercentage / 100) * totalQuestionsInCurrentPart);
                const remainingCorrectAnswers = requiredCorrectAnswers - correctCount;
        
                if (remainingCorrectAnswers > 0) {
                    if (correctCount + incorrectCount === totalQuestionsInCurrentPart) {
                        statusMessage.textContent = "Você já respondeu todas as perguntas. Por favor, reinicie o quiz.";
                    } else {
                        statusMessage.textContent = `Você precisa acertar mais ${remainingCorrectAnswers} questões para atingir ${passingPercentage}% de acerto.`;
                    }
                } else {
                    statusMessage.textContent = `Parabéns! Você atingiu ${passingPercentage}% de acerto.`;
                }
            }
        }
        

    function selectPart(partNumber) {
        // Se já selecionou 3 partes, não permita mais seleções
        if (selectedParts.length >= 3) {
            alert("Você já selecionou 3 partes.");
            return;
        }
    
        // Adicione a parte selecionada à lista de partes selecionadas
        selectedParts.push(partNumber);
    
        // Verifique as combinações de partes que são permitidas
        const tempParts = [...selectedParts];
        tempParts.sort();
        const allowedCombinations = ["1,2,3", "1,2,4", "1,2,5", "1,2,6", "1,3,4", "2,3,4", "2,5,6", "3,4,5", "3,4,6", "4,5,6", "1,5,6"];
        const isAllowed = allowedCombinations.some(combination => {
            const [a, b, c] = combination.split(',');
            return (tempParts.includes(parseInt(a)) && tempParts.includes(parseInt(b)) && tempParts.includes(parseInt(c)));
        });
    
        if (!isAllowed && tempParts.length === 3) {
            alert("Esta combinação de partes não é permitida.");
            selectedParts.pop();  // Remova a última parte selecionada
            return;
        }
        // Inicie o temporizador quando uma parte for selecionada
        remainingTime += 30 * 60;  // Adicione 30 minutos ao tempo restante
        if (timerInterval === null) {
            timerInterval = setInterval(updateTimer, 1000);
        }
        // Atualize o quiz com as questões das partes selecionadas
        updateQuiz();
    }
    
   function updateTimer() {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    document.getElementById('timer').textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    if (remainingTime <= 0) {
        clearInterval(timerInterval);
        alert("O tempo acabou!");
        // Aqui você pode adicionar o código para finalizar o quiz
    } else {
        remainingTime--;
    }
} 
    

    function updateQuiz() {
        currentQuestions = [];
        selectedParts.forEach(partNumber => {
            const start = (partNumber - 1) * 25;
            const end = start + 25;
            currentQuestions = currentQuestions.concat(allQuestions.slice(start, end));
        });
        buildQuiz(currentQuestions);
        updateStatusMessage();
    }

    function selectAllParts() {
        passingPercentage = 85;
        currentQuestions = allQuestions;
        buildQuiz(currentQuestions);
        updateStatusMessage();
    }

    restartButton.addEventListener('click', function() {
        correctCount = 0;
        incorrectCount = 0;
        correctCounter.textContent = correctCount;
        incorrectCounter.textContent = incorrectCount;
        resultsContainer.innerHTML = '';
        passingPercentage = currentQuestions.length === totalQuestions ? 85 : 75;
        statusMessage.textContent = `Você precisa acertar mais ${Math.ceil((passingPercentage / 100) * currentQuestions.length)} questões para atingir ${passingPercentage}% de acerto.`;

        buildQuiz(currentQuestions); // Default to the first part
    });

    window.selectPart = selectPart;
    window.selectAllParts = selectAllParts;

    function resetParts() {
        selectedParts = [];
        currentQuestions = [];
        correctCount = 0;
        incorrectCount = 0;
        correctCounter.textContent = correctCount;
        incorrectCounter.textContent = incorrectCount;
        buildQuiz(currentQuestions);
        updateStatusMessage();
    }
    
    window.resetParts = resetParts;

});

