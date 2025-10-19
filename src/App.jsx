import React, { useEffect, useMemo, useState } from "react";

/* ---------------- Helpers ---------------- */
const uid = () => Date.now() + Math.floor(Math.random() * 1000);

/* ---------------- Typing Practice ---------------- */
function TypingPractice({ passages }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState("");
  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [finalStats, setFinalStats] = useState(null);

  // keep index valid when passages change
  useEffect(() => {
    if (currentIndex >= passages.length) setCurrentIndex(Math.max(0, passages.length - 1));
  }, [passages, currentIndex]);

  const passage = passages[currentIndex]?.text || "";

  // Timer
  useEffect(() => {
    let id;
    if (running && !finished) id = setInterval(() => setTimer((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running, finished]);

  const restart = () => {
    setInput("");
    setTimer(0);
    setRunning(false);
    setFinished(false);
    setFinalStats(null);
  };

  const handleSubmit = () => {
    setRunning(false);
    setFinished(true);

    const passageWords = passage.trim().split(/\s+/);
    const inputWords = input.trim().split(/\s+/);

    let correctWords = 0;
    inputWords.forEach((word, i) => {
      if (word === passageWords[i]) correctWords++;
    });

    const errors = inputWords.length - correctWords;
    const accuracy = inputWords.length > 0 ? Math.round((correctWords / inputWords.length) * 100) : 100;
    const wpm = timer > 0 ? Math.round(correctWords / (timer / 60)) : 0;

    setFinalStats({ wpm, accuracy, errors });
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-3">Typing Practice</h2>

      <div className="mb-3 flex gap-2 flex-wrap">
        {passages.map((p, idx) => (
          <button
            key={p.id}
            onClick={() => {
              setCurrentIndex(idx);
              restart();
            }}
            className={`px-3 py-1 rounded ${idx === currentIndex ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            Passage {idx + 1}
          </button>
        ))}
      </div>

      <div className="rounded border p-3 mb-3 whitespace-pre-wrap bg-gray-50 overflow-y-auto max-h-[60vh]">
        {passage || "No passages available. Add one in Admin."}
      </div>

      <textarea
        className="w-full border p-2 rounded mb-3"
        rows={6}
        value={input}
        onChange={(e) => {
          if (!running && !finished) setRunning(true);
          setInput(e.target.value);
        }}
        disabled={!passage || finished}
        placeholder={passage ? "Type exactly as shown above..." : "Add a passage in Admin to start typing."}
      />

      <div className="flex gap-4 items-center">
        <div>⏱ {timer}s</div>
        {finalStats && (
          <>
            <div>⚡ WPM: {finalStats.wpm}</div>
            <div>🎯 Accuracy: {finalStats.accuracy}%</div>
            <div>❌ Errors: {finalStats.errors}</div>
          </>
        )}
      </div>

      <div className="flex gap-2 mt-3">
        <button onClick={handleSubmit} disabled={finished || !input} className="bg-green-500 text-white px-3 py-1 rounded">
          Submit
        </button>
        <button onClick={restart} className="bg-blue-500 text-white px-3 py-1 rounded">
          Restart
        </button>
      </div>
    </div>
  );
}

/* ---------------- Quiz ---------------- */
function Quiz({ questions }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]); // chosen option indexes by question order
  const [finished, setFinished] = useState(false);

  // adjust index if questions length changes
  useEffect(() => {
    if (index >= questions.length && questions.length > 0) setIndex(Math.max(0, questions.length - 1));
  }, [questions, index]);

  const handleChoose = (opt) => {
    const newAns = [...answers];
    newAns[index] = opt;
    setAnswers(newAns);
  };

  const handleNext = () => {
    if (index + 1 < questions.length) setIndex(index + 1);
    else setFinished(true);
  };

  const handlePrev = () => {
    if (index > 0) setIndex(index - 1);
  };

  const score = answers.reduce((s, ans, i) => (questions[i] && ans === questions[i].answer ? s + 1 : s), 0);

  if (questions.length === 0) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-3">Quiz</h2>
        <div>No questions available. Add questions in Admin (JSON upload).</div>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-3">Quiz Results</h2>
        <div className="mb-3">Score: {score} / {questions.length}</div>
        <div className="space-y-3">
          {questions.map((q, i) => (
            <div key={q.id ?? i} className="p-3 border rounded">
              <div className="font-medium">{i + 1}. {q.question}</div>
              <div className="text-sm mt-1">Your Answer: {answers[i] != null ? q.options[answers[i]] : "Not answered"}</div>
              <div className="text-sm">Correct: {q.options[q.answer]}</div>
              {q.explanation && <div className="text-xs text-gray-600 mt-1">💡 {q.explanation}</div>}
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-4">
          <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={() => { setAnswers([]); setIndex(0); setFinished(false); }}>
            Retake Quiz
          </button>
          <button className="px-4 py-2 border rounded" onClick={() => { setAnswers([]); setIndex(0); setFinished(false); }}>
            Back to Quiz
          </button>
        </div>
      </div>
    );
  }

  const q = questions[index];

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-3">Quiz</h2>

      <div className="mb-2 font-medium">{index + 1}. {q.question}</div>
      <div className="space-y-2">
        {q.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleChoose(i)}
            className={`block w-full text-left px-3 py-2 rounded ${answers[index] === i ? "bg-blue-100" : "bg-white hover:bg-gray-50"} border`}
          >
            {String.fromCharCode(65 + i)}. {opt}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mt-4">
        <button onClick={handlePrev} disabled={index === 0} className="px-3 py-1 border rounded bg-white">Prev</button>
        <button onClick={handleNext} className="px-3 py-1 border rounded bg-blue-500 text-white ml-auto">
          {index + 1 < questions.length ? "Next" : "Finish"}
        </button>
      </div>
    </div>
  );
}

/* ---------------- Admin (with JSON upload for quizzes) ---------------- */
function Admin({ passages, setPassages, questions, setQuestions }) {
  // passages UI
  const [newPassageText, setNewPassageText] = useState("");
  const [editingPassageId, setEditingPassageId] = useState(null);
  const [editingPassageText, setEditingPassageText] = useState("");

  // quiz JSON UI
  const [quizJsonText, setQuizJsonText] = useState("");
  const [appendMode, setAppendMode] = useState(true); // append vs replace

  // questions inline edit/delete management (keep available for small edits)
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editingQuestionDraft, setEditingQuestionDraft] = useState({
    question: "",
    options: ["", "", "", ""],
    answer: 0,
    explanation: "",
  });

  /* --- Passages actions --- */
  const addPassage = () => {
    const t = newPassageText.trim();
    if (!t) return alert("Passage cannot be empty.");
    setPassages([...passages, { id: uid(), text: t }]);
    setNewPassageText("");
  };

  const startEditPassage = (p) => {
    setEditingPassageId(p.id);
    setEditingPassageText(p.text);
  };

  const saveEditPassage = () => {
    setPassages(passages.map((p) => (p.id === editingPassageId ? { ...p, text: editingPassageText } : p)));
    setEditingPassageId(null);
    setEditingPassageText("");
  };

  const cancelEditPassage = () => {
    setEditingPassageId(null);
    setEditingPassageText("");
  };

  const deletePassage = (id) => {
    if (!window.confirm("Delete this passage?")) return;
    setPassages(passages.filter((p) => p.id !== id));
  };

  /* --- Quiz JSON upload --- */
  const validateQuestionShape = (obj) => {
    // Required: question (string), options (array len>=2), answer (number)
    if (typeof obj.question !== "string") return "question must be a string";
    if (!Array.isArray(obj.options) || obj.options.length < 2) return "options must be an array with at least 2 items";
    if (typeof obj.answer !== "number") return "answer must be a number (index of correct option)";
    if (obj.answer < 0 || obj.answer >= obj.options.length) return "answer index out of range";
    return null;
  };

  const uploadQuizJson = () => {
    if (!quizJsonText.trim()) return alert("Paste quiz JSON into the box first.");
    let parsed;
    try {
      parsed = JSON.parse(quizJsonText);
    } catch (err) {
      return alert("Invalid JSON: " + err.message);
    }
    if (!Array.isArray(parsed)) return alert("JSON must be an array of question objects.");

    // Validate each question
    const errors = [];
    const normalized = parsed.map((q, i) => {
      const err = validateQuestionShape(q);
      if (err) errors.push(`Item ${i + 1}: ${err}`);
      // ensure id exists
      return {
        id: q.id ?? uid(),
        question: q.question,
        options: q.options.slice(),
        answer: q.answer,
        explanation: q.explanation ?? "",
      };
    });

    if (errors.length) return alert("Validation errors:\n" + errors.join("\n"));

    if (appendMode) {
      setQuestions([...questions, ...normalized]);
    } else {
      setQuestions(normalized);
    }
    setQuizJsonText("");
    alert("Quiz uploaded successfully.");
  };

  /* --- Questions inline edit/delete --- */
  const startEditQuestion = (q) => {
    setEditingQuestionId(q.id);
    setEditingQuestionDraft({
      question: q.question,
      options: q.options.slice(),
      answer: q.answer,
      explanation: q.explanation ?? "",
    });
  };

  const saveEditQuestion = () => {
    const { question, options, answer } = editingQuestionDraft;
    if (!question.trim()) return alert("Question text required.");
    if (options.some((o) => !o.trim())) return alert("All options must be filled.");
    if (typeof answer !== "number" || answer < 0 || answer >= options.length) return alert("Answer index invalid.");
    setQuestions(questions.map((qq) => (qq.id === editingQuestionId ? { ...qq, ...editingQuestionDraft } : qq)));
    setEditingQuestionId(null);
    setEditingQuestionDraft({ question: "", options: ["", "", "", ""], answer: 0, explanation: "" });
  };

  const cancelEditQuestion = () => {
    setEditingQuestionId(null);
    setEditingQuestionDraft({ question: "", options: ["", "", "", ""], answer: 0, explanation: "" });
  };

  const deleteQuestion = (id) => {
    if (!window.confirm("Delete this question?")) return;
    setQuestions(questions.filter((q) => q.id !== id));
  };

  /* --- NEW: Delete All handlers with confirmation --- */
  const deleteAllPassages = () => {
    if (!window.confirm("Are you sure you want to DELETE ALL passages? This action cannot be undone.")) return;
    setPassages([]);
    // reset any editing state
    setEditingPassageId(null);
    setEditingPassageText("");
  };

  const deleteAllQuestions = () => {
    if (!window.confirm("Are you sure you want to DELETE ALL questions? This action cannot be undone.")) return;
    setQuestions([]);
    // reset any editing state
    setEditingQuestionId(null);
    setEditingQuestionDraft({ question: "", options: ["", "", "", ""], answer: 0, explanation: "" });
  };

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-semibold">Admin Panel</h2>

      {/* Passages */}
      <section className="border rounded p-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium">Passages</h3>
          {passages.length > 0 && (
            <button
              onClick={deleteAllPassages}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm"
            >
              Delete All
            </button>
          )}
        </div>

        <div className="space-y-2">
          {passages.length === 0 && <div className="text-sm text-gray-600">No passages yet.</div>}
          {passages.map((p) => (
            <div key={p.id} className="border rounded p-2">
              {editingPassageId === p.id ? (
                <>
                  <textarea className="w-full border p-2" rows={3} value={editingPassageText} onChange={(e) => setEditingPassageText(e.target.value)} />
                  <div className="flex gap-2 mt-2">
                    <button onClick={saveEditPassage} className="px-3 py-1 bg-green-500 text-white rounded">Save</button>
                    <button onClick={cancelEditPassage} className="px-3 py-1 border rounded">Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <div className="whitespace-pre-wrap mb-2">{p.text}</div>
                  <div className="flex gap-2">
                    <button onClick={() => startEditPassage(p)} className="px-3 py-1 bg-yellow-400 rounded">Edit</button>
                    <button onClick={() => deletePassage(p.id)} className="px-3 py-1 bg-red-500 text-white rounded">Delete</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="mt-3">
          <textarea className="w-full border p-2" rows={3} placeholder="New passage..." value={newPassageText} onChange={(e) => setNewPassageText(e.target.value)} />
          <div className="flex gap-2 mt-2">
            <button onClick={addPassage} className="px-4 py-2 bg-blue-600 text-white rounded">Add Passage</button>
            <button onClick={() => { setNewPassageText(""); }} className="px-4 py-2 border rounded">Clear</button>
          </div>
        </div>
      </section>

      {/* Quiz JSON upload + small inline editor */}
      <section className="border rounded p-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium">Questions (JSON upload)</h3>
        </div>

        <div className="mb-3">
          <div className="text-sm text-gray-600 mb-2">Paste an array of question objects. Example item:</div>
          <pre className="bg-gray-50 p-2 rounded text-xs overflow-auto">{`{
  "id": 1,
  "question": "Which article...?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "answer": 2,
  "explanation": "Optional explanation"
}`}</pre>

          <textarea
            className="w-full border p-2 mt-2"
            rows={6}
            placeholder='Paste JSON array here (example in box above)'
            value={quizJsonText}
            onChange={(e) => setQuizJsonText(e.target.value)}
          />

          <div className="flex items-center gap-3 mt-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={appendMode} onChange={(e) => setAppendMode(e.target.checked)} />
              Append (unchecked → Replace)
            </label>
            <button onClick={uploadQuizJson} className="px-4 py-2 bg-green-600 text-white rounded">Upload JSON</button>
            <button onClick={() => setQuizJsonText("")} className="px-4 py-2 border rounded">Clear</button>
          </div>
        </div>

        <div className="border-t pt-3">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">Manage Questions (small edits)</h4>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600">JSON upload is recommended for bulk</div>
              {questions.length > 0 && (
                <button
                  onClick={deleteAllQuestions}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                >
                  Delete All
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {questions.length === 0 && <div className="text-sm text-gray-600">No questions yet.</div>}
            {questions.map((q) => (
              <div key={q.id} className="border rounded p-2">
                {editingQuestionId === q.id ? (
                  <>
                    <input className="w-full border p-2 mb-2" value={editingQuestionDraft.question} onChange={(e) => setEditingQuestionDraft({ ...editingQuestionDraft, question: e.target.value })} />
                    {editingQuestionDraft.options.map((op, i) => (
                      <input key={i} className="w-full border p-2 mb-1" value={editingQuestionDraft.options[i]} onChange={(e) => setEditingQuestionDraft({ ...editingQuestionDraft, options: editingQuestionDraft.options.map((o, j) => (j === i ? e.target.value : o)) })} placeholder={`Option ${i + 1}`} />
                    ))}
                    <label className="block mb-2">Answer index (0–{editingQuestionDraft.options.length - 1}):
                      <input type="number" min="0" max={editingQuestionDraft.options.length - 1} value={editingQuestionDraft.answer} onChange={(e) => setEditingQuestionDraft({ ...editingQuestionDraft, answer: Number(e.target.value) })} className="ml-2 border p-1" />
                    </label>
                    <input className="w-full border p-2 mb-2" value={editingQuestionDraft.explanation} onChange={(e) => setEditingQuestionDraft({ ...editingQuestionDraft, explanation: e.target.value })} placeholder="Explanation (optional)" />
                    <div className="flex gap-2">
                      <button onClick={saveEditQuestion} className="px-3 py-1 bg-green-500 text-white rounded">Save</button>
                      <button onClick={cancelEditQuestion} className="px-3 py-1 border rounded">Cancel</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="font-medium mb-1">{q.question}</div>
                    <ol className="list-decimal pl-6 mb-2">
                      {q.options.map((op, i) => <li key={i} className={`${q.answer === i ? "font-semibold" : ""}`}>{op}</li>)}
                    </ol>
                    {q.explanation && <div className="text-xs text-gray-600 mb-2">💡 {q.explanation}</div>}
                    <div className="flex gap-2">
                      <button onClick={() => startEditQuestion(q)} className="px-3 py-1 bg-yellow-400 rounded">Edit</button>
                      <button onClick={() => deleteQuestion(q.id)} className="px-3 py-1 bg-red-500 text-white rounded">Delete</button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------------- App (holds persisted data and routes) ---------------- */
export default function App() {
  const [view, setView] = useState("typing");

  const [passages, setPassages] = useState(() => {
    try {
      const raw = localStorage.getItem("ssc_passages_v1");
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore parse errors */ }
    return [{ id: uid(), text: "The Constitution of India was adopted on 26th January 1950." }];
  });

  const [questions, setQuestions] = useState(() => {
    try {
      const raw = localStorage.getItem("ssc_questions_v1");
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore parse errors */ }
    return [{
      id: uid(),
      question: "Which Article guarantees equality before law?",
      options: ["Article 12", "Article 13", "Article 14", "Article 15"],
      answer: 2,
      explanation: ""
    }];
  });

  // persist
  useEffect(() => {
    localStorage.setItem("ssc_passages_v1", JSON.stringify(passages));
  }, [passages]);

  useEffect(() => {
    localStorage.setItem("ssc_questions_v1", JSON.stringify(questions));
  }, [questions]);

  return (
    <div className="min-h-screen bg-white">
      <header className="p-4 border-b flex gap-3">
        <button onClick={() => setView("typing")} className={`px-3 py-1 rounded ${view === "typing" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>Typing</button>
        <button onClick={() => setView("quiz")} className={`px-3 py-1 rounded ${view === "quiz" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>Quiz</button>
        <button onClick={() => setView("admin")} className={`px-3 py-1 rounded ${view === "admin" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>Admin</button>
      </header>

      <main className="p-4 max-w-4xl mx-auto">
        {view === "typing" && <TypingPractice passages={passages} />}
        {view === "quiz" && <Quiz questions={questions} />}
        {view === "admin" && <Admin passages={passages} setPassages={setPassages} questions={questions} setQuestions={setQuestions} />}
      </main>
    </div>
  );
}
