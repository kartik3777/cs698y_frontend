import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./App.css";

// Tooltip helper
const InfoTooltip = ({ text }) => (
  <span className="tooltip-container">
    <span className="tooltip-icon">ⓘ</span>
    <span className="tooltip-text">{text}</span>
  </span>
);

export default function App() {
  const [formData, setFormData] = useState({
    applicationOrder: 1,
    inflationRate: 2.5,
    applicationMode: 5,
    GDP: 1.8,
    unemploymentRate: 7.4,
    course: 9500,
    cu1Evaluations: 6,
    cu2Evaluations: 5,
    ageAtEnrollment: 20,
    admissionGrade: 145,
    cu1Approved: 5,
    cu1Grade: 13.5,
    cu2Grade: 14,
    cu2Approved: 4,
  });

  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [modelInfo, setModelInfo] = useState("");
  const [fairness, setFairness] = useState({
  accuracy: 0.86,
  f1: 0.86,
  dpr_before: 0.72,
  dpr_after: 0.84,
});


  useEffect(() => {
    setModelInfo(
      "This model predicts whether a student is likely to Dropout or Graduate based on academic, economic, and course-related factors. Hover over ⓘ icons for help with each input."
    );
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePredict = async () => {
    setLoading(true);
    setPrediction(null);

    const payload = {
      "Application order": Number(formData.applicationOrder),
      "Inflation rate": Number(formData.inflationRate),
      "Application mode": Number(formData.applicationMode),
      "GDP": Number(formData.GDP),
      "Unemployment rate": Number(formData.unemploymentRate),
      "Course": Number(formData.course),
      "Curricular units 1st sem (evaluations)": Number(formData.cu1Evaluations),
      "Curricular units 2nd sem (evaluations)": Number(formData.cu2Evaluations),
      "Age at enrollment": Number(formData.ageAtEnrollment),
      "Admission grade": Number(formData.admissionGrade),
      "Curricular units 1st sem (approved)": Number(formData.cu1Approved),
      "Curricular units 1st sem (grade)": Number(formData.cu1Grade),
      "Curricular units 2nd sem (grade)": Number(formData.cu2Grade),
      "Curricular units 2nd sem (approved)": Number(formData.cu2Approved),
    };

    try {
      const response = await axios.post("https://cs698-a3-3.onrender.com/predict", payload);
      setPrediction(response.data[0]);
      console.log('====================================');
      console.log(response.data[0]);
      console.log('====================================');
    } catch (error) {
      console.error("Error calling prediction API:", error);
      alert("Failed to get prediction. Please check console for details.");
    } finally {
      setLoading(false);
    }
  };

  // Optional tooltips for each input (can be customized)
  const tooltips = {
    applicationOrder: "The order in which the student submitted the application.",
    inflationRate: "Current inflation rate (%) affecting tuition and economy.",
    applicationMode: "Mode of application (e.g., online, in-person).",
    GDP: "GDP growth rate (%) of the country.",
    unemploymentRate: "Unemployment rate (%) in the country.",
    course: "Total course fee in USD.",
    cu1Evaluations: "Number of evaluations in the 1st semester.",
    cu2Evaluations: "Number of evaluations in the 2nd semester.",
    ageAtEnrollment: "Student's age at the time of enrollment.",
    admissionGrade: "Grade at admission (e.g., high school grade).",
    cu1Approved: "Number of 1st semester units approved.",
    cu1Grade: "Average grade for 1st semester units.",
    cu2Grade: "Average grade for 2nd semester units.",
    cu2Approved: "Number of 2nd semester units approved.",
  };
   const explanationRef = useRef(null);

  const handleScrollToExplanation = () => {
    explanationRef.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="container">
      <header>
        <h1>🎓 Student Outcome Predictor</h1>
        <p className="subtitle">Predict student success using economic and academic data.</p>
      </header>

      <main className="main-content">
        <div className="input-section">
          <div className="card">
            <h2>Enter Student & Course Details</h2>
            <div className="form-grid">
              {Object.entries(formData).map(([key, value]) => (
                <div className="form-group" key={key}>
                  <label>
                    {key.replace(/([A-Z])/g, " $1")}
                    {tooltips[key] && <InfoTooltip text={tooltips[key]} />}
                  </label>
                  <input
                    type="number"
                    name={key}
                    value={value}
                    onChange={handleChange}
                  />
                </div>
              ))}
            </div>
            <button className="predict-btn" onClick={handlePredict} disabled={loading}>
              {loading ? "Analyzing..." : "Predict Outcome"}
            </button>
          </div>
        </div>

        <div className="output-section">
          {loading && (
            <div className="card loading-card">
              <div className="spinner"></div>
              <p>Running the model...</p>
            </div>
          )}

          {prediction && (
            <div className="card result-card">
              <h2>Prediction Result</h2>
              <div className={`outcome-header ${prediction.prediction_label.toLowerCase()}`}>
                <span className="outcome-icon">
                  {prediction.prediction_label === "Graduate" ? "✅" : "❌"}
                </span>
                <p className="outcome-text">
                  This student is likely to <strong>{prediction.prediction_label}</strong>
                </p>
              </div>
              <div className="confidence-section">
                <label>Confidence Score</label>
                <div className="confidence-bar-container">
                  <div
                    className="confidence-bar-fill"
                    style={{ width: `${prediction.probability * 100}%` }}
                  ></div>
                </div>
                <span>{(prediction.probability * 100).toFixed(1)}%</span>
              </div>
            </div>
          )}

          <div className="card info-card">
            <h2>ℹ️ About This Model</h2>
            <p>{modelInfo}</p>
          </div>

          {fairness && (
  <div className="card fairness-card">
    <h2>Model Performance & Fairness</h2>
    <div className="metrics-grid">
      <div className="metric-item">
        <p>
          Accuracy <InfoTooltip text="The percentage of predictions the model got right overall." />
        </p>
        <p className="metric-value">{(fairness.accuracy * 100).toFixed(1)}%</p>
      </div>
      <div className="metric-item">
        <p>
          F1-Score <InfoTooltip text="A balanced measure of the model's performance, especially useful when the number of graduates and dropouts is uneven." />
        </p>
        <p className="metric-value">{(fairness.f1 * 100).toFixed(1)}%</p>
      </div>
      <div className="metric-item">
        <p>
          Bias Before Fix <InfoTooltip text="A fairness score before our improvements. A value far from 1.0 indicates significant bias between groups." />
        </p>
        <p className="metric-value red-text">{fairness.dpr_before.toFixed(2)}</p>
      </div>
      <div className="metric-item">
        <p>
          Bias After Fix <InfoTooltip text="The fairness score after our improvements. The goal is to be closer to 1.0, which means fairer outcomes for everyone." />
        </p>
        <p className="metric-value green-text">{fairness.dpr_after.toFixed(2)}</p>
      </div>
    </div>
  </div>
)}
    
   <button onClick={handleScrollToExplanation} className="explanation-btn">
        See explanation
      </button>

      {/* Some spacing or main content here */}
      <div style={{ height: "50px" }}></div>

      {/* The explanation section */}
      

          
        </div>
      </main>
      <div ref={explanationRef} className="explanation-section">
  <h1>🎓 Student Dropout Prediction — Model Transparency & Explainability</h1>

  <p>
    This project uses <em>XGBoost (Extreme Gradient Boosting)</em> to predict the likelihood
    of a student <em>graduating or dropping out</em> based on selected academic and socio-economic features.
  </p>
  <p>
    It focuses on <strong>transparency, fairness, and explainability</strong> — helping educators understand why each prediction is made.
  </p>
  <hr />

  <h2>🧠 Overview: What XGBoost Does</h2>
  <p>
    XGBoost is a machine-learning algorithm that builds an <em>ensemble of small decision trees</em>,
    where each new tree learns to <em>correct the errors</em> made by the previous ones.
  </p>
  <p>Each tree looks for simple patterns like:</p>
  <blockquote>
    “If admission grade is high and most courses are approved → higher chance of graduation.”
  </blockquote>
  <p>All trees then combine their “votes” to produce the final probability that a student will graduate.</p>
  <hr />

  <h2>🌳 How the Model Learns (Step by Step)</h2>

  <h3>1️⃣ Building Trees</h3>
  <p>
    XGBoost builds <em>T</em> trees <em>f₁, f₂, ..., f_T</em>, each contributing a small adjustment to the prediction:
  </p>
  <pre>{`ŷ_i = Σ_{t=1}^{T} f_t(x_i)`}</pre>
  <p>Each f_t is a decision tree, trained to reduce the model’s overall prediction error.</p>
  <hr />

  <h3>2️⃣ Objective Function</h3>
  <p>
    XGBoost minimizes an objective function that balances accuracy and simplicity:
  </p>
  <pre>{`Obj = Σ_{i=1}^{n} l(y_i, ŷ_i) + Σ_{t=1}^{T} Ω(f_t)`}</pre>
  <p>Where:</p>
  <ul>
    <li>l(y_i, ŷ_i) → how wrong the prediction is (loss)</li>
    <li>Ω(f_t) → penalty for overly complex trees (regularization)</li>
  </ul>

  <hr />

  <h3>3️⃣ Using Gradients and Hessians</h3>
  <p>
    To grow each tree efficiently, XGBoost uses a second-order Taylor expansion of the loss function:
  </p>
  <pre>{`Obj^(t) ≈ Σ_i [ l(y_i, ŷ_i^(t-1)) + g_i f_t(x_i) + 0.5 h_i f_t^2(x_i) ] + Ω(f_t)`}</pre>
  <p>Where g_i = ∂l/∂ŷ_i (gradient), h_i = ∂²l/∂ŷ_i² (hessian)</p>

  <hr />

  <h3>4️⃣ Leaf Weights and Tree Splits</h3>
  <pre>{`w_j* = - Σ_{i∈j} g_i / (Σ_{i∈j} h_i + λ)`}</pre>
  <p>Choose splits that give the highest gain in reducing error:</p>
  <pre>{`Gain = 0.5 [ (Σ_{i∈L} g_i)^2/(Σ_{i∈L} h_i + λ) + (Σ_{i∈R} g_i)^2/(Σ_{i∈R} h_i + λ) - (Σ_{i∈L∪R} g_i)^2/(Σ_{i∈L∪R} h_i + λ) ] - γ`}</pre>

  <hr />

  <h3>5️⃣ Updating the Model</h3>
  <pre>{`ŷ_i^(t) = ŷ_i^(t-1) + η f_t(x_i)`}</pre>
  <p>η (learning rate) controls how much each new tree influences the final outcome.</p>

  <hr />

  <h2>📊 Making a Prediction</h2>
  <ol>
    <li>Student data x is passed through all trees.</li>
    <li>Each tree outputs a small “vote” or weight.</li>
    <li>All votes are added: <pre>{`ŷ_raw = Σ_{t=1}^{T} f_t(x)`}</pre></li>
    <li>Converted into probability using sigmoid: <pre>{`p = 1 / (1 + e^{-ŷ_raw})`}</pre></li>
    <li>If p > 0.5 → Graduate, else → Dropout</li>
  </ol>

  <hr />

  <h2>💬 In Human Terms</h2>
  <ul>
    <li>Each tree is like a teacher giving advice based on certain rules.</li>
    <li>The model combines all advice into one balanced decision.</li>
    <li>It optimizes for accuracy while keeping itself simple and fair.</li>
    <li>The final number is a probability — a measure of confidence, not certainty.</li>
  </ul>
</div>

    </div>
  );
}
