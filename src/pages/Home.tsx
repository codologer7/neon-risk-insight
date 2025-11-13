import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Shield, Zap, TrendingUp, Users, Target } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import heroBg from "@/assets/hero-bg.jpg";

const Home = () => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent!",
      description: "Thank you for contacting us. We'll get back to you soon.",
    });
    setFormData({ name: "", email: "", message: "" });
    setOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${heroBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-background/80 to-background" />
        
        <div className="relative container mx-auto px-6 py-32 text-center">
          <div className="mb-8 inline-block">
            <div className="text-6xl mb-4 animate-float">🏦</div>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-6 text-gradient animate-fade-in">
            Loan Risk Predictor
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            AI-powered loan default prediction platform leveraging advanced machine learning
          </p>
          
          <Link to="/predict">
            <Button variant="hero" size="lg" className="text-lg px-8 py-6 animate-glow">
              🔮 Try Risk Predictor
            </Button>
          </Link>
        </div>
      </section>

      {/* About Section */}
      <section className="py-32 px-6 mt-12">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-gradient">
            Why Choose Our Platform?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-gradient hover:scale-105 transition-transform duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center glow-primary">
                  <Target className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">High Accuracy</h3>
                <p className="text-muted-foreground">
                  Our LightGBM model delivers industry-leading precision in default prediction
                </p>
              </CardContent>
            </Card>

            <Card className="border-gradient hover:scale-105 transition-transform duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent/20 flex items-center justify-center glow-accent">
                  <Shield className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Full Transparency</h3>
                <p className="text-muted-foreground">
                  Understand exactly how risk scores are calculated with explainable AI
                </p>
              </CardContent>
            </Card>

            <Card className="border-gradient hover:scale-105 transition-transform duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center glow-primary">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Lightning Fast</h3>
                <p className="text-muted-foreground">
                  Get instant predictions with our optimized FastAPI backend
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-6 bg-card/30">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-gradient">
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold glow-primary">
                1
              </div>
              <h3 className="text-xl font-semibold mb-3">Enter Details</h3>
              <p className="text-muted-foreground">
                Input applicant financial and demographic information
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-2xl font-bold glow-accent">
                2
              </div>
              <h3 className="text-xl font-semibold mb-3">AI Analysis</h3>
              <p className="text-muted-foreground">
                Our machine learning model analyzes risk factors in milliseconds
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold glow-primary">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3">Get Results</h3>
              <p className="text-muted-foreground">
                Receive probability score and risk classification instantly
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border/50">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gradient">Loan Risk Predictor</h3>
              <p className="text-muted-foreground text-sm">
                Empowering financial decisions with AI
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold mb-3">Quick Links</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div><Link to="/predict" className="hover:text-primary transition-colors">Predict Risk</Link></div>
                <div>
                  <a 
                    href="https://github.com/codologer7/Loan-Default-Prediction-for-Banking/blob/main/README.md" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    Documentation
                  </a>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold mb-3">Connect</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>
                  <a 
                    href="https://github.com/codologer7/Loan-Default-Prediction-for-Banking" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    GitHub
                  </a>
                </div>
                <div>
                  <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                      <button className="hover:text-primary transition-colors">Contact Us</button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Contact Us</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Name</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="message">Message</Label>
                          <Textarea
                            id="message"
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            required
                            rows={4}
                          />
                        </div>
                        <Button type="submit" className="w-full">Send Message</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-border/30 text-center text-sm text-muted-foreground">
            <p>© 2025 Loan Risk Predictor. All rights reserved.</p>
            <p className="mt-2">Built By Team 9</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
