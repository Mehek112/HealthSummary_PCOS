function PredictionResult({ result, onGoToDashboard }) {
  if (!result) return null;

  return (
    <div className="card">
      <h2>Prediction Result</h2>

      {result.pcos_risk ? (
        <p className="risk-text high">PCOS Positive / Risk Detected</p>
      ) : (
        <p className="risk-text low">PCOS Negative / Low Risk</p>
      )}

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

      <p className="note">
        This is a pre-clinic risk assessment and not a medical diagnosis.
      </p>

      <button className="predict-btn" onClick={onGoToDashboard}>
        Go to AI Dashboard
      </button>
    </div>
  );
}

export default PredictionResult;