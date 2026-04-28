import { useState } from "react";
import { predictPCOS } from "../api/pcosApi";
import { saveTrackerEntry } from "../api/trackerApi";

function PredictionForm({ setResult, user }) {
  const [formData, setFormData] = useState({
    age: "",
    weight: "",
    height: "",
    waist: "",
    hip: "",
    cycle_regular: "Regular",
    cycle_length: "",
    weight_gain: "No",
    hair_growth: "No",
    skin_darkening: "No",
    hair_loss: "No",
    pimples: "No",
    regular_exercise: "Yes",
    fast_food: "No",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const finalData = {
      ...formData,
      age: Number(formData.age),
      weight: Number(formData.weight),
      height: Number(formData.height),
      waist: Number(formData.waist),
      hip: Number(formData.hip),
      cycle_length: Number(formData.cycle_length),
    };

    try {
      const prediction = await predictPCOS(finalData);

      const fullResult = {
        ...prediction,
        input_data: finalData,
        tracked_at: new Date().toLocaleString(),
      };

      // 🔥 IMPORTANT FIX: ensure user exists
      if (!user || !user.id) {
        alert("User not logged in properly. Please login again.");
        console.error("User missing:", user);
        setResult(fullResult); // still show result
        setLoading(false);
        return;
      }

      // Save to Supabase
      await saveTrackerEntry({
        user_id: user.id,

        age: finalData.age,
        weight: finalData.weight,
        height: finalData.height,
        waist: finalData.waist,
        hip: finalData.hip,

        cycle_regular: finalData.cycle_regular,
        cycle_length: finalData.cycle_length,

        weight_gain: finalData.weight_gain,
        hair_growth: finalData.hair_growth,
        skin_darkening: finalData.skin_darkening,
        hair_loss: finalData.hair_loss,
        pimples: finalData.pimples,
        regular_exercise: finalData.regular_exercise,
        fast_food: finalData.fast_food,

        bmi: prediction.bmi,
        waist_hip_ratio: prediction.waist_hip_ratio,

        pcos_risk: prediction.pcos_risk,
        risk_score: prediction.risk_score,
        probability: prediction.probability,
        risk_level: prediction.risk_level,
      });

      setResult(fullResult);
    } catch (error) {
      alert("Prediction failed. Please check backend connection.");
      console.error(error);
    }

    setLoading(false);
  };

  return (
    <div className="card">
      <h2>PCOS Risk Prediction</h2>
      <p className="section-subtitle">
        Enter your basic health and symptom details to predict PCOS risk.
      </p>

      <form onSubmit={handleSubmit} className="form-grid">
        <input
          type="number"
          name="age"
          placeholder="Age"
          value={formData.age}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="weight"
          placeholder="Weight (kg)"
          value={formData.weight}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="height"
          placeholder="Height (cm)"
          value={formData.height}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="waist"
          placeholder="Waist (inch)"
          value={formData.waist}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="hip"
          placeholder="Hip (inch)"
          value={formData.hip}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="cycle_length"
          placeholder="Cycle length (days)"
          value={formData.cycle_length}
          onChange={handleChange}
          required
        />

        <label>
          Cycle Regularity
          <select
            name="cycle_regular"
            value={formData.cycle_regular}
            onChange={handleChange}
          >
            <option>Regular</option>
            <option>Irregular</option>
          </select>
        </label>

        <label>
          Weight Gain
          <select
            name="weight_gain"
            value={formData.weight_gain}
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
            value={formData.hair_growth}
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
            value={formData.skin_darkening}
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
            value={formData.hair_loss}
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
            value={formData.pimples}
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
            value={formData.regular_exercise}
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
            value={formData.fast_food}
            onChange={handleChange}
          >
            <option>Yes</option>
            <option>No</option>
          </select>
        </label>

        <button type="submit" className="predict-btn">
          {loading ? "Predicting..." : "Predict PCOS Risk"}
        </button>
      </form>
    </div>
  );
}

export default PredictionForm;