import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

import AuthPage from "./components/AuthPage";
import PredictionForm from "./components/PredictionForm";
import PredictionResult from "./components/PredictionResult";
import AIDashboard from "./components/AIDashboard";
// import BotpressChat from "./components/BotpressChat";

import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [result, setResult] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setResult(null);
    setShowDashboard(false);
  };

  const handleNewPrediction = (predictionResult) => {
    setResult(predictionResult);
    setShowDashboard(false);
  };

  // 🔥 DEBUG (optional, can remove later)
  console.log("User:", user);
  console.log("Result:", result);
  console.log("ShowDashboard:", showDashboard);

  if (!user) {
    return <AuthPage setUser={setUser} />;
  }

  return (
    <div className="app">
      <header className="hero">
        <h1>PCOS Health Management System</h1>
        <p>
          Predict PCOS risk and view your personalized AI-powered health dashboard.
        </p>

        <button className="predict-btn" onClick={handleLogout}>
          Logout
        </button>
      </header>

      {/* Prediction Section */}
      {!showDashboard && (
        <>
          <PredictionForm setResult={handleNewPrediction} user={user} />

          {result && (
            <PredictionResult
              result={result}
              onGoToDashboard={() => setShowDashboard(true)}
            />
          )}
        </>
      )}

      {/* FIXED: Dashboard now does NOT depend on result */}
      {showDashboard && (
        <AIDashboard result={result} user={user} />
      )}
    </div>
  );
}

export default App;

// import { useEffect, useState } from "react";
// import { supabase } from "./supabaseClient";

// import AuthPage from "./components/AuthPage";
// import PredictionForm from "./components/PredictionForm";
// import PredictionResult from "./components/PredictionResult";
// import AIDashboard from "./components/AIDashboard";
// import BotpressChat from "./components/BotpressChat";

// import "./App.css";

// function App() {
//   const [user, setUser] = useState(null);
//   const [result, setResult] = useState(null);
//   const [showDashboard, setShowDashboard] = useState(false);

//   useEffect(() => {
//     supabase.auth.getUser().then(({ data }) => {
//       setUser(data.user);
//     });

//     const { data: listener } = supabase.auth.onAuthStateChange(
//       (_event, session) => {
//         setUser(session?.user || null);
//       }
//     );

//     return () => {
//       listener.subscription.unsubscribe();
//     };
//   }, []);

//   const handleLogout = async () => {
//     await supabase.auth.signOut();
//     setUser(null);
//     setResult(null);
//     setShowDashboard(false);
//   };

//   const handleNewPrediction = (predictionResult) => {
//     setResult(predictionResult);
//     setShowDashboard(false);
//   };

//   // User is not logged in
//   if (!user) {
//     return <AuthPage setUser={setUser} />;
//   }

//   // User is logged in
//   return (
//     <div className="app">
//       {/* Chatbot appears only after login/signup */}
//       <BotpressChat />

//       <header className="hero">
//         <h1>PCOS Health Management System</h1>
//         <p>
//           Predict PCOS risk and view your personalized AI-powered health
//           dashboard.
//         </p>

//         <button className="predict-btn" onClick={handleLogout}>
//           Logout
//         </button>
//       </header>

//       {/* Prediction Section */}
//       {!showDashboard && (
//         <>
//           <PredictionForm
//             setResult={handleNewPrediction}
//             user={user}
//           />

//           {result && (
//             <PredictionResult
//               result={result}
//               onGoToDashboard={() => setShowDashboard(true)}
//             />
//           )}
//         </>
//       )}

//       {/* Dashboard */}
//       {showDashboard && (
//         <AIDashboard
//           result={result}
//           user={user}
//         />
//       )}
//     </div>
//   );
// }

// export default App;

