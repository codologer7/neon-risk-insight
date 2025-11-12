# FastAPI Backend Setup Guide

## Overview
This guide helps you set up the Python FastAPI backend for the loan risk prediction model.

**Important:** Lovable doesn't support Python backends. You need to run the FastAPI server separately on your local machine or deploy it to a hosting service (Railway, Heroku, Render, etc.).

## Prerequisites
- Python 3.8+
- FastAPI
- joblib
- uvicorn
- pydantic
- scikit-learn (for isotonic regression)
- lightgbm
- fastapi-cors

## Backend Structure

Create a new folder called `backend/` with the following structure:

```
backend/
├── artifacts/
│   ├── model_lgb.pkl
│   ├── calibrator_iso.pkl
│   ├── feature_medians.pkl
│   ├── label_encoders.pkl
│   └── artifacts_meta.json
├── main.py
└── requirements.txt
```

## Step 1: Install Dependencies

Create `requirements.txt`:

```txt
fastapi==0.104.1
uvicorn==0.24.0
pydantic==2.5.0
joblib==1.3.2
scikit-learn==1.3.2
lightgbm==4.1.0
python-multipart==0.0.6
```

Install:
```bash
pip install -r requirements.txt
```

## Step 2: Copy Model Artifacts

Copy all the uploaded artifacts to `backend/artifacts/`:
- model_lgb.pkl
- calibrator_iso.pkl
- feature_medians.pkl
- label_encoders.pkl
- artifacts_meta.json

## Step 3: Create main.py

```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import json
import numpy as np
from typing import Dict, Any

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:5173"],  # Add your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load artifacts at startup
model = joblib.load("artifacts/model_lgb.pkl")
calibrator = joblib.load("artifacts/calibrator_iso.pkl")
feature_medians = joblib.load("artifacts/feature_medians.pkl")
label_encoders = joblib.load("artifacts/label_encoders.pkl")

with open("artifacts/artifacts_meta.json", "r") as f:
    meta = json.load(f)

feature_columns = meta["feature_columns"]
cutoffs = meta["cutoffs"]

class ApplicantData(BaseModel):
    annual_income: float
    credit_amount: float
    annuity: float
    age: int
    employment_years: int
    gender: str
    contract_type: str
    education: str

class PredictionRequest(BaseModel):
    data: ApplicantData

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/score")
def score(request: PredictionRequest):
    try:
        data = request.data
        
        # Create a dictionary with all features initialized to medians
        features = {col: feature_medians.get(col, 0) for col in feature_columns}
        
        # Map form inputs to model features
        features["AMT_INCOME_TOTAL"] = data.annual_income
        features["AMT_CREDIT"] = data.credit_amount
        features["AMT_ANNUITY"] = data.annuity
        features["DAYS_BIRTH"] = -data.age * 365
        features["DAYS_EMPLOYED"] = -data.employment_years * 365
        
        # Encode categorical features
        if "NAME_CONTRACT_TYPE" in label_encoders and "NAME_CONTRACT_TYPE" in features:
            try:
                features["NAME_CONTRACT_TYPE"] = label_encoders["NAME_CONTRACT_TYPE"].transform([data.contract_type])[0]
            except:
                features["NAME_CONTRACT_TYPE"] = feature_medians.get("NAME_CONTRACT_TYPE", 0)
        
        if "CODE_GENDER" in label_encoders and "CODE_GENDER" in features:
            try:
                features["CODE_GENDER"] = label_encoders["CODE_GENDER"].transform([data.gender])[0]
            except:
                features["CODE_GENDER"] = feature_medians.get("CODE_GENDER", 0)
        
        if "NAME_EDUCATION_TYPE" in label_encoders and "NAME_EDUCATION_TYPE" in features:
            try:
                features["NAME_EDUCATION_TYPE"] = label_encoders["NAME_EDUCATION_TYPE"].transform([data.education])[0]
            except:
                features["NAME_EDUCATION_TYPE"] = feature_medians.get("NAME_EDUCATION_TYPE", 0)
        
        # Arrange features in the correct order
        X = np.array([[features[col] for col in feature_columns]])
        
        # Predict
        raw_prob = model.predict_proba(X)[0, 1]
        calibrated_prob = calibrator.predict(np.array([raw_prob]))[0]
        
        # Assign risk bucket
        if calibrated_prob <= cutoffs["A"]:
            bucket = "A"
        elif calibrated_prob <= cutoffs["B"]:
            bucket = "B"
        elif calibrated_prob <= cutoffs["C"]:
            bucket = "C"
        else:
            bucket = "D"
        
        return {
            "probability": float(calibrated_prob),
            "bucket": bucket
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

## Step 4: Run the Backend

```bash
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The backend will be available at `http://localhost:8000`

## Step 5: Test the Backend

Visit `http://localhost:8000/docs` to see the interactive API documentation.

Test the health endpoint:
```bash
curl http://localhost:8000/health
```

## Step 6: Run the Frontend

In a separate terminal:
```bash
npm run dev
```

The frontend will connect to the backend automatically using the `VITE_API_URL` environment variable.

## Deployment Options

### Option 1: Railway
1. Create account at railway.app
2. Create new project
3. Connect your GitHub repo or upload code
4. Railway will auto-detect Python and deploy

### Option 2: Render
1. Create account at render.com
2. New Web Service
3. Connect GitHub or upload code
4. Set build command: `pip install -r requirements.txt`
5. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Option 3: Heroku
1. Create account at heroku.com
2. Install Heroku CLI
3. Create `Procfile`: `web: uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Deploy with `git push heroku main`

## Troubleshooting

### CORS Issues
Make sure the backend CORS settings include your frontend URL.

### Model Loading Errors
Verify all .pkl files are in the `artifacts/` folder.

### Port Conflicts
If port 8000 is in use, change it in both the backend command and the `.env` file.

### Encoding Errors
If categorical values don't match training data, the model will use median fallback values.
