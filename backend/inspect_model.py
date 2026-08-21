import joblib

pipeline = joblib.load("pcos_pipeline_v3.pkl")

model = pipeline.named_steps["model"]

print("\nSTACKING MODEL TYPE:")
print(type(model))

print("\nFITTED ATTRIBUTES:")
print([attr for attr in dir(model) if attr.endswith("_")])

print("\nBASE ESTIMATORS:")
print(model.estimators_)

print("\nFINAL ESTIMATOR:")
print(model.final_estimator_)

print("\nFINAL ESTIMATOR COEFFICIENTS:")
if hasattr(model.final_estimator_, "coef_"):
    print(model.final_estimator_.coef_)
else:
    print("No coef_ found")