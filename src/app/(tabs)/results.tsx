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

export default function ResultsScreen() {
  const [result, setResult] = useState("");
  const { supabaseConnector, db } = useSystem();
  const [results, setResults] = useState<Result[]>([]);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    const dbResults = await db.selectFrom(RESULTS_TABLE).selectAll().execute();
    setResults(dbResults);
  };

  const addResult = async () => {
    // const { userID } = await supabaseConnector.fetchCredentials();
    const resultId = Crypto.randomUUID();

    await db
      .insertInto(RESULTS_TABLE)
      .values({
        id: resultId,
        created_at: null,
        timestamp: "1000",
        user_uuid: null,
      })
      .execute();

    setResult("");
    loadResults();
  };

  // Reset the database
  const resetResults = async () => {
    await db.deleteFrom(RESULTS_TABLE).execute();
    loadResults();
  };

  return (
    <VStack>
      {/*<Button onPress={addResult}>
        <ButtonText>Classify</ButtonText>
      </Button>
*/}
      {/* Reset Button */}
      <Button onPress={resetResults}>
        <ButtonText>Reset Database</ButtonText>
      </Button>

      {/* Dynamic Counter */}
      <Text>Total Results: {results.length}</Text>

      <VStack>
        <ScrollView>
          {results.map((result) => (
            <HStack key={result.id} className="p-4 gap-4">
              <Image
                className="rounded-md border-white-50 border-2"
                source={{
                  uri:
                    FileSystem.documentDirectory +
                    "images/" +
                    result.id +
                    ".jpg",
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
