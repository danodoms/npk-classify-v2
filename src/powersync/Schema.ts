import { column, Schema, Table } from "@powersync/react-native";
// OR: import { column, Schema, Table } from '@powersync/react-native';

export const RESULTS_TABLE = "results";

const results = new Table(
  {
    // id column (text) is automatically included
    created_at: column.text,
    classification: column.text,
    confidence: column.real,
    timestamp: column.text,
    user_uuid: column.text,
  },
  { indexes: {} }
);

export const AppSchema = new Schema({
  results,
});

export type Database = (typeof AppSchema)["types"];
export type Result = Database["results"];
