import { useEffect, useState } from "react";
import { useSystem } from "@/src/powersync/System";
import * as Crypto from "expo-crypto";
import * as FileSystem from "expo-file-system";

import { RESULTS_TABLE, Result } from "@/src/powersync/Schema";
import { VStack } from "@/src/components/ui/vstack";
import {
  Button,
  ButtonText,
  ButtonSpinner,
  ButtonIcon,
  ButtonGroup,
} from "@/src/components/ui/button";
import { Image } from "@/src/components/ui/image";
import { Text } from "@/src/components/ui/text";
import { ScrollView } from "react-native";
import { HStack } from "@/src/components/ui/hstack";
import { useQuery } from "@powersync/react";

export default function ResultsScreen() {
  const [result, setResult] = useState("");
  const { supabaseConnector, db } = useSystem();
  /*const [results, setResults] = useState<Result[]>([]);*/

  const { data: results } = useQuery(db.selectFrom(RESULTS_TABLE).selectAll());

  // Reset the database
  const resetResults = async () => {
    await db.deleteFrom(RESULTS_TABLE).execute();
  };

  const listFiles = async () => {
    try {
      if (!FileSystem.documentDirectory) return;

      // Get the list of files in the document directory
      const files = await FileSystem.readDirectoryAsync(
        FileSystem.documentDirectory + "images"
      );
      console.log("Files in documentDirectory:", files);
    } catch (error) {
      console.error("Error reading files:", error);
    }
  };

  return (
    <VStack className="p-4 gap-4">
      {/*<Text>Total Results: {results.length}</Text>
      <HStack className="gap-4 items-center w-full">
        <Button onPress={listFiles} className="flex flex-auto">
          <ButtonText>List Files</ButtonText>
        </Button>

        <Button onPress={resetResults} className="flex flex-auto">
          <ButtonText>Reset Database</ButtonText>
        </Button>
      </HStack>*/}

      <VStack>
        <ScrollView>
          {results.map((result) => (
            <HStack key={result.id} className="pt-4 gap-4">
              <Image
                className="rounded-md border-white-50 border-2"
                source={{
                  uri: FileSystem.documentDirectory + "images/" + result.id,
                }}
                alt="image-result"
              ></Image>

              <VStack>
                <Text className="font-bold text-lg">
                  {result.classification}
                </Text>
                <Text className="">{result.confidence}%</Text>
                <Text>{result.timestamp}</Text>
              </VStack>
            </HStack>
          ))}
        </ScrollView>
      </VStack>
    </VStack>
  );
}
