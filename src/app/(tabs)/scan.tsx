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
import {Image, Pressable, View} from "react-native";
import { VStack } from "@/src/components/ui/vstack";
import { Text } from "@/src/components/ui/text";
import { plantDiseaseClasses } from "@/assets/model/tflite/plant-disease/plant-disease-classes";
import {npkClassificationClasses} from "@/assets/model/tflite/npk-classification/npk-classification-classes";
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
import { Circle, Scan } from "lucide-react-native";
import { width } from "dom-helpers";
import { HStack } from "@/src/components/ui/hstack";
import {useSupaLegend} from "@/src/utils/supalegend/useSupaLegend";
import * as ImagePicker from "expo-image-picker";
import {Center} from "@/src/components/ui/center";
import axios from 'axios';

export default function ScanScreen() {
  const {
    confidence,
    classification,
    isModelPredicting,
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



  const API_URL = "http://127.0.0.1:8000/generate-heatmap/";
  const[isXaiEnabled, setXaiEnabled] = useState(false);
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const {addResult} = useSupaLegend()

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
      require("@/assets/model/tflite/npk-classification/npk-classification.tflite")
    );
    setModel(tfliteModel);
  };

  if (!hasPermission) {
    return (
      <VStack className="pt-16">
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


  const processImageAndClassify = async (imageUri: string) => {
    // Resize the image to fit the model requirements
    const manipulatedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 128, height: 128 } }],
        { format: SaveFormat.JPEG, base64: true }
    );

    setCapturedImageUri(manipulatedImage.uri);
    runModelPrediction(manipulatedImage.uri, "float32", npkClassificationClasses);
    setDrawerOpen(true); // Open the drawer to show results
  };


  const captureAndClassify = async () => {
    if (!model) {
      console.log("Model is not loaded yet.");
      return;
    }
    if (!cameraRef.current) {
      console.log("No camera ref");
      return;
    }

    const photo = await cameraRef.current.takePhoto();
    if (!photo) {
      throw new Error("Photo is undefined, no image captured");
    }

    console.log("Image Captured");

    setCapturedImageUri(null);
    setDrawerOpen(true);

    await processImageAndClassify("file://" + photo.path); // Process the captured image
  };



  const importImageAndClassify = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted) {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const selectedImageUri = result.assets[0].uri;
        await processImageAndClassify(selectedImageUri); // Process the selected image
      } else {
        console.log("Image selection was canceled");
      }
    } else {
      console.log("Permission to access gallery was denied");
    }
  };

  function saveResultToDatabase() {
    if (!capturedImageUri) return console.log("No captured image uri");
    if (!classification) return console.log("No captured classification");
    if (!confidence) return console.log("No confidence");

    addResult(capturedImageUri, classification, confidence);
    setDrawerOpen(false)
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
        <VStack>
          <HStack className="gap-4 mb-4 flex justify-center items-center ">
            <Pressable onPress={()=>setXaiEnabled(!isXaiEnabled)}>
                <Text className="w-full bg-background">
                  {isXaiEnabled ? (
                      "Disable XAI"
                  ):(
                      "Enable XAI"
                  )}
                </Text>
            </Pressable>
          </HStack>
          <HStack className="gap-4 mb-4 flex justify-center items-center ">
            {/* {device?.hasFlash && */}
            <Button className="rounded-full">
              <ButtonText>Toggle Flash</ButtonText>
            </Button>

            <Button className="rounded-full" onPress={importImageAndClassify}>
              <ButtonText>Import</ButtonText>
            </Button>
            {/* } */}

            {/*  <Button
          onPress={captureAndClassify}
          size="xl"
          variant="solid"
          action="primary"
          className="rounded-full"
        >
          <ButtonText>Classify</ButtonText>
        </Button>*/}

            <Pressable onPress={captureAndClassify}>
              <Box className="size-xl rounded-full border-4 border-white bg-transparent">
                <Scan className=""/>
              </Box>
            </Pressable>


            <Button onPress={toggleCameraFacing} className="rounded-full">
              <ButtonText>Flip Camera</ButtonText>
            </Button>
          </HStack>
        </VStack>


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
          setDrawerOpen,
          imageUri: capturedImageUri,
          classification,
          confidence,
        }}
      />
    </VStack>
  );
}
