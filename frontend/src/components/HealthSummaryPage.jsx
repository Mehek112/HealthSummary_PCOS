
import "./HealthSummaryPage.css";
import { jsPDF } from "jspdf";

import {
Activity,
AlertTriangle,
Apple,
Dumbbell,
HeartPulse,
Scale,
ShieldCheck,
Sparkles,
Stethoscope,
TrendingUp,
CalendarDays,
Ruler,
ArrowLeft,
LayoutDashboard,
Download,
} from "lucide-react";

import {
PieChart,
Pie,
Cell,
ResponsiveContainer,
} from "recharts";

import { useMemo } from "react";

export default function HealthSummaryPage({
result,
onBack,
onDashboard,
}) {
if (!result) {
return (
<div className="health-page">
<div className="empty-state">
<AlertTriangle size={70} />

<h2>No Health Data Yet</h2>

<p>
Please complete a PCOS prediction to
generate your personalized health report.
</p>
</div>
</div>
);
}

const input = result.input_data || {};
console.log("========== HEALTH SUMMARY RESULT ==========");
console.log(result);

console.log("========== XAI DATA ==========");
console.log(result.xai);

console.log("========== TOP FEATURES ==========");
console.log(result.xai?.top_features);
/* ============================================================
   XAI / SHAP TOP CONTRIBUTING FACTORS
   ============================================================ */

const topContributors = result.xai?.top_features || [];

/*
  Features that are internal engineered/model features.
  These should never be shown directly to the user.
*/
const hiddenXaiFeatures = new Set([
  "hormonal_load",
  "symptom_count",
  "cycle_severity",
  "symptom_metabolic",
  "androgenic_triad",
  "insulin_resistance_flag",
  "obese_irregular",
  "metabolic_risk",
  "cycle_risk",
  "waist_height_ratio",
  "bmi_category",
  "bmi_risk",
]);

/*
  Individual user-understandable health factors that
  are allowed to appear in the explanation.

  IMPORTANT:
  We intentionally do NOT use broad categories such as:
  - Hormonal Symptoms
  - Lifestyle
  - Metabolic Indicators
*/
// const allowedUserFeatures = new Set([
//   "age",
//   "weight",
//   "height",
//   "waist",
//   "hip",
//   "bmi",

//   "cycle_regular",
//   "cycle_length",

//   "weight_gain",
//   "hair_growth",
//   "skin_darkening",
//   "hair_loss",
//   "pimples",

//   "regular_exercise",
//   "fast_food",
// ]);

// /*
//   Convert backend feature names into clean labels.
// */
// const featureLabels = {
//   age: "Age",
//   weight: "Weight",
//   height: "Height",
//   waist: "Waist Measurement",
//   hip: "Hip Measurement",
//   bmi: "BMI",

//   cycle_regular: "Cycle Regularity",
//   cycle_length: "Cycle Length",

//   weight_gain: "Weight Gain",
//   hair_growth: "Excess Hair Growth",
//   skin_darkening: "Skin Darkening",
//   hair_loss: "Hair Loss",
//   pimples: "Pimples / Acne",

//   regular_exercise: "Regular Exercise",
//   fast_food: "Fast Food Consumption",
// };
/*
  Backend SHAP feature names are mapped to simple,
  user-friendly health factors.

  Some SHAP features are engineered/internal features
  and are intentionally excluded from the UI.
*/

const xaiFeatureMap = {
  // User-facing features returned by the backend
  "Weight gain(Y/N)": {
    key: "weight_gain",
    label: "Weight Gain",
  },

  "Reg.Exercise(Y/N)": {
    key: "regular_exercise",
    label: "Regular Exercise",
  },

  "Fast food (Y/N)": {
    key: "fast_food",
    label: "Fast Food Consumption",
  },

  "Waist:Hip Ratio": {
    key: "waist_hip_ratio",
    label: "Waist-to-Hip Ratio",
  },

  "Waist": {
    key: "waist",
    label: "Waist Measurement",
  },

  "Hip": {
    key: "hip",
    label: "Hip Measurement",
  },

  "Weight": {
    key: "weight",
    label: "Weight",
  },

  "Height": {
    key: "height",
    label: "Height",
  },

  "Age": {
    key: "age",
    label: "Age",
  },

  "BMI": {
    key: "bmi",
    label: "BMI",
  },

  "Cycle regular(Y/N)": {
    key: "cycle_regular",
    label: "Cycle Regularity",
  },

  "Cycle length": {
    key: "cycle_length",
    label: "Cycle Length",
  },

  "Hair growth(Y/N)": {
    key: "hair_growth",
    label: "Excess Hair Growth",
  },

  "Skin darkening(Y/N)": {
    key: "skin_darkening",
    label: "Skin Darkening",
  },

  "Hair loss(Y/N)": {
    key: "hair_loss",
    label: "Hair Loss",
  },

  "Pimples(Y/N)": {
    key: "pimples",
    label: "Pimples / Acne",
  },
};
/*
  Only keep:
  1. Real user-facing features
  2. Features actually present in the model explanation
  3. Non-zero SHAP contributions
*/
// const userFacingContributors = topContributors
//   .filter((item) => {
//     const feature = String(item.feature || "")
//       .trim()
//       .toLowerCase();

//     return (
//       !hiddenXaiFeatures.has(feature) &&
//       allowedUserFeatures.has(feature) &&
//       Number(item.contribution) !== 0
//     );
//   })
//   .map((item) => ({
//     ...item,
//     feature: String(item.feature).trim().toLowerCase(),
//     label:
//       featureLabels[String(item.feature).trim().toLowerCase()] ||
//       item.label ||
//       item.feature,
//   }));
const userFacingContributors = topContributors
  .filter((item) => {
    const backendFeature = String(item.feature || "").trim();

    return (
      xaiFeatureMap[backendFeature] &&
      Number(item.contribution) !== 0
    );
  })
  .map((item) => {
    const backendFeature = String(item.feature || "").trim();
    const mappedFeature = xaiFeatureMap[backendFeature];

    return {
      ...item,
      feature: mappedFeature.key,
      label: mappedFeature.label,
    };
  });

/*
  POSITIVE SHAP VALUES
  = factors that increased predicted PCOS risk.
*/
const positiveContributors = userFacingContributors
  .filter((item) => Number(item.contribution) > 0)
  .sort(
    (a, b) =>
      Number(b.contribution) - Number(a.contribution)
  )
  .slice(0, 5);

/*
  NEGATIVE SHAP VALUES
  = factors that reduced predicted PCOS risk.
*/
const negativeContributors = userFacingContributors
  .filter((item) => Number(item.contribution) < 0)
  .sort(
    (a, b) =>
      Math.abs(Number(b.contribution)) -
      Math.abs(Number(a.contribution))
  )
  .slice(0, 5);

/*
  Calculate relative contribution.

  IMPORTANT:
  These are NOT probabilities.

  Example:
  If the displayed positive SHAP contributions are:
  0.40, 0.30, 0.20, 0.10

  then the percentages become:
  40%, 30%, 20%, 10%.
*/
const positiveTotal = positiveContributors.reduce(
  (sum, item) =>
    sum + Math.abs(Number(item.contribution)),
  0
);

const negativeTotal = negativeContributors.reduce(
  (sum, item) =>
    sum + Math.abs(Number(item.contribution)),
  0
);

const positiveFactors = positiveContributors.map(
  (item) => ({
    ...item,

    relativePercentage:
      positiveTotal > 0
        ? Math.round(
            (Math.abs(Number(item.contribution)) /
              positiveTotal) *
              100
          )
        : 0,
  })
);

const negativeFactors = negativeContributors.map(
  (item) => ({
    ...item,

    relativePercentage:
      negativeTotal > 0
        ? Math.round(
            (Math.abs(Number(item.contribution)) /
              negativeTotal) *
              100
          )
        : 0,
  })
);

/*
  Human-readable influence strength.
*/
const getInfluenceLabel = (contribution) => {
  const value = Math.abs(Number(contribution));

  if (value >= 0.10) {
    return "Strong influence";
  }

  if (value >= 0.03) {
    return "Moderate influence";
  }

  return "Lower influence";
};
/* ============================================================
   EXTRACTABLE TEXT PDF REPORT
   ============================================================ */

const generateHealthSummaryPDF = () => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const margin = 18;
  const contentWidth = pageWidth - margin * 2;

  let y = 20;

  /* =========================
     HELPERS
     ========================= */

  const addPageIfNeeded = (height = 10) => {
    if (y + height > pageHeight - 18) {
      doc.addPage();
      y = 20;
    }
  };

  const addTitle = (text) => {
    addPageIfNeeded(12);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);

    doc.text(text, margin, y);

    y += 10;
  };

  const addSection = (text) => {
    addPageIfNeeded(14);

    y += 5;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);

    doc.text(text, margin, y);

    y += 7;
  };

  const addLine = (label, value) => {
    addPageIfNeeded(8);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);

    doc.text(`${label}:`, margin, y);

    doc.setFont("helvetica", "normal");

    const labelWidth = doc.getTextWidth(`${label}: `);

    doc.text(
      String(value ?? "Not available"),
      margin + labelWidth + 2,
      y
    );

    y += 6;
  };

  const addParagraph = (text) => {
    const lines = doc.splitTextToSize(
      String(text),
      contentWidth
    );

    addPageIfNeeded(lines.length * 5 + 5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    doc.text(lines, margin, y);

    y += lines.length * 5 + 4;
  };

  const addBullet = (text) => {
    const lines = doc.splitTextToSize(
      `- ${text}`,
      contentWidth - 4
    );

    addPageIfNeeded(lines.length * 5 + 3);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    doc.text(lines, margin + 2, y);

    y += lines.length * 5 + 2;
  };


  /* ============================================================
     REPORT HEADER
     ============================================================ */

  addTitle("PCOS HEALTH SUMMARY");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  doc.text(
    "AI-powered PCOS risk assessment report",
    margin,
    y
  );

  y += 5;

  doc.text(
    `Generated on: ${new Date().toLocaleString()}`,
    margin,
    y
  );

  y += 8;


  /* ============================================================
     PREDICTION SUMMARY
     ============================================================ */

  addSection("PCOS RISK ASSESSMENT");

  addLine(
    "Risk Level",
    result.risk_level
  );

  addLine(
    "PCOS Risk Score",
    `${result.risk_score}%`
  );

  addLine(
    "AI Confidence",
    `${confidence.toFixed(2)}%`
  );

  addLine(
    "Prediction",
    result.pcos_risk
      ? "PCOS risk detected"
      : "No PCOS risk detected"
  );

  addParagraph(
    result.message ||
    "This is a pre-clinic risk assessment and not a medical diagnosis."
  );


  /* ============================================================
     BODY COMPOSITION
     ============================================================ */

  addSection("BODY COMPOSITION");

  addLine(
    "Age",
    input.age ? `${input.age} years` : "Not available"
  );

  addLine(
    "Weight",
    input.weight ? `${input.weight} kg` : "Not available"
  );

  addLine(
    "Height",
    input.height ? `${input.height} cm` : "Not available"
  );

  addLine(
    "BMI",
    result.bmi
  );

  addLine(
    "Waist",
    input.waist ? `${input.waist} inch` : "Not available"
  );

  addLine(
    "Hip",
    input.hip ? `${input.hip} inch` : "Not available"
  );

  addLine(
    "Waist/Hip Ratio",
    result.waist_hip_ratio
  );


  /* ============================================================
     MENSTRUAL CYCLE
     ============================================================ */

  addSection("MENSTRUAL CYCLE");

  addLine(
    "Cycle Status",
    result.cycle_status || input.cycle_regular
  );

  addLine(
    "Cycle Length",
    result.cycle_length
      ? `${result.cycle_length} days`
      : "Not available"
  );


  /* ============================================================
     SYMPTOMS
     ============================================================ */

  addSection("KEY SYMPTOMS");

  if (result.symptoms && result.symptoms.length > 0) {

    result.symptoms.forEach((symptom) => {
      addBullet(symptom);
    });

  } else {

    addBullet("No significant symptoms detected");

  }


  /* ============================================================
     INDIVIDUAL HEALTH INPUTS
     ============================================================ */

  addSection("HEALTH PROFILE");

  addLine(
    "Weight Gain",
    input.weight_gain || "Not available"
  );

  addLine(
    "Excess Hair Growth",
    input.hair_growth || "Not available"
  );

  addLine(
    "Skin Darkening",
    input.skin_darkening || "Not available"
  );

  addLine(
    "Hair Loss",
    input.hair_loss || "Not available"
  );

  addLine(
    "Pimples / Acne",
    input.pimples || "Not available"
  );

  addLine(
    "Regular Exercise",
    input.regular_exercise || "Not available"
  );

  addLine(
    "Fast Food Consumption",
    input.fast_food || "Not available"
  );


  /* ============================================================
     LIFESTYLE
     ============================================================ */

  addSection("LIFESTYLE ASSESSMENT");

  addLine(
    "Lifestyle Score",
    `${lifestyleScore}/100`
  );

  addParagraph(
    lifestyleScore >= 80
      ? "Lifestyle assessment indicates generally healthy lifestyle habits."
      : lifestyleScore >= 60
      ? "Lifestyle assessment indicates moderate lifestyle habits with some areas for improvement."
      : "Lifestyle assessment indicates areas for lifestyle improvement, particularly exercise and dietary habits."
  );


  /* ============================================================
     RISK FACTOR CONTRIBUTION
     ============================================================ */

    /* ============================================================
   XAI CONTRIBUTING FACTORS
   ============================================================ */

addSection("TOP CONTRIBUTING FACTORS");

addParagraph(
  "The following factors had the greatest positive influence on the AI prediction according to SHAP explainability. Percentages represent relative SHAP contribution among the displayed factors and are not probability percentages."
);

positiveFactors.forEach((factor) => {
  addLine(
    factor.label,
    `${factor.relativePercentage}% relative contribution`
  );
});


addSection("FACTORS REDUCING RISK");

addParagraph(
  "These factors had a negative influence on the model's prediction. A negative SHAP contribution means the factor pushed the predicted risk lower for this assessment."
);

negativeFactors.forEach((factor) => {
  addLine(
    factor.label,
    `${factor.relativePercentage}% relative contribution`
  );
});


  /* ============================================================
     RECOMMENDATIONS
     ============================================================ */

  addSection("AI TAILORED RECOMMENDATIONS");

  recommendations.forEach((item) => {

    addParagraph(item.title);

    addBullet(item.text);

  });


  /* ============================================================
     AI SUMMARY
     ============================================================ */

  addSection("AI SUMMARY");

  addParagraph(
    `Based on the submitted health profile, the AI estimates a ${result.risk_level} PCOS risk with a confidence score of ${confidence.toFixed(2)}%.`
  );

  addParagraph(
    "The assessment considers menstrual cycle characteristics, metabolic health indicators, lifestyle habits and hormonal symptoms."
  );

  addParagraph(
    "These insights are intended for educational and pre-clinic risk assessment purposes and should not be considered a medical diagnosis or a substitute for professional medical advice."
  );


  /* ============================================================
     FOOTER ON EVERY PAGE
     ============================================================ */

  const totalPages = doc.getNumberOfPages();

  for (let page = 1; page <= totalPages; page++) {

    doc.setPage(page);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);

    doc.text(
      "PCOSense - AI Health Summary",
      margin,
      pageHeight - 10
    );

    doc.text(
      `Page ${page} of ${totalPages}`,
      pageWidth - margin,
      pageHeight - 10,
      {
        align: "right",
      }
    );
  }


  /* ============================================================
     DOWNLOAD
     ============================================================ */

  doc.save("PCOS_Health_Summary.pdf");
};

