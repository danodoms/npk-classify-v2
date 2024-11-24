import React, { useState, useEffect, useRef } from "react";
import { loadTensorflowModel, TensorflowModel } from "react-native-fast-tflite";
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from "react-native-vision-camera";
import { Image, View } from "react-native";
import { VStack } from "@/src/components/ui/vstack";
import { Text } from "@/src/components/ui/text";
import { plantDiseaseClasses } from "@/assets/model/tflite/plant-disease/plant-disease-classes";
import * as ImageManipulator from "expo-image-manipulator";
import {
  Button,
  ButtonText,
  ButtonSpinner,
  ButtonIcon,
  ButtonGroup,
} from "@/src/components/ui/button";
import { SaveFormat } from "expo-image-manipulator";
import { Box } from "@/src/components/ui/box";
import ScanResultDrawer from "@/src/components/ScanResultDrawer";
import { useTfliteModel } from "@/src/hooks/useTfliteModel";
import LottieView from "lottie-react-native";

export default function ScanScreen() {
  const {
    isDrawerOpen,
    setIsDrawerOpen,
    confidence,
    setConfidence,
    classification,
    setClassification,
    isModelPredicting,
    setIsModelPredicting,
    model,
    setModel,
    runModelPrediction,
  } = useTfliteModel();
  const [isTfReady, setIsTfReady] = useState(false);
  const cameraRef = useRef<Camera | null>(null);
  const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null); // To hold the image URI
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice("back");

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
    const tfliteModel = await loadTensorflowModel(
      require("../../../assets/model/tflite/plant-disease/plant-disease.tflite")
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
    setIsModelPredicting(true);

    // Convert image into correct format
    runModelPrediction(manipulatedImage.uri, "float32", plantDiseaseClasses);
  };

  function RenderButtonComponent() {
    if (!isTfReady)
      return (
        <Text size="lg" className="text-center font-bold">
          Loading AI Model...
        </Text>
      );

    if (isModelPredicting)
      return (
        <Text size="lg" className="text-center font-bold">
          Classifying Image...
        </Text>
      );

    return (
      <Button
        onPress={captureAndClassify}
        size="lg"
        variant="solid"
        action="primary"
        className="rounded-lg "
      >
        <ButtonText>Classify</ButtonText>
      </Button>
    );
  }

  return (
    <VStack
      className="bg-green p-4 outline-red-500 outline outline-1 h-full relative"
      reversed={true}
    >
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

      <RenderButtonComponent />

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
