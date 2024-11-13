document.addEventListener('DOMContentLoaded', function () {
    const quizContainer = document.getElementById('quiz-container');
    const correctCounter = document.getElementById('correct-counter');
    const incorrectCounter = document.getElementById('incorrect-counter');
    const statusMessage = document.getElementById('status-message');
    const restartButton = document.getElementById('restart-button');
    const timerDisplay = document.getElementById('timer');

    let correctCount = 0;
    let incorrectCount = 0;
    let allQuestions = [];
    let currentQuestions = [];
    let passingPercentage = 75;
    let selectedParts = [];
    let remainingTime = 0;
    let timerInterval = null;

    fetch('questions.json')
        .then(response => response.json())
        .then(data => {
            allQuestions = data.questions;
            updateStatusMessage();
        });

    function buildQuiz(questions) {
        if (questions.length === 0) {
            quizContainer.innerHTML = '';
            return;
        }

        correctCount = 0;
        incorrectCount = 0;
        correctCounter.textContent = correctCount;
        incorrectCounter.textContent = incorrectCount;

        const output = questions.map((currentQuestion, questionNumber) => {
            const answers = Object.keys(currentQuestion.options).map(
                letter => `
                    <label class="answer">
                        <input type="radio" name="question${questionNumber}" value="${letter}">
                        ${letter}: ${currentQuestion.options[letter]}
                    </label>`
            ).join('');

            return `
                <div class="question">
                    <h3>${currentQuestion.id}. ${currentQuestion.question}</h3>
                    <div class="answers">${answers}</div>
                </div>`;
        });

        quizContainer.innerHTML = output.join('');

        questions.forEach((currentQuestion, questionNumber) => {
            const answerContainer = quizContainer.querySelector(`.question:nth-child(${questionNumber + 1}) .answers`);

            if (!answerContainer) return;

            let answeredCorrectly = false;

            const inputs = answerContainer.querySelectorAll('input[type="radio"]');
            inputs.forEach(input => {
                input.addEventListener('change', function (event) {
                    if (answeredCorrectly) return;

                    const selectedOption = event.target.value;
                    const selectedLabel = event.target.parentElement;

                    if (selectedOption === currentQuestion.correctAnswer) {
                        correctCount++;
                        correctCounter.textContent = correctCount;
                        selectedLabel.style.backgroundColor = 'green'; // Marca a resposta correta em verde
                        answeredCorrectly = true;
                        inputs.forEach(input => input.disabled = true);
                    } else {
                        incorrectCount++;
                        incorrectCounter.textContent = incorrectCount;
                        selectedLabel.style.backgroundColor = 'red'; // Marca a resposta incorreta em vermelho
                        inputs.forEach(input => input.disabled = true);

                        // Marca a resposta correta em verde após seleção incorreta
                        const correctLabel = answerContainer.querySelector(`input[value="${currentQuestion.correctAnswer}"]`)?.parentElement;
                        if (correctLabel) correctLabel.style.backgroundColor = 'green';
                    }
                    updateStatusMessage();
                });
            });
        });
    }

    function updateStatusMessage() {
        const requiredCorrectAnswers = Math.ceil((passingPercentage / 100) * currentQuestions.length);
        const remainingCorrectAnswers = requiredCorrectAnswers - correctCount;

        if (remainingCorrectAnswers > 0) {
            if (correctCount + incorrectCount === currentQuestions.length) {
                statusMessage.textContent = "Você já respondeu todas as perguntas. Por favor, reinicie o quiz.";
            } else {
                statusMessage.textContent = `Você precisa acertar mais ${remainingCorrectAnswers} questões para atingir ${passingPercentage}% de acerto.`;
            }
        } else {
            statusMessage.textContent = `Parabéns! Você atingiu ${passingPercentage}% de acerto.`;
        }
    }

    function selectPart(partNumber) {
        if (selectedParts.length >= 3) {
            alert("Você já selecionou 3 partes.");
            return;
        }

        selectedParts.push(partNumber);

        const allowedCombinations = ["1,2,3", "1,2,4", "1,2,5", "1,2,6", "1,3,4", "2,3,4", "2,5,6", "3,4,5", "3,4,6", "4,5,6", "1,5,6"];
        const tempParts = [...selectedParts].sort().join(',');

        if (!allowedCombinations.includes(tempParts) && selectedParts.length === 3) {
            alert("Esta combinação de partes não é permitida.");
            selectedParts.pop();
            return;
        }

        remainingTime += 30 * 60;
        if (!timerInterval) {
            timerInterval = setInterval(updateTimer, 1000);
        }

        updateQuiz();
    }

    function updateTimer() {
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        if (remainingTime <= 0) {
            clearInterval(timerInterval);
            alert("O tempo acabou!");
        } else {
            remainingTime--;
        }
    }

    function updateQuiz() {
        currentQuestions = selectedParts.flatMap(partNumber => {
            const start = (partNumber - 1) * 25;
            return allQuestions.slice(start, start + 25);
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

    restartButton.addEventListener('click', function () {
        resetParts();
    });

    function resetParts() {
        selectedParts = [];
        currentQuestions = [];
        correctCount = 0;
        incorrectCount = 0;
        correctCounter.textContent = correctCount;
        incorrectCounter.textContent = incorrectCount;
        passingPercentage = 75;

        remainingTime = 0;
        clearInterval(timerInterval);
        timerInterval = null;
        timerDisplay.textContent = "00:00";

        buildQuiz(currentQuestions);
        updateStatusMessage();
    }

    window.selectPart = selectPart;
    window.selectAllParts = selectAllParts;
    window.resetParts = resetParts;
});