/* ==============================
AI CONFIDENCE
===============================*/

// const confidence = Math.min(
// (result.risk_score || 60) + 15,
// 98
// );
// const confidence = result.confidence || 85;
const confidence = Math.min(
  Math.max(Number(result.confidence) || 85, 0),
  100
);

const gaugeData = useMemo(
() => [
{
name: "filled",
value: confidence,
},
{
name: "empty",
value: 100 - confidence,
},
],
[confidence]
);

/* ==============================
LIFESTYLE SCORE
===============================*/

let lifestyleScore = 0;

if (input.regular_exercise === "Yes")
lifestyleScore += 50;

if (input.fast_food === "No")
lifestyleScore += 50;

// /* ==============================
// RISK CONTRIBUTION
// ===============================*/

// const cycleInfluence =
// input.cycle_regular === "Irregular"
// ? 90
// : 40;

// const weightInfluence =
// input.weight_gain === "Yes"
// ? 82
// : 35;

// const hormoneInfluence =
// [
// input.hair_growth,
// input.hair_loss,
// input.pimples,
// ].filter((x) => x === "Yes").length *
// 30 +
// 10;

// const metabolicInfluence =
// input.skin_darkening === "Yes"
// ? 85
// : 40;

/* ==============================
RECOMMENDATIONS
===============================*/

