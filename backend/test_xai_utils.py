from xai_utils import explain_pcos_prediction


# ============================================================
# TEST INPUT
# SAME USER USED IN PREVIOUS SHAP TEST
# ============================================================

class TestData:

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
# RUN XAI
# ============================================================

result = explain_pcos_prediction(
    TestData(),
    top_n=10
)


# ============================================================
# PRINT
# ============================================================

print("\n==============================")
print("XAI TEST RESULT")
print("==============================")

print(
    "PCOS probability:",
    result["pcos_probability"]
)

print("\nTOP FEATURES")

for item in result["top_features"]:

    print(
        f"{item['label']}: "
        f"{item['contribution']:.6f} "
        f"({item['direction'].upper()})"
    )

print("\nGROUP CONTRIBUTIONS")

for item in result["group_contributions"]:

    print(
        f"{item['group']}: "
        f"{item['contribution']:.6f} "
        f"({item['direction'].upper()})"
    )