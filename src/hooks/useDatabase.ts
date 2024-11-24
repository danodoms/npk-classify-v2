import { useState } from "react";
import { useSystem } from "@/src/powersync/System";
import { RESULTS_TABLE } from "@/src/powersync/Schema";

export function useDatabase() {
  const { db } = useSystem();
  const [error, setError] = useState(null);

  const addResult = async (
    resultId: string,
    classification: string,
    confidence: number
  ) => {
    try {
      await db
        .insertInto(RESULTS_TABLE)
        .values({
          id: resultId,
          created_at: Date.now().toString(),
          timestamp: Date.now().toString(),
          classification: classification,
          confidence: confidence,
          user_uuid: null,
        })
        .execute();
    } catch (err) {
      /*setError(err); // Handle error if insertion fails*/
      console.error("Error inserting result: ", err);
    }
  };

  return { addResult };
}
