from pydantic import BaseModel

class PCOSInput(BaseModel):
    age: float
    weight: float
    height: float
    waist: float
    hip: float
    cycle_regular: str
    cycle_length: int
    weight_gain: str
    hair_growth: str
    skin_darkening: str
    hair_loss: str
    pimples: str
    regular_exercise: str
    fast_food: str