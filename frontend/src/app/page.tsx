'use client';

import { useState } from 'react';
import { ImagePlus, AlertCircle, Loader2, Heart, Brain, Eye, Shield, Clock, Cloud, Building, Microscope, UserPlus } from 'lucide-react';

interface DiagnosisResult {
  condition: string;
  confidence: number;
  description: string;
}

interface FeatureCard {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // New: Store the actual file
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);

  const features: FeatureCard[] = [
    {
      icon: <Clock className="w-8 h-8 text-teal-600" />,
      title: "Real-Time Analysis",
      description: "Immediate diagnosis to reduce waiting times"
    },
    {
      icon: <Brain className="w-8 h-8 text-teal-600" />,
      title: "Multi-Disease Support",
      description: "Supports different image formats (DICOM, JPEG, PNG)"
    },
    {
      icon: <Cloud className="w-8 h-8 text-teal-600" />,
      title: "Cloud-Based Storage",
      description: "Access results and reports anytime, anywhere"
    },
    {
      icon: <Shield className="w-8 h-8 text-teal-600" />,
      title: "Data Security",
      description: "Enterprise-grade security for your medical data"
    }
  ];

  const beneficiaries = [
    {
      icon: <Building className="w-8 h-8 text-emerald-600" />,
      title: "Hospitals & Clinics",
      description: "Enhance diagnostic accuracy and reduce workload"
    },
    {
      icon: <UserPlus className="w-8 h-8 text-emerald-600" />,
      title: "Doctors & Radiologists",
      description: "Assist in faster and more informed decision-making"
    },
    {
      icon: <Microscope className="w-8 h-8 text-emerald-600" />,
      title: "Medical Research Institutes",
      description: "Speed up research and validation processes"
    }
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file); // Store the file for the backend
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        // We pass the file directly to analyzeDiagnosis now
        analyzeDiagnosis(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file); // Store the file
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        analyzeDiagnosis(file);
      };
      reader.readAsDataURL(file);
    }
  };

  // UPDATED: Now accepts the file argument and calls the real backend
  const analyzeDiagnosis = async (fileToAnalyze: File) => {
    setIsAnalyzing(true);
    setDiagnosisResult(null); // Clear previous results

    const formData = new FormData();
    formData.append('image', fileToAnalyze);

    try {
      // Connect to the Backend API
      const response = await fetch('https://multi-disease-detection-fomn.onrender.com/api/diagnose', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      // Logic to interpret the AI results
      let conditionText = "Healthy / No Abnormalities";
      let confidenceScore = 0;
      let descriptionText = "The AI analysis did not detect significant signs of Tuberculosis or Diabetic Retinopathy.";

      // Check TB Result
      if (data.tb_diagnosis === "Positive") {
        conditionText = "Tuberculosis Detected";
        confidenceScore = data.tb_probability;
        descriptionText = "The AI model has detected patterns consistent with Tuberculosis in the chest X-ray.";
      } 
      // Check Eye Result (only if TB is negative, or if confidence is higher)
      else if (data.dr_diagnosis === "Positive") {
        conditionText = "Diabetic Retinopathy Detected";
        confidenceScore = data.dr_probability;
        descriptionText = "The AI model has detected signs of Diabetic Retinopathy in the retinal scan.";
      }
      // If both negative, just show the highest confidence of "health" (inverse of disease prob)
      else {
         confidenceScore = Math.max(100 - data.tb_probability, 100 - data.dr_probability);
      }

      setDiagnosisResult({
        condition: conditionText,
        confidence: parseFloat(confidenceScore.toFixed(2)),
        description: descriptionText
      });

    } catch (error) {
      console.error("Diagnosis Error:", error);
      alert("Failed to connect to the server. Please ensure the backend (port 5000) is running.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=2532')] bg-cover bg-fixed bg-center">
      <div className="min-h-screen backdrop-blur-sm bg-white/30">
        {/* Hero Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white/80 to-transparent">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              AI-Powered Disease Diagnosis System
            </h1>
            <p className="text-xl text-gray-800 max-w-3xl mx-auto leading-relaxed mb-12">
              Revolutionizing Healthcare with AI and Medical Imaging. Upload medical images for instant 
              AI-powered diagnosis with high accuracy and reliability.
            </p>
          </div>
        </section>

        {/* Disease Detection Types */}
        <section className="py-16 bg-gradient-to-b from-teal-50/80 to-emerald-50/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Specialized Disease Detection</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="bg-teal-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Tuberculosis Detection</h3>
                <p className="text-gray-700">Early detection of lung abnormalities to prevent complications.</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="bg-rose-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-rose-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Heart Disease Analysis</h3>
                <p className="text-gray-700">Analyze cardiac patterns to predict heart-related conditions.</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="bg-emerald-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Eye className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Diabetic Retinopathy</h3>
                <p className="text-gray-700">Detect early signs of vision impairment caused by diabetes.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Upload Section */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className={`border-3 border-dashed rounded-2xl p-12 transition-all duration-300 ${
                isDragging
                  ? 'border-teal-500 bg-teal-50/80'
                  : 'border-gray-300 bg-white/80'
              } backdrop-blur-sm`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {!selectedImage ? (
                <div className="text-center">
                  <ImagePlus className="w-20 h-20 mx-auto mb-6 text-teal-600" />
                  <p className="text-lg text-gray-700 mb-6">
                    Drag and drop your medical image here, or
                  </p>
                  <label className="inline-flex items-center px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl cursor-pointer transition-colors shadow-lg hover:shadow-xl">
                    <span>Browse Files</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                  <p className="mt-4 text-sm text-gray-600">
                    Supported formats: DICOM, JPEG, PNG
                  </p>
                </div>
              ) : (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedImage}
                    alt="Uploaded medical image"
                    className="max-h-[500px] mx-auto rounded-xl shadow-2xl"
                  />
                  <button
                    onClick={() => {
                        setSelectedImage(null);
                        setSelectedFile(null);
                        setDiagnosisResult(null);
                    }}
                    className="absolute top-4 right-4 bg-rose-500 text-white p-2 rounded-full hover:bg-rose-600 transition-colors shadow-lg"
                    aria-label="Remove image"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {isAnalyzing && (
              <div className="mt-12 text-center">
                <Loader2 className="w-12 h-12 mx-auto animate-spin text-teal-600" />
                <p className="text-lg text-gray-700 mt-4">Analyzing your image with AI...</p>
              </div>
            )}

            {diagnosisResult && !isAnalyzing && (
              <div className="mt-12 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Diagnosis Results
                </h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b pb-4">
                    <span className="text-lg text-gray-700">Detected Condition:</span>
                    <span className={`text-xl font-semibold ${diagnosisResult.condition.includes("Detected") ? "text-rose-600" : "text-emerald-600"}`}>
                      {diagnosisResult.condition}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b pb-4">
                    <span className="text-lg text-gray-700">Confidence Level:</span>
                    <div className="flex items-center">
                      <div className="w-48 h-2 bg-gray-200 rounded-full mr-4">
                        <div 
                          className={`h-2 rounded-full ${diagnosisResult.confidence > 50 ? "bg-teal-600" : "bg-yellow-500"}`}
                          style={{ width: `${diagnosisResult.confidence}%` }}
                        />
                      </div>
                      <span className="text-xl font-semibold text-gray-900">
                        {diagnosisResult.confidence}%
                      </span>
                    </div>
                  </div>
                  <div className="py-4">
                    <p className="text-gray-700 text-lg leading-relaxed">
                      {diagnosisResult.description}
                    </p>
                  </div>
                  <div className="bg-amber-50/80 backdrop-blur-sm border-l-4 border-amber-400 p-6 rounded-r-xl">
                    <div className="flex items-start">
                      <AlertCircle className="h-6 w-6 text-amber-500 mt-1" />
                      <div className="ml-4">
                        <h4 className="text-lg font-semibold text-amber-900 mb-2">
                          Important Medical Disclaimer
                        </h4>
                        <p className="text-amber-800">
                          This AI-assisted diagnosis is for informational purposes only and should not 
                          be considered as a replacement for professional medical advice. Please consult 
                          with a qualified healthcare provider for proper medical diagnosis and treatment.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gradient-to-b from-emerald-50/80 to-teal-50/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Key Features</h2>
            <div className="grid md:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-700">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Who Can Benefit Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Who Can Benefit?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {beneficiaries.map((beneficiary, index) => (
                <div key={index} className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                  <div className="mb-4">{beneficiary.icon}</div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">{beneficiary.title}</h3>
                  <p className="text-gray-700">{beneficiary.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-teal-600 to-emerald-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-6">Get Started Today</h2>
            <p className="text-xl mb-8 opacity-90">
              Experience the future of AI in healthcare and empower your diagnosis process.
            </p>
            <div className="space-x-4">
              <button className="bg-white text-teal-600 px-8 py-3 rounded-xl font-semibold hover:bg-teal-50 transition-colors shadow-lg hover:shadow-xl">
                Sign Up Now
              </button>
              <button className="border-2 border-white px-8 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors">
                Schedule Demo
              </button>
            </div>
          </div>
        </section>

        <footer className="py-12 text-center text-gray-600 bg-white/80 backdrop-blur-sm">
          <p className="text-sm">© 2025 Medical Image Diagnosis System. All rights reserved.</p>
          <p className="mt-2 text-sm">
            This system is for demonstration purposes only and should not be used for actual medical diagnosis.
          </p>
        </footer>
      </div>
    </div>
  );
}