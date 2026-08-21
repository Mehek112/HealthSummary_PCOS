import joblib
import numpy as np
import pandas as pd
import shap


# ============================================================
# LOAD EXISTING MODEL FILES
# ============================================================

pipeline = joblib.load("pcos_pipeline_v3.pkl")
feature_names = joblib.load("feature_names_v3.pkl")

print("Pipeline loaded successfully.")
print("Total model features:", len(feature_names))


# ============================================================
# LOAD REAL CLEANED DATASET
# ============================================================

df = pd.read_csv("PCOS_Cleaned_Dataset.csv")
df.columns = df.columns.str.strip()

print("\nDataset shape:", df.shape)


# ============================================================
# ORIGINAL FEATURES
# EXACTLY SAME AS TRAINING
# ============================================================

features = [
    'Age (yrs)',
    'Weight (Kg)',
    'Height(Cm)',
    'BMI',
    'Waist(inch)',
    'Hip(inch)',
    'Waist:Hip Ratio',
    'Cycle(R/I)',
    'Cycle length(days)',
    'Weight gain(Y/N)',
    'hair growth(Y/N)',
    'Skin darkening (Y/N)',
    'Hair loss(Y/N)',
    'Pimples(Y/N)',
    'Reg.Exercise(Y/N)',
    'Fast food (Y/N)'
]

target = 'PCOS (Y/N)'


# ============================================================
# KEEP ONLY MODEL INPUT FEATURES
# ============================================================

df = df[features + [target]].copy()


# ============================================================
# MISSING VALUES
# SAME AS COLAB
# ============================================================

df = df.fillna(df.median(numeric_only=True))
df = df.fillna('N')


# ============================================================
# BINARY ENCODING
# SAME AS COLAB
# ============================================================

binary_cols = [
    'Weight gain(Y/N)',
    'hair growth(Y/N)',
    'Skin darkening (Y/N)',
    'Hair loss(Y/N)',
    'Pimples(Y/N)',
    'Fast food (Y/N)'
]


def encode_yn(val):

    s = str(val).strip().upper()

    if s in ('Y', 'YES', '1', '1.0', 'TRUE'):
        return 1

    elif s in ('N', 'NO', '0', '0.0', 'FALSE'):
        return 0

    return np.nan


for col in binary_cols:
    df[col] = df[col].apply(encode_yn)


# ============================================================
# EXERCISE ENCODING
# NO EXERCISE = 1
# SAME AS TRAINING
# ============================================================

df['Reg.Exercise(Y/N)'] = df['Reg.Exercise(Y/N)'].apply(
    lambda v:
        0
        if str(v).strip().upper() in ('Y', 'YES', '1', '1.0')
        else
        1
        if str(v).strip().upper() in ('N', 'NO', '0', '0.0')
        else np.nan
)


# ============================================================
# CYCLE ENCODING
# IRREGULAR = 1
# SAME AS TRAINING
# ============================================================

df['Cycle(R/I)'] = df['Cycle(R/I)'].apply(
    lambda v:
        1
        if str(v).strip().upper() in ('I', 'IRREGULAR', '2')
        else
        0
        if str(v).strip().upper() in ('R', 'REGULAR', '4', '1')
        else np.nan
)


# ============================================================
# FILL ENCODING MISSING VALUES
# SAME AS COLAB
# ============================================================

for col in binary_cols + [
    'Reg.Exercise(Y/N)',
    'Cycle(R/I)'
]:

    if df[col].isnull().any():
        df[col] = df[col].fillna(df[col].mode()[0])


# ============================================================
# NUMERIC CONVERSION
# SAME AS COLAB
# ============================================================

for col in df.columns:

    if col != target:

        df[col] = pd.to_numeric(
            df[col],
            errors='coerce'
        )


df = df.fillna(
    df.median(numeric_only=True)
)


# ============================================================
# FEATURE ENGINEERING
# EXACT SAME AS COLAB
# ============================================================

symptom_cols = [
    'Weight gain(Y/N)',
    'hair growth(Y/N)',
    'Skin darkening (Y/N)',
    'Hair loss(Y/N)',
    'Pimples(Y/N)'
]


df['symptom_count'] = df[symptom_cols].sum(axis=1)


df['metabolic_risk'] = (
    (df['BMI'] > 25).astype(int)
    +
    (df['Waist:Hip Ratio'] > 0.85).astype(int)
    +
    df['Fast food (Y/N)']
    +
    df['Reg.Exercise(Y/N)']
)


df['cycle_risk'] = (
    df['Cycle(R/I)']
    *
    (df['Cycle length(days)'] > 32).astype(int)
)


