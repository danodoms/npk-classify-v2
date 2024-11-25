import { Dimensions } from "react-native";

import { Text } from "@/src/components/ui/text";

import {
  Bot,
  ChartScatter,
  Leaf,
  Scan,
  Circle,
  Sparkles,
  Sparkle,
} from "lucide-react-native";
import { VStack } from "@/src/components/ui/vstack";
import { Box } from "@/src/components/ui/box";
import { Heading } from "@/src/components/ui/heading";
import LottieView from "lottie-react-native";
import React from "react";
import { HStack } from "@/src/components/ui/hstack";
import { useColorScheme } from "@/src/hooks/useColorScheme";
import { getPrimaryColor } from "@expo/config-plugins/build/android/PrimaryColor";
import {
  Avatar,
  AvatarBadge,
  AvatarFallbackText,
  AvatarImage,
} from "@/src/components/ui/avatar";

import { useDatabase } from "@/src/hooks/useDatabase";
import { Image } from "@/src/components/ui/image";
import { getScanResultImageUriFromResultId } from "@/src/lib/imageUtil";
import {
  Extrapolation,
  interpolate,
  useSharedValue,
} from "react-native-reanimated";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";
import Pagination from "react-native-reanimated-carousel";
import { Button, ButtonText } from "@/src/components/ui/button";

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const width = Dimensions.get("window").width;
  const { results } = useDatabase();
  const progress = useSharedValue<number>(0);

  return (
    <VStack className="p-4 gap-4 h-full bg-background-0 pt-12">
      <HStack className=" rounded-md mb-4 justify-between flex">
        <HStack className="gap-1">
          <Heading className="flex flex-auto" size="3xl">
            XR Vision
          </Heading>
          <Sparkle color="white" className="size-xs" />
        </HStack>

        <Avatar size="md" className="flex">
          <AvatarFallbackText>John Doe</AvatarFallbackText>
          <AvatarImage
            source={{
              uri: "https://avatars.githubusercontent.com/u/165539900?v=4",
            }}
          />
          <AvatarBadge />
        </Avatar>

        {/*<Text className="text-left">
          Classify Rice NPK deficiencies with your camera
        </Text>*/}
      </HStack>

      <HStack className="flex gap-4 justify-between align-items-center">
        <HStack className="flex gap-2 align-middle align-items-center">
          <Box className="flex align-middle flex-auto">
            <ChartScatter color="white" className="" />
          </Box>

          <Heading className="flex align-middle" size="lg">
            Analytics
          </Heading>
        </HStack>

        <Button className="" variant="link">
          <ButtonText className="opacity-50 font-normal">Show More</ButtonText>
        </Button>
      </HStack>

      <VStack className="flex gap-4 mb-4">
        <HStack className="flex gap-4">
          <Box className="flex flex-1 bg-background-50 rounded-lg p-4">
            <Text>Nitrogen</Text>
          </Box>
          <Box className="flex flex-1 bg-background-50 rounded-lg p-4">
            <Text>Potassium</Text>
          </Box>
        </HStack>
        <HStack className="flex gap-4">
          <Box className="flex flex-1 bg-background-50 rounded-lg p-4">
            <Text>Phosphorus</Text>
          </Box>
          <Box className="flex flex-1 bg-background-50 rounded-lg p-4">
            <Text>Healthy</Text>
          </Box>
        </HStack>
      </VStack>

      <HStack className="flex gap-2">
        <Scan color="white" className="size-sm" />
        <Heading className="" size="lg">
          Recent Scans
        </Heading>

        <Text className="opacity-50 align-bottom ml-auto">
          {results.length} Total Scans
        </Text>
      </HStack>

      {/*<Box className="flex flex-auto bg-background-50 rounded-lg"></Box>*/}

      <Box className="relative flex flex-auto bg-background-50 rounded-lg justify-center h-full overflow-hidden">
        <Carousel
          loop
          width={width}
          autoPlay={true}
          data={results}
          autoPlayInterval={3500}
          /*mode="parallax"*/
          pagingEnabled={true}
          scrollAnimationDuration={1500}
          onSnapToItem={(index) => console.log("current index:", index)}
          renderItem={({ item, index }) => (
            <Box className="relative flex flex-auto bg-background-50 justify-center h-full overflow-hidden">
              <Text>ahhajdsdujsiadsbdsbajiu</Text>
              <Image
                source={{ uri: getScanResultImageUriFromResultId(item.id) }}
                className="absolute top-0 left-0 w-full h-full"
                resizeMode="cover"
                alt="recent-scan"
              ></Image>

              {/* Gradient Overlay */}
              <Box className="absolute w-full h-1/2 bg-gradient-to-t z-10 from-background-0 to-transparent" />

              <VStack className="z-10 absolute bottom-4 left-4  ">
                <Text className="font-bold text-2xl">
                  {item.classification}
                </Text>
                <Text className="">{item.confidence}% Confidence</Text>
              </VStack>
            </Box>
          )}
        />
      </Box>

      {/*<Pagination.
        progress={progress}
        data={defaultDataWith6Colors}
        dotStyle={{ backgroundColor: "#262626" }}
        activeDotStyle={{ backgroundColor: "#f1f1f1" }}
        containerStyle={{ gap: 5, marginBottom: 10 }}
        onPress={onPressPagination}
      />*/}

      <Box className="w-full flex align-middle bg-background-50 p-4 rounded-lg">
        <Text className="text-sm text-center">Developed by XtraRice Team</Text>
        <Text className="text-xs text-center">
          danodoms - henrytors - rexpons
        </Text>
      </Box>
    </VStack>
  );
}
