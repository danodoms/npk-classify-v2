import React, { useState } from "react";
import {
  Drawer,
  DrawerBackdrop,
  DrawerContent,
  DrawerHeader,
  DrawerCloseButton,
  DrawerBody,
  DrawerFooter,
} from "@/src/components/ui/drawer";
import { Button, ButtonText } from "@/src/components/ui/button";
import { Heading } from "@/src/components/ui/heading";
import { Text } from "@/src/components/ui/text";
import { Image } from "@/src/components/ui/image";
import { Skeleton, SkeletonText } from "@/src/components/ui/skeleton";
import { VStack } from "@/src/components/ui/vstack";
import { Box } from "@/src/components/ui/box";
import LottieView from "lottie-react-native";
import { StyleSheet } from "react-native";

interface ScanResultDrawerProps {
  drawerState: {
    isDrawerOpen: boolean;
    setDrawerOpen: (open: boolean) => void;
    saveResultCallback: () => void;
    imageUri: string | null;
    classification: string | null;
    confidence: number | null;
  };
}

type ConfidenceRemark = "Weak" | "Moderate" | "Strong"

function renderConfidenceRemark(confidence:number):ConfidenceRemark{
  if(confidence >= 90) return "Strong";
  if(confidence >= 70 && confidence <=89) return "Moderate";
  return "Weak"
}

const ScanResultDrawer: React.FC<ScanResultDrawerProps> = ({ drawerState }) => {
  return (
    <Drawer
      isOpen={drawerState.isDrawerOpen}
      /*isOpen={true}*/
      onClose={() => {
        drawerState.setDrawerOpen(false);
      }}
      size="md"
      anchor="bottom"
    >
      <DrawerBackdrop />
      <DrawerContent>
        <DrawerHeader>
          {drawerState.classification && drawerState.confidence ? (
            <VStack className="">
              <Heading size="xl" className="text-left">
                {drawerState.classification}
              </Heading>

              <Text className="text-typography-400">
                {drawerState.confidence}% {renderConfidenceRemark(drawerState.confidence)} Confidence
              </Text>
            </VStack>
          ) : (
            /*<VStack className="flex overflow-visible">*/
            <SkeletonText _lines={2} speed={4} className="h-6 rounded-md" />
            /*<Skeleton variant="rounded" className="h-4 w-1/2" />*/
            /*</VStack>*/
          )}
        </DrawerHeader>
        <DrawerBody>
          {drawerState.imageUri ? (
            <Box>
              <Image
                size="2xl"
                className="min-h-full min-w-full rounded-md"
                alt="classification-image"
                source={{
                  uri: drawerState.imageUri,
                }}
              ></Image>

                  <LottieView
                      style={styles.animation}
                      source={require("@/assets/animations/scan-animation.json")}
                      autoPlay
                      loop
                  />


            </Box>
          ) : (
              <>
                <Skeleton variant="rounded" className="h-full w-full" />
              </>

          )}
        </DrawerBody>
        <DrawerFooter>
          <Button
            onPress={() => {
              drawerState.saveResultCallback();
            }}
            className="flex-1"
          >
            <ButtonText>Save and close</ButtonText>
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

const styles = StyleSheet.create({
  animation: {
    width: 500,
    height: 250,
    position: "absolute",
    alignSelf: "center",
    flex: 1, // Allows the animation to fill the parent container
    backgroundColor: "transparent",
  },
});

export default ScanResultDrawer;
