import {
  Image,
  StyleSheet,
  Platform,
  View,
  TouchableOpacity,
  Animated,
} from "react-native";

import { Text } from "@/src/components/ui/text";

import { Leaf } from "lucide-react-native";
import { VStack } from "@/src/components/ui/vstack";
import { Box } from "@/src/components/ui/box";
import { Heading } from "@/src/components/ui/heading";

export default function HomeScreen() {
  return (
    <VStack className="p-4">
      <Box className="p-4 rounded-md bg-background-200">
        <Heading className="">XtraRice</Heading>
        <Text className="text-sm text-left">
          Classify Rice NPK deficiencies with your camera!
        </Text>
      </Box>
    </VStack>
  );
}
