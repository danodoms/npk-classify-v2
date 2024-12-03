import { enableReactTracking } from "@legendapp/state/config/enableReactTracking";
import { observable } from "@legendapp/state";
import { results$ as _results$ } from "@/src/utils/SupaLegend";

export const useResults = () => {
  enableReactTracking({
    auto: true,
  });
  return observable(_results$).get();
};
