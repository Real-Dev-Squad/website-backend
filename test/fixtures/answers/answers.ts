const answerData = [
  {
    id: "dummy-answer-id",
    eventId: "event_id",
    answeredBy: "satyam-bajpai",
    answer: "this is demo answer",
    questionId: "demo-question-id-1",
  },
  {
    eventId: "event_id-2",
    answeredBy: "vinayak-trivedi",
    answer: "this is my answer",
    questionId: "demo-question-id-2",
  },
  {
    id: "dummy-answer-id-2",
    answer: "this is my answer",
    event_id: "event_id-2",
    answered_by: "vinayak-trivedi",
    question_id: "demo-question-id-2",
    status: "PENDING",
    reviewed_by: null,
    created_at: new Date().toString(),
    updated_at: new Date().toString(),
  },
];

module.exports = answerData;
