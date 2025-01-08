import * as FileSystem from "expo-file-system";
import "react-native-get-random-values";
import {supabase} from "../utils/supabase";
import {useSession} from "@/src/hooks/useSession";


export const useSupabase = () => {
    const session = useSession()
    const userId = session?.user.id


    type BucketResult = { name: string } | { error: unknown };
    /**
     * Function to get a storage bucket or create it if it doesn't exist.
     * @param {string} bucketName - The name of the bucket.
     * @returns {Promise<object>} - The bucket data or an error object.
     */
    const getOrCreateBucket = async (bucketName:string) : Promise<BucketResult> => {
        try {
            // Check if the bucket exists
            const { data: buckets, error: listError } = await supabase.storage.listBuckets();
            console.log(buckets)

            if (listError) {
                throw listError;
            }

            // Find if the bucket exists
            const existingBucket = buckets.find((bucket) => bucket.name === bucketName);

            if (existingBucket) {
                console.log(`Bucket "${bucketName}" already exists.`);
                return existingBucket;
            }

            // Create the bucket if it doesn't exist
            console.log(`Bucket "${bucketName}" does not exist. Creating it...`);
            const { data: createdBucket, error: createError } = await supabase.storage.createBucket(bucketName);

            if (createError) {
                throw createError;
            }

            console.log(`Bucket "${bucketName}" created successfully.`);
            return createdBucket;
        } catch (error) {
            console.error('Error getting or creating bucket:', error);
            return { error };
        }
    };


    /**
     * Upload images to Supabase storage bucket.
     * @param {string} bucketName - The name of the bucket.
     * @param {string} directory - The app storage directory containing images.
     */
    const uploadImagesToBucket = async (bucketName: string, directory: string) => {
        try {
            // Get all files in the specified directory
            const files = await FileSystem.readDirectoryAsync(directory);

            // Filter only .jpg files
            const jpgFiles = files.filter((file) => file.endsWith('.jpg'));
            console.log(jpgFiles);

            if (jpgFiles.length === 0) {
                console.log('No .jpg files found in the directory.');
                return;
            }

            // Upload each .jpg file
            for (const file of jpgFiles) {
                const filePath = `${directory}${file}`;
                const fileName = file;

                // Define the path for the user-specific folder inside the bucket
                const userFolderPath = `${userId}/${fileName}`;

                /*// Check if the file already exists
                const { data: existingFiles, error: checkError } = await supabase.storage
                    .from(bucketName)
                    .list('', { search: fileName });*/

                // Check if the file already exists under the user folder
                const { data: existingFiles, error: checkError } = await supabase.storage
                    .from(bucketName)
                    .list(userId, { search: fileName });


                if (checkError) throw checkError;

                if (existingFiles.some((f) => f.name === fileName)) {
                    console.log(`File "${fileName}" already exists for user "${userId}". Skipping upload.`);
                    continue;
                }

                // Get the file info to determine size
                const fileInfo = await FileSystem.getInfoAsync(filePath);
                if (!fileInfo.exists) {
                    console.log(`File "${fileName}" not found`);
                    continue;
                }

                // Read the file
                const fileUri = fileInfo.uri;

                // Upload using fetch and FormData
                const formData = new FormData();
                formData.append('file', {
                    uri: fileUri,
                    name: fileName,
                    type: 'image/jpeg'
                } as any);

                const { data, error } = await supabase.storage
                    .from(bucketName)
                    .upload(userFolderPath, formData, {
                        contentType: 'multipart/form-data',
                    });

                if (error) throw error;

                console.log(`Uploaded "${fileName}" successfully:`, data);
            }
        } catch (error) {
            console.error('Error uploading images:', error);
        }
    };



    /**
     * Main function to ensure the bucket exists and upload images.
     */
    const syncLocalImagesToRemoteDatabase = async () => {
        const bucketName = 'images'; // Replace with your desired bucket name
        const imagesDirectory = `${FileSystem.documentDirectory}images/`; // Replace with your app's image directory

        // Ensure the bucket exists
        const bucket: BucketResult = await getOrCreateBucket(bucketName);

        if ('error' in bucket) {
            console.error('Failed to ensure bucket:', bucket.error);
            return;
        }

        // Upload images to the bucket
        await uploadImagesToBucket(bucketName, imagesDirectory);
    };

return syncLocalImagesToRemoteDatabase
}

