import { useState } from "react";
import { useSystem } from "@/src/powersync/System";
import { RESULTS_TABLE } from "@/src/powersync/Schema";
import { useQuery } from "@powersync/react";

export function useDatabase() {
  const { db } = useSystem();
  const [error, setError] = useState(null);
  // const { userID } = await supabaseConnector.fetchCredentials();

  const { data: results } = useQuery(db.selectFrom(RESULTS_TABLE).selectAll());

  const { data: topClassifications } = useQuery(
    db
      .selectFrom(RESULTS_TABLE) // Table name
      .select([
        "classification", // Select the classification column
        db.fn.count("classification").as("total"), // Count the rows for each classification
      ])
      .groupBy("classification") // Group by classification
      .orderBy("total", "desc") // Order by the total count in descending order
  );

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

  return { addResult, results, topClassifications };
}
