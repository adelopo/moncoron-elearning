import * as bootstrap from "bootstrap";
import axios from "axios";
const csrftoken = document.querySelector("input[name=_token]")?.value;
// get_lesson_idand_corse_id
const urlString = window.location.href;
const regex = /courses\/(\d+)\/lesson\/(\d+)/;
const match = urlString.match(regex);
let { courseId, lessonId } = match
    ? { courseId: match[1], lessonId: match[2] }
    : { courseId: null, lessonId: null };

// make-the-first-one-show
const questions = document.querySelectorAll(".area-question-data");
questions[0].style.display = "block";

// currentindex
let currentQuestionIndex = parseInt(
    document.querySelector(".question_current_index")?.id
);

// shw-question
function showQuestion(index) {
    questions.forEach((question, i) => {
        question.style.display = i + 1 === index ? "block" : "none";
    });
}

// Icon-box-lick-progress
document.querySelectorAll("#box_navigate_cbt").forEach((btn) => {
    btn.addEventListener("click", () => {
        const currid = parseInt(btn.innerText);
        currentQuestionIndex = currid;
        showQuestion(currentQuestionIndex);
    });
});

// next-and-prev-btn
const next = document.querySelector("#next_cbt");
const prev = document.querySelector("#prev_cbt");

next.onclick = function () {
    currentQuestionIndex++;
    currentQuestionIndex > questions.length && (currentQuestionIndex = 1);
    showQuestion(currentQuestionIndex);
    indicateChoosen();
};

prev.onclick = function () {
    currentQuestionIndex--;
    currentQuestionIndex < 1 && (currentQuestionIndex = questions.length);
    showQuestion(currentQuestionIndex);
    indicateChoosen();
};

// modal-element-popup
const modalElement = document.getElementById("modal_result");
const modal = new bootstrap.Modal(modalElement);

// submit-button-click-save-ans-score-assessment
const submitCbtBtn = document.querySelector("#submit_cbt");
submitCbtBtn.addEventListener("click", () => {
    processSubmission();
});

// icon-modal
const iconmodal = document.getElementById("dolittle_icon");

// submit-func-call
async function processSubmission() {
    // initialize-answrs
    const answers = [];

    questions.forEach((questionarea, index) => {
        // quesion-id-is-1++-although-not-ideal-will-get-attributes-later
        const questionId = index + 1;

        //get options-selected
        const optionselect =
            questionarea?.querySelector(
                `input[name="Question${questionId}"]:checked`
            ) || null;

        answers.push({
            question_id: questionId,
            selected_option: optionselect?.getAttribute("data-id") || null,
        });
    });

    const payload = {
        answers,
    };

    try {
        const response = await axios.post(
            `/courses/${courseId}/lesson/${lessonId}/submit-assessment`,
            {
                ...payload,
            },
            {
                headers: {
                    "X-CSRF-Token": csrftoken,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            }
        );

        if (response) {
            // console.log(response);
            updateModals(response?.data);
            // response?.statustext !== "certified" && modal.show();
        }
    } catch (err) {
        window.alert("An error occoured!,", err.status);
        console.log(err);
    }
}

let passicon = `<dotlottie-player src="https://lottie.host/69a64540-0934-4244-8840-29b3bc08d921/a95uBnXlyg.json" background="transparent" speed="1" style="width: 150px; height: 150px;" autoplay></dotlottie-player>`;

let failicon = `<dotlottie-player src="https://lottie.host/439c9c30-4286-4a5b-a033-cdf8855f4216/GpO6NLRhtH.json" background="transparent" speed="1" style="width: 150px; height: 150px;" autoplay></dotlottie-player>`;

const resultmodalText = document.getElementById("result_modal_text");
const footerCont = document.getElementById("footer_button");
const buttonfail = `<a class="btn btn-primary" href="/courses/${courseId}">Retake Assessment</a>`;

const buttonpass = `<a  class="btn btn-primary" id = "next_lesson">Next Lesson</a>`;

let urlnavigate;
function updateModals(response) {
    if (response.statustext === "passed") {
        iconmodal.innerHTML = passicon;
        resultmodalText.innerHTML = response?.message;
        footerCont.innerHTML = buttonpass;
        urlnavigate = response?.url;
        modal.show();
    } else if (response.statustext === "failed") {
        iconmodal.innerHTML = failicon;
        resultmodalText.innerHTML = response?.message;
        footerCont.innerHTML = buttonfail;
        modal.show();
    } else if (response.statustext === "redirect") {
        resultmodalText.innerHTML = response?.message;
        footerCont.innerHTML = buttonpass;
        urlnavigate = response?.url;
        modal.show();
    } else if (response.statustext === "certified") {
        window.open(`/courses/${courseId}/coursecompletion`, "_self");
    }

    document.getElementById("next_lesson")?.setAttribute("href", urlnavigate);
}

function startTimer(duration, display) {
    let timer = duration;

    const interval = setInterval(() => {
        const minutes = Math.floor(timer / 60);
        const seconds = timer % 60;

        const displayMinutes = minutes < 10 ? "0" + minutes : minutes;
        const displaySeconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = `${displayMinutes}:${displaySeconds}`;
        if (--timer < 0) {
            clearInterval(interval);
            // auto-submit
            processSubmission();
        }
    }, 1000);
}

// timer-functionality
document.addEventListener("DOMContentLoaded", function () {
    const loader = document.getElementById("loadingAnimation");
    setTimeout(() => {
        loader.classList.add("invisible_loader");
    }, 1500);

    const timerElement = document.getElementById("question_timer");
    let timeLimit = parseInt(timerElement.getAttribute("data-time-limit"));
    startTimer(timeLimit, timerElement);
});

// track-if-checked-and-styled
function indicateChoosen() {
    questions.forEach((questionarea, index) => {
        const optionselect = questionarea?.querySelector(
            `input[name="Question${index + 1}"]:checked`
        );
        if (optionselect) {
            const boxNavigateCbt = document.querySelector(
                `#box_navigate_cbt[data-target="${index + 1}"]`
            );
            if (boxNavigateCbt) {
                boxNavigateCbt.classList.add("selected_opt_styles");
            }
        }
    });
}
