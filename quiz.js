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

    fetch('questions.json')
        .then(response => response.json())
        .then(data => {
            allQuestions = data.questions;
            buildQuiz(allQuestions.slice(0, 25)); // Show first part by default
            currentQuestions = allQuestions.slice(0, 25);
            updateStatusMessage();
        });

    function buildQuiz(questions) {
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
        const totalQuestionsInCurrentPart = currentQuestions.length;
        const requiredCorrectAnswers = Math.ceil((passingPercentage / 100) * totalQuestionsInCurrentPart);
        const remainingCorrectAnswers = requiredCorrectAnswers - correctCount;

        if (remainingCorrectAnswers > 0) {
            statusMessage.textContent = `Você precisa acertar mais ${remainingCorrectAnswers} questões para atingir ${passingPercentage}% de acerto.`;
        } else {
            statusMessage.textContent = `Parabéns! Você atingiu ${passingPercentage}% de acerto.`;
        }
    }

    function selectPart(partNumber) {
        const start = (partNumber - 1) * 25;
        const end = start + 25;
        passingPercentage = 75;
        currentQuestions = allQuestions.slice(start, end);
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
});
