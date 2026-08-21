import joblib

pipeline = joblib.load("pcos_pipeline_v3.pkl")

print("\nMODEL TYPE:")
print(type(pipeline))

print("\nMODEL:")
print(pipeline)

print("\nAVAILABLE ATTRIBUTES:")
print([attr for attr in dir(pipeline) if attr.endswith("_")])