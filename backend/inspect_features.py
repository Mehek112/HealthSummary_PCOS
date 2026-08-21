import joblib
import numpy as np

pipeline = joblib.load("pcos_pipeline_v3.pkl")
feature_names = joblib.load("feature_names_v3.pkl")

model = pipeline.named_steps["model"]

print("\nTOTAL FEATURES:", len(feature_names))

print("\nFEATURE NAMES:")
for i, feature in enumerate(feature_names):
    print(i, "-", feature)

print("\n\n==============================")
print("BASE MODEL FEATURE IMPORTANCE")
print("==============================")

for name, estimator in model.named_estimators_.items():

    print(f"\n--- {name.upper()} ---")

    if hasattr(estimator, "feature_importances_"):
        importances = estimator.feature_importances_

        indices = np.argsort(importances)[::-1]

        for i in indices:
            print(
                f"{feature_names[i]}: "
                f"{importances[i]:.4f}"
            )

    else:
        print("This model does not have feature_importances_")