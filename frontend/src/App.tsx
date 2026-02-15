import React, { useState } from "react";
import ImageUploader from "./components/ImageUploader";
import DiagnosisResult from "./components/DiagnosisResult";
import { Card, CardContent } from "@/components/ui/card";

const App: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [diagnosisResult, setDiagnosisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  const analyzeDiagnosis = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setDiagnosisResult(null);

    const formData = new FormData();
    const blob = await fetch(selectedImage).then((res) => res.blob());
    formData.append("image", blob);

    try {
      const response = await fetch("http://127.0.0.1:5000/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch diagnosis");
      }

      const result = await response.json();
      setDiagnosisResult(result);
    } catch (error) {
      console.error("Error analyzing image:", error);
      setDiagnosisResult({
        condition: "Error",
        confidence: 0,
        description: "Failed to fetch diagnosis. Please try again.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-6">
      <Card className="w-full max-w-2xl bg-white p-6 shadow-md rounded-2xl">
        <CardContent>
          <h1 className="text-2xl font-semibold text-center mb-4">AI Medical Diagnosis</h1>
          <ImageUploader onImageUpload={setSelectedImage} />
          {selectedImage && (
            <div className="mt-4">
              <img
                src={selectedImage}
                alt="Uploaded preview"
                className="w-full rounded-lg shadow-md"
              />
              <button
                onClick={analyzeDiagnosis}
                disabled={isAnalyzing}
                className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition"
              >
                {isAnalyzing ? "Analyzing..." : "Analyze"}
              </button>
            </div>
          )}
          {diagnosisResult && <DiagnosisResult result={diagnosisResult} />}
        </CardContent>
      </Card>
    </div>
  );
};

export default App;
