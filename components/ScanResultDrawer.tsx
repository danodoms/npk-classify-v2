import React, {useState} from 'react';
import {
    Drawer,
    DrawerBackdrop,
    DrawerContent,
    DrawerHeader,
    DrawerCloseButton,
    DrawerBody,
    DrawerFooter,
} from "@/components/ui/drawer"
import {Button,ButtonText} from "@/components/ui/button";
import {Heading} from "@/components/ui/heading";
import {Text} from "@/components/ui/text";
import { Image } from '@/components/ui/image';
import {Skeleton} from "@/components/ui/skeleton";




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
                    drawerState.setIsDrawerOpen(false)
                }}
                size="sm"
                anchor="bottom"
            >
                <DrawerBackdrop />
                <DrawerContent>
                    <DrawerHeader>
                        <Heading size="2xl" className="text-center">{drawerState.classification}</Heading>
                        <Skeleton variant="rounded" className="h-20 w-full" />
                    </DrawerHeader>
                    <DrawerBody>
                        <Text size="xl" className="text-typography-800">
                            {drawerState.confidence}
                        </Text>


                        {drawerState.imageUri ?
                        <Image size="md" className="w-full" alt="classification-image" source={{
                            uri: drawerState.imageUri
                        }}>
                        </Image>
                         :
                            <Skeleton variant="rounded" className="h-20 w-full" />
                        }


                    </DrawerBody>
                    <DrawerFooter>
                        <Button
                            onPress={() => {
                                drawerState.setIsDrawerOpen(false)
                            }}
                            className="flex-1"
                        >
                            <ButtonText>Button</ButtonText>
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </>
    );
};

export default ScanResultDrawer;
