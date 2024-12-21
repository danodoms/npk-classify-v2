import { Dimensions, Pressable } from "react-native";

import { Text } from "@/src/components/ui/text";

import {
  Bot,
  ChartScatter,
  Leaf,
  Scan,
  Circle,
  Sparkles,
  Sparkle,
  Image as ImageLucide,
  GalleryHorizontal,
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
import { FlashList } from "@shopify/flash-list";
import { Center } from "@/src/components/ui/center";
import { Skeleton } from "@/src/components/ui/skeleton";
import { useResults } from "@/src/utils/useResults";
import { Link } from "expo-router";

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const { width, height } = Dimensions.get("window");
  const { results, topClassifications } = useResults();

  /*const progress = useSharedValue<number>(0);*/

  return (
    <VStack className="p-4 gap-4 h-full bg-background-0 pt-12">
      <HStack className=" rounded-md mb-4 justify-between flex">
        <HStack className="gap-1">
          <Heading className="flex flex-auto" size="3xl">
            XR Vision
          </Heading>
          <Sparkle color="white" className="size-xs" />
        </HStack>

        <Link href="/screens/account">
          <Avatar size="md" className="flex">
            <AvatarFallbackText>John Doe</AvatarFallbackText>
            <AvatarImage
              source={{
                uri: "https://avatars.githubusercontent.com/u/165539900?v=4",
              }}
            />
            <AvatarBadge />
          </Avatar>
        </Link>




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

      {/* <VStack className="flex gap-4 mb-4">
        <Box className="flex flex-auto bg-background-50 rounded-lg p-4 ">
          <Text className="font-bold">
            {topClassifications[0].classification}
          </Text>
        </Box>

        <Box className="flex flex-auto bg-background-50 rounded-lg p-4">
          <Text>{topClassifications[1].classification}</Text>
        </Box>

        <Box className="flex flex-auto bg-background-50 rounded-lg p-4">
          <Text>{topClassifications[2].classification}</Text>
        </Box>
        <Box className="flex flex-1 bg-background-50 rounded-lg p-4">
          <Text>{topClassifications[3].classification}</Text>
        </Box>
      </VStack>*/}

      <VStack className="flex mb-4 h-1/4 relative rounded-lg">
        <FlashList
          data={topClassifications}
          renderItem={({ item }) => (
            <HStack className="flex flex-auto bg-background-50 rounded-lg p-4 mb-2 align-items-center">
              <Text className="flex flex-1 font-bold">
                {item.classification}
              </Text>
              <Text className="ml-auto font-bold  rounded-lg">
                {item.count.toString()}
              </Text>
            </HStack>
          )}
          estimatedItemSize={20}
          ListEmptyComponent={
            <Box className="flex bg-background-50 h-full flex-auto rounded-lg p-4">
              <Text className="text-center flex-auto opacity-50">
                No data to analyze
              </Text>
            </Box>
          }
        />
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

      <Box className="relative flex flex-auto bg-background-50 rounded-lg justify-center h-full overflow-hidden">
        {results.length > 0 ? (
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
        ) : (
          <Box className="relative flex flex-auto bg-background-50 justify-center h-full overflow-hidden p-4 gap-4">
            <Box className="flex flex-1 gap-4 max-h-1/4">
              <Skeleton className="w-1/3 h-4 p-4" variant="rounded" />
              <Skeleton className="w-1/5 h-2 p-4" variant="rounded" />
            </Box>

            <Box className="flex-auto justify-center rounded-lg">
              <Center className="opacity-50 mb-1">
                <HStack className="gap-2">
                  <Scan color="white" />
                  <GalleryHorizontal color="white" />
                  <ImageLucide color="white" />
                </HStack>
              </Center>

              <Text className="text-center opacity-50">
                Scan results will display here
              </Text>
              <Text className="text-center opacity-50 text-sm">
                Powered by XR Vision
              </Text>
            </Box>

            <Box className="flex flex-1 gap-4 max-h-1/4  justify-end">
              <Skeleton className="w-3/4 h-4 p-4" variant="rounded" />
              <Skeleton className="w-1/2 h-4 p-4" variant="rounded" />
            </Box>
          </Box>
        )}
      </Box>

      {/*<Pagination.
        progress={progress}
        data={defaultDataWith6Colors}
        dotStyle={{ backgroundColor: "#262626" }}
        activeDotStyle={{ backgroundColor: "#f1f1f1" }}
        containerStyle={{ gap: 5, marginBottom: 10 }}
        onPress={onPressPagination}
      />*/}

      {/* <Box className="w-full flex align-middle bg-background-50 p-4 rounded-lg">
        <Text className="text-sm text-center">Developed by XtraRice Team</Text>
        <Text className="text-xs text-center">
          danodoms - henrytors - rexpons
        </Text>
      </Box>*/}
    </VStack>
  );
}
