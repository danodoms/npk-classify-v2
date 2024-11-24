import { useEffect, useState } from "react";
import { useSystem } from "@/src/powersync/System";
import * as Crypto from "expo-crypto";

import { RESULTS_TABLE, Result } from "@/src/powersync/Schema";
import { VStack } from "@/src/components/ui/vstack";
import {
  Button,
  ButtonText,
  ButtonSpinner,
  ButtonIcon,
  ButtonGroup,
} from "@/src/components/ui/button";
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
        n_deficiency: 10,
        p_deficiency: 20,
        k_deficiency: 30,
        healthy: 40,
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
      <Button onPress={addResult}>
        <ButtonText>Classify</ButtonText>
      </Button>

      {/* Reset Button */}
      <Button onPress={resetResults}>
        <ButtonText>Reset Database</ButtonText>
      </Button>

      {/* Dynamic Counter */}
      <Text>Total Results: {results.length}</Text>

      <VStack>
        <ScrollView>
          {results.map((result) => (
            <HStack key={result.id}>
              <Text>N: {result.n_deficiency}</Text>
              <Text>P: {result.p_deficiency}</Text>
              <Text>K: {result.k_deficiency}</Text>
              <Text>Healthy: {result.healthy}</Text>
              <Text>Timestamp: {result.timestamp}</Text>
            </HStack>
          ))}
        </ScrollView>
      </VStack>
    </VStack>
  );
}
