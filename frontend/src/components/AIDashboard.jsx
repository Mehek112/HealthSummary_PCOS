import { useEffect, useState } from "react";
import UserHealthSummary from "./UserHealthSummary";
import SymptomTracker from "./SymptomTracker";
import TrendVisualization from "./TrendVisualization";
import PersonalizedInsights from "./PersonalizedInsights";
import Recommendations from "./Recommendations";
import { getTrackerHistory } from "../api/trackerApi";

function AIDashboard({ result, user }) {
  const [history, setHistory] = useState([]);

  if (!user) {
    return <p>Loading dashboard...</p>;
  }

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await getTrackerHistory(user.id);
        setHistory(data);
      } catch (error) {
        console.error("Error loading history:", error);
      }
    };

    if (user?.id) {
      loadHistory();
    }
  }, [user]);

  return (
    <>
      <UserHealthSummary result={result} />

      <SymptomTracker
        result={result}
        user={user}
        history={history}
        setHistory={setHistory}
      />

      <TrendVisualization history={history} />

      <PersonalizedInsights result={result} history={history} />

      <Recommendations result={result} history={history} />
    </>
  );
}

export default AIDashboard;