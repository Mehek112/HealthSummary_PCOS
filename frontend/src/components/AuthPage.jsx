import { useState } from "react";
import { supabase } from "../supabaseClient";

function AuthPage({ setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleAuth = async (e) => {
  e.preventDefault();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    alert("Please enter a valid email address.");
    return;
  }

  if (password.length < 8) {
    alert("Password must be at least 8 characters long.");
    return;
  }

  if (!/[A-Z]/.test(password)) {
    alert("Password must contain at least one uppercase letter.");
    return;
  }

  if (!/[a-z]/.test(password)) {
    alert("Password must contain at least one lowercase letter.");
    return;
  }

  if (!/[0-9]/.test(password)) {
    alert("Password must contain at least one number.");
    return;
  }

  if (!/[!@#$%^&*]/.test(password)) {
    alert("Password must contain at least one special character.");
    return;
  }

  const response = isLogin
    ? await supabase.auth.signInWithPassword({ email, password })
    : await supabase.auth.signUp({ email, password });

  if (response.error) {
    alert(response.error.message);
    return;
  }

  const { data } = await supabase.auth.getUser();
  setUser(data.user);

  if (!isLogin) {
    alert("Signup successful. Please check your email if confirmation is required.");
  }
};

  return (
    <div className="app">
      <div className="card">
        <h2>{isLogin ? "Login" : "Sign Up"}</h2>
        <p className="section-subtitle">
          Access your personal PCOS dashboard securely.
        </p>

        <form onSubmit={handleAuth} className="form-grid">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="predict-btn" type="submit">
            {isLogin ? "Login" : "Create Account"}
          </button>
        </form>

        <p className="note">
          {isLogin ? "New user?" : "Already have an account?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            style={{
              border: "none",
              background: "transparent",
              color: "#5a2d82",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            {isLogin ? "Sign up here" : "Login here"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default AuthPage;