import React, { useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";

function App() {
  const [model, setModel] = useState<tf.LayersModel | null>(null);
  const [loadingModel, setLoadingModel] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [prediction, setPrediction] = useState<string>("");

  useEffect(() => {
    loadModel();
  }, []);

  const loadModel = async () => {
    console.log("Starting model loading...");
    try {
      const loadedModel = await tf.loadLayersModel("/model/model.json");
      console.log("Model loaded successfully:", loadedModel);
      setModel(loadedModel);
    } catch (error) {
      console.error("Failed to load model. Error:", error);
      alert("Model failed to load. Check console logs.");
    } finally {
      setLoadingModel(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("Image file selected:", file);
      setImageFile(file);
    }
  };

  const preprocessImage = (image: HTMLImageElement) => {
    console.log("Preprocessing image...");
    const tensor = tf.browser.fromPixels(image)
      .resizeNearestNeighbor([224, 224]) // Resize to model input dimensions
      .toFloat()
      .expandDims(0)
      .div(255.0);
    console.log("Image preprocessed successfully.");
    return tensor;
  };

  const handleClassify = async () => {
    if (!model) {
      alert("Model isn't loaded yet. Please wait.");
      return;
    }

    if (!imageFile) {
      alert("Please upload an image.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const imageElement = new Image();
      if (event.target?.result) {
        imageElement.src = event.target.result as string;
        imageElement.onload = async () => {
          try {
            console.log("Image loaded. Preprocessing...");
            const inputTensor = preprocessImage(imageElement);

            console.log("Running prediction...");
            const predictionResult = model.predict(inputTensor) as tf.Tensor;

            console.log("Prediction result received:", predictionResult);

            if (!predictionResult) {
              alert("No prediction returned from the model.");
              return;
            }

            const predictionData = predictionResult.dataSync();
            console.log("Prediction data sync complete:", predictionData);

            const predictedClass = predictionData[0] > 0.5 ? "Pneumonia" : "Normal";
            console.log("Prediction decision made:", predictedClass);

            setPrediction(predictedClass);
          } catch (error) {
            console.error("Error during prediction:", error);
            alert("Prediction failed.");
          }
        };
      }
    };
    reader.readAsDataURL(imageFile);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Pneumonia Classifier</h1>

        {loadingModel && (
          <div className="text-center mb-4 text-blue-600">Loading model... Please wait...</div>
        )}

        {/* Image Upload Input */}
        <input
          type="file"
          className="border p-2 mb-4 w-full"
          onChange={handleImageChange}
          disabled={loadingModel}
        />

        {/* Classify Button */}
        <button
          onClick={handleClassify}
          className={`w-full ${loadingModel ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"} text-white py-2 px-4 rounded`}
          disabled={loadingModel}
        >
          Classify
        </button>

        {/* Display Prediction */}
        {prediction && (
          <div className="mt-4 text-center">
            <h2 className="text-lg font-semibold">Prediction Result:</h2>
            <p className="text-xl font-bold text-blue-600">{prediction}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
