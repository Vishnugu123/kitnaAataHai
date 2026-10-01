import { useState } from "react";

function App() {
  const [subject, setSubject] = useState("Go");
  const [difficulty, setDifficulty] = useState("Medium");
  const [questions, setQuestions] = useState(10);
  const [assessment, setAssessment] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState(null);
  const [answers, setAnswers] = useState({});

  const topics = [
    "Variables",
    "Functions",
    "Pointers",
    "Structs",
    "String",
    "File Handling",
    "Array & Slice",
    "Interfaces",
    "Goroutines",
  ];

  const [selectedTopics, setSelectedTopics] = useState([
    "Variables",
    "Functions",
    "Pointers",
  ]);

  function toggleTopic(topic) {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(
        selectedTopics.filter((item) => item !== topic)
      );
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  }

  async function startAssessment() {
    const assessmentData = {
      subject: subject,
      topics: selectedTopics,
      difficulty: difficulty,
      questions: questions,
    };

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/assessment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(assessmentData),
        }
      );

      const data = await response.json();

      console.log(data);

      setAssessment(data);
      setCurrentQuestion(0);
      setAnswers({});
      setAnswer("");
    } catch (error) {
      console.error("Error:", error);
    }
  }

  function goToQuestion(nextIndex) {
    const updatedAnswers = {
      ...answers,
      [assessment.questions[currentQuestion].id]: answer,
    };

    setAnswers(updatedAnswers);
    setCurrentQuestion(nextIndex);

    const nextQuestion = assessment.questions[nextIndex];

    setAnswer(updatedAnswers[nextQuestion.id] || "");
  }

  async function submitAssessment() {
    const finalAnswers = {
      ...answers,
      [assessment.questions[currentQuestion].id]: answer,
    };

    setAnswers(finalAnswers);

    const submissionData = {
      assessment_id: assessment.assessment_id,
      answers: finalAnswers,
    };

    console.log("Submitting:", submissionData);

      const response = await fetch(
        "http://127.0.0.1:8000/api/assessment/submit",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(submissionData),
        }
      );

      

      const data = await response.json();

      console.log("Backend response:", data);

      setResult(data);
  }

  if (result) {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto max-w-4xl px-6 py-12">

        <div className="mb-10 text-center">
          <p className="text-gray-400">Assessment Complete</p>

          <h1 className="mt-2 text-4xl font-bold">
            Your Result
          </h1>
        </div>

        {/* Score */}
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-8 text-center">
          <p className="text-sm text-gray-400">
            Your Score
          </p>

          <h2 className="mt-2 text-5xl font-bold">
            {result.total_score} / {result.max_score}
          </h2>

          <p className="mt-3 text-xl text-gray-400">
            {result.percentage}%
          </p>
        </div>

        {/* Overall Feedback */}
        <div className="mt-6 rounded-2xl border border-gray-800 bg-gray-900 p-6">
          <h2 className="text-xl font-semibold">
            Overall Feedback
          </h2>

          <p className="mt-3 leading-7 text-gray-300">
            {result.overall_feedback}
          </p>
        </div>

        {/* Weak Topics */}
        <div className="mt-6 rounded-2xl border border-gray-800 bg-gray-900 p-6">
          <h2 className="text-xl font-semibold">
            Weak Topics
          </h2>

          <div className="mt-4 flex flex-wrap gap-2">
            {result.weak_topics.map((topic) => (
              <span
                key={topic}
                className="rounded-full bg-red-500/20 px-4 py-2 text-sm text-red-300"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>

        {/* Question-wise Result */}
        <div className="mt-6">
          <h2 className="mb-4 text-2xl font-semibold">
            Question-wise Analysis
          </h2>

          <div className="space-y-4">
            {result.questions.map((question) => (
              <div
                key={question.question_id}
                className="rounded-2xl border border-gray-800 bg-gray-900 p-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">
                    Question {question.question_id}
                  </h3>

                  <span className="rounded-full bg-gray-800 px-3 py-1 text-sm">
                    {question.score}/10
                  </span>
                </div>

                <p className="mt-3 text-sm text-gray-400">
                  Status: {question.status}
                </p>

                {question.understood_concepts.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-green-400">
                      You understood
                    </p>

                    <ul className="mt-2 list-disc pl-5 text-sm text-gray-300">
                      {question.understood_concepts.map((concept) => (
                        <li key={concept}>{concept}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {question.missing_concepts.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-red-400">
                      You missed
                    </p>

                    <ul className="mt-2 list-disc pl-5 text-sm text-gray-300">
                      {question.missing_concepts.map((concept) => (
                        <li key={concept}>{concept}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-4 border-t border-gray-800 pt-4">
                  <p className="text-sm font-medium">
                    Feedback
                  </p>

                  <p className="mt-2 text-sm leading-6 text-gray-400">
                    {question.feedback}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="mt-8 w-full rounded-lg bg-white px-6 py-3 font-semibold text-black hover:bg-gray-200"
        >
          Create New Assessment
        </button>

      </div>
    </div>
  );
}



  if (assessment) {
    const question =
      assessment.questions[currentQuestion];

    const isLastQuestion =
      currentQuestion === assessment.questions.length - 1;

    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <div className="mx-auto max-w-3xl px-6 py-12">

          <div className="mb-8">
            <p className="text-sm text-gray-400">
              {subject} Assessment
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              Question {currentQuestion + 1} /{" "}
              {assessment.questions.length}
            </h1>
          </div>

          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-8">

            <div className="mb-6">
              <span className="rounded-full bg-gray-800 px-3 py-1 text-sm">
                {question.difficulty}
              </span>

              <span className="ml-2 rounded-full bg-gray-800 px-3 py-1 text-sm">
                {question.type}
              </span>
            </div>

            <h2 className="whitespace-pre-wrap text-xl font-semibold">
              {question.question}
            </h2>

            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Write your answer here..."
              className="mt-6 h-48 w-full resize-none rounded-lg border border-gray-700 bg-gray-800 p-4 outline-none focus:border-white"
            />

            <div className="mt-6 flex justify-between">

              <button
                onClick={() => {
                  if (currentQuestion > 0) {
                    goToQuestion(currentQuestion - 1);
                  }
                }}
                disabled={currentQuestion === 0}
                className="rounded-lg border border-gray-700 px-5 py-3 disabled:opacity-30"
              >
                ← Previous
              </button>

              {!isLastQuestion ? (
                <button
                  onClick={() => {
                    goToQuestion(currentQuestion + 1);
                  }}
                  className="rounded-lg bg-white px-5 py-3 font-semibold text-black"
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={submitAssessment}
                  className="rounded-lg bg-green-500 px-5 py-3 font-semibold text-black"
                >
                  Submit Assessment
                </button>
              )}

            </div>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto max-w-3xl px-6 py-12">

        <div className="mb-10">
          <h1 className="text-4xl font-bold">
            Create Assessment
          </h1>

          <p className="mt-2 text-gray-400">
            Select exactly what you have studied and test your
            understanding.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-8">

          <div className="mb-8">
            <label className="mb-3 block text-sm font-medium">
              Subject
            </label>

            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 outline-none"
            >
              <option value="Go">Go</option>
              <option value="Python">Python</option>
              <option value="C">C</option>
              <option value="C++">C++</option>
              <option value="Java">Java</option>
              <option value="Rust">Rust</option>
            </select>
          </div>

          <div className="mb-8">
            <label className="mb-3 block text-sm font-medium">
              Topics
            </label>

            <div className="grid grid-cols-2 gap-3">
              {topics.map((topic) => (
                <label
                  key={topic}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-700 bg-gray-800 p-3 hover:border-gray-500"
                >
                  <input
                    type="checkbox"
                    checked={selectedTopics.includes(topic)}
                    onChange={() => toggleTopic(topic)}
                    className="h-4 w-4"
                  />

                  <span>{topic}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <label className="mb-3 block text-sm font-medium">
              Difficulty
            </label>

            <div className="grid grid-cols-3 gap-3">
              {["Easy", "Medium", "Hard"].map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`rounded-lg border px-4 py-3 ${
                    difficulty === level
                      ? "border-white bg-white text-black"
                      : "border-gray-700 bg-gray-800"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <label className="mb-3 block text-sm font-medium">
              Number of Questions
            </label>

            <select
              value={questions}
              onChange={(e) =>
                setQuestions(Number(e.target.value))
              }
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3"
            >
              <option value={5}>5 Questions</option>
              <option value={10}>10 Questions</option>
              <option value={15}>15 Questions</option>
              <option value={20}>20 Questions</option>
            </select>
          </div>

          <div className="mb-8 rounded-lg bg-gray-800 p-4">
            <p className="text-sm text-gray-400">
              Your assessment
            </p>

            <p className="mt-2">
              <strong>{subject}</strong> ·{" "}
              {difficulty} · {questions} questions
            </p>

            <p className="mt-1 text-sm text-gray-400">
              Topics: {selectedTopics.join(", ")}
            </p>
          </div>

          <button
            onClick={startAssessment}
            disabled={selectedTopics.length === 0}
            className="w-full rounded-lg bg-white px-6 py-3 font-semibold text-black hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Start Assessment →
          </button>

        </div>
      </div>
    </div>
  );
}

export default App;