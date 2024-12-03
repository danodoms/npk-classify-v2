import { useEffect, useState } from "react";
import { useSystem } from "@/src/powersync/PowerSync";
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
import { getScanResultImageUriFromResultId } from "@/src/lib/imageUtil";
import { useDatabase } from "@/src/hooks/useDatabase";
import { observer } from "@legendapp/state/react";
import { results$ as _results$ } from "@/src/utils/SupaLegend";
import { observable, observe } from "@legendapp/state";
import { enableReactTracking } from "@legendapp/state/config/enableReactTracking";
import { useResults } from "@/src/utils/useResults";

export default function ResultsScreen() {
  const results = useResults();

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
    <VStack className="p-4 gap-4 pt-12 bg-background-0">
      <Text>Total Results: {Object.keys(results).length}</Text>
      <HStack className="gap-4 items-center w-full">
        <Button onPress={listFiles} className="flex flex-auto">
          <ButtonText>Log Captured Images</ButtonText>
        </Button>

        {/*<Button onPress={resetResults} className="flex flex-auto">
            <ButtonText>Reset Database</ButtonText>
          </Button>*/}
      </HStack>

      <VStack>
        <ScrollView>
          {Object.values(results).map((result) => (
            <HStack key={result.id} className="pt-4 gap-4">
              <Image
                className="rounded-md border-white-50 border-2"
                source={{
                  uri: getScanResultImageUriFromResultId(result.id),
                }}
                alt="image-result"
              ></Image>

              <VStack>
                <Text className="font-bold text-lg">
                  {result.classification}
                </Text>
                <Text className="">{result.confidence}%</Text>
                <Text>{result.created_at}</Text>
              </VStack>
            </HStack>
          ))}
        </ScrollView>
      </VStack>
    </VStack>
  );
}
