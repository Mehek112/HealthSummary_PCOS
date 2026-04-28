from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from schemas import PCOSInput
from model_utils import predict_pcos

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
    return {"message": "PCOS Prediction Backend Running"}

@app.post("/predict")
def predict(data: PCOSInput):
    result = predict_pcos(data)
    return result