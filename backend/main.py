# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from schemas import PCOSInput
# from model_utils import predict_pcos


# from schemas import PCOSInput
# from model_utils import predict_pcos
# from xai_utils import explain_pcos_prediction
# app = FastAPI(title="PCOS Prediction API")

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# @app.get("/")
# def home():
#     return {"message": "PCOS Prediction Backend Running"}

# @app.post("/predict")
# def predict(data: PCOSInput):
#     result = predict_pcos(data)
#     return result

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from schemas import PCOSInput
from model_utils import predict_pcos
from xai_utils import explain_pcos_prediction


app = FastAPI(title="PCOS Prediction API")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "PCOS Prediction Backend Running"
    }


@app.post("/predict")
def predict(data: PCOSInput):

    # Existing real prediction
    result = predict_pcos(data)

    # Real SHAP-based XAI
    xai_result = explain_pcos_prediction(data)

    # Attach XAI to prediction response
    result["xai"] = xai_result

    return result