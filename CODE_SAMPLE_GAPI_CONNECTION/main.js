// this is a basic connection schema to the corresponding data for the table provided.
// this API KEY will expire after January 2022
// Written by GSoosalu & ndr3svt
const API_KEY = "AIzaSyCfuQLHd0Aha7KuNvHK0p6V6R_0kKmsRX4";
const DISCOVERY_DOCS = [
  "https://sheets.googleapis.com/$discovery/rest?version=v4",
];
const SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";
let questionId;
let answeredQuestion = [];
let unanswerdQuestions = [];
let correctAnswerIndex;
let chosenAnswerIndex;
let randomQuestion;
let userTotalScore = 0;

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
      // Create the data format
      constructApiData(apiResponse);
      // Initialize
      init();
      // Hide loader
      hideLoader();
    })
    .catch((error) => {
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
    optionsContainer.innerHTML += `<div id='option' onClick="toggleChoice(${i})" class='unchosen option'><p class='text'>${options[i]}</p></div>`;
  }
};

function toggleChoice(clickedOptionIndex) {
  chosenAnswerIndex = clickedOptionIndex;
}

function handleEvaluation() {
  if (chosenAnswerIndex == randomQuestion.answerIndex) {
    // color the button with green
    // calculate the score
    console.log("CORRECT");
  } else {
		// color the button with red
    console.log("INCORRECT");
  }

  // Add evaluated question in answeredQuestion array
  answeredQuestion.push(randomQuestion);

  // Filter out evaluated question from unanswerdQuestions array
  const filtredQuestions = unanswerdQuestions.filter(
    (item) => item.id !== randomQuestion.id
  );
  unanswerdQuestions = filtredQuestions;

  // Replace next button with finish button when arriving to the last question from unanswerdQuestions array
  let next = document.querySelector("#next");
  let finish = document.querySelector("#finish");
  if (unanswerdQuestions.length === 0) {
		next.classList.remove("d-flex");
    next.classList.add("d-none");
    finish.classList.add("d-flex");
  }
}

const handleNextQuestion = () => {
  init();
};

const handleFinish = () => {
  // TODO
}