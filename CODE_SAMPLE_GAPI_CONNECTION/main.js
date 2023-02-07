// this is a basic connection schema to the corresponding data for the table provided.
// this API KEY will expire after January 2022
// Written by GSoosalu & ndr3svt
const API_KEY = "AIzaSyCfuQLHd0Aha7KuNvHK0p6V6R_0kKmsRX4";
const DISCOVERY_DOCS = [
  "https://sheets.googleapis.com/$discovery/rest?version=v4",
];
const SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";
let answeredQuestion = [];
let unanswerdQuestions = [];
let userTotalScore = 0;
let chosenAnswerIndex;
let randomQuestion;

const hideLoader = () => {
  let loader = document.querySelector("#loader");

  loader.classList.remove("d-flex");
  loader.classList.add("d-none");
};

const showLoader = () => {
  let loader = document.querySelector("#loader");

  loader.classList.remove("d-none");
  loader.classList.add("d-flex");
};

const handleClientLoad = () => {
  gapi.load("client", initClient);
};

const initClient = () => {
  showLoader();

  gapi.client
    .init({
      apiKey: API_KEY,
      discoveryDocs: DISCOVERY_DOCS,
    })
    .then(() => {
      getExerciseData();
    })
    .catch((error) => {
      hideLoader();
      console.log(JSON.stringify(error, null, 2));
    });
};

/** We construct the response received from API in a way that it's easier to use
 * [{ answerIndex: "2", answerOptions: "18;11;14", id: "01.01", question: "2*5+4", score: "4", topic: "Math" }] */
const constructApiData = (apiResponse) => {
  let questionObject = {};

  for (let i = 1; i < apiResponse.length; i++) {
    for (let j = 0; j < apiResponse[0].length; j++) {
      questionObject = {
        ...questionObject,
        [apiResponse[0][j]]: apiResponse[i][j],
      };
    }

    unanswerdQuestions.push(questionObject);
  }
};

const getExerciseData = () => {
  gapi.client.sheets.spreadsheets.values
    .get({
      spreadsheetId: "1hzA42BEzt2lPvOAePP6RLLRZKggbg0RWuxSaEwd5xLc",
      range: "Learning!A1:F10",
    })
    .then((response) => {
      const apiResponse = response.result.values;
      // Create data format
      constructApiData(apiResponse);
      // Initialize
      init();
      // Hide loader
      hideLoader();
    })
    .catch((error) => {
      hideLoader();
      console.log("Error: " + error.message);
    });
};

const init = () => {
  // Get random question
  const randomIndex = Math.floor(Math.random() * unanswerdQuestions.length);
  randomQuestion = unanswerdQuestions[randomIndex];

  // Create options array
  const options = randomQuestion.answerOptions.split(";");

  // Update DOM with question
  let questionElement = document.querySelector("#question");
  questionElement.innerHTML = randomQuestion.question;

  // Update DOM with question options
  let optionsContainer = document.querySelector("#options-wrapper");
  
	optionsContainer.innerHTML = "";
  for (let i = 0; i < options.length; i++) {
    optionsContainer.innerHTML += `<div id='option${i}' onClick="toggleChoice(${i})" class='unchosen option'><p class='text'>${options[i]}</p></div>`;
  }
};

function toggleChoice(clickedOptionIndex) {
  chosenAnswerIndex = clickedOptionIndex;

  // Add "chosen" class to the selected option
  let chosenOptionElement = document.querySelector(
    `#option${chosenAnswerIndex}`
  );
  chosenOptionElement.classList.add("chosen");
}

function handleEvaluation() {
  let chosenOptionElement = document.querySelector(
    `#option${chosenAnswerIndex}`
  );
  let correctOptionElement = document.querySelector(
    `#option${randomQuestion.answerIndex}`
  );
  let nextBtn = document.querySelector("#next");
  let finishBtn = document.querySelector("#finish");
  let evaluateBtn = document.querySelector("#evaluate");

  // Hide evaluate button and show next button
  evaluateBtn.classList.add("d-none");
  evaluateBtn.classList.remove("d-flex");

  nextBtn.classList.remove("d-none");
  nextBtn.classList.add("d-flex");

  // if selected option is correct add color green to the border,
  // otherwise add color red to the selected option and show which option is correct with border green
  if (chosenAnswerIndex == randomQuestion.answerIndex) {
    chosenOptionElement.classList.add("option-green");
    userTotalScore += Number(randomQuestion.score);
  } else {
    chosenOptionElement.classList.add("option-red");
    correctOptionElement.classList.add("option-green");
  }

  // Add evaluated question in answeredQuestion array
  answeredQuestion.push(randomQuestion);

  // Filter out evaluated question from unanswerdQuestions array
  const filtredQuestions = unanswerdQuestions.filter(
    (item) => item.id !== randomQuestion.id
  );
  unanswerdQuestions = filtredQuestions;

  // Replace next button with finish button when arriving to the last question from unanswerdQuestions array
  if (unanswerdQuestions.length === 0) {
    nextBtn.classList.remove("d-flex");
    nextBtn.classList.add("d-none");
    finishBtn.classList.add("d-flex");
  }
}

/** Hide next button and show evaluate button
 * Update the UI with new question */
const handleNextQuestion = () => {
  let nextBtn = document.querySelector("#next");
  let evaluateBtn = document.querySelector("#evaluate");

  evaluateBtn.classList.remove("d-none");
  evaluateBtn.classList.add("d-flex");

  nextBtn.classList.remove("d-flex");
  nextBtn.classList.add("d-none");

  init();
};

/** Display the final score when pressing finish button */
const handleFinish = () => {
  let scoreContainer = document.querySelector("#score-container");
  let totalScore = document.querySelector("#score");
  
	scoreContainer.classList.remove("d-none");
  totalScore.innerHTML = userTotalScore;
};
