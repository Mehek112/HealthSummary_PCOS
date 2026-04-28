function UserHealthSummary({ result }) {
  if (!result) return null;

  return (
    <div className="card dashboard-card">
      <h2>AI Dashboard</h2>
      <h3>User Health Summary</h3>
      <p className="section-subtitle">
        Quick snapshot of your current PCOS risk and health status.
      </p>

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

      <div className="result-box">
        <h3>Prediction Result</h3>

        {result.pcos_risk ? (
          <p className="risk-text high">PCOS risk detected</p>
        ) : (
          <p className="risk-text low">Low / No PCOS risk detected</p>
        )}

        <p>
          <strong>Cycle Status:</strong> {result.cycle_status}
        </p>

        <p>
          <strong>Cycle Length:</strong> {result.cycle_length} days
        </p>

        <p>
          <strong>Waist-Hip Ratio:</strong> {result.waist_hip_ratio}
        </p>
      </div>

      <div className="symptom-box">
        <h3>Key Symptoms Summary</h3>

        {result.symptoms.length > 0 ? (
          <ul>
            {result.symptoms.map((symptom, index) => (
              <li key={index}>{symptom}</li>
            ))}
          </ul>
        ) : (
          <p>No major visible symptoms reported.</p>
        )}
      </div>

      <p className="note">{result.message}</p>
    </div>
  );
}

export default UserHealthSummary;