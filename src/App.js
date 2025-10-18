import React, { useState, useEffect } from "react";
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
      setPrediction(response.data);
      console.log('====================================');
      console.log(response.data);
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
              <div className={`outcome-header ${prediction.prediction.toLowerCase()}`}>
                <span className="outcome-icon">
                  {prediction.prediction === "Graduate" ? "✅" : "❌"}
                </span>
                <p className="outcome-text">
                  This student is likely to <strong>{prediction.prediction}</strong>
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


          <div className="card info-card">
            <h2>ℹ️ About This Model</h2>
            <p>{modelInfo}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
