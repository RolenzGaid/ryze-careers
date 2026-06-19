"use client";

import { useMemo, useState } from "react";
import { SECTIONS, ALL_FIELDS } from "../lib/fields.js";

const TOTAL = SECTIONS.length;

export default function ApplicationForm() {
  const initial = useMemo(() => {
    const obj = {};
    for (const f of ALL_FIELDS) obj[f.name] = "";
    return obj;
  }, []);

  const [values, setValues] = useState(initial);
  const [step, setStep] = useState(0);
  const [maxReached, setMaxReached] = useState(0);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | done | error
  const [submitError, setSubmitError] = useState("");

  const current = SECTIONS[step];
  const isLast = step === TOTAL - 1;

  function update(name, value) {
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: false }));
  }

  function validateStep(index) {
    const next = {};
    for (const f of SECTIONS[index].fields) {
      if (f.required && String(values[f.name] || "").trim() === "") next[f.name] = true;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function goToStep(index) {
    setSubmitError("");
    setErrors({});
    setStep(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleNext() {
    if (!validateStep(step)) return;
    const next = Math.min(step + 1, TOTAL - 1);
    setMaxReached((m) => Math.max(m, next));
    goToStep(next);
  }

  function handleBack() {
    goToStep(Math.max(step - 1, 0));
  }

  async function handleSubmit() {
    if (!validateStep(step)) return;
    setSubmitError("");
    setStatus("sending");
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Submission failed.");
      setStatus("done");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setSubmitError(err.message);
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="shell">
        <Rail step={step} maxReached={maxReached} onJump={() => {}} />
        <main className="main">
          <div className="success" role="status">
            <div className="check">✓</div>
            <h2>Application received</h2>
            <p>
              Thanks for applying to Ryze Agency. Our team has been notified and will review
              your application. If it’s a match, we’ll reach out using the contact details
              you provided.
            </p>
          </div>
        </main>
      </div>
    );
  }

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="shell">
      <Rail step={step} maxReached={maxReached} onJump={goToStep} />

      <main className="main">
        <div className="step-panel">
          <div className="fade-step" key={step}>
            <div className="panel-head">
              <span className="count">
                Step {step + 1} of {TOTAL}
              </span>
              <h1>{current.title}</h1>
              <p>{descriptions[current.id]}</p>
            </div>

            {(hasErrors || submitError) && (
              <div className="banner error">
                {submitError || "Please complete the required fields marked below."}
              </div>
            )}

            <div className="grid">
              {current.fields.map((field) => (
                <Field
                  key={field.name}
                  field={field}
                  value={values[field.name]}
                  invalid={!!errors[field.name]}
                  onChange={update}
                />
              ))}
            </div>

            <div className="nav">
              {step > 0 ? (
                <button type="button" className="btn btn-ghost" onClick={handleBack}>
                  Back
                </button>
              ) : (
                <span />
              )}
              <span className="spacer" />
              {isLast ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSubmit}
                  disabled={status === "sending"}
                >
                  {status === "sending" ? "Submitting…" : "Submit application"}
                </button>
              ) : (
                <button type="button" className="btn btn-primary" onClick={handleNext}>
                  Continue
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const descriptions = {
  applicant: "The essentials so we can identify and reach you. Fields marked * are required.",
  education: "Where you studied. Leave blank anything that doesn’t apply to you.",
  employment: "Your most recent or relevant role. This section is optional.",
  military: "Complete only if you’ve served. Otherwise, skip ahead.",
  references: "Someone who can speak to your work. Optional, but it helps.",
};

function Rail({ step, maxReached, onJump }) {
  return (
    <aside className="rail">
      <div className="brand">
        <span className="brand-mark">
          <img src="https://ryzeagency.com/wp-content/uploads/2024/05/ryze-logo-300px.png" alt="Ryze Logo">
        </span>
        <span className="brand-tag">Careers</span>
      </div>

      <div className="rail-head">
        <span className="kicker">Employment Application</span>
        <h2>A few steps to introduce yourself.</h2>
      </div>

      <ol className="stepper">
        {SECTIONS.map((section, i) => {
          const state = i === step ? "active" : i < step ? "done" : "upcoming";
          const reached = i <= maxReached;
          const cls =
            "step-item" +
            (state === "active" ? " active" : "") +
            (state === "done" ? " done" : "") +
            (i <= step ? " filled" : "") +
            (reached && i !== step ? " clickable" : "");
          return (
            <li key={section.id}>
              <button
                type="button"
                className={cls}
                onClick={() => reached && onJump(i)}
                disabled={!reached}
              >
                <span className="dot">{i < step ? "✓" : i + 1}</span>
                <span className="step-label">
                  <span className="s-kicker">Step {i + 1}</span>
                  <span className="s-name">{section.title}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="rail-foot">
        Ryze Agency is an equal opportunity employer. We consider all applicants without
        regard to protected status.
      </div>

      {/* Mobile-only compact progress */}
      <div className="mobile-progress">
        <div className="mp-row">
          <span className="mp-step">{SECTIONS[step].title}</span>
          <span className="mp-count">
            Step {step + 1} of {SECTIONS.length}
          </span>
        </div>
        <div className="mp-track">
          <div
            className="mp-fill"
            style={{ width: `${((step + 1) / SECTIONS.length) * 100}%` }}
          />
        </div>
      </div>
    </aside>
  );
}

function Field({ field, value, invalid, onChange }) {
  const span = field.span || 12;
  const required = !!field.required;

  return (
    <div className="field" style={{ gridColumn: `span ${span}` }}>
      <label className="flabel" htmlFor={field.name}>
        {field.label}
        {required && <span className="star">*</span>}
      </label>

      {field.type === "radio" ? (
        <div className="segmented" role="radiogroup" aria-label={field.label}>
          {["Yes", "No"].map((opt) => (
            <div className="opt" key={opt}>
              <input
                type="radio"
                id={`${field.name}-${opt}`}
                name={field.name}
                value={opt}
                checked={value === opt}
                onChange={(e) => onChange(field.name, e.target.value)}
              />
              <label htmlFor={`${field.name}-${opt}`}>{opt}</label>
            </div>
          ))}
        </div>
      ) : (
        <input
          className={"input" + (invalid ? " invalid" : "")}
          id={field.name}
          name={field.name}
          type={field.type === "date" ? "date" : field.type}
          inputMode={field.type === "number" ? "numeric" : undefined}
          value={value}
          onChange={(e) => onChange(field.name, e.target.value)}
          placeholder={placeholderFor(field)}
        />
      )}
    </div>
  );
}

function placeholderFor(field) {
  if (field.type === "number" && (field.label === "From" || field.label === "To")) return "Year";
  if (field.name.toLowerCase().includes("salary")) return "USD";
  return "";
}
