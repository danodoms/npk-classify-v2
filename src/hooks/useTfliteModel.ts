import { useRef, useState } from "react";
import { plantDiseaseClasses } from "@/assets/model/tflite/plant-disease/plant-disease-classes";
import { TensorflowModel } from "react-native-fast-tflite";
import { Camera } from "react-native-vision-camera";
import { convertToRGB } from "react-native-image-to-rgb";

type imageDataType = "uint8" | "float32";

export function useTfliteModel() {
  const [isModelPredicting, setIsModelPredicting] = useState(false);
  const [classification, setClassification] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [model, setModel] = useState<TensorflowModel | null>(null);

  const runModelPrediction = (
    imageUri: string,
    dataType: imageDataType,
    outputClasses: object
  ) => {
    if (!model) return console.log("Model is not ready");

    /*const modelInputs = model.inputs[0];
    const modelDataType = modelInputs;*/

    convertImageToRgb(imageUri, dataType)
      .then((imageTensor) => {
        console.log("Starting Classification");
        return model.run([imageTensor]);
      })
      .then((prediction) => {
        setIsModelPredicting(false);
        console.log("MODEL OUTPUT PREDICTION: ", prediction);
        return performClassification(prediction[0], outputClasses);
      })
      .then(() => {
        console.log("Done, Image Classified");
        setIsDrawerOpen(true);
      })
      .catch((error) => {
        console.error("Error during classification:", error);
      });
  };

  const convertImageToRgb = async (
    imageUri: string,
    format: imageDataType
  ): Promise<Float32Array | Uint8Array> => {
    try {
      const convertedArray = await convertToRGB(imageUri); // Assumes this returns a flat RGB array
      /*console.log("Converted Array:", convertedArray);*/

      // Validate the converted array
      if (!Array.isArray(convertedArray) || convertedArray.length % 3 !== 0) {
        throw new Error(
          "Invalid RGB array. The input array length must be divisible by 3."
        );
      }

      const normalizeValue = (value: number) => value / 255; // Normalization function
      const finalArray: number[] = [];

      // Directly process the array
      for (let i = 0; i < convertedArray.length; i += 3) {
        finalArray.push(
          normalizeValue(convertedArray[i]), // Red
          normalizeValue(convertedArray[i + 1]), // Green
          normalizeValue(convertedArray[i + 2]) // Blue
        );

        // Yield control to prevent blocking
        if (i % 3000 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
      }

      /*console.log("Normalized Array:", finalArray);*/

      // Return the desired format
      if (format === "float32") {
        return new Float32Array(finalArray);
      } else if (format === "uint8") {
        return new Uint8Array(finalArray.map((v) => Math.round(v * 255))); // Convert back to 0-255
      } else {
        throw new Error("Invalid format specified. Use 'float32' or 'uint8'.");
      }
    } catch (error) {
      console.error("Error in convertImageToRgb:", error);
      throw error; // Propagate the error for better debugging
    }
  };

  const performClassification = (
    outputs: Record<any, any>,
    outputClasses: Record<any, any>
  ) => {
    const result = getMaxClassification(outputs, outputClasses);
    setConfidence((result.maxValue * 100).toFixed(2) + "%");

    // Update classification state
    setClassification(result.className);
  };

  const getMaxClassification = (
    outputs: Record<any, any>,
    outputClasses: Record<any, any>
  ) => {
    // Find the key of the highest value
    const maxKey = Object.keys(outputs).reduce((a, b) =>
      outputs[a] > outputs[b] ? a : b
    );

    // Get the highest value
    const maxValue = outputs[maxKey];

    // Get the disease name using the key
    const className: string = String(outputClasses[maxKey]);

    return {
      className,
      maxValue,
    };
  };

  return {
    isModelPredicting,
    setIsModelPredicting,
    classification,
    setClassification,
    confidence,
    setConfidence,
    isDrawerOpen,
    setIsDrawerOpen,
    model,
    setModel,
    runModelPrediction,
  };
}
