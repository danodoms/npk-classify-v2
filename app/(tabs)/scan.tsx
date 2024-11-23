import { useState, useEffect, useRef } from "react";
import { loadTensorflowModel, TensorflowModel } from "react-native-fast-tflite";
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from "react-native-vision-camera";
import { Image, View } from "react-native";
/*import {useResizePlugin} from "vision-camera-resize-plugin";*/
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Worklets } from "react-native-worklets-core";
import { plantDiseaseClasses } from "@/assets/model/tflite/plant-disease/plant-disease-classes";
import * as ImageManipulator from "expo-image-manipulator";
import { convertToRGB } from "react-native-image-to-rgb";
import {
  Button,
  ButtonText,
  ButtonSpinner,
  ButtonIcon,
  ButtonGroup,
} from "@/components/ui/button";
import { SaveFormat } from "expo-image-manipulator";
import { Box } from "@/components/ui/box";
import ScanResultDrawer from "@/components/ScanResultDrawer";

export default function ScanScreen() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isTfReady, setIsTfReady] = useState(false);
  const [classification, setClassification] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<string | null>(null);
  const [model, setModel] = useState<TensorflowModel | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null); // To hold the image URI
  /*const { resize } = useResizePlugin()*/

  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice("back");

  /*  const runClassification = Worklets.createRunOnJS((outputs:{}) => {
        const result = getMaxClassification(outputs, plantDiseaseClasses)

        // Update classification state
        setClassification(`${result.className} (Score: ${result.maxValue.toFixed(6)})`); // Optionally include the score
    })*/

  const performClassification = (outputs: {}) => {
    const result = getMaxClassification(outputs, plantDiseaseClasses);

    setConfidence(result.maxValue.toFixed(6));

    // Update classification state
    setClassification(result.className);
  };

  const getMaxClassification = (outputs, outputClasses: object) => {
    // Find the key of the highest value
    const maxKey = Object.keys(outputs).reduce((a, b) =>
      outputs[a] > outputs[b] ? a : b
    );

    // Get the highest value
    const maxValue = outputs[maxKey];

    // Get the disease name using the key
    const className = outputClasses[maxKey];

    return {
      className,
      maxValue,
    };
  };

  /*    const frameProcessor = useFrameProcessor((frame) => {
        'worklet'
        /!*console.log(`Frame: ${frame.width}x${frame.height} (${frame.pixelFormat})`)*!/
        if (model == null) return console.log("no model loaded")

        'worklet'
        runAtTargetFps(1, () => {
            /!* console.log("I'm running synchronously at 1 FPS!")*!/
            /!*          const brightness = detectBrightness(frame)*!/

            // 1. Resize Frame using vision-camera-resize-plugin
            const resized = resize(frame, {
                scale: {
                    width: 224,
                    height: 224,
                },
                pixelFormat: 'rgb',

                //TAKE NOTE OF THIS, SOMETIMES SOME MODEL NEEDS float32 and some needs uint8
                dataType: 'float32',
            })

            // 2. Run model with given input buffer synchronously
            const outputs = model.runSync([resized])
            /!*console.log([resized])*!/


            runClassification(outputs[0])

        })
    }, [model])*/

  // Ensure TensorFlow is ready before classifying
  useEffect(() => {
    const initializeTf = async () => {
      // await tf.ready();
      setIsTfReady(true);
      await loadModel(); // Load the model when TensorFlow is ready
    };
    initializeTf();
  }, []);

  const loadModel = async () => {
    // Load the TFLite model from the app bundle
    /*   const tfliteModel = await loadTensorflowModel(require("../../../assets/model/tflite/ASL.tflite"))*/
    const tfliteModel = await loadTensorflowModel(
      require("../../assets/model/tflite/plant-disease/plant-disease.tflite")
    );
    setModel(tfliteModel);
  };

  if (!hasPermission) {
    return (
      <VStack>
        <Text>We need your permission to show the camera</Text>
        <Button onPress={requestPermission}>
          <ButtonText>grant permission</ButtonText>
        </Button>
      </VStack>
    );
  }

  if (!device) {
    return (
      <VStack>
        <Text>No camera device</Text>
      </VStack>
    );
  }

  /*function toggleCameraFacing() {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    }*/

  const captureAndClassify = async () => {
    if (!model) {
      console.log("Model is not loaded yet.");
      return;
    }
    if (!cameraRef.current) {
      console.log("No camera ref");
      return;
    }

    try {
      // Capture the image from the camera
      const photo = await cameraRef.current.takePhoto();

      if (!photo) {
        throw new Error("Photo is undefined, no image captured");
      }
      console.log("Image Captured");

      // Reset the states and show the drawer
      setConfidence(null);
      setCapturedImageUri(null);
      setClassification(null);
      setIsDrawerOpen(true);

      // Resize the image to fit the model requirements
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        "file://" + photo.path,
        [{ resize: { width: 224, height: 224 } }],
        { format: SaveFormat.JPEG, base64: true }
      );
      console.log("Image Resized");

      setCapturedImageUri("file://" + manipulatedImage.uri);

      // Convert image into correct format
      convertImageToRgb(manipulatedImage.uri, "float32")
        .then((imageTensor) => {
          console.log("Starting Classification");
          return model.run([imageTensor]);
        })
        .then((prediction) => {
          console.log(prediction);
          return performClassification(prediction[0]);
        })
        .then(() => {
          console.log("Done, Image Classified");
          setIsDrawerOpen(true);
        })
        .catch((error) => {
          console.error("Error during classification:", error);
        });
    } catch (error) {
      console.error("Error in capture and classify:", error);
    }
  };

  const convertImageToRgb = async (image, format: "uint8" | "float32") => {
    const convertedArray = await convertToRGB(image);
    console.log("convertedArray:", convertedArray);

    return new Promise((resolve, reject) => {
      try {
        // Process in chunks to avoid blocking the main thread
        let red: number[] = [];
        let green: number[] = [];
        let blue: number[] = [];
        const chunkSize = 1000; // Adjust based on performance needs

        const processChunk = (startIndex: number) => {
          for (
            let index = startIndex;
            index < Math.min(startIndex + chunkSize, convertedArray.length);
            index += 3
          ) {
            red.push(convertedArray[index] / 255);
            green.push(convertedArray[index + 1] / 255);
            blue.push(convertedArray[index + 2] / 255);
          }

          if (startIndex + chunkSize < convertedArray.length) {
            // Continue processing the next chunk
            setTimeout(() => processChunk(startIndex + chunkSize), 0);
          } else {
            // Finalize and resolve the promise
            const finalArray = [...red, ...green, ...blue];
            console.log("normalized array: ", finalArray);

            if (format === "float32") {
              resolve(new Float32Array(finalArray));
            } else if (format === "uint8") {
              resolve(new Uint8Array(finalArray));
            } else {
              reject(
                new Error("Invalid format specified. Use 'float32' or 'uint8'.")
              );
            }
          }
        };

        processChunk(0); // Start processing
      } catch (error) {
        reject(error);
      }
    });
  };

  return (
    <VStack className="bg-green p-4 outline-red-500 outline outline-1 h-full relative">
      <Camera
        device={device}
        style={{
          position: "absolute", // This makes the component absolutely positioned
          top: 0, // Adjust these values as needed
          left: 0,
          right: 0,
          bottom: 0,
        }}
        isActive={true}
        ref={cameraRef}
        photo={true}
        /*  frameProcessor={frameProcessor}*/
      />

      {/* Image Preview */}
      {capturedImageUri && (
        <VStack>
          <Image source={{ uri: capturedImageUri }} />
        </VStack>
      )}

      {/* Display Classification Result */}
      {classification && <Text>{classification}</Text>}

      <Button
        onPress={captureAndClassify}
        disabled={!isTfReady}
        size="lg"
        variant="solid"
        action="primary"
        className="rounded-lg"
      >
        {isTfReady ? (
          <ButtonText>Classify</ButtonText>
        ) : (
          <ButtonText>Waiting for Tensorflow...</ButtonText>
        )}
      </Button>

      <ScanResultDrawer
        drawerState={{
          isDrawerOpen,
          setIsDrawerOpen,
          imageUri: capturedImageUri,
          classification,
          confidence,
        }}
      />
    </VStack>
  );
}

/*const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
    },
    camera: {
        flex: 1,
    },
    buttonContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        margin: 64,
    },
    button: {
        flex: 1,
        alignSelf: 'flex-end',
        alignItems: 'center',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    previewContainer: {
        position: 'absolute',
        top: 40,
        left: 20,
        borderRadius: 10,
        padding: 5,
    },
    imagePreview: {
        width: 100,
        height: 100,
        borderRadius: 5,
    }
});*/