df['pcos_triad'] = (
    df['hair growth(Y/N)']
    *
    df['Pimples(Y/N)']
    *
    df['Weight gain(Y/N)']
)


df['androgenic_triad'] = (
    df['hair growth(Y/N)']
    +
    df['Hair loss(Y/N)']
    +
    df['Pimples(Y/N)']
)


df['hormonal_load'] = (
    df['hair growth(Y/N)'] * 2
    +
    df['Skin darkening (Y/N)'] * 1.5
    +
    df['Pimples(Y/N)'] * 1.5
    +
    df['Hair loss(Y/N)']
    +
    df['Weight gain(Y/N)']
)


df['waist_height_ratio'] = (
    df['Waist(inch)']
    /
    (df['Height(Cm)'] / 2.54)
)


df['central_obesity'] = (
    df['Waist(inch)'] > 35
).astype(int)


df['obese_irregular'] = (
    (df['BMI'] > 27.5).astype(int)
    *
    df['Cycle(R/I)']
)


df['lifestyle_risk'] = (
    df['Fast food (Y/N)'] * 2
    +
    df['Reg.Exercise(Y/N)']
    +
    (df['BMI'] > 30).astype(int) * 2
)


df['cycle_severity'] = (
    df['Cycle(R/I)']
    *
    np.log1p(df['Cycle length(days)'])
)


df['young_symptomatic'] = (
    (
        (df['Age (yrs)'] >= 18)
        &
        (df['Age (yrs)'] <= 35)
    ).astype(int)
    *
    df['symptom_count']
)


df['symptom_metabolic'] = (
    df['symptom_count']
    *
    df['metabolic_risk']
)


df['bmi_whr_interaction'] = (
    df['BMI']
    *
    df['Waist:Hip Ratio']
)


df['insulin_resistance_flag'] = (
    df['Skin darkening(Y/N)']
    *
    df['Weight gain(Y/N)']
) if 'Skin darkening(Y/N)' in df.columns else (
    df['Skin darkening (Y/N)']
    *
    df['Weight gain(Y/N)']
)


# ============================================================
# SELECT EXACT 26 MODEL FEATURES
# ============================================================

background_df = df[feature_names].copy()


print("\nBackground dataset shape:", background_df.shape)
print("Expected features:", len(feature_names))
print("Actual features:", len(background_df.columns))


# ============================================================
# VERIFY FEATURE ORDER
# ============================================================

if list(background_df.columns) != list(feature_names):

    print("\nERROR: Feature order mismatch!")

    print("\nModel features:")
    print(feature_names)

    print("\nBackground features:")
    print(background_df.columns.tolist())

    raise ValueError("Feature order does not match model.")


print("\nFeature order verified successfully.")


# ============================================================
# CREATE SHAP BACKGROUND
# ============================================================

# Use real representative samples.
#
# We use a subset rather than all 541 rows to keep SHAP
# computation reasonable.

np.random.seed(42)

background_size = min(100, len(background_df))

background = background_df.sample(
    n=background_size,
    random_state=42
).values


print("\nSHAP background shape:", background.shape)


# ============================================================
# TEST CURRENT USER
# ============================================================

# SAME TEST USER FROM YOUR CURRENT XAI TEST
# ------------------------------------------------------------

age = 22
weight = 74
height = 165
waist = 34
hip = 40

cycle_regular = "Irregular"
cycle_length = 42

weight_gain = "Yes"
hair_growth = "Yes"
skin_darkening = "Yes"
hair_loss = "No"
pimples = "Yes"

regular_exercise = "No"
fast_food = "Yes"


# ============================================================
# CALCULATE BASIC FEATURES
# ============================================================

bmi = round(
    weight / ((height / 100) ** 2),
    2
)

waist_hip_ratio = round(
    waist / hip,
    2
)


# ============================================================
# CREATE RAW USER INPUT
# ============================================================

raw = {

    "Age (yrs)": age,

    "Weight (Kg)": weight,

    "Height(Cm)": height,

    "BMI": bmi,

    "Waist(inch)": waist,

    "Hip(inch)": hip,

    "Waist:Hip Ratio": waist_hip_ratio,

    "Cycle(R/I)":
        1
        if cycle_regular.lower() == "irregular"
        else 0,

    "Cycle length(days)": cycle_length,

    "Weight gain(Y/N)":
        1
        if weight_gain.lower() == "yes"
        else 0,

    "hair growth(Y/N)":
        1
        if hair_growth.lower() == "yes"
        else 0,

    "Skin darkening (Y/N)":
        1
        if skin_darkening.lower() == "yes"
        else 0,

    "Hair loss(Y/N)":
        1
        if hair_loss.lower() == "yes"
        else 0,

    "Pimples(Y/N)":
        1
        if pimples.lower() == "yes"
        else 0,

    "Reg.Exercise(Y/N)":
        0
        if regular_exercise.lower() == "yes"
        else 1,

    "Fast food (Y/N)":
        1
        if fast_food.lower() == "yes"
        else 0
}


