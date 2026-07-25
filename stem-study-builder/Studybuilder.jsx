import React, { useState } from "react";
import {
  GraduationCap,
  Sparkles,
  Loader2,
  Eye,
  EyeOff,
  Copy,
  Check,
  AlertCircle,
  FlaskConical,
} from "lucide-react";

// ============================================================
// STEM Study Builder
// A generative AI application that turns a topic into a
// structured practice set using the Anthropic API.
// Demonstrates: prompt engineering for strict JSON output,
// grade and difficulty controls, graceful loading and error
// states, and clean rendering of model output.
// ============================================================

export default function StudyBuilder() {
  const [topic, setTopic] = useState("Photosynthesis");
  const [grade, setGrade] = useState("High school");
  const [count, setCount] = useState(4);
  const [difficulty, setDifficulty] = useState("Medium");
  const [useMC, setUseMC] = useState(true);
  const [useSA, setUseSA] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [questions, setQuestions] = useState([]);
  const [revealed, setRevealed] = useState({});
  const [copied, setCopied] = useState(false);

  const grades = ["Elementary", "Middle school", "High school", "College intro"];
  const difficulties = ["Easy", "Medium", "Hard"];

  const generate = async () => {
    setError("");
    if (!topic.trim()) {
      setError("Enter a topic to build a study set.");
      return;
    }
    if (!useMC && !useSA) {
      setError("Pick at least one question type.");
      return;
    }

    setLoading(true);
    setQuestions([]);
    setRevealed({});

    const types = [];
    if (useMC) types.push("multiple_choice");
    if (useSA) types.push("short_answer");

    const system =
      "You are a STEM assessment writer. You return ONLY valid JSON, no preamble, no markdown fences. " +
      "The JSON must match this schema exactly: " +
      '{"questions":[{"type":"multiple_choice","question":string,"options":[string,string,string,string],"answer":string,"explanation":string}' +
      ' OR {"type":"short_answer","question":string,"answer":string,"explanation":string}]}. ' +
      "For multiple_choice, answer must exactly match one of the options. Keep explanations to one or two sentences.";

    const user =
      `Write ${count} practice questions on the topic "${topic}". ` +
      `Target level: ${grade}. Difficulty: ${difficulty}. ` +
      `Allowed question types: ${types.join(", ")}. ` +
      `Mix the allowed types. Return only the JSON object.`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system,
          messages: [{ role: "user", content: user }],
        }),
      });

      const data = await response.json();
      const text = data.content
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("\n");

      const clean = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(clean);

      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        throw new Error("bad shape");
      }
      setQuestions(parsed.questions);
    } catch (e) {
      setError(
        "The model returned something we could not read. Try again, or lower the question count."
      );
    } finally {
      setLoading(false);
    }
  };

  const toggle = (i) => setRevealed((r) => ({ ...r, [i]: !r[i] }));

  const copyAll = () => {
    const lines = questions.map((q, i) => {
      let block = `${i + 1}. ${q.question}\n`;
      if (q.type === "multiple_choice") {
        q.options.forEach((o, j) => {
          block += `   ${String.fromCharCode(65 + j)}. ${o}\n`;
        });
      }
      block += `   Answer: ${q.answer}\n`;
      if (q.explanation) block += `   Why: ${q.explanation}\n`;
      return block;
    });
    navigator.clipboard.writeText(
      `${topic} — ${grade} — ${difficulty}\n\n${lines.join("\n")}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div
      className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-8"
      style={{
        backgroundImage:
          "linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px)",
        backgroundSize: "26px 26px",
      }}
    >
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-indigo-900 text-white rounded-xl p-2.5">
            <FlaskConical size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-indigo-950">
              STEM Study Builder
            </h1>
            <p className="text-sm text-slate-500">
              Topic in, structured practice set out. Powered by Claude.
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 mt-6 shadow-sm">
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Topic
          </label>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Newton's laws, cellular respiration, quadratic functions"
            className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />

          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Level
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {grades.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {difficulties.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Questions: <span className="text-indigo-700">{count}</span>
            </label>
            <input
              type="range"
              min="2"
              max="6"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full accent-indigo-700"
            />
          </div>

          <div className="flex flex-wrap gap-4 mt-4">
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={useMC}
                onChange={(e) => setUseMC(e.target.checked)}
                className="w-4 h-4 accent-indigo-700"
              />
              Multiple choice
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={useSA}
                onChange={(e) => setUseSA(e.target.checked)}
                className="w-4 h-4 accent-indigo-700"
              />
              Short answer
            </label>
          </div>

          <button
            onClick={generate}
            disabled={loading}
            className="mt-5 w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-900 hover:bg-indigo-800 disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-xl transition"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Building set
              </>
            ) : (
              <>
                <Sparkles size={18} /> Build study set
              </>
            )}
          </button>

          {error && (
            <div className="mt-4 flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Results */}
        {questions.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-indigo-950 flex items-center gap-2">
                <GraduationCap size={20} /> {topic}
              </h2>
              <button
                onClick={copyAll}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-800 border border-slate-300 rounded-lg px-3 py-1.5"
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
                {copied ? "Copied" : "Copy set"}
              </button>
            </div>

            <div className="space-y-4">
              {questions.map((q, i) => (
                <div
                  key={i}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <span className="shrink-0 bg-indigo-100 text-indigo-800 font-bold text-sm rounded-lg w-7 h-7 flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{q.question}</p>

                      {q.type === "multiple_choice" && q.options && (
                        <ul className="mt-3 space-y-1.5">
                          {q.options.map((o, j) => {
                            const isAns = revealed[i] && o === q.answer;
                            return (
                              <li
                                key={j}
                                className={
                                  "text-sm rounded-lg px-3 py-1.5 border " +
                                  (isAns
                                    ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-medium"
                                    : "bg-slate-50 border-slate-200 text-slate-700")
                                }
                              >
                                <span className="font-semibold mr-1.5">
                                  {String.fromCharCode(65 + j)}.
                                </span>
                                {o}
                              </li>
                            );
                          })}
                        </ul>
                      )}

                      <button
                        onClick={() => toggle(i)}
                        className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-indigo-700 hover:text-indigo-900"
                      >
                        {revealed[i] ? <EyeOff size={15} /> : <Eye size={15} />}
                        {revealed[i] ? "Hide answer" : "Show answer"}
                      </button>

                      {revealed[i] && (
                        <div className="mt-2 text-sm bg-indigo-50 border border-indigo-100 rounded-lg px-3.5 py-2.5">
                          {q.type === "short_answer" && (
                            <p className="text-slate-900">
                              <span className="font-semibold">Answer: </span>
                              {q.answer}
                            </p>
                          )}
                          {q.explanation && (
                            <p className="text-slate-600 mt-1">
                              {q.explanation}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-center text-xs text-slate-400 mt-10">
          Built by Randy O. Powell. Generative AI portfolio project.
        </p>
      </div>
    </div>
  );
}
