import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

function TrendVisualization({ history }) {
  const [trackerData, setTrackerData] = useState([]);

  useEffect(() => {
    const savedData = history || [];

    const formattedData = savedData
      .slice()
      .reverse()
      .map((entry, index) => ({
        entryNo: `Entry ${index + 1}`,
        weight: Number(entry.weight),
        risk_score: Number(entry.risk_score),
        cycle_length: Number(entry.cycle_length),
        cycle_status: entry.cycle_regular === "Irregular" ? 1 : 0,
        weight_gain: entry.weight_gain === "Yes" ? 1 : 0,
        hair_growth: entry.hair_growth === "Yes" ? 1 : 0,
        skin_darkening: entry.skin_darkening === "Yes" ? 1 : 0,
        hair_loss: entry.hair_loss === "Yes" ? 1 : 0,
        pimples: entry.pimples === "Yes" ? 1 : 0,
      }));

    setTrackerData(formattedData);
  }, [history]);

  if (trackerData.length < 2) {
    return (
      <div className="card dashboard-card">
        <h3>Trend Visualization</h3>
        <p className="section-subtitle">
          Trends will appear after at least two tracking entries are saved.
        </p>
      </div>
    );
  }

  const symptomFrequency = [
    {
      symptom: "Weight Gain",
      count: trackerData.reduce((sum, item) => sum + item.weight_gain, 0),
    },
    {
      symptom: "Hair Growth",
      count: trackerData.reduce((sum, item) => sum + item.hair_growth, 0),
    },
    {
      symptom: "Skin Darkening",
      count: trackerData.reduce((sum, item) => sum + item.skin_darkening, 0),
    },
    {
      symptom: "Hair Loss",
      count: trackerData.reduce((sum, item) => sum + item.hair_loss, 0),
    },
    {
      symptom: "Pimples",
      count: trackerData.reduce((sum, item) => sum + item.pimples, 0),
    },
  ];

  const latest = trackerData[trackerData.length - 1];
  const previous = trackerData[trackerData.length - 2];

  const weightChange = latest.weight - previous.weight;
  const riskChange = latest.risk_score - previous.risk_score;

  return (
    <div className="card dashboard-card">
      <h3>Trend Visualization</h3>
      <p className="section-subtitle">
        Visualizes weight changes, PCOS risk score, cycle pattern, and symptom
        frequency over time.
      </p>

      <div className="summary-grid">
        <div className="summary-box">
          <span>Weight Change</span>
          <h2>
            {weightChange > 0 ? "+" : ""}
            {weightChange.toFixed(1)} kg
          </h2>
        </div>

        <div className="summary-box">
          <span>Risk Change</span>
          <h2>
            {riskChange > 0 ? "+" : ""}
            {riskChange.toFixed(1)}%
          </h2>
        </div>

        <div className="summary-box">
          <span>Total Entries</span>
          <h2>{trackerData.length}</h2>
        </div>
      </div>

      <div className="result-box">
        <h3>Weight Changes Over Time</h3>
        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <LineChart data={trackerData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="entryNo" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#6b3fa0"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="result-box">
        <h3>PCOS Risk Score Trend</h3>
        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <LineChart data={trackerData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="entryNo" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="risk_score"
                stroke="#c0392b"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="result-box">
        <h3>Cycle Length Pattern</h3>
        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <BarChart data={trackerData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="entryNo" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="cycle_length" fill="#8e65c0" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="result-box">
        <h3>Symptom Frequency</h3>
        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <BarChart data={symptomFrequency}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="symptom" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#6b3fa0" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default TrendVisualization;