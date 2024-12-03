import { enableReactTracking } from "@legendapp/state/config/enableReactTracking";
import { observable } from "@legendapp/state";
import { results$ as _results$ } from "@/src/utils/SupaLegend";

function aggregateAndSortClassifications(data) {
  // Step 1: Extract values from the object
  const values = Object.values(data);

  // Step 2: Aggregate counts by classification
  const aggregated = values.reduce((acc, item) => {
    if (!acc[item.classification]) {
      acc[item.classification] = {
        classification: item.classification,
        count: 0,
      };
    }
    acc[item.classification].count += 1; // Increment count
    return acc;
  }, {});

  // Step 3: Convert aggregated data to an array and sort by count
  return Object.values(aggregated).sort((a, b) => b.count - a.count);
}

export const useResults = () => {
  enableReactTracking({
    auto: true,
  });

  //Get the results and converts it into an array
  const results = Object.values(observable(_results$).get());
  const topClassifications = aggregateAndSortClassifications(results);

  return { results, topClassifications };
};
