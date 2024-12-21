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

export const supabase = createClient<Database>(
  process.env.EXPO_PUBLIC_SUPABASE_URL as string,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
