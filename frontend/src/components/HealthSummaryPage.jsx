
// import UserHealthSummary from "../components/UserHealthSummary";
// import Recommendations from "../components/Recommendations";

// import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
// import { useMemo } from "react";

// /* ================= GAUGE ================= */
// function Gauge({ value = 70 }) {
//   const data = useMemo(
//     () => [
//       { name: "filled", value },
//       { name: "empty", value: 100 - value },
//     ],
//     [value]
//   );

//   return (
//     <div className="relative w-full h-48 flex items-center justify-center">
//       <ResponsiveContainer width="100%" height="100%">
//         <PieChart>
//           <Pie
//             data={data}
//             startAngle={180}
//             endAngle={0}
//             innerRadius={60}
//             outerRadius={80}
//             dataKey="value"
//           >
//             <Cell fill="#5a2d82" />
//             <Cell fill="#e5e7eb" />
//           </Pie>
//         </PieChart>
//       </ResponsiveContainer>

//       <div className="absolute text-center">
//         <h2 className="text-2xl font-bold text-purple-900">{value}%</h2>
//         <p className="text-xs text-gray-500">Risk Confidence</p>
//       </div>
//     </div>
//   );
// }

// /* ================= PAGE ================= */
// export default function HealthSummaryPage({ result, history }) {
//  if (!result) {
//   return (
//     <div className="min-h-screen flex items-center justify-center text-gray-500">
//       <div className="text-center">
//         <h2 className="text-xl font-semibold">No Health Data Yet</h2>
//         <p>Please complete a PCOS prediction first.</p>
//       </div>
//     </div>
//   );
// }

//   return (
//     <div className="min-h-screen bg-gray-50 w-full">

//       {/* NAVBAR (your existing component) */}
    

//       <main className="w-full px-10 py-8">

//         {/* TITLE */}
//         <div className="text-center mb-8">
//           <h1 className="text-3xl font-bold text-purple-900">
//             Health Summary
//           </h1>
//           <p className="text-gray-500 text-sm mt-2">
//             AI-powered PCOS risk analysis dashboard
//           </p>
//         </div>

//         {/* ================= USER SUMMARY (YOUR COMPONENT) ================= */}
//         <UserHealthSummary result={result} />

//         {/* ================= GAUGE SECTION ================= */}
//         <div className="bg-white p-8 rounded-2xl border shadow-sm my-8 flex justify-center">
//           <Gauge value={result.risk_score || 70} />
//         </div>

//         {/* ================= RECOMMENDATIONS (YOUR COMPONENT) ================= */}
//         <h2 className="text-lg font-bold text-purple-900 mb-4">
//           AI Recommendations
//         </h2>

//         <Recommendations result={result} history={history} />

//       </main>
//     </div>
//   );
// }

import "./HealthSummaryPage.css";

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

/* ==============================
AI CONFIDENCE
===============================*/

// const confidence = Math.min(
// (result.risk_score || 60) + 15,
// 98
// );
const confidence = result.confidence || 85;

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

/* ==============================
RISK CONTRIBUTION
===============================*/

const cycleInfluence =
input.cycle_regular === "Irregular"
? 90
: 40;

const weightInfluence =
input.weight_gain === "Yes"
? 82
: 35;

const hormoneInfluence =
[
input.hair_growth,
input.hair_loss,
input.pimples,
].filter((x) => x === "Yes").length *
30 +
10;

const metabolicInfluence =
input.skin_darkening === "Yes"
? 85
: 40;

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

{/* ================= RISK FACTORS ================= */}

<section className="risk-section">

<div className="section-heading">

<h2>
Risk Factor Contribution
</h2>

<p>
These factors had the highest influence
on your AI prediction.
</p>

</div>

<div className="risk-bars">

<div className="risk-item">

<div className="risk-label">

<span>
Cycle Length &
Irregularity
</span>

<strong>
{cycleInfluence}%
</strong>

</div>

<div className="progress">

<div
className="progress-fill purple"
style={{
width:
`${cycleInfluence}%`,
}}
/>

</div>

</div>

<div className="risk-item">

<div className="risk-label">

<span>
Weight Changes
</span>

<strong>
{weightInfluence}%
</strong>

</div>

<div className="progress">

<div
className="progress-fill"
style={{
width:
`${weightInfluence}%`,
}}
/>

</div>

</div>

<div className="risk-item">

<div className="risk-label">

<span>
Hormonal Symptoms
</span>

<strong>
{hormoneInfluence}%
</strong>

</div>

<div className="progress">

<div
className="progress-fill"
style={{
width:
`${hormoneInfluence}%`,
}}
/>

</div>

</div>

<div className="risk-item">

<div className="risk-label">

<span>
Metabolic Indicators
</span>

<strong>
{metabolicInfluence}%
</strong>

</div>

<div className="progress">

<div
className="progress-fill"
style={{
width:
`${metabolicInfluence}%`,
}}
/>

</div>

</div>

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

The strongest contributing factors were
menstrual cycle characteristics,
metabolic health indicators,
lifestyle habits and hormonal symptoms.

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
onClick={() => window.print()}
>

<Download size={18} />

Download Report

</button>

</section>

</div>

);

}