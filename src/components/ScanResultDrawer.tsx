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

interface ScanResultDrawerProps {
  drawerState: {
    isDrawerOpen: boolean;
    setIsDrawerOpen: (open: boolean) => void;
    imageUri: string | null;
    classification: string | null;
    confidence: string | null;
  };
}

const ScanResultDrawer: React.FC<ScanResultDrawerProps> = ({ drawerState }) => {
  return (
    <>
      <Drawer
        isOpen={drawerState.isDrawerOpen}
        /*isOpen={true}*/
        onClose={() => {
          drawerState.setIsDrawerOpen(false);
        }}
        size="md"
        anchor="bottom"
      >
        <DrawerBackdrop />
        <DrawerContent>
          <DrawerHeader>
            {drawerState.classification ? (
              <Heading size="2xl" className="text-center">
                {drawerState.classification}
              </Heading>
            ) : (
              /*<VStack space="md" className="h-20">
                <Skeleton variant="rounded" className="h-4 w-full" />

                <Skeleton variant="rounded" className="h-4 w-1/2" />
              </VStack>*/

              <SkeletonText _lines={2} className="h-4 rounded-md" />
            )}
          </DrawerHeader>
          <DrawerBody>
            {drawerState.confidence ? (
              <Text size="xl" className="text-typography-400 mb-4">
                Confidence: {drawerState.confidence}
              </Text>
            ) : (
              <Skeleton variant="rounded" className="h-4 w-1/2 mb-4" />
            )}

            {drawerState.imageUri ? (
              <Image
                size="2xl"
                className="min-h-full min-w-full rounded-md"
                alt="classification-image"
                source={{
                  uri: drawerState.imageUri,
                }}
              ></Image>
            ) : (
              <Skeleton variant="rounded" className="h-full w-full" />
            )}
          </DrawerBody>
          <DrawerFooter>
            <Button
              onPress={() => {
                drawerState.setIsDrawerOpen(false);
              }}
              className="flex-1"
            >
              <ButtonText>Close</ButtonText>
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default ScanResultDrawer;
