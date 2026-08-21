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
# LOAD CLEANED DATASET
# ============================================================

df = pd.read_csv("PCOS_Cleaned_Dataset.csv")

df.columns = df.columns.str.strip()

print("\nDataset shape:", df.shape)


# ============================================================
# ORIGINAL FEATURES USED BY MODEL
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
# KEEP ONLY TRAINING FEATURES + TARGET
# ============================================================

df = df[features + [target]].copy()


# ============================================================
# MISSING VALUES
# SAME LOGIC AS COLAB TRAINING
# ============================================================

df = df.fillna(df.median(numeric_only=True))
df = df.fillna("N")


# ============================================================
# ENCODING
# SAME LOGIC AS COLAB
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
# EXERCISE
# SAME LOGIC AS TRAINING
# ============================================================

df['Reg.Exercise(Y/N)'] = df['Reg.Exercise(Y/N)'].apply(
    lambda v:
        0 if str(v).strip().upper() in ('Y', 'YES', '1', '1.0')
        else 1 if str(v).strip().upper() in ('N', 'NO', '0', '0.0')
        else np.nan
)


# ============================================================
# CYCLE
# SAME LOGIC AS TRAINING
# ============================================================

df['Cycle(R/I)'] = df['Cycle(R/I)'].apply(
    lambda v:
        1 if str(v).strip().upper() in ('I', 'IRREGULAR', '2')
        else 0 if str(v).strip().upper() in ('R', 'REGULAR', '4', '1')
        else np.nan
)


# ============================================================
# FILL ENCODING MISSING VALUES
# ============================================================

for col in binary_cols + [
    'Reg.Exercise(Y/N)',
    'Cycle(R/I)'
]:

    if df[col].isnull().any():
        df[col] = df[col].fillna(df[col].mode()[0])


# ============================================================
# NUMERIC CONVERSION
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
# EXACT SAME AS TRAINING
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
    df['Fast food(Y/N)'] if 'Fast food(Y/N)' in df.columns else 0
)