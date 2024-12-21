import { createClient } from "@supabase/supabase-js";
import { observable } from "@legendapp/state";
import { syncedSupabase } from "@legendapp/state/sync-plugins/supabase";
import { configureSynced } from "@legendapp/state/sync";
import { observablePersistAsyncStorage } from "@legendapp/state/persist-plugins/async-storage";
import { observablePersistMMKV } from "@legendapp/state/persist-plugins/mmkv";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Database } from "./database.types";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { saveImageToAppData } from "@/src/lib/imageUtil";
import { MMKV } from "react-native-mmkv";
import { supabase } from "./supabase";

const mmkvStorageId = "mmkvStorage";

const generateId = () => uuidv4();

// Create a configured sync function
const customSynced = configureSynced(syncedSupabase, {
  // Use React Native MMKV
  persist: {
    plugin: observablePersistMMKV({ id: mmkvStorageId }),
    /*plugin: observablePersistAsyncStorage({
      AsyncStorage,
    }),*/
  },
  generateId,
  supabase,
  changesSince: "last-sync",
  fieldCreatedAt: "created_at",
  fieldUpdatedAt: "updated_at",
  // Optionally enable soft deletes
  fieldDeleted: "deleted",
});

export const results$ = observable(
  customSynced({
    supabase,
    collection: "results",
    select: (from) =>
      from.select(
        "id,counter,classification,confidence,created_at,updated_at,deleted"
      ),
    actions: ["read", "create", "update", "delete"],
    realtime: true,
    // Persist data and pending changes locally
    persist: {
      name: "results",
      retrySync: true, // Persist pending changes and retry
    },
    retry: {
      infinite: true, // Retry changes with exponential backoff
    },
  })
);

export const clearResults$ = () => results$.delete();

/*CRUD FUNCTIONS BELOW*/
/*CRUD FUNCTIONS BELOW*/
/*CRUD FUNCTIONS BELOW*/

export function addResult(
  capturedImageUri: string,
  classification: string,
  confidence: number
) {
  const id = generateId();
  // Add keyed by id to the todos$ observable to trigger a create in Supabase
  results$[id].assign({
    id,
    classification,
    confidence,
  });
  console.log("RESULT SAVED: " + id + " " + classification + " " + confidence);

  saveImageToAppData(capturedImageUri, id);
}
