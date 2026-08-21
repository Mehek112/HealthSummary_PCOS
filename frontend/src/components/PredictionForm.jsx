
import { useState } from "react";
import { predictPCOS } from "../api/pcosApi";
import { saveTrackerEntry } from "../api/trackerApi";
import { RotateCcw } from "lucide-react";

import {
  User,
  Activity,
  HeartPulse,
  Dumbbell,
  Shield,
  Zap,
  CircleHelp,
} from "lucide-react";

import { FaFemale } from "react-icons/fa";
import "./PredictionForm.css";

function PredictionForm({setResult,user,onLogout,result}) {
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

  const handleReset = () => {
    setFormData({
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

      if (!user || !user.id) {
        alert("User not logged in properly.");
        setResult(fullResult);
        setLoading(false);
        return;
      }

      await saveTrackerEntry({
        user_id: user.id,
        ...finalData,
        bmi: prediction.bmi,
        waist_hip_ratio: prediction.waist_hip_ratio,
        pcos_risk: prediction.pcos_risk,
        risk_score: prediction.risk_score,
        probability: prediction.probability,
        risk_level: prediction.risk_level,
      });

      setResult(fullResult);
    } catch (error) {
      alert("Prediction failed.");
      console.error(error);
    }

    setLoading(false);
  };

  return (
  <div className="prediction-page">
   

    <div className="prediction-grid">

      {/* LEFT PANEL */}
      <div className="prediction-card">
        <h1 className="prediction-title">
          PCOS Risk Assessment
        </h1>

        <p className="prediction-subtitle">
          Fill in your health details to receive an
          AI-powered prediction.
        </p>

        <form onSubmit={handleSubmit}>

          {/* Profile */}
          <div className="section-header">
            <User size={20} />
            <h2>Profile & Measurements</h2>
          </div>

          <div className="input-grid">

            <div className="field-group">
              <label>Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field-group">
              <label>Weight (kg)</label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field-group">
              <label>Height (cm)</label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field-group">
              <label>Waist (inch)</label>
              <input
                type="number"
                name="waist"
                value={formData.waist}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field-group">
              <label>Hip (inch)</label>
              <input
                type="number"
                name="hip"
                value={formData.hip}
                onChange={handleChange}
                required
              />
            </div>

          </div>

          {/* Menstrual */}

          <div className="section-header">
            <Activity size={20} />
            <h2>Menstrual History</h2>
          </div>

          <div className="input-grid">

            <div className="field-group">
              <label>Cycle Regularity</label>
              <select
                name="cycle_regular"
                value={formData.cycle_regular}
                onChange={handleChange}
              >
                <option>Regular</option>
                <option>Irregular</option>
              </select>
            </div>

            <div className="field-group">
              <label>Cycle Length (days)</label>
              <input
                type="number"
                name="cycle_length"
                value={formData.cycle_length}
                onChange={handleChange}
                required
              />
            </div>

          </div>

          {/* Symptoms */}

          <div className="section-header">
            <HeartPulse size={20} />
            <h2>Clinical Signs & Symptoms</h2>
          </div>

          <div className="symptom-grid">

            <div className="field-group">
              <label>Weight Gain</label>
              <select
                name="weight_gain"
                value={formData.weight_gain}
                onChange={handleChange}
              >
                <option>No</option>
                <option>Yes</option>
              </select>
            </div>

            <div className="field-group">
              <label>Hair Growth</label>
              <select
                name="hair_growth"
                value={formData.hair_growth}
                onChange={handleChange}
              >
                <option>No</option>
                <option>Yes</option>
              </select>
            </div>

            <div className="field-group">
              <label>Skin Darkening</label>
              <select
                name="skin_darkening"
                value={formData.skin_darkening}
                onChange={handleChange}
              >
                <option>No</option>
                <option>Yes</option>
              </select>
            </div>

            <div className="field-group">
              <label>Hair Loss</label>
              <select
                name="hair_loss"
                value={formData.hair_loss}
                onChange={handleChange}
              >
                <option>No</option>
                <option>Yes</option>
              </select>
            </div>

            <div className="field-group">
              <label>Pimples</label>
              <select
                name="pimples"
                value={formData.pimples}
                onChange={handleChange}
              >
                <option>No</option>
                <option>Yes</option>
              </select>
            </div>

          </div>

          {/* Lifestyle */}

          <div className="section-header">
            <Dumbbell size={20} />
            <h2>Lifestyle Habits</h2>
          </div>

          <div className="input-grid">

            <div className="field-group">
              <label>Regular Exercise</label>
              <select
                name="regular_exercise"
                value={formData.regular_exercise}
                onChange={handleChange}
              >
                <option>Yes</option>
                <option>No</option>
              </select>
            </div>

            <div className="field-group">
              <label>Fast Food</label>
              <select
                name="fast_food"
                value={formData.fast_food}
                onChange={handleChange}
              >
                <option>No</option>
                <option>Yes</option>
              </select>
            </div>

          </div>

          <div className="button-row">
            <button
              className="predict-btn"
              type="submit"
            >
              <Zap size={18} />
              {loading
                ? "Predicting..."
                : "Predict PCOS"}
            </button>
            <button
              type="button"
              className="reset-btn"
              onClick={handleReset}
            >
              
              Reset
            </button>
          </div>

        </form>
      </div>

      {/* RIGHT PANEL */}

      <div className="sidebar-card">
        <div className="illustration">
          <FaFemale />
        </div>

        <h3>
          <CircleHelp size={20} />
          Why we ask this?
        </h3>

        <p>
          We review your metabolic, lifestyle,
          and habit statistics to generate
          immediate health trends and estimate
          your PCOS risk.
        </p>

        <div className="badges">
         
          <span>AI-Driven Analysis</span>
        </div>

        <div className="privacy-card">
          <Shield />

          <div>
            <h4>
              Your data is private and secure.
            </h4>

            <p>
              Information remains confidential
              and is only used to generate your
              assessment.
            </p>
          </div>
        </div>
      </div>

    </div>
  </div>
);

}

export default PredictionForm;