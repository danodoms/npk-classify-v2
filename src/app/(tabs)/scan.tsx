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
import {npkClassifierClasses} from "@/assets/model/tflite/npk-classifier/npk-classifier-classes";
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
import {Circle, HelpCircleIcon, Scan, X} from "lucide-react-native";
import { width } from "dom-helpers";
import { HStack } from "@/src/components/ui/hstack";
import {useSupaLegend} from "@/src/utils/supalegend/useSupaLegend";
import * as ImagePicker from "expo-image-picker";
import {Center} from "@/src/components/ui/center";
import axios from 'axios';
import { useToast, Toast,ToastTitle, ToastDescription } from '@/src/components/ui/toast';
import {Icon} from "@/src/components/ui/icon"
import blobToBase64 from 'react-native-blob-util';
import { fromByteArray } from 'base64-js';


export default function ScanScreen() {
  const {
    confidence,
    classification,
      setClassification,
      setConfidence,
      resetPrediction,
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
  const [xaiHeatmapUri, setXaiHeatmapUri] = useState<string | null>(null);
  const [isError, setIsError] = useState<boolean>(false);
  const device = useCameraDevice(cameraFacing);



  const toast = useToast()

  function showNetworkErrorToast() {
    toast.show({id: "networkErrorToast",
      duration: 5000,
      placement: 'top',
      onCloseComplete: undefined,
      avoidKeyboard: true,
      containerStyle: undefined,
      render: () => (
          <Toast
              action="error"
              variant="outline"
              nativeID="networkErrorToast"
              className="p-4 gap-6 border-error-500 w-full shadow-hard-5 max-w-[443px] flex-row justify-between"
          >
            <HStack space="md">
              <Icon as={HelpCircleIcon} className="stroke-error-500 mt-0.5" />
              <VStack space="xs">
                <ToastTitle className="font-semibold text-error-500">
                  Error!
                </ToastTitle>
                <ToastDescription size="sm">
                  Something went wrong.
                </ToastDescription>
              </VStack>
            </HStack>
            <HStack className="min-[450px]:gap-3 gap-1">
              <Button variant="link" size="sm" className="px-3.5 self-center">
                <ButtonText>Retry</ButtonText>
              </Button>
              <Pressable onPress={() => toast.close("networkErrorToast")}>
                <Icon as={X} />
              </Pressable>
            </HStack>
          </Toast>
      ),})
  }

const API_URL = "http://10.0.2.2:8000/generate-heatmap/";
/*  const API_URL = "https://xr-vision-backend.onrender.com/generate-heatmap/";*/

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
      require("@/assets/model/tflite/npk-classifier/npk-classifier-v3.tflite")
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
    // Reset predictions and open the result drawer
    resetPrediction()
    setXaiHeatmapUri(null)
    setDrawerOpen(true);

    // Resize the image to fit the model requirements
    const manipulatedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 224, height: 224 } }],
        { format: SaveFormat.JPEG, base64: true }
    );
    setCapturedImageUri(manipulatedImage.uri);

    // If XAI is disabled, use offline model prediction
    if (!isXaiEnabled){
      runModelPrediction(manipulatedImage.uri, "float32", npkClassifierClasses);
      return
    }

    // Prepare the FormData to send to the API
    const formData = new FormData();
    formData.append('file',{
      uri: manipulatedImage.uri,
      name: 'image.jpg',
      type: 'image/jpeg'});

    // Send image to API and process the response
    axios.post(API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      params: {
          'enable_gradcam': true
      },
      responseType:"arraybuffer"
      })
        .then(response=>{
          setConfidence((parseFloat(response.headers["prediction-confidence"]*100)).toFixed(2));
          setClassification(response.headers["prediction-label"])

         /* //handle cases where endpoint body is empty
          if(!response.data || !response.data.length){
            console.log("endpoint didnt return gradcam image");
            setXaiHeatmapUri(null)
            return
          }*/

          const bytes = new Uint8Array(response.data);
          const base64String = fromByteArray(bytes);
          const imageUri = `data:image/jpeg;base64,${base64String}`;
          setXaiHeatmapUri(imageUri);
        })
        .catch(error=>{
          console.error("Error calling XAI API:", error);
          showNetworkErrorToast()
        });
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
                <Text className="w-full bg-background font-bold text-lg">
                  {isXaiEnabled ? (
                      "XAI Visualizations Enabled"
                  ):(
                      "XAI Visualizations Disabled"
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
          isError,
          setDrawerOpen,
          imageUri: capturedImageUri,
          xaiHeatmapUri,
          classification,
          confidence,
        }}
      />
    </VStack>
  );
}
