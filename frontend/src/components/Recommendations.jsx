import { useEffect, useState } from "react";

function Recommendations({ result, history }) {
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const savedData = history || [];
    if (!result) return;

    const latest = savedData[0] || result.input_data;

    const recs = [];

    // Exercise recommendations
    if (latest.regular_exercise === "No") {
      recs.push({
        type: "Exercise",
        text: "Start with light physical activity like walking or yoga for 20–30 minutes daily.",
      });
    } else {
      recs.push({
        type: "Exercise",
        text: "Continue regular exercise. Consistency helps improve hormonal balance.",
      });
    }

    // Diet recommendations
    if (latest.fast_food === "Yes") {
      recs.push({
        type: "Diet",
        text: "Reduce fast food intake and include more whole foods, vegetables, and protein-rich meals.",
      });
    } else {
      recs.push({
        type: "Diet",
        text: "Maintain a balanced diet with fiber, healthy fats, and protein.",
      });
    }

    // Weight-related
    if (latest.weight_gain === "Yes") {
      recs.push({
        type: "Weight Management",
        text: "Monitor calorie intake and consider structured meal planning to manage weight effectively.",
      });
    }

    // Cycle-related
    if (latest.cycle_regular === "Irregular") {
      recs.push({
        type: "Cycle Care",
        text: "Track your menstrual cycle regularly and consult a doctor if irregularity persists.",
      });
    }

    // Hormonal symptoms
    if (
      latest.hair_growth === "Yes" ||
      latest.pimples === "Yes" ||
      latest.hair_loss === "Yes"
    ) {
      recs.push({
        type: "Hormonal Care",
        text: "Consider consulting a healthcare professional for hormone-related symptoms.",
      });
    }

    // Skin/metabolic
    if (latest.skin_darkening === "Yes") {
      recs.push({
        type: "Metabolic Health",
        text: "Skin darkening may indicate insulin resistance. Focus on diet and regular activity.",
      });
    }

    // Risk-based recommendation
    if (result.risk_score >= 75) {
      recs.push({
        type: "Medical Advice",
        text: "Your risk score is high. It is recommended to consult a gynecologist or endocrinologist.",
      });
    } else if (result.risk_score >= 40) {
      recs.push({
        type: "Preventive Care",
        text: "Moderate risk detected. Regular monitoring and lifestyle improvements are advised.",
      });
    } else {
      recs.push({
        type: "Maintenance",
        text: "Your risk is low. Continue maintaining a healthy lifestyle and track regularly.",
      });
    }

    setRecommendations(recs);
  }, [result,history]);

  return (
    <div className="card dashboard-card">
      <h3>Recommendations</h3>
      <p className="section-subtitle">
        Personalized suggestions based on your symptoms, lifestyle, and risk
        level to help you take actionable steps.
      </p>

      <div
        style={{
          display: "grid",
          gap: "14px",
          marginTop: "15px",
        }}
      >
        {recommendations.map((rec, index) => (
          <div
            key={index}
            style={{
              background: "#ffffff",
              border: "1px solid #eadff4",
              borderRadius: "14px",
              padding: "16px",
            }}
          >
            <p
              style={{
                margin: "0 0 8px",
                color: "#5a2d82",
                fontWeight: "bold",
              }}
            >
              {rec.type}
            </p>

            <p style={{ margin: 0, lineHeight: "1.6" }}>{rec.text}</p>
          </div>
        ))}
      </div>

      <p className="note">
        These are general recommendations and not a substitute for professional
        medical advice.
      </p>
    </div>
  );
}

export default Recommendations;