import { useRef, useState } from "react";
import { plantDiseaseClasses } from "@/assets/model/tflite/plant-disease/plant-disease-classes";
import { TensorflowModel } from "react-native-fast-tflite";
import { Camera } from "react-native-vision-camera";
import { convertToRGB } from "react-native-image-to-rgb";

type imageDataType = "uint8" | "float32";

export function useTfliteModel() {
  // State for tracking if the model is currently predicting
  const [isModelPredicting, setIsModelPredicting] = useState(false);

  // Stores the classification result (e.g., plant disease class)
  const [classification, setClassification] = useState<string | null>(null);

  // Stores the confidence level of the classification in percentage
  const [confidence, setConfidence] = useState<number | null>(null);

  // Reference to the loaded TensorFlow Lite model
  const [model, setModel] = useState<TensorflowModel | null>(null);

  /**
   * Runs the model prediction on a provided image.
   * This function orchestrates the process of:
   * 1. Converting the image into a format suitable for the model.
   * 2. Running the model on the processed image data.
   * 3. Extracting and storing the classification result and confidence.
   *
   * @param imageUri - The URI of the image to be classified.
   * @param dataType - The data type for the image tensor, either 'uint8' or 'float32'.
   * @param outputClasses - The mapping of model output indices to class names.
   */
  const runModelPrediction = (
      imageUri: string,
      dataType: imageDataType,
      outputClasses: object
  ) => {
    if (!model) return console.log("Model is not ready");

    // Reset previous results and set predicting state to true
    setClassification(null);
    setConfidence(null);
    setIsModelPredicting(true);

    // Step 1: Convert the image to a suitable tensor format
    convertImageToRgb(imageUri, dataType)
        .then((imageTensor) => {
          console.log("Starting Classification");

          // Step 2: Run the model on the image tensor
          return model.run([imageTensor]);
        })
        .then((prediction) => {
          setIsModelPredicting(false);

          // Step 3: Perform classification using the model output
          return performClassification(prediction[0], outputClasses);
        })
        .then(() => {
          console.log("Done, Image Classified");
        })
        .catch((error) => {
          console.error("Error during classification:", error);
        });
  };

  /**
   * Converts an image into an RGB tensor that matches the input format expected by the model.
   *
   * @param imageUri - The URI of the image to convert.
   * @param format - The desired tensor format, either 'uint8' or 'float32'.
   * @returns A promise that resolves to a typed array representing the image tensor.
   */
  const convertImageToRgb = async (
      imageUri: string,
      format: imageDataType
  ): Promise<Float32Array | Uint8Array> => {
    try {
      // Step 1: Convert image to a flat RGB array
      const convertedArray = await convertToRGB(imageUri);

      // Validate the array for correctness
      if (!Array.isArray(convertedArray) || convertedArray.length % 3 !== 0) {
        throw new Error(
            "Invalid RGB array. The input array length must be divisible by 3."
        );
      }

      // Step 2: Normalize the RGB values (scale to [0,1]) or prepare them as uint8
      const normalizeValue = (value: number) => value / 255;
      const finalArray: number[] = [];

      for (let i = 0; i < convertedArray.length; i += 3) {
        finalArray.push(
            normalizeValue(convertedArray[i]), // Red
            normalizeValue(convertedArray[i + 1]), // Green
            normalizeValue(convertedArray[i + 2]) // Blue
        );

        // Yield control periodically to prevent blocking
        if (i % 3000 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
      }

      // Step 3: Return the array in the desired format
      if (format === "float32") {
        return new Float32Array(finalArray);
      } else if (format === "uint8") {
        return new Uint8Array(finalArray.map((v) => Math.round(v * 255)));
      } else {
        throw new Error("Invalid format specified. Use 'float32' or 'uint8'.");
      }
    } catch (error) {
      console.error("Error in convertImageToRgb:", error);
      throw error;
    }
  };

  /**
   * Processes the model output and determines the highest confidence class.
   *
   * @param outputs - The raw outputs from the TensorFlow Lite model.
   * @param outputClasses - The mapping of model output indices to class names.
   */
  const performClassification = (
      outputs: Record<any, any>,
      outputClasses: Record<any, any>
  ) => {
    const result = getMaxClassification(outputs, outputClasses);

    // Update states with the classification result and confidence
    setConfidence(Number((result.maxValue * 100).toFixed(2)));
    setClassification(result.className);
  };

  /**
   * Finds the class with the highest confidence in the model output.
   *
   * @param outputs - The raw outputs from the TensorFlow Lite model.
   * @param outputClasses - The mapping of model output indices to class names.
   * @returns An object containing the class name and its confidence value.
   */
  const getMaxClassification = (
      outputs: Record<any, any>,
      outputClasses: Record<any, any>
  ) => {
    // Step 1: Find the key corresponding to the maximum output value
    const maxKey = Object.keys(outputs).reduce((a, b) =>
        outputs[a] > outputs[b] ? a : b
    );

    // Step 2: Retrieve the maximum value and associated class name
    const maxValue = outputs[maxKey];
    const className: string = String(outputClasses[maxKey]);

    return {
      className,
      maxValue,
    };
  };

  return {
    isModelPredicting, // Tracks if the model is currently processing an image
    classification, // The final classification result (e.g., disease name)
    confidence, // The confidence percentage of the classification
    model, // The loaded TensorFlow Lite model instance
    setModel, // Setter for the TensorFlow Lite model
    runModelPrediction, // Function to classify an image using the model
  };
}