const recommendations = [];

// Diet

if (input.fast_food === "Yes") {
recommendations.push({
icon: <Apple size={26} />,
title: "Anti-Inflammatory Diet",

text:
"Reduce processed food intake and focus on vegetables, fruits, lean proteins, healthy fats and complex carbohydrates to improve hormonal balance.",
});
} else {
recommendations.push({
icon: <Apple size={26} />,
title: "Maintain Healthy Nutrition",

text:
"Continue your balanced diet. Include plenty of fibre, protein and hydration to maintain metabolic health.",
});
}

// Exercise

if (input.regular_exercise === "No") {
recommendations.push({
icon: <Dumbbell size={26} />,
title: "Strength Over Cardio",

text:
"Start with light resistance exercises and daily walking. Building muscle improves insulin sensitivity in women with PCOS.",
});
} else {
recommendations.push({
icon: <Dumbbell size={26} />,
title: "Stay Active",

text:
"Continue regular exercise. Consistency is one of the strongest protective factors against worsening symptoms.",
});
}

// Hormones

recommendations.push({
icon: <HeartPulse size={26} />,

title: "Hormonal Wellness",

text:
"Maintain regular sleep, reduce stress through mindfulness or yoga and continue monitoring menstrual cycles every month.",
});

// Doctor

if (result.risk_score >= 75) {
recommendations.push({
icon: <Stethoscope size={26} />,

title: "Consultation Advised",

text:
"Your predicted risk is high. Schedule an appointment with a gynecologist for hormone profile testing and pelvic ultrasound.",
});
} else {
recommendations.push({
icon: <ShieldCheck size={26} />,

title: "Preventive Care",

text:
"Continue periodic health monitoring and maintain healthy lifestyle habits to reduce future PCOS risk.",
});
}

