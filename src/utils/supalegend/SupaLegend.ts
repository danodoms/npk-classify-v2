import { useEffect } from "react";
import {Observable, observable} from "@legendapp/state";
import { syncedSupabase } from "@legendapp/state/sync-plugins/supabase";
import { configureSynced } from "@legendapp/state/sync";
import { observablePersistMMKV } from "@legendapp/state/persist-plugins/mmkv";
import { v4 as uuidv4 } from "uuid";
import { MMKV } from "react-native-mmkv";
import { supabase } from "../supabase";
import { saveImageToAppData } from "@/src/lib/imageUtil";




/*NOTE: THIS FILE SERVES AS THE SUPALEGEND CONFIG AND DEFINES THE BASE CONFIG AND THE FUNCTIONS
NOTE: FUNCTIONS INSIDE HERE SHOULD ONLY BE USED BY THE USESUPALEGEND HOOK*/

export type ResultsObservable = Observable<Record<string, {     id: string,     counter: number ,    classification: string | null ,    confidence: number | null  ,   created_at: string | null    , updated_at: string | null   ,  deleted: boolean | null   ,  user_id: string }>>


const mmkvStorageId = "mmkvStorage";
const generateId = () => uuidv4();


// Configure the synced function
const customSynced = configureSynced(syncedSupabase, {
    persist: {
        plugin: observablePersistMMKV({ id: mmkvStorageId }),
    },
    generateId,
    supabase,
    changesSince: "last-sync",
    fieldCreatedAt: "created_at",
    fieldUpdatedAt: "updated_at",
    fieldDeleted: "deleted",
});

// Create the observable for results
/*export const results$ = observable(
    customSynced({
        supabase,
        collection: "results",
        select: (from) =>
            from.select(
                "id,counter,classification,confidence,created_at,updated_at,deleted,user_id"
            ),
        filter: (select) => select.eq("user_id", user_id),
        actions: ["read", "create", "update", "delete"],
        realtime: true,
        persist: {
            name: "results",
            retrySync: true,
        },
        retry: {
            infinite: true,
        },
    })
);*/


export function createResultsObservable(user_id: string) {
    // Return the observable for the results, dynamically using the user_id parameter
    return observable(
        customSynced({
            supabase,
            collection: "results",
            select: (from) =>
                from.select(
                    "id,counter,classification,confidence,created_at,updated_at,deleted,user_id"
                ).eq("user_id", user_id),
            filter: (select) => select.eq("user_id", user_id),
            actions: ["read", "create", "update", "delete"],
            realtime: { filter: `user_id=eq.${user_id}` },
            persist: {
                name: "results",
                retrySync: true,
            },
            retry: {
                infinite: true,
            },
            changesSince: 'last-sync'
        })
    );
}



// Function to add a result
export const addResult = (
    results$:  ResultsObservable,
    capturedImageUri: string,
    classification: string,
    confidence: number,
    user_id: string
) => {
    const id = generateId();
    results$[id].assign({
        id,
        classification,
        confidence,
        user_id,
    });
    console.log(
        `RESULT SAVED: ${id} ${classification} ${confidence} ${user_id}`
    );

    saveImageToAppData(capturedImageUri, id);
};




