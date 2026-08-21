
// export default PredictionResult;
import "./PredictionResult.css";
function PredictionResult({ result, onGoToDashboard }) {
  if (!result) return null;

  return (
    <div className="result-page">

      <div className="card full-width-card">

        {/* HEADER (CENTERED) */}
        <div className="result-header">
          <h2>Prediction Result</h2>

          {result.pcos_risk ? (
            <p className="risk-text high">
              PCOS Positive / Risk Detected
            </p>
          ) : (
            <p className="risk-text low">
              PCOS Negative / Low Risk
            </p>
          )}
        </div>

        {/* SUMMARY GRID */}
        <div className="summary-grid">
          <div className="summary-box">
            <span>PCOS Risk Score</span>
            <h2>{result.risk_score}%</h2>
          </div>

          <div className="summary-box">
            <span>Risk Level</span>
            <h2>{result.risk_level}</h2>
          </div>

          <div className="summary-box">
            <span>BMI</span>
            <h2>{result.bmi}</h2>
          </div>
        </div>

        {/* NOTE */}
       

        {/* ACTION BUTTON */}
        {/* <button className="predict-btn" onClick={onGoToDashboard}>
          Go to AI Dashboard
        </button> */}

      </div>

    </div>
  );
}

export default PredictionResult;