import React, { useState, useEffect, useRef } from "react";
import {
  loadTensorflowModel,
  TensorflowModel,
  useTensorflowModel,
} from "react-native-fast-tflite";
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  type CameraPosition,
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
import { saveImageToAppData } from "@/src/lib/imageUtil";
import * as Crypto from "expo-crypto";
import { Circle } from "lucide-react-native";
import { width } from "dom-helpers";
import { HStack } from "@/src/components/ui/hstack";
import { addResult } from "@/src/utils/SupaLegend";

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
  const [cameraFacing, setCameraFacing] = useState<CameraPosition>("back");
  const device = useCameraDevice(cameraFacing);

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
      require("@/assets/model/tflite/plant-disease/plant-disease.tflite")
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

  function toggleCameraFacing() {
    setCameraFacing((current) => (current === "back" ? "front" : "back"));
  }

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

    setCapturedImageUri(manipulatedImage.uri);
    setIsModelPredicting(true);

    // Convert image into correct format
    runModelPrediction(manipulatedImage.uri, "float32", plantDiseaseClasses);
  };

  function saveResultToDatabase() {
    if (!capturedImageUri) return console.log("No captured image uri");
    if (!classification) return console.log("No captured classification");
    if (!confidence) return console.log("No confidence");

    //@DEPRECATED
    /*const resultId = Crypto.randomUUID();*/
    /*saveImageToAppData(capturedImageUri, resultId);
    addResult(resultId, classification, confidence);*/

    addResult(capturedImageUri, classification, confidence);
  }

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
      <HStack className="gap-4 mb-4 flex justify-center items-center ">
        {/* {device?.hasFlash && */}
        <Button className="rounded-full">
          <ButtonText>Toggle Flash</ButtonText>
        </Button>
        {/* } */}

        <Button
          onPress={captureAndClassify}
          size="xl"
          variant="solid"
          action="primary"
          className="rounded-full"
        >
          <ButtonText>Classify</ButtonText>
          {/*<ButtonIcon></ButtonIcon>*/}
        </Button>

        <Button onPress={toggleCameraFacing} className="rounded-full">
          <ButtonText>Flip Camera</ButtonText>
        </Button>
      </HStack>

      /*<Circle color="white" style={} onPress={captureAndClassify} />*/
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

      <RenderButtonComponent />

      <ScanResultDrawer
        drawerState={{
          saveResultCallback: saveResultToDatabase,
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
