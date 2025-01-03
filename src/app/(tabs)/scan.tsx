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
import {
  Brain,
  BrainCircuit,
  BrainCog,
  ChevronUp,
  Circle,
  HelpCircleIcon,
  Images,
  RefreshCw,
  Scan,
  X
} from "lucide-react-native";
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
import { Input, InputField, InputIcon, InputSlot } from '@/src/components/ui/input';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useSelector} from "@legendapp/state/react";
import { globalStore } from "@/src/state/globalState";



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


  const cameraRef = useRef<Camera | null>(null);
  const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null); // To hold the image URI
  const { hasPermission, requestPermission } = useCameraPermission();
  const [cameraFacing, setCameraFacing] = useState<CameraPosition>("back");
  const [xaiHeatmapUri, setXaiHeatmapUri] = useState<string | null>(null);
  const [isError, setIsError] = useState<boolean>(false);
  const [isResultSaved, setIsResultSaved] = useState<boolean>(false);
  const device = useCameraDevice(cameraFacing);
  const[isXaiEnabled, setXaiEnabled] = useState(false);
  const [isDrawerOpen, setDrawerOpen] = useState(false)

  const backendAddress = useSelector(() => globalStore.backendAddress.get());




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

/*const API_URL = "http://10.0.2.2:8000/generate-heatmap/";*/
/*  const API_URL = "https://xr-vision-backend.onrender.com/generate-heatmap/";*/
  const API_URL = `https://${backendAddress}/generate-heatmap/`;



  const {addResult} = useSupaLegend()

  // Ensure TensorFlow is ready before classifying
  useEffect(() => {
    const initializeTf = async () => {
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
    setIsResultSaved(false)
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
    setIsResultSaved(true)
  }

  function RenderButtonComponent() {

    return (
        <VStack className="p-4">

          <HStack className="gap-4 mb-8 flex justify-center items-center w-full ">
            <Button
                size="md"
                variant={isXaiEnabled ? "solid" : "outline"}
                className="rounded-full"
                onPress={() => setXaiEnabled(!isXaiEnabled)}
            >
              <ButtonText>{isXaiEnabled ? "Disable XAI" : "Enable XAI"}</ButtonText>
              <ButtonIcon as={isXaiEnabled ? BrainCog : Brain} />
            </Button>

            <Button size="md" variant="solid" className="rounded-full" onPress={()=>setDrawerOpen(true)}>
              {/*<ButtonText >Show Drawer</ButtonText>*/}
              <ButtonIcon as={ChevronUp} />
            </Button>
          </HStack>

          <HStack className="mb-4 flex justify-evenly items-center border-red-500">
            <Button size="xl" variant="solid" className="rounded-full p-4" onPress={importImageAndClassify} >
              <ButtonIcon size="xl" as={Images} />
            </Button>

            <Pressable onPress={captureAndClassify}>
              <Center className="size-20 rounded-full border-4 border-white">
                <Center className="size-16 rounded-full bg-white opacity-20"/>
              </Center>
            </Pressable>

            <Button size="xl"  variant="solid" className="rounded-full p-4" onPress={toggleCameraFacing}>
              <ButtonIcon size="xl" as={RefreshCw} />
            </Button>
          </HStack>
        </VStack>
    );
  }

  return (
    <VStack
      className="bg-green h-full relative justify-between"
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

      {/*FOR DEVELOPERS*/}
      <VStack className="w-full justify-center mb-4 opacity-50 pt-20">
        <Text className="font-medium text-xs text-center">XAI is using this API route, modify it in accounts page</Text>
        <Text className="text-xs text-center">{API_URL}</Text>
      </VStack>


      <RenderButtonComponent />

      <ScanResultDrawer
        drawerState={{
          saveResultCallback: saveResultToDatabase,
          isResultSaved,
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
