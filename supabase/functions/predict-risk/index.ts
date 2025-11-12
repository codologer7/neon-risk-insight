import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Load metadata
import meta from './artifacts_meta.json' with { type: 'json' };

interface ApplicantData {
  annual_income: number;
  credit_amount: number;
  annuity: number;
  age: number;
  employment_years: number;
  gender: string;
  contract_type: string;
  education: string;
}

interface PredictionRequest {
  data: ApplicantData;
}

// Feature medians for imputation (these should match your feature_medians.pkl)
const FEATURE_MEDIANS: Record<string, number> = {
  "AMT_INCOME_TOTAL": 147150.0,
  "AMT_CREDIT": 599025.0,
  "AMT_ANNUITY": 27108.0,
  "AMT_GOODS_PRICE": 450000.0,
  "DAYS_BIRTH": -13993,
  "DAYS_EMPLOYED": -2010,
  "DAYS_REGISTRATION": -4427,
  "DAYS_ID_PUBLISH": -3053,
  "CNT_CHILDREN": 0,
  "CNT_FAM_MEMBERS": 2,
};

// Label encodings (simplified - these should match your label_encoders.pkl)
const GENDER_ENCODING: Record<string, number> = { "M": 0, "F": 1 };
const CONTRACT_ENCODING: Record<string, number> = { 
  "Cash loans": 0, 
  "Revolving loans": 1 
};
const EDUCATION_ENCODING: Record<string, number> = {
  "Secondary / secondary special": 0,
  "Higher education": 1,
  "Incomplete higher": 2,
  "Lower secondary": 3,
  "Academic degree": 4,
};

// Risk cutoffs from metadata
const cutoffs = meta.cutoffs;

/**
 * Simplified prediction function
 * NOTE: This is a placeholder implementation. For production, you should:
 * 1. Export your LightGBM model to ONNX format using Python
 * 2. Use ONNX Runtime Web or ONNX Runtime Node in this edge function
 * 3. Load and run inference with the actual trained model
 */
function predictRisk(data: ApplicantData): { probability: number; bucket: string } {
  // Preprocess the input data
  const income = data.annual_income;
  const credit = data.credit_amount;
  const annuity = data.annuity;
  const age = data.age;
  const employment = data.employment_years;
  
  // Calculate derived features
  const creditToIncome = credit / income;
  const annuityToIncome = annuity / income;
  const debtToIncome = (annuity * 12) / income;
  
  // Simplified risk scoring (replace with actual model inference)
  // This is a basic heuristic that should be replaced with your actual model
  let riskScore = 0;
  
  // Credit to income ratio impact
  if (creditToIncome > 3) riskScore += 0.08;
  else if (creditToIncome > 2) riskScore += 0.05;
  else if (creditToIncome > 1) riskScore += 0.03;
  
  // Debt to income ratio impact
  if (debtToIncome > 0.5) riskScore += 0.06;
  else if (debtToIncome > 0.3) riskScore += 0.03;
  
  // Age impact (very young or older applicants might have higher risk)
  if (age < 25) riskScore += 0.04;
  else if (age > 60) riskScore += 0.02;
  
  // Employment years impact
  if (employment < 1) riskScore += 0.05;
  else if (employment < 3) riskScore += 0.03;
  else if (employment > 10) riskScore -= 0.02; // Reduce risk for stable employment
  
  // Contract type impact
  if (data.contract_type === "Revolving loans") riskScore += 0.02;
  
  // Education impact
  if (data.education === "Academic degree" || data.education === "Higher education") {
    riskScore -= 0.02;
  } else if (data.education === "Lower secondary") {
    riskScore += 0.02;
  }
  
  // Normalize to 0-1 range and add some randomness for variation
  const baseProbability = Math.max(0, Math.min(0.4, riskScore));
  const probability = baseProbability + (Math.random() * 0.02 - 0.01); // Add small variance
  
  // Assign risk bucket based on cutoffs
  let bucket = "D";
  if (probability <= cutoffs.A) bucket = "A";
  else if (probability <= cutoffs.B) bucket = "B";
  else if (probability <= cutoffs.C) bucket = "C";
  
  console.log('Prediction:', {
    input: data,
    features: { creditToIncome, annuityToIncome, debtToIncome },
    probability,
    bucket
  });
  
  return { probability, bucket };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: PredictionRequest = await req.json();
    console.log('Received prediction request:', body);
    
    // Validate input
    if (!body.data) {
      throw new Error('Missing data field in request');
    }
    
    const { data } = body;
    
    // Validate required fields
    const requiredFields = ['annual_income', 'credit_amount', 'annuity', 'age', 'employment_years', 'gender', 'contract_type', 'education'];
    for (const field of requiredFields) {
      if (!(field in data)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    // Make prediction
    const result = predictRisk(data);
    
    console.log('Prediction result:', result);
    
    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in predict-risk function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: 'Failed to process prediction request'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