return (
<div className="health-page">

{/* ================= HERO ================= */}

<section className="hero-section">

<div className="hero-left">

<div className="hero-card">

<div className="risk-badge">
<Sparkles size={18} />
AI Prediction
</div>

<h1>
{result.risk_level} 
</h1>

<div className="risk-score">
{result.risk_score}%
</div>

<p className="hero-message">
{result.message}
</p>

<div className="hero-details">

<div>
<Scale size={18} />
BMI
<strong>{result.bmi}</strong>
</div>

<div>
<Ruler size={18} />
Waist/Hip
<strong>
{result.waist_hip_ratio}
</strong>
</div>

<div>
<CalendarDays size={18} />
Cycle
<strong>
{result.cycle_length} days
</strong>
</div>

</div>

</div>

</div>

<div className="hero-right">

<div className="confidence-card">

<div className="confidence-title">
  <h3>AI Confidence Meter</h3>

    
</div>

<div className="gauge">
<ResponsiveContainer
width="100%"
height={220}
>
<PieChart>
<Pie
data={gaugeData}
startAngle={180}
endAngle={0}
innerRadius={70}
outerRadius={90}
dataKey="value"
>
<Cell fill="#8b5cf6" />
<Cell fill="#ece8ff" />
</Pie>
</PieChart>
</ResponsiveContainer>

<div className="gauge-center">
<h2>{confidence.toFixed(2)}%</h2>
<p>Confidence</p>
</div>
</div>

<div className="confidence-text">
<div className="tooltip-box">
  Indicates how reliable the AI prediction is based on the model's performance and your health data.
</div>
</div>

</div>

</div>

</section>

{/* ================= METRICS ================= */}

<section className="metrics-section">

<div className="metric-card">

<Scale size={28} />

<span>BMI</span>

<h2>{result.bmi}</h2>

<p>
{result.bmi >= 25
? "Overweight"
: result.bmi >= 18.5
? "Healthy"
: "Underweight"}
</p>

</div>

<div className="metric-card">

<CalendarDays size={28} />

<span>Cycle Status</span>

<h2>{result.cycle_status}</h2>

<p>{result.cycle_length} Day Average</p>

</div>

<div className="metric-card">

<TrendingUp size={28} />

<span>Weight</span>

<h2>{input.weight} kg</h2>

<p>Current Weight</p>

</div>

<div className="metric-card">

<Activity size={28} />

<span>Lifestyle Score</span>

<h2>{lifestyleScore}/100</h2>

<p>
{lifestyleScore >= 80
? "Excellent"
: lifestyleScore >= 60
? "Moderate"
: "Needs Improvement"}
</p>

</div>

</section>

{/* ================= XAI TOP CONTRIBUTING FACTORS ================= */}

<section className="risk-section">

  <div className="section-heading">

  <h2>
  {result.pcos_risk
    ? "Factors Increasing PCOS Risk"
    : "Factors That May Contribute to PCOS Risk"}
</h2>

 <p>
  {result.pcos_risk
    ? "These health factors had the greatest influence in increasing your predicted PCOS risk, based on SHAP explainability."
    : "These health factors had the greatest influence on your prediction and may contribute to PCOS risk, based on SHAP explainability."}
</p>
</div>

<div className="xai-info">
  <Sparkles size={17} />

  <span>
  These percentages show the relative influence of each
  factor on this prediction. They are not your PCOS
  risk percentage.
</span>
</div>

  <div className="risk-bars">

    {positiveFactors.length > 0 ? (

      positiveFactors.map((factor, index) => {

        const barWidth = Math.max(
          factor.relativePercentage,
          5
        );

        return (
          <div
            className="risk-item"
            key={factor.feature || index}
          >

            <div className="risk-label">

              <span>
                {factor.label}
              </span>

              <strong>
                {result.pcos_risk
                  ? getInfluenceLabel(factor.contribution)
                  : "Possible risk factor"}
              </strong>

            </div>

            <div className="progress">

              <div
                className="progress-fill purple"
                style={{
                  width: `${barWidth}%`,
                }}
              />

            </div>

            <div className="xai-percentage">
              {factor.relativePercentage}% relative contribution
            </div>

          </div>
        );

      })

    ) : (

      <p className="xai-empty">
        No significant positive contributing factors available.
      </p>

    )}

  </div>

</section>


{/* ================= XAI RISK REDUCING FACTORS ================= */}

<section className="risk-section negative-risk-section">

  <div className="section-heading">

    <h2>
      Factors Supporting Lower Risk
    </h2>

    <p>
  These factors had an influence that pushed the prediction
  toward a lower PCOS risk in this assessment.
</p>

  </div>

  <div className="xai-info negative-info">
    <ShieldCheck size={17} />

   <span>
    These factors helped lower your predicted PCOS risk
    in this assessment.
  </span>

  </div>

  <div className="risk-bars">

    {negativeFactors.length > 0 ? (

      negativeFactors.map((factor, index) => {

        const barWidth = Math.max(
          factor.relativePercentage,
          5
        );

        return (
          <div
            className="risk-item"
            key={factor.feature || index}
          >

            <div className="risk-label">

              <span>
                {factor.label}
              </span>

              <strong>
                Reduces risk
              </strong>

            </div>

            <div className="progress">

              <div
                className="progress-fill negative"
                style={{
                  width: `${barWidth}%`,
                }}
              />

            </div>

            <div className="xai-percentage">
              {factor.relativePercentage}% relative contribution
            </div>

          </div>
        );

      })

    ) : (

      <p className="xai-empty">
        No significant risk-reducing factors identified.
      </p>

    )}

  </div>

</section>

{/* ================= AI RECOMMENDATIONS ================= */}

<section className="recommend-section">

<div className="section-heading">
<h2>AI Tailored Recommendations</h2>
<p>
Personalized suggestions generated from your
symptoms, lifestyle habits and predicted risk.
</p>
</div>

<div className="recommend-grid">

{recommendations.map((item, index) => (

<div
className="recommend-card"
key={index}
>

<div className="recommend-icon">
{item.icon}
</div>

<h3>{item.title}</h3>

<p>{item.text}</p>

</div>

))}

</div>

</section>


{/* ================= SYMPTOMS ================= */}

<section className="symptom-section">

<div className="section-heading">

<h2>Key Symptoms Summary</h2>

<p>
Symptoms identified from your submitted
assessment.
</p>

</div>

<div className="symptom-list">

{result.symptoms &&
result.symptoms.length > 0 ? (

result.symptoms.map((symptom, index) => (

<div
key={index}
className="symptom-chip"
>
<AlertTriangle size={18} />

{symptom}

</div>

))

) : (

<div className="symptom-chip">

<ShieldCheck size={18} />

No significant symptoms detected

</div>

)}

</div>

</section>


{/* ================= AI NOTE ================= */}

<section className="note-section">

<div className="note-card">

<Sparkles size={28} />

<div>

<h3>AI Summary</h3>

<p>

Based on your submitted health profile,
the AI estimates a

<strong>
{" "}
{result.risk_level} PCOS Risk
</strong>

{" "}with a confidence score of

<strong>
{" "}
{confidence.toFixed(2)}%
</strong>.

The prediction is explained using SHAP-based
Explainable AI (XAI), which shows how your
individual health factors influenced the prediction.

Factors that increased the predicted risk are shown
as contributing factors, while factors that helped
lower the predicted risk are shown separately.

These insights should be considered an
educational health assessment and not a
substitute for professional medical advice.

</p>

</div>

</div>

</section>


{/* ================= ACTION BUTTONS ================= */}

<section className="bottom-actions">

<button
className="back-btn"
onClick={onBack}
>

<ArrowLeft size={18} />

Back to Prediction

</button>


<button
className="dashboard-btn"
onClick={onDashboard}
>

<LayoutDashboard size={18} />

Go to Dashboard

</button>

<button
  className="pdf-btn"
  onClick={generateHealthSummaryPDF}
>

  <Download size={18} />

  Download Report

</button>

</section>

</div>

);

}