import { useEffect, useState } from "react";
import { predictPCOS } from "../api/pcosApi";
import { saveTrackerEntry } from "../api/trackerApi";

function SymptomTracker({ result, user, history, setHistory }) {
  const [currentEntry, setCurrentEntry] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (history && history.length > 0) {
      const latest = history[0];

      setCurrentEntry({
        ...latest,
        date: new Date(latest.created_at).toLocaleString(),
      });
    } else if (result?.input_data) {
      setCurrentEntry({
        date: result.tracked_at,
        ...result.input_data,
        risk_score: result.risk_score,
        risk_level: result.risk_level,
        pcos_risk: result.pcos_risk,
        bmi: result.bmi,
        waist_hip_ratio: result.waist_hip_ratio,
      });
    }
  }, [history, result]);

  const handleChange = (e) => {
    setCurrentEntry({
      ...currentEntry,
      [e.target.name]: e.target.value,
    });
  };

  const getUpdatedSymptoms = (entry) => {
    const symptoms = [];

    if (entry.cycle_regular === "Irregular") symptoms.push("Irregular cycle");
    if (entry.weight_gain === "Yes") symptoms.push("Weight gain");
    if (entry.hair_growth === "Yes") symptoms.push("Excess hair growth");
    if (entry.skin_darkening === "Yes") symptoms.push("Skin darkening");
    if (entry.hair_loss === "Yes") symptoms.push("Hair loss");
    if (entry.pimples === "Yes") symptoms.push("Pimples / acne");
    if (entry.regular_exercise === "No") symptoms.push("No regular exercise");
    if (entry.fast_food === "Yes") symptoms.push("Fast food habit");

    return symptoms;
  };

  const saveUpdatedEntry = async () => {
    if (!currentEntry || !user?.id) return;

    setLoading(true);

    const updatedInput = {
      age: Number(currentEntry.age),
      weight: Number(currentEntry.weight),
      height: Number(currentEntry.height),
      waist: Number(currentEntry.waist),
      hip: Number(currentEntry.hip),
      cycle_regular: currentEntry.cycle_regular,
      cycle_length: Number(currentEntry.cycle_length),
      weight_gain: currentEntry.weight_gain,
      hair_growth: currentEntry.hair_growth,
      skin_darkening: currentEntry.skin_darkening,
      hair_loss: currentEntry.hair_loss,
      pimples: currentEntry.pimples,
      regular_exercise: currentEntry.regular_exercise,
      fast_food: currentEntry.fast_food,
    };

    try {
      const newPrediction = await predictPCOS(updatedInput);

      const savedRows = await saveTrackerEntry({
        user_id: user.id,

        age: updatedInput.age,
        weight: updatedInput.weight,
        height: updatedInput.height,
        waist: updatedInput.waist,
        hip: updatedInput.hip,

        cycle_regular: updatedInput.cycle_regular,
        cycle_length: updatedInput.cycle_length,

        weight_gain: updatedInput.weight_gain,
        hair_growth: updatedInput.hair_growth,
        skin_darkening: updatedInput.skin_darkening,
        hair_loss: updatedInput.hair_loss,
        pimples: updatedInput.pimples,
        regular_exercise: updatedInput.regular_exercise,
        fast_food: updatedInput.fast_food,

        bmi: newPrediction.bmi,
        waist_hip_ratio: newPrediction.waist_hip_ratio,

        pcos_risk: newPrediction.pcos_risk,
        risk_score: newPrediction.risk_score,
        probability: newPrediction.probability,
        risk_level: newPrediction.risk_level,
      });

      const savedEntry = savedRows[0];

      setHistory([savedEntry, ...history]);

      setCurrentEntry({
        ...savedEntry,
        date: new Date(savedEntry.created_at).toLocaleString(),
      });

      alert("Updated symptoms saved and risk score recalculated.");
    } catch (error) {
      alert("Could not recalculate risk. Please check backend connection.");
      console.error(error);
    }

    setLoading(false);
  };

  if (!currentEntry) return null;

  return (
    <div className="card dashboard-card">
      <h3>Symptom & Input Tracker</h3>
      <p className="section-subtitle">
        Update symptoms over time and recalculate the PCOS risk score based on
        the latest inputs.
      </p>

      <div className="result-box">
        <h3>Current Tracking Update</h3>

        <div className="summary-grid">
          <div className="summary-box">
            <span>Current Risk</span>
            <h2>{currentEntry.risk_score}%</h2>
          </div>

          <div className="summary-box">
            <span>Risk Level</span>
            <h2>{currentEntry.risk_level}</h2>
          </div>

          <div className="summary-box">
            <span>BMI</span>
            <h2>{currentEntry.bmi}</h2>
          </div>
        </div>
      </div>

      <div className="form-grid">
        <label>
          Cycle Regularity
          <select
            name="cycle_regular"
            value={currentEntry.cycle_regular || "Regular"}
            onChange={handleChange}
          >
            <option>Regular</option>
            <option>Irregular</option>
          </select>
        </label>

        <label>
          Cycle Length
          <input
            type="number"
            name="cycle_length"
            value={currentEntry.cycle_length || ""}
            onChange={handleChange}
          />
        </label>

        <label>
          Weight
          <input
            type="number"
            name="weight"
            value={currentEntry.weight || ""}
            onChange={handleChange}
          />
        </label>

        <label>
          Weight Gain
          <select
            name="weight_gain"
            value={currentEntry.weight_gain || "No"}
            onChange={handleChange}
          >
            <option>Yes</option>
            <option>No</option>
          </select>
        </label>

        <label>
          Excess Hair Growth
          <select
            name="hair_growth"
            value={currentEntry.hair_growth || "No"}
            onChange={handleChange}
          >
            <option>Yes</option>
            <option>No</option>
          </select>
        </label>

        <label>
          Skin Darkening
          <select
            name="skin_darkening"
            value={currentEntry.skin_darkening || "No"}
            onChange={handleChange}
          >
            <option>Yes</option>
            <option>No</option>
          </select>
        </label>

        <label>
          Hair Loss
          <select
            name="hair_loss"
            value={currentEntry.hair_loss || "No"}
            onChange={handleChange}
          >
            <option>Yes</option>
            <option>No</option>
          </select>
        </label>

        <label>
          Pimples / Acne
          <select
            name="pimples"
            value={currentEntry.pimples || "No"}
            onChange={handleChange}
          >
            <option>Yes</option>
            <option>No</option>
          </select>
        </label>

        <label>
          Regular Exercise
          <select
            name="regular_exercise"
            value={currentEntry.regular_exercise || "Yes"}
            onChange={handleChange}
          >
            <option>Yes</option>
            <option>No</option>
          </select>
        </label>

        <label>
          Fast Food Habit
          <select
            name="fast_food"
            value={currentEntry.fast_food || "No"}
            onChange={handleChange}
          >
            <option>Yes</option>
            <option>No</option>
          </select>
        </label>

        <button className="predict-btn" onClick={saveUpdatedEntry}>
          {loading ? "Updating..." : "Save Update & Recalculate Risk"}
        </button>
      </div>

      <div className="result-box">
        <h3>Recent Tracking History</h3>

        {history.length === 0 ? (
          <p>No tracking history available yet.</p>
        ) : (
          <div style={{ display: "grid", gap: "14px", marginTop: "15px" }}>
            {history.slice(0, 5).map((entry, index) => {
              const updatedSymptoms = getUpdatedSymptoms(entry);

              return (
                <div
                  key={index}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #eadff4",
                    borderRadius: "14px",
                    padding: "16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "12px",
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <p style={{ margin: "0 0 6px" }}>
                        <strong>
                          {new Date(entry.created_at).toLocaleString()}
                        </strong>
                      </p>
                      <p style={{ margin: 0 }}>
                        <strong>Risk Level:</strong> {entry.risk_level}
                      </p>
                    </div>

                    <div
                      style={{
                        background: entry.pcos_risk ? "#fdecea" : "#eaf7ef",
                        color: entry.pcos_risk ? "#c0392b" : "#1e8449",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        fontWeight: "bold",
                      }}
                    >
                      {entry.risk_score}%
                    </div>
                  </div>

                  <div style={{ marginTop: "12px" }}>
                    <strong>Updated Symptoms:</strong>

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "8px",
                        marginTop: "8px",
                      }}
                    >
                      {updatedSymptoms.length > 0 ? (
                        updatedSymptoms.map((symptom, i) => (
                          <span
                            key={i}
                            style={{
                              background: "#f1e9fb",
                              color: "#5a2d82",
                              padding: "7px 10px",
                              borderRadius: "20px",
                              fontSize: "14px",
                            }}
                          >
                            {symptom}
                          </span>
                        ))
                      ) : (
                        <span
                          style={{
                            background: "#eaf7ef",
                            color: "#1e8449",
                            padding: "7px 10px",
                            borderRadius: "20px",
                            fontSize: "14px",
                          }}
                        >
                          No major symptoms reported
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default SymptomTracker;