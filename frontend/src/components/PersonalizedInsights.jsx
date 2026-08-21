import { useEffect, useState } from "react";

function PersonalizedInsights({ result, history }) {
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    const savedData = history || [];

    if (!result) return;

    const latest = savedData[0] || result.input_data;
    const previous = savedData[1];

    const generatedInsights = [];s

    // Multi-factor PCOS risk pattern
if (
  latest.cycle_regular === "Irregular" &&
  latest.weight_gain === "Yes" &&
  latest.pimples === "Yes"
) {
  generatedInsights.push({
    type: "Combined Risk Pattern",
    text: "Irregular cycles, weight gain, and pimples together show a stronger PCOS-related symptom pattern.",
  });
}

// Lifestyle + metabolic risk pattern
if (
  latest.weight_gain === "Yes" &&
  latest.fast_food === "Yes" &&
  latest.regular_exercise === "No"
) {
  generatedInsights.push({
    type: "Lifestyle Risk Pattern",
    text: "Weight gain with frequent fast-food intake and lack of regular exercise may increase metabolic risk.",
  });
}

// Hormonal symptom cluster
if (
  latest.hair_growth === "Yes" &&
  latest.hair_loss === "Yes" &&
  latest.pimples === "Yes"
) {
  generatedInsights.push({
    type: "Hormonal Symptom Cluster",
    text: "Excess hair growth, hair loss, and pimples together may indicate a hormone-related symptom pattern.",
  });
}

// Cycle + risk trend pattern
if (
  previous &&
  latest.cycle_regular === "Irregular" &&
  Number(latest.risk_score) > Number(previous.risk_score)
) {
  generatedInsights.push({
    type: "Worsening Risk Pattern",
    text: "Your risk score has increased along with irregular cycle tracking, so continued monitoring is important.",
  });
}

// Positive improvement pattern
if (
  previous &&
  latest.regular_exercise === "Yes" &&
  Number(latest.risk_score) < Number(previous.risk_score)
) {
  generatedInsights.push({
    type: "Positive Progress",
    text: "Your risk score has reduced while regular exercise is present, which may indicate an improving profile.",
  });
}

    if (latest.cycle_regular === "Irregular" && latest.weight_gain === "Yes") {
      generatedInsights.push({
        type: "Risk Factor",
        text: "Irregular cycles combined with weight gain may increase PCOS risk.",
      });
    }

    if (latest.hair_growth === "Yes" || latest.pimples === "Yes") {
      generatedInsights.push({
        type: "Symptom Pattern",
        text: "Excess hair growth or pimples can be related to hormonal imbalance symptoms.",
      });
    }

    if (latest.skin_darkening === "Yes" && latest.weight_gain === "Yes") {
      generatedInsights.push({
        type: "Metabolic Indicator",
        text: "Skin darkening with weight gain may indicate a higher metabolic risk profile.",
      });
    }

    if (latest.regular_exercise === "Yes") {
      generatedInsights.push({
        type: "Positive Habit",
        text: "Regular exercise is a positive factor and may help improve your overall risk profile.",
      });
    } else {
      generatedInsights.push({
        type: "Lifestyle Alert",
        text: "Lack of regular exercise may contribute to increased metabolic and PCOS-related risk.",
      });
    }

    if (latest.fast_food === "Yes") {
      generatedInsights.push({
        type: "Diet Pattern",
        text: "Frequent fast-food consumption may negatively affect weight and metabolic health.",
      });
    }

    if (previous) {
      const riskChange = Number(latest.risk_score) - Number(previous.risk_score);
      const weightChange = Number(latest.weight) - Number(previous.weight);

      if (riskChange > 2) {
        generatedInsights.push({
          type: "Risk Trend",
          text: `Your risk score has increased by ${riskChange.toFixed(
            1
          )}% compared to your previous entry.`,
        });
      } else if (riskChange < -2) {
        generatedInsights.push({
          type: "Improvement",
          text: `Your risk score has reduced by ${Math.abs(riskChange).toFixed(
            1
          )}% compared to your previous entry.`,
        });
      }

      if (weightChange > 1) {
        generatedInsights.push({
          type: "Weight Trend",
          text: `Your weight has increased by ${weightChange.toFixed(
            1
          )} kg since the previous entry.`,
        });
      } else if (weightChange < -1) {
        generatedInsights.push({
          type: "Weight Trend",
          text: `Your weight has reduced by ${Math.abs(weightChange).toFixed(
            1
          )} kg since the previous entry.`,
        });
      }
    }

    if (result.risk_score >= 75) {
      generatedInsights.push({
        type: "High Risk Summary",
        text: "Your current risk score is high, so regular tracking and professional medical consultation are recommended.",
      });
    } else if (result.risk_score < 30) {
      generatedInsights.push({
        type: "Low Risk Summary",
        text: "Your current risk score is low, but continuing healthy habits and regular tracking is useful.",
      });
    }

    if (generatedInsights.length === 0) {
      generatedInsights.push({
        type: "General Insight",
        text: "Your profile does not show strong visible risk patterns at the moment. Continue tracking regularly.",
      });
    }

    setInsights(generatedInsights);
  }, [result,history]);

  return (
    <div className="card dashboard-card">
      <h3>Personalized Insights</h3>
      <p className="section-subtitle">
        Converts your symptoms, lifestyle inputs, and tracking history into
        meaningful health insights.
      </p>

      <div
        style={{
          display: "grid",
          gap: "14px",
          marginTop: "15px",
        }}
      >
        {insights.map((insight, index) => (
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
              {insight.type}
            </p>

            <p style={{ margin: 0, lineHeight: "1.6" }}>{insight.text}</p>
          </div>
        ))}
      </div>

      <p className="note">
        These insights are generated from user inputs and prediction patterns.
        They are for awareness only, not medical diagnosis.
      </p>
    </div>
  );
}

export default PersonalizedInsights;