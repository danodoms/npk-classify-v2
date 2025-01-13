import React, { useEffect, useState } from "react";
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
import { observable, observe } from "@legendapp/state";
import { enableReactTracking } from "@legendapp/state/config/enableReactTracking";
import {useSupaLegend} from "@/src/utils/supalegend/useSupaLegend";
import {Center} from "@/src/components/ui/center";
import {Icon} from "@/src/components/ui/icon"
import {Brain, BrainCog, RefreshCw, Trash, X} from "lucide-react-native";
import { GestureHandlerRootView, Swipeable} from 'react-native-gesture-handler';

export default function ResultsScreen() {
  const { results, clearResults } = useSupaLegend();

  const [isItemSwiped, setIsItemSwiped] = useState(false);

  /*console.log(topClassifications);*/

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

  function formatTimestamp(timestamp:string, includeTimeZone = true) {
    // Parse the timestamp into a Date object
    const date = new Date(timestamp);

    // Get the components of the date
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };

    // Add timeZoneName if includeTimeZone is true
    if (includeTimeZone) {
      (options as Intl.DateTimeFormatOptions).timeZoneName = "short";
    }

    // Format the date to a readable string
    return date.toLocaleString("en-US", options as Intl.DateTimeFormatOptions);
  }

// Example usage
  const timestamp = "2025-01-02 04:47:49.176207+00";
  console.log(formatTimestamp(timestamp, true));  // With tim

  if(!results.length){
    return(
        <Center className="gap-4 pt-12 bg-background-0 border-green-500 h-full">
          <Text className="opacity-50 text-center text-lg">No results</Text>
        </Center>
    )
  }

  const renderRightActions = (id: string, onDelete: (id: string) => void) => {
    return (
        <Center className="p-4 rounded-md">
          <Button
              size="md"
              variant="solid"
              action="negative"
              onPress={() => onDelete(id)} // Trigger delete action
              className="rounded-md"
          >
            <ButtonIcon as={Trash} />
            <ButtonText>Delete</ButtonText>
          </Button>
        </Center>

    );
  };

  // Delete result from the state and file system
  const onDelete = async (id: string) => {
    console.log("test")
  };


  return (
      <VStack className="gap-4 pt-20 bg-background-0 border-green-500 h-full">
        <ScrollView className="flex gap-4">
          <GestureHandlerRootView >
          {results.map((result) => (

              <Swipeable
                  key={result.id}
                  renderRightActions={() => renderRightActions(result.id, onDelete)} // Swipe actions
               /*   onSwipeableOpen={direction:"right" swipeable: ()=>setIsItemSwiped(true)}*/
              >
                <HStack className="gap-4 border-red-500 px-4 py-2 rounded-lg items-center">
                  <Image
                      className="rounded-md border-white-50 border-2"
                      source={{
                        uri: getScanResultImageUriFromResultId(result.id),
                      }}
                      alt="image-result"
                  />

                  <VStack className="border-green-500">
                    <Text className="font-bold text-lg">{result.classification}</Text>
                    <Text className="opacity-50">{result.confidence}% Confidence</Text>
                    <Text className="opacity-50 text-sm">
                      {result.created_at && formatTimestamp(result.created_at || '', false)}
                    </Text>

                  {/*  <Text className="opacity-50 text-sm">Swipe right to delete</Text>*/}
                  </VStack>
                </HStack>
              </Swipeable>

          ))}
          </GestureHandlerRootView>
        </ScrollView>
      </VStack>

  );
}
