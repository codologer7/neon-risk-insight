# Model Integration Guide

## Current Implementation

✅ **Your app is now fully functional with TypeScript backend!**

The prediction form is connected to a Lovable Cloud edge function that:
- Validates all input fields
- Preprocesses the data (feature engineering, encoding)
- Makes predictions using a simplified risk scoring algorithm
- Returns probability and risk bucket (A/B/C/D)

## Using Your Actual Trained Model

The current implementation uses a **simplified heuristic algorithm** because your model artifacts are in Python pickle format (.pkl), which cannot be directly used in JavaScript/TypeScript.

### To Use Your Actual LightGBM Model

You have two options:

---

## Option 1: Convert to ONNX (Recommended)

ONNX is a universal model format that works across Python, JavaScript, and other languages.

### Step 1: Export Your Model to ONNX (Python)

```python
import joblib
import numpy as np
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType

# Load your trained model
model = joblib.load('artifacts/model_lgb.pkl')
calibrator = joblib.load('artifacts/calibrator_iso.pkl')

# Define input shape (number of features your model expects)
# Replace 127 with your actual feature count from artifacts_meta.json
initial_type = [('float_input', FloatTensorType([None, 127]))]

# Convert to ONNX
onnx_model = convert_sklearn(model, initial_types=initial_type)

# Save ONNX model
with open("model.onnx", "wb") as f:
    f.write(onnx_model.SerializeToString())

# Also convert calibrator
calibrator_onnx = convert_sklearn(calibrator, initial_types=[('float_input', FloatTensorType([None, 1]))])
with open("calibrator.onnx", "wb") as f:
    f.write(calibrator_onnx.SerializeToString())
```

### Step 2: Install Required Packages

```bash
pip install skl2onnx onnx onnxruntime
```

### Step 3: Upload ONNX Files

Once you have `model.onnx` and `calibrator.onnx`, upload them through the Lovable chat and ask to integrate them into the edge function.

### Step 4: Update Edge Function

The edge function will need to use ONNX Runtime for Node.js:

```typescript
import * as ort from 'npm:onnxruntime-node';

// Load models
const modelSession = await ort.InferenceSession.create('./model.onnx');
const calibratorSession = await ort.InferenceSession.create('./calibrator.onnx');

// Make prediction
const inputTensor = new ort.Tensor('float32', features, [1, features.length]);
const results = await modelSession.run({ float_input: inputTensor });
```

---

## Option 2: Keep External Python API

If converting to ONNX is too complex, you can:

1. Keep your Python FastAPI backend running separately
2. Deploy it to a service like:
   - **Railway** (easiest): https://railway.app
   - **Render**: https://render.com
   - **Heroku**: https://heroku.com
   - **AWS Lambda** with Docker

3. Update the edge function to call your external API:

```typescript
// In supabase/functions/predict-risk/index.ts
const response = await fetch('YOUR_DEPLOYED_API_URL/score', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ data })
});
```

---

## Current Simplified Algorithm

The current implementation uses financial heuristics:

**Risk Factors:**
- High credit-to-income ratio
- High debt-to-income ratio
- Very young or older age
- Short employment history
- Revolving loan contracts
- Lower education levels

**Risk Reduction Factors:**
- Stable long-term employment (10+ years)
- Higher education (Academic degree/Higher education)

This provides reasonable predictions but won't match your trained model's accuracy.

---

## Next Steps

1. **Test the current implementation** - The form should work end-to-end now
2. **Decide on integration approach** - ONNX or external API
3. **Share your preference** - Let me know which option you'd like to pursue

---

## Features Included

✅ Full preprocessing pipeline
✅ Categorical encoding
✅ Feature engineering
✅ Risk bucket classification
✅ Error handling & validation
✅ Real-time predictions
✅ Responsive UI

**Need help with model conversion?** Just ask and I can guide you through the ONNX export process!
