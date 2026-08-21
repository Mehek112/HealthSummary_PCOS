// // import { useEffect, useState } from "react";
// // import { supabase } from "./supabaseClient";

// // import AuthPage from "./components/AuthPage";
// // import PredictionForm from "./components/PredictionForm";
// // import PredictionResult from "./components/PredictionResult";
// // import AIDashboard from "./components/AIDashboard";
// // import HealthSummaryPage from "./components/HealthSummaryPage";
// // import Navbar from "./components/Navbar";

// // import "./App.css";

// // function App() {
// //   const [user, setUser] = useState(null);
// //   const [result, setResult] = useState(null);
// //   const [page, setPage] = useState("predict"); // GLOBAL NAV CONTROL

// //   /* ================= AUTH ================= */
// //   useEffect(() => {
// //     supabase.auth.getUser().then(({ data }) => {
// //       setUser(data.user);
// //     });

// //     const { data: listener } =
// //       supabase.auth.onAuthStateChange((_event, session) => {
// //         setUser(session?.user || null);
// //       });

// //     return () => listener.subscription.unsubscribe();
// //   }, []);

// //   /* ================= LOGOUT ================= */
// //   const handleLogout = async () => {
// //     await supabase.auth.signOut();
// //     setUser(null);
// //     setResult(null);
// //     setPage("predict");
// //   };

// //   /* ================= PREDICTION ================= */
// //   const handleNewPrediction = (predictionResult) => {
// //     setResult(predictionResult);
// //     setPage("result");
// //   };

// //   /* ================= AUTH CHECK ================= */
// //   if (!user) {
// //     return <AuthPage setUser={setUser} />;
// //   }

// //   return (
// //     <div className="app">

// //       {/* ================= GLOBAL NAVBAR ================= */}
// //       <Navbar
// //         onLogout={handleLogout}
// //         onNavigate={setPage}
// //         activePage={page}
// //       />

// //       {/* ================= PAGE SWITCHER ================= */}

// //       {page === "predict" && (
// //         <PredictionForm
// //           setResult={handleNewPrediction}
// //           user={user}
// //           onLogout={handleLogout}
// //         />
// //       )}

// //       {page === "result" && (
// //         <PredictionResult
// //           result={result}
// //           onGoToDashboard={() => setPage("dashboard")}
// //         />
// //       )}

// //       {page === "dashboard" && (
// //         <AIDashboard result={result} user={user} />
// //       )}

// //       {page === "summary" && (
// //         <HealthSummaryPage result={result} />
// //       )}

// //     </div>
// //   );
// // }

// // export default App;
// import { useEffect, useState } from "react";
// import { supabase } from "./supabaseClient";

// import AuthPage from "./components/AuthPage";
// import PredictionForm from "./components/PredictionForm";
// import AIDashboard from "./components/AIDashboard";
// import HealthSummaryPage from "./components/HealthSummaryPage";
// import Navbar from "./components/Navbar";

// import "./App.css";

// function App() {
//   const [user, setUser] = useState(null);
//   const [result, setResult] = useState(null);
//   const [page, setPage] = useState("predict");

//   useEffect(() => {
//     supabase.auth.getUser().then(({ data }) => {
//       setUser(data.user);
//     });

//     const { data: listener } =
//       supabase.auth.onAuthStateChange((_event, session) => {
//         setUser(session?.user || null);
//       });

//     return () => listener.subscription.unsubscribe();
//   }, []);

//   const handleLogout = async () => {
//     await supabase.auth.signOut();
//     setUser(null);
//     setResult(null);
//     setPage("predict");
//   };

//   const handleNewPrediction = (predictionResult) => {
//     setResult(predictionResult);
//   };

//   if (!user) {
//     return <AuthPage setUser={setUser} />;
//   }

//   return (
//     <div className="app">

//       {/* GLOBAL NAVBAR */}
//       <Navbar
//         onLogout={handleLogout}
//         onNavigate={setPage}
//         activePage={page}
//       />

//       {/* PREDICT PAGE */}
//       {page === "predict" && (
//         <PredictionForm
//           setResult={handleNewPrediction}
//           user={user}
//           onLogout={handleLogout}
//           result={result}
//         />
//       )}

//       {/* DASHBOARD */}
//       {page === "dashboard" && (
//         <AIDashboard result={result} user={user} />
//       )}

//       {/* SUMMARY */}
//       {page === "summary" && (
//         <HealthSummaryPage result={result} />
//       )}

//     </div>
//   );
// }

// export default App;
import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

import AuthPage from "./components/AuthPage";
import PredictionForm from "./components/PredictionForm";
import PredictionResult from "./components/PredictionResult";
import AIDashboard from "./components/AIDashboard";
import HealthSummaryPage from "./components/HealthSummaryPage";
import Navbar from "./components/Navbar";

import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [result, setResult] = useState(null);
  const [page, setPage] = useState("predict");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data: listener } =
      supabase.auth.onAuthStateChange(
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
    setPage("predict");
  };

  const handleNewPrediction = (predictionResult) => {
    setResult(predictionResult);
  };

  if (!user) {
    return <AuthPage setUser={setUser} />;
  }

  return (
    <div className="app">

      {/* Global Navbar */}
      <Navbar
        onLogout={handleLogout}
        onNavigate={setPage}
        activePage={page}
      />

      {/* Predict Page */}
      {page === "predict" && (
        <>
          <PredictionForm
            setResult={handleNewPrediction}
            user={user}
            onLogout={handleLogout}
          />

          {result && (
            <PredictionResult
              result={result}
              onGoToDashboard={() =>
                setPage("dashboard")
              }
            />
          )}
        </>
      )}

      {/* AI Dashboard */}
      {page === "dashboard" && (
        <AIDashboard
          result={result}
          user={user}
        />
      )}

      {/* Health Summary */}
      {page === "summary" && (
        <HealthSummaryPage
          result={result}
        />
      )}

    </div>
  );
}

export default App;