# ============================================================
# ENGINEER USER FEATURES
# ============================================================

u = raw.copy()


u["symptom_count"] = (
    u["Weight gain(Y/N)"]
    +
    u["hair growth(Y/N)"]
    +
    u["Skin darkening (Y/N)"]
    +
    u["Hair loss(Y/N)"]
    +
    u["Pimples(Y/N)"]
)


u["metabolic_risk"] = (
    int(u["BMI"] > 25)
    +
    int(u["Waist:Hip Ratio"] > 0.85)
    +
    u["Fast food (Y/N)"]
    +
    u["Reg.Exercise(Y/N)"]
)


u["cycle_risk"] = (
    u["Cycle(R/I)"]
    *
    int(u["Cycle length(days)"] > 32)
)


u["pcos_triad"] = (
    u["hair growth(Y/N)"]
    *
    u["Pimples(Y/N)"]
    *
    u["Weight gain(Y/N)"]
)


u["androgenic_triad"] = (
    u["hair growth(Y/N)"]
    +
    u["Hair loss(Y/N)"]
    +
    u["Pimples(Y/N)"]
)


u["hormonal_load"] = (
    u["hair growth(Y/N)"] * 2
    +
    u["Skin darkening (Y/N)"] * 1.5
    +
    u["Pimples(Y/N)"] * 1.5
    +
    u["Hair loss(Y/N)"]
    +
    u["Weight gain(Y/N)"]
)


u["waist_height_ratio"] = (
    u["Waist(inch)"]
    /
    (u["Height(Cm)"] / 2.54)
)


u["central_obesity"] = int(
    u["Waist(inch)"] > 35
)


u["obese_irregular"] = (
    int(u["BMI"] > 27.5)
    *
    u["Cycle(R/I)"]
)


u["lifestyle_risk"] = (
    u["Fast food (Y/N)"] * 2
    +
    u["Reg.Exercise(Y/N)"]
    +
    int(u["BMI"] > 30) * 2
)


u["cycle_severity"] = (
    u["Cycle(R/I)"]
    *
    np.log1p(u["Cycle length(days)"])
)


u["young_symptomatic"] = (
    int(18 <= u["Age (yrs)"] <= 35)
    *
    u["symptom_count"]
)


u["symptom_metabolic"] = (
    u["symptom_count"]
    *
    u["metabolic_risk"]
)


u["bmi_whr_interaction"] = (
    u["BMI"]
    *
    u["Waist:Hip Ratio"]
)


u["insulin_resistance_flag"] = (
    u["Skin darkening (Y/N)"]
    *
    u["Weight gain(Y/N)"]
)


# ============================================================
# CREATE MODEL INPUT
# ============================================================

X = np.array([
    [u[f] for f in feature_names]
])


# ============================================================
# VERIFY PREDICTION
# ============================================================

probabilities = pipeline.predict_proba(X)[0]

print("\n==============================")
print("PREDICTION")
print("==============================")

print("Class probabilities:", probabilities)

print(
    "PCOS probability:",
    probabilities[1]
)


# ============================================================
# SHAP
# ============================================================

print("\n==============================")
print("INITIALIZING SHAP")
print("==============================")


explainer = shap.Explainer(
    pipeline.predict_proba,
    background
)


shap_values = explainer(X)


print("\nSHAP calculation successful!")

print(
    "SHAP values shape:",
    shap_values.values.shape
)


# ============================================================
# EXTRACT PCOS CLASS CONTRIBUTIONS
# ============================================================

values = shap_values.values


if len(values.shape) == 3:

    feature_contributions = values[0, :, 1]

else:

    feature_contributions = values[0]


# ============================================================
# RESULTS
# ============================================================

results = []

for feature, contribution in zip(
    feature_names,
    feature_contributions
):

    contribution = float(contribution)

    results.append({

        "feature": feature,

        "contribution": contribution,

        "absolute_contribution":
            abs(contribution)

    })


results = sorted(
    results,
    key=lambda x: x["absolute_contribution"],
    reverse=True
)


# ============================================================
# PRINT RESULTS
# ============================================================

print("\n==============================")
print("TOP FEATURE CONTRIBUTIONS")
print("==============================")


for item in results[:10]:

    direction = (
        "INCREASES RISK"
        if item["contribution"] > 0
        else
        "DECREASES RISK"
    )

    print(
        f"{item['feature']}: "
        f"{item['contribution']:.6f} "
        f"({direction})"
    )