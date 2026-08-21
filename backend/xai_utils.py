import joblib
import numpy as np
import pandas as pd
import shap


# ============================================================
# LOAD EXISTING MODEL
# ============================================================

pipeline = joblib.load("pcos_pipeline_v3.pkl")
feature_names = joblib.load("feature_names_v3.pkl")

print("XAI: Pipeline loaded.")
print("XAI: Total model features:", len(feature_names))


# ============================================================
# REUSE EXISTING FEATURE ENGINEERING
# ============================================================

from model_utils import compute_engineered_features


# ============================================================
# ORIGINAL DATASET FEATURES
# EXACTLY SAME AS TRAINING
# ============================================================

DATASET_FEATURES = [
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

TARGET = 'PCOS (Y/N)'


# ============================================================
# BUILD SHAP BACKGROUND
# ============================================================

def build_shap_background():

    df = pd.read_csv("PCOS_Cleaned_Dataset.csv")

    df.columns = df.columns.str.strip()

    print("XAI: Dataset shape:", df.shape)

    # Keep exactly the features used during training
    df = df[DATASET_FEATURES + [TARGET]].copy()

    # Same missing-value handling as training
    df = df.fillna(df.median(numeric_only=True))
    df = df.fillna("N")

    # --------------------------------------------------------
    # Binary encoding
    # --------------------------------------------------------

    binary_cols = [
        'Weight gain(Y/N)',
        'hair growth(Y/N)',
        'Skin darkening (Y/N)',
        'Hair loss(Y/N)',
        'Pimples(Y/N)',
        'Fast food (Y/N)'
    ]

    def encode_yn(value):

        s = str(value).strip().upper()

        if s in ('Y', 'YES', '1', '1.0', 'TRUE'):
            return 1

        if s in ('N', 'NO', '0', '0.0', 'FALSE'):
            return 0

        return np.nan

    for col in binary_cols:
        df[col] = df[col].apply(encode_yn)

    # --------------------------------------------------------
    # Exercise encoding
    # No exercise = 1
    # --------------------------------------------------------

    df['Reg.Exercise(Y/N)'] = df['Reg.Exercise(Y/N)'].apply(
        lambda v:
            0
            if str(v).strip().upper() in ('Y', 'YES', '1', '1.0')
            else
            1
            if str(v).strip().upper() in ('N', 'NO', '0', '0.0')
            else np.nan
    )

    # --------------------------------------------------------
    # Cycle encoding
    # Irregular = 1
    # --------------------------------------------------------

    df['Cycle(R/I)'] = df['Cycle(R/I)'].apply(
        lambda v:
            1
            if str(v).strip().upper() in ('I', 'IRREGULAR', '2')
            else
            0
            if str(v).strip().upper() in ('R', 'REGULAR', '4', '1')
            else np.nan
    )

    # --------------------------------------------------------
    # Fill encoded missing values
    # --------------------------------------------------------

    for col in binary_cols + [
        'Reg.Exercise(Y/N)',
        'Cycle(R/I)'
    ]:

        if df[col].isnull().any():
            df[col] = df[col].fillna(df[col].mode()[0])

    # --------------------------------------------------------
    # Numeric conversion
    # --------------------------------------------------------

    for col in df.columns:

        if col != TARGET:

            df[col] = pd.to_numeric(
                df[col],
                errors='coerce'
            )

    df = df.fillna(
        df.median(numeric_only=True)
    )

    # ========================================================
    # FEATURE ENGINEERING
    # REUSE EXACT SAME FUNCTION AS MODEL
    # ========================================================

    engineered_rows = []

    for _, row in df.iterrows():

        raw = row[DATASET_FEATURES].to_dict()

        engineered = compute_engineered_features(raw)

        engineered_rows.append(engineered)

    engineered_df = pd.DataFrame(engineered_rows)

    # --------------------------------------------------------
    # Select exact model features
    # --------------------------------------------------------

    background_df = engineered_df[feature_names].copy()

    print(
        "XAI: Background dataset shape:",
        background_df.shape
    )

    # --------------------------------------------------------
    # Verify feature order
    # --------------------------------------------------------

    if list(background_df.columns) != list(feature_names):

        raise ValueError(
            "XAI: Feature order does not match model."
        )

    print("XAI: Feature order verified.")

    # --------------------------------------------------------
    # Representative real-data background
    # --------------------------------------------------------

    background_size = min(
        100,
        len(background_df)
    )

    background_df = background_df.sample(
        n=background_size,
        random_state=42
    )

    print(
        "XAI: SHAP background shape:",
        background_df.shape
    )

    return background_df


# ============================================================
# CREATE BACKGROUND ONCE
# ============================================================

SHAP_BACKGROUND = build_shap_background()


# ============================================================
# CREATE SHAP EXPLAINER ONCE
# ============================================================

print("XAI: Initializing SHAP explainer...")

explainer = shap.Explainer(
    pipeline.predict_proba,
    SHAP_BACKGROUND
)

print("XAI: SHAP explainer ready.")


# ============================================================
# BUILD USER MODEL INPUT
# ============================================================

def build_user_features(data):

    bmi = round(
        data.weight /
        ((data.height / 100) ** 2),
        2
    )

    waist_hip_ratio = round(
        data.waist / data.hip,
        2
    )

    # --------------------------------------------------------
    # Raw features
    # SAME AS model_utils.py
    # --------------------------------------------------------

    raw = {

        "Age (yrs)": data.age,

        "Weight (Kg)": data.weight,

        "Height(Cm)": data.height,

        "BMI": bmi,

        "Waist(inch)": data.waist,

        "Hip(inch)": data.hip,

        "Waist:Hip Ratio": waist_hip_ratio,

        "Cycle(R/I)":
            1
            if data.cycle_regular.lower() == "irregular"
            else 0,

        "Cycle length(days)": data.cycle_length,

        "Weight gain(Y/N)":
            1
            if data.weight_gain.lower() == "yes"
            else 0,

        "hair growth(Y/N)":
            1
            if data.hair_growth.lower() == "yes"
            else 0,

        "Skin darkening (Y/N)":
            1
            if data.skin_darkening.lower() == "yes"
            else 0,

        "Hair loss(Y/N)":
            1
            if data.hair_loss.lower() == "yes"
            else 0,

        "Pimples(Y/N)":
            1
            if data.pimples.lower() == "yes"
            else 0,

        # No exercise = 1
        "Reg.Exercise(Y/N)":
            0
            if data.regular_exercise.lower() == "yes"
            else 1,

        "Fast food (Y/N)":
            1
            if data.fast_food.lower() == "yes"
            else 0
    }

    # ========================================================
    # EXACT SAME FEATURE ENGINEERING
    # ========================================================

    full_input = compute_engineered_features(raw)

    # --------------------------------------------------------
    # DataFrame is intentional:
    # preserves feature names for explainability
    # --------------------------------------------------------

    X = pd.DataFrame(
        [[full_input[f] for f in feature_names]],
        columns=feature_names
    )

    return X


# ============================================================
# HUMAN-READABLE FEATURE NAMES
# ============================================================

FEATURE_LABELS = {

    "Age (yrs)": "Age",

    "Weight (Kg)": "Weight",

    "Height(Cm)": "Height",

    "BMI": "BMI",

    "Waist(inch)": "Waist circumference",

    "Hip(inch)": "Hip circumference",

    "Waist:Hip Ratio": "Waist-to-hip ratio",

    "Cycle(R/I)": "Menstrual cycle regularity",

    "Cycle length(days)": "Cycle length",

    "Weight gain(Y/N)": "Weight gain",

    "hair growth(Y/N)": "Excess hair growth",

    "Skin darkening (Y/N)": "Skin darkening",

    "Hair loss(Y/N)": "Hair loss",

    "Pimples(Y/N)": "Pimples / acne",

    "Reg.Exercise(Y/N)": "Regular exercise",

    "Fast food (Y/N)": "Fast food consumption",

    "symptom_count": "Overall symptom count",

    "metabolic_risk": "Metabolic risk",

    "cycle_risk": "Cycle-related risk",

    "pcos_triad": "PCOS symptom combination",

    "androgenic_triad": "Androgenic symptoms",

    "hormonal_load": "Hormonal symptom load",

    "waist_height_ratio": "Waist-to-height ratio",

    "central_obesity": "Central obesity indicator",

    "obese_irregular": "Obesity with irregular cycle",

    "lifestyle_risk": "Lifestyle risk",

    "cycle_severity": "Cycle severity",

    "young_symptomatic": "Age and symptom interaction",

    "symptom_metabolic": "Symptom-metabolic interaction",

    "bmi_whr_interaction": "BMI and waist-to-hip interaction",

    "insulin_resistance_flag": "Insulin-resistance indicator"
}


# ============================================================
# FEATURE GROUPS
# ============================================================

FEATURE_GROUPS = {

    "Hormonal & Symptom Indicators": [
        "hormonal_load",
        "symptom_count",
        "hair growth(Y/N)",
        "Hair loss(Y/N)",
        "Pimples(Y/N)",
        "Skin darkening (Y/N)",
        "pcos_triad",
        "androgenic_triad",
        "young_symptomatic"
    ],

    "Menstrual Cycle Pattern": [
        "Cycle(R/I)",
        "Cycle length(days)",
        "cycle_risk",
        "cycle_severity"
    ],

    "Metabolic Indicators": [
        "metabolic_risk",
        "symptom_metabolic",
        "insulin_resistance_flag",
        "Weight gain(Y/N)"
    ],

    "Body Composition": [
        "BMI",
        "Weight (Kg)",
        "Waist(inch)",
        "Hip(inch)",
        "Waist:Hip Ratio",
        "waist_height_ratio",
        "central_obesity",
        "obese_irregular",
        "bmi_whr_interaction"
    ],

    "Lifestyle Factors": [
        "Fast food (Y/N)",
        "Reg.Exercise(Y/N)",
        "lifestyle_risk"
    ],

    "Demographic Factors": [
        "Age (yrs)",
        "Height(Cm)"
    ]
}


# ============================================================
# GET FEATURE GROUP
# ============================================================

def get_feature_group(feature):

    for group, features in FEATURE_GROUPS.items():

        if feature in features:
            return group

    return "Other"


# ============================================================
# MAIN XAI FUNCTION
# ============================================================

def explain_pcos_prediction(data, top_n=10):

    # --------------------------------------------------------
    # Build exact model input
    # --------------------------------------------------------

    X = build_user_features(data)

    # --------------------------------------------------------
    # Existing prediction
    # --------------------------------------------------------

    probabilities = pipeline.predict_proba(X)[0]

    pcos_probability = float(probabilities[1])

    # --------------------------------------------------------
    # SHAP explanation
    # --------------------------------------------------------

    shap_values = explainer(X)

    values = shap_values.values

    if len(values.shape) == 3:

        contributions = values[0, :, 1]

    else:

        contributions = values[0]

    # --------------------------------------------------------
    # Build feature results
    # --------------------------------------------------------

    results = []

    for feature, contribution in zip(
        feature_names,
        contributions
    ):

        contribution = float(contribution)

        results.append({

            "feature": feature,

            "label": FEATURE_LABELS.get(
                feature,
                feature
            ),

            "contribution": round(
                contribution,
                6
            ),

            "absolute_contribution": round(
                abs(contribution),
                6
            ),

            "direction":
                "increases"
                if contribution > 0
                else
                "decreases",

            "group":
                get_feature_group(feature)
        })

    # --------------------------------------------------------
    # Sort by absolute contribution
    # --------------------------------------------------------

    results.sort(
        key=lambda x: x["absolute_contribution"],
        reverse=True
    )

    top_features = results[:top_n]

    # ========================================================
    # GROUP CONTRIBUTIONS
    # ========================================================

    grouped = {}

    for item in results:

        group = item["group"]

        if group not in grouped:
            grouped[group] = 0.0

        grouped[group] += item["contribution"]

    grouped_results = []

    for group, contribution in grouped.items():

        grouped_results.append({

            "group": group,

            "contribution": round(
                float(contribution),
                6
            ),

            "absolute_contribution": round(
                abs(float(contribution)),
                6
            ),

            "direction":
                "increases"
                if contribution > 0
                else
                "decreases"
        })

    grouped_results.sort(
        key=lambda x: x["absolute_contribution"],
        reverse=True
    )

    # ========================================================
    # RETURN XAI DATA
    # ========================================================

    return {

        "pcos_probability":
            round(pcos_probability, 6),

        "top_features":
            top_features,

        "feature_contributions":
            results,

        "group_contributions":
            grouped_results
    }