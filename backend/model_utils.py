import joblib
import numpy as np

pipeline = joblib.load("pcos_pipeline_v3.pkl")
feature_names = joblib.load("feature_names_v3.pkl")
threshold = joblib.load("best_threshold_v3.pkl")


def encode_yes_no(value):
    return 1 if value.lower() == "yes" else 0


def compute_engineered_features(raw):
    d = raw.copy()

    d["symptom_count"] = sum([
        d["Weight gain(Y/N)"],
        d["hair growth(Y/N)"],
        d["Skin darkening (Y/N)"],
        d["Hair loss(Y/N)"],
        d["Pimples(Y/N)"]
    ])

    d["metabolic_risk"] = (
        int(d["BMI"] > 25) +
        int(d["Waist:Hip Ratio"] > 0.85) +
        d["Fast food (Y/N)"] +
        d["Reg.Exercise(Y/N)"]
    )

    d["cycle_risk"] = d["Cycle(R/I)"] * int(d["Cycle length(days)"] > 32)

    d["pcos_triad"] = (
        d["hair growth(Y/N)"] *
        d["Pimples(Y/N)"] *
        d["Weight gain(Y/N)"]
    )

    d["androgenic_triad"] = (
        d["hair growth(Y/N)"] +
        d["Hair loss(Y/N)"] +
        d["Pimples(Y/N)"]
    )

    d["hormonal_load"] = (
        d["hair growth(Y/N)"] * 2 +
        d["Skin darkening (Y/N)"] * 1.5 +
        d["Pimples(Y/N)"] * 1.5 +
        d["Hair loss(Y/N)"] +
        d["Weight gain(Y/N)"]
    )

    d["waist_height_ratio"] = d["Waist(inch)"] / (d["Height(Cm)"] / 2.54)

    d["central_obesity"] = int(d["Waist(inch)"] > 35)

    d["obese_irregular"] = int(d["BMI"] > 27.5) * d["Cycle(R/I)"]

    d["lifestyle_risk"] = (
        d["Fast food (Y/N)"] * 2 +
        d["Reg.Exercise(Y/N)"] +
        int(d["BMI"] > 30) * 2
    )

    d["cycle_severity"] = d["Cycle(R/I)"] * np.log1p(d["Cycle length(days)"])

    d["young_symptomatic"] = (
        int(18 <= d["Age (yrs)"] <= 35) *
        d["symptom_count"]
    )

    d["symptom_metabolic"] = d["symptom_count"] * d["metabolic_risk"]

    d["bmi_whr_interaction"] = d["BMI"] * d["Waist:Hip Ratio"]

    d["insulin_resistance_flag"] = (
        d["Skin darkening (Y/N)"] *
        d["Weight gain(Y/N)"]
    )

    return d


def predict_pcos(data):
    bmi = round(data.weight / ((data.height / 100) ** 2), 2)
    waist_hip_ratio = round(data.waist / data.hip, 2)

    raw = {
        "Age (yrs)": data.age,
        "Weight (Kg)": data.weight,
        "Height(Cm)": data.height,
        "BMI": bmi,
        "Waist(inch)": data.waist,
        "Hip(inch)": data.hip,
        "Waist:Hip Ratio": waist_hip_ratio,
        "Cycle(R/I)": 1 if data.cycle_regular.lower() == "irregular" else 0,
        "Cycle length(days)": data.cycle_length,
        "Weight gain(Y/N)": encode_yes_no(data.weight_gain),
        "hair growth(Y/N)": encode_yes_no(data.hair_growth),
        "Skin darkening (Y/N)": encode_yes_no(data.skin_darkening),
        "Hair loss(Y/N)": encode_yes_no(data.hair_loss),
        "Pimples(Y/N)": encode_yes_no(data.pimples),
        "Reg.Exercise(Y/N)": 0 if data.regular_exercise.lower() == "yes" else 1,
        "Fast food (Y/N)": encode_yes_no(data.fast_food)
    }

    full_input = compute_engineered_features(raw)

    row = np.array([[full_input[f] for f in feature_names]])

    probability = pipeline.predict_proba(row)[0][1]
    prediction = int(probability >= threshold)

    if probability < 0.30:
        risk_level = "Low Risk"
    elif probability < threshold:
        risk_level = "Moderate Risk"
    elif probability < 0.75:
        risk_level = "High Risk"
    else:
        risk_level = "Very High Risk"

    symptoms = []

    if data.weight_gain.lower() == "yes":
        symptoms.append("Weight gain")
    if data.hair_growth.lower() == "yes":
        symptoms.append("Excess hair growth")
    if data.skin_darkening.lower() == "yes":
        symptoms.append("Skin darkening")
    if data.hair_loss.lower() == "yes":
        symptoms.append("Hair loss")
    if data.pimples.lower() == "yes":
        symptoms.append("Pimples / acne")

    return {
        "pcos_risk": bool(prediction),
        "risk_score": round(float(probability) * 100, 2),
        "probability": round(float(probability), 4),
        "risk_level": risk_level,
        "bmi": bmi,
        "waist_hip_ratio": waist_hip_ratio,
        "cycle_status": data.cycle_regular,
        "cycle_length": data.cycle_length,
        "symptoms": symptoms,
        "message": "This is a pre-clinic risk assessment, not a medical diagnosis."
    }