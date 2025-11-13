import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, TrendingUp, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PredictionResult {
  probability: number;
  riskBucket: string;
}

const Predict = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  
  const [formData, setFormData] = useState({
    income: "",
    creditAmount: "",
    annuity: "",
    age: "",
    employmentYears: "",
    gender: "",
    contractType: "",
    education: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getRiskColor = (bucket: string) => {
    switch (bucket) {
      case "A": return "text-risk-a";
      case "B": return "text-risk-b";
      case "C": return "text-risk-c";
      case "D": return "text-risk-d";
      default: return "text-foreground";
    }
  };

  const getRiskLabel = (bucket: string) => {
    switch (bucket) {
      case "A": return "Low Risk";
      case "B": return "Moderate Risk";
      case "C": return "High Risk";
      case "D": return "Very High Risk";
      default: return "Unknown";
    }
  };

  const handlePredict = async () => {
    // Validation
    const requiredFields = Object.entries(formData);
    const emptyFields = requiredFields.filter(([_, value]) => !value);
    
    if (emptyFields.length > 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields before predicting.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('predict-risk', {
        body: {
          data: {
            annual_income: parseFloat(formData.income),
            credit_amount: parseFloat(formData.creditAmount),
            annuity: parseFloat(formData.annuity),
            age: parseInt(formData.age),
            employment_years: parseInt(formData.employmentYears),
            gender: formData.gender,
            contract_type: formData.contractType,
            education: formData.education,
          }
        }
      });

      if (error) {
        throw new Error(error.message || 'Prediction failed');
      }
      
      if (!data) {
        throw new Error('No data returned from prediction');
      }
      
      setResult({
        probability: data.probability,
        riskBucket: data.bucket,
      });
      
      toast({
        title: "Prediction Complete",
        description: "Risk analysis has been calculated successfully.",
      });
    } catch (error) {
      console.error("Prediction error:", error);
      toast({
        title: "Prediction Failed",
        description: error instanceof Error ? error.message : "Failed to process prediction request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 py-4 px-6">
        <div className="container mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Back to Home</span>
          </Link>
          <h1 className="text-2xl font-bold text-gradient">Risk Predictor</h1>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Form Section */}
          <div>
            <Card className="border-gradient">
              <CardHeader>
                <CardTitle className="text-2xl text-gradient">Applicant Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="income">Income (₹)</Label>
                    <Input
                      id="income"
                      type="number"
                      placeholder="50000"
                      value={formData.income}
                      onChange={(e) => handleInputChange("income", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="creditAmount">Credit Amount (₹)</Label>
                    <Input
                      id="creditAmount"
                      type="number"
                      placeholder="25000"
                      value={formData.creditAmount}
                      onChange={(e) => handleInputChange("creditAmount", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="annuity">Annuity (₹)</Label>
                    <Input
                      id="annuity"
                      type="number"
                      placeholder="1500"
                      value={formData.annuity}
                      onChange={(e) => handleInputChange("annuity", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="35"
                      value={formData.age}
                      onChange={(e) => handleInputChange("age", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employmentYears">Employment Years</Label>
                  <Input
                    id="employmentYears"
                    type="number"
                    placeholder="5"
                    value={formData.employmentYears}
                    onChange={(e) => handleInputChange("employmentYears", e.target.value)}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">Male</SelectItem>
                        <SelectItem value="F">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contractType">Contract Type</Label>
                    <Select value={formData.contractType} onValueChange={(value) => handleInputChange("contractType", value)}>
                      <SelectTrigger id="contractType">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cash loans">Cash Loan</SelectItem>
                        <SelectItem value="Revolving loans">Revolving Loan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="education">Education Level</Label>
                  <Select value={formData.education} onValueChange={(value) => handleInputChange("education", value)}>
                    <SelectTrigger id="education">
                      <SelectValue placeholder="Select education" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Secondary / secondary special">Secondary</SelectItem>
                      <SelectItem value="Higher education">Higher Education</SelectItem>
                      <SelectItem value="Incomplete higher">Incomplete Higher</SelectItem>
                      <SelectItem value="Lower secondary">Lower Secondary</SelectItem>
                      <SelectItem value="Academic degree">Academic Degree</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  variant="hero" 
                  size="lg" 
                  className="w-full text-lg"
                  onClick={handlePredict}
                  disabled={loading}
                >
                  {loading ? "Analyzing..." : "🔮 Predict Risk"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {result ? (
              <>
                <Card className="border-gradient">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Default Probability
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-6">
                      <div className="text-6xl font-bold text-gradient mb-2">
                        {(result.probability * 100).toFixed(1)}%
                      </div>
                      <Progress value={result.probability * 100} className="h-3 mt-4" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gradient">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-primary" />
                      Risk Classification
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className={`text-5xl font-bold mb-2 ${getRiskColor(result.riskBucket)}`}>
                        Bucket {result.riskBucket}
                      </div>
                      <div className="text-xl text-muted-foreground">
                        {getRiskLabel(result.riskBucket)}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gradient bg-card/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Risk Bucket Guide</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-risk-a/20 flex items-center justify-center text-risk-a font-bold">A</div>
                      <span className="text-muted-foreground">Low Risk (0-6%)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-risk-b/20 flex items-center justify-center text-risk-b font-bold">B</div>
                      <span className="text-muted-foreground">Moderate Risk (6-12%)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-risk-c/20 flex items-center justify-center text-risk-c font-bold">C</div>
                      <span className="text-muted-foreground">High Risk (12-20%)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-risk-d/20 flex items-center justify-center text-risk-d font-bold">D</div>
                      <span className="text-muted-foreground">Very High Risk (20%+)</span>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="border-gradient h-full flex items-center justify-center">
                <CardContent className="text-center py-16">
                  <div className="text-6xl mb-4 opacity-50">📊</div>
                  <h3 className="text-xl font-semibold mb-2">No Results Yet</h3>
                  <p className="text-muted-foreground">
                    Fill in the form and click "Predict Risk" to see results
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Predict;
