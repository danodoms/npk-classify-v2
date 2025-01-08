import {
  moveAsync,
  documentDirectory,
  makeDirectoryAsync,
} from "expo-file-system";
import * as FileSystem from "expo-file-system";

export const saveImageToAppData = async (
  imageUri: string,
  fileName: string
) => {
  const destinationUri = documentDirectory + `images/${fileName}.jpg`;
  try {
    await makeDirectoryAsync(documentDirectory + "images", {
      intermediates: true,
    });
    await moveAsync({
      from: imageUri,
      to: destinationUri,
    });
    console.log("Image moved to app data:", destinationUri);
  } catch (error) {
    console.error("Error moving image:", error);
  }
};


export const getScanResultImageUriFromResultId = (resultId: string) => {
  return FileSystem.documentDirectory + "images/" + resultId + ".jpg";
};
