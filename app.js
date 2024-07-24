let currentUser = null;
let currentLanguage = 'ko';
let currentPracticeType = 'keyboard';
let currentPracticeContent = '';
let currentCharIndex = 0;
let startTime = null;
let correctCount = 0;
let incorrectCount = 0;

function startPractice() {
    const username = document.getElementById('username').value;
    const language = document.getElementById('language').value;

    if (username.trim() === '') {
        alert('아이디/별명을 입력하세요.');
        return;
    }

    currentUser = username;
    currentLanguage = language;

    document.getElementById('user-selection').style.display = 'none';
    document.getElementById('practice-area').style.display = 'block';
}

function selectPracticeType(type) {
    currentPracticeType = type;
    generatePracticeContent();
}

function generatePracticeContent() {
    let contentArray = [];
    switch (currentPracticeType) {
        case 'keyboard':
            contentArray = currentLanguage === 'ko' ? koWordList : enWordList;
            break;
        case 'word':
            contentArray = currentLanguage === 'ko' ? koWordList : enWordList;
            break;
        case 'sentence':
            contentArray = currentLanguage === 'ko' ? koSentences : enSentences;
            break;
        case 'longText':
            contentArray = longTexts;
            break;
    }
    currentPracticeContent = contentArray[Math.floor(Math.random() * contentArray.length)];
    currentCharIndex = 0;
    correctCount = 0;
    incorrectCount = 0;
    startTime = new Date();
    displayPracticeContent();
}

function displayPracticeContent() {
    const contentDiv = document.getElementById('practice-content');
    contentDiv.innerHTML = '';
    for (let i = 0; i < currentPracticeContent.length; i++) {
        const span = document.createElement('span');
        span.textContent = currentPracticeContent[i];
        if (i === currentCharIndex) {
            span.classList.add('current-char');
        }
        contentDiv.appendChild(span);
    }
    document.getElementById('practice-input').value = '';
    document.getElementById('practice-input').focus();
}

document.getElementById('practice-input').addEventListener('input', handleInput);

function handleInput(event) {
    const input = event.target.value;
    const currentChar = currentPracticeContent[currentCharIndex];
    let inputCorrect = false;

    if (currentLanguage === 'ko' && isHangul(currentChar)) {
        const [expectedCho, expectedJung, expectedJong] = decomposeHangul(currentChar);
        const inputChars = input.split('');

        if (inputChars.length > 0) {
            const inputChar = inputChars[inputChars.length - 1];
            const [inputCho, inputJung, inputJong] = decomposeHangul(inputChar);

            if (expectedCho === inputCho && expectedJung === inputJung && expectedJong === inputJong) {
                inputCorrect = true;
            }
        }
    } else {
        inputCorrect = input[input.length - 1] === currentChar;
    }

    if (inputCorrect) {
        correctCount++;
        currentCharIndex++;
        if (currentCharIndex >= currentPracticeContent.length) {
            finishPractice();
        } else {
            displayPracticeContent();
        }
    } else {
        incorrectCount++;
    }

    updateDisplayContent(input);
}

function updateDisplayContent(input) {
    const contentDiv = document.getElementById('practice-content');
    contentDiv.innerHTML = '';
    for (let i = 0; i < currentPracticeContent.length; i++) {
        const span = document.createElement('span');
        span.textContent = currentPracticeContent[i];
        if (i < currentCharIndex) {
            span.classList.add('correct-char');
        } else if (i === currentCharIndex) {
            span.classList.add('current-char');
        } else {
            span.classList.remove('wrong-char');
        }
        contentDiv.appendChild(span);
    }

    const inputDiv = document.createElement('div');
    for (let i = 0; i < input.length; i++) {
        const span = document.createElement('span');
        if (input[i] === currentPracticeContent[i]) {
            span.classList.add('correct-char');
        } else {
            span.classList.add('wrong-char');
        }
        span.textContent = input[i];
        inputDiv.appendChild(span);
    }
    contentDiv.appendChild(document.createElement('br'));
    contentDiv.appendChild(inputDiv);
}

function finishPractice() {
    const endTime = new Date();
    const timeElapsed = (endTime - startTime) / 1000;
    const speed = correctCount / timeElapsed * 60;
    const accuracy = correctCount / (correctCount + incorrectCount) * 100;

    saveStats(speed, accuracy);

    alert(`연습 종료! 속도: ${speed.toFixed(2)} 타수/분, 정확도: ${accuracy.toFixed(2)}%`);
    resetPractice();
}

function saveStats(speed, accuracy) {
    let stats = JSON.parse(localStorage.getItem(currentUser)) || { speed: [], accuracy: [] };
    stats.speed.push(speed);
    stats.accuracy.push(accuracy);
    localStorage.setItem(currentUser, JSON.stringify(stats));
}

function resetPractice() {
    currentCharIndex = 0;
    correctCount = 0;
    incorrectCount = 0;
    startTime = null;
    document.getElementById('practice-input').value = '';
    document.getElementById('practice-content').innerHTML = '';
}

function showStats() {
    const stats = JSON.parse(localStorage.getItem(currentUser));
    if (!stats) {
        alert('통계가 없습니다.');
        return;
    }

    const speedStats = stats.speed;
    const accuracyStats = stats.accuracy;

    const totalSpeed = speedStats.reduce((acc, cur) => acc + cur, 0) / speedStats.length;
    const maxSpeed = Math.max(...speedStats);
    const avgAccuracy = accuracyStats.reduce((acc, cur) => acc + cur, 0) / accuracyStats.length;

    document.getElementById('stats').innerHTML = `
        <p>전체 평균 속도: ${totalSpeed.toFixed(2)} 타수/분</p>
        <p>최대 속도: ${maxSpeed.toFixed(2)} 타수/분</p>
        <p>평균 정확도: ${avgAccuracy.toFixed(2)}%</p>
    `;
    document.getElementById('stats-area').style.display = 'block';
}

const HANGUL_OFFSET = 0xAC00;

const CHO = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
const JUNG = ["ㅏ", "ㅐ", "ㅑ", "ㅒ", "ㅓ", "ㅔ", "ㅕ", "ㅖ", "ㅗ", "ㅘ", "ㅙ", "ㅚ", "ㅛ", "ㅜ", "ㅝ", "ㅞ", "ㅟ", "ㅠ", "ㅡ", "ㅢ", "ㅣ"];
const JONG = ["", "ㄱ", "ㄲ", "ㄳ", "ㄴ", "ㄵ", "ㄶ", "ㄷ", "ㄹ", "ㄺ", "ㄻ", "ㄼ", "ㄽ", "ㄾ", "ㄿ", "ㅀ", "ㅁ", "ㅂ", "ㅄ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];

function decomposeHangul(syllable) {
    const code = syllable.charCodeAt(0) - HANGUL_OFFSET;

    const jong = code % 28;
    const jung = ((code - jong) / 28) % 21;
    const cho = (((code - jong) / 28) - jung) / 21;

    return [CHO[cho], JUNG[jung], JONG[jong]];
}

function isHangul(char) {
    return char.charCodeAt(0) >= HANGUL_OFFSET && char.charCodeAt(0) <= HANGUL_OFFSET + 11171;
}
