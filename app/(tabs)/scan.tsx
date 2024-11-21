import {useState, useEffect, useRef} from 'react';
import {loadTensorflowModel, TensorflowModel} from "react-native-fast-tflite";
import {
    Camera,
    useCameraDevice,
    useCameraPermission,
} from "react-native-vision-camera";
import {Image} from 'react-native'
/*import {useResizePlugin} from "vision-camera-resize-plugin";*/
import {VStack} from "@/components/ui/vstack";
import { Text } from '@/components/ui/text';
import {Worklets} from "react-native-worklets-core";
import {plantDiseaseClasses} from "@/assets/model/tflite/plant-disease/plant-disease-classes";
import * as ImageManipulator from 'expo-image-manipulator';
import {convertToRGB} from "react-native-image-to-rgb";
import {
    Button,
    ButtonText,
    ButtonSpinner,
    ButtonIcon,
    ButtonGroup,
} from '@/components/ui/button';
import {SaveFormat} from "expo-image-manipulator";


export default function ScanScreen() {
    const [isTfReady, setIsTfReady] = useState(false);
    const [classification, setClassification] = useState<string  | null>(null);
    const [model, setModel] = useState<TensorflowModel | null>(null);
    const cameraRef = useRef<Camera | null>(null);
    const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null); // To hold the image URI
    /*const { resize } = useResizePlugin()*/


    const { hasPermission, requestPermission } = useCameraPermission()
    const device = useCameraDevice('back')



  /*  const runClassification = Worklets.createRunOnJS((outputs:{}) => {
        const result = getMaxClassification(outputs, plantDiseaseClasses)

        // Update classification state
        setClassification(`${result.className} (Score: ${result.maxValue.toFixed(6)})`); // Optionally include the score
    })*/

    const getMaxClassification = (outputs, outputClasses:object) => {
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
            maxValue
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
            await loadModel();  // Load the model when TensorFlow is ready
        };
        initializeTf();
    }, []);

    const loadModel = async () => {
        // Load the TFLite model from the app bundle
        /*   const tfliteModel = await loadTensorflowModel(require("../../../assets/model/tflite/ASL.tflite"))*/
        const tfliteModel = await loadTensorflowModel(require("../../assets/model/tflite/plant-disease/plant-disease.tflite"))
        setModel(tfliteModel);
    };



    if (!hasPermission) {
        return (
            <VStack>
                <Text>We need your permission to show the camera</Text>
                <Button onPress={requestPermission}>
                    <ButtonText>
                        grant permission
                    </ButtonText>
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
        if (!model) return console.log("Model is not loaded yet.");
        if (!cameraRef.current) return console.log("no camera ref");

        // Capture the image from the camera
        const photo = await cameraRef.current.takePhoto();

        if (!photo) {
            throw new Error("Photo is undefined, no image captured");
        }
        console.log("Image Captured");


        // Resize the image to fit the model requirements ex. 224 x 224 in 3 channels
        const manipulatedImage = await ImageManipulator.manipulateAsync("file://"  +  photo.path, [{ resize: { width: 224, height: 224 } }], {format:SaveFormat.JPEG , base64:true});
        console.log("Image Resized")

        // Sets the captured image preview to flash on screen
        setCapturedImageUri("file://" + manipulatedImage.uri); // Set the image URI to show on screen
        setTimeout(() => setCapturedImageUri(null), 5000); // Hide the image preview after 5 seconds

        //convert image into correct format
        const imageTensor = await convertImageToRgb(manipulatedImage.uri, 'float32')


        // Perform classification with the loaded TFLite model
        console.log("Starting Classification");
        const prediction = await model.run([imageTensor])
        console.log(prediction)

       /* await runClassification(prediction[0])*/


        console.log("Done, Image Classified")
    };



    type imageFormat = 'uint8' | 'float32'
    const convertImageToRgb = async (image,format:imageFormat='uint8') => {
        const convertedArray = await convertToRGB(image);
        console.log("convertedArray:", convertedArray);

        let red:number[] = []
        let blue:number[] = []
        let green:number[] = []

        // This normalizes the RGB values by dividing 255
        for (let index = 0; index < convertedArray.length; index += 3) {
            red.push(convertedArray[index] / 255);
            green.push(convertedArray[index + 1] / 255);
            blue.push(convertedArray[index + 2] / 255);
        }
        const finalArray = [...red, ...green, ...blue];

        console.log('normalized array: ', finalArray);

        //convert to array buffer (some models require uint8 or float32 format)
        if (format === 'float32') {
            return new Float32Array(finalArray);
        } else if (format === 'uint8') {
            return new Uint8Array(finalArray);
        } else {
            throw new Error("Invalid format specified. Use 'float32' or 'uint8'.");
        }
    };





    return (
        <VStack>
            <Camera
                className="absolute"
                device={device}
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
            {classification && (
                <Text>
                    {classification}
                </Text>
            )}

            <VStack >
                <Button onPress={captureAndClassify} disabled={!isTfReady}>
                    {isTfReady ? <Text>Capture and Classify</Text> : <Text>Waiting for Tensorflow...</Text>}
                </Button>
            </VStack>


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
