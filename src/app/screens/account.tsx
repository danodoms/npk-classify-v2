import React, { useState, useEffect } from 'react'
import { supabase } from '@/src/utils/supabase'
import Auth from '../../components/Auth'
import Account from "@/src/components/Account"
import {Alert, View} from 'react-native'
import { Session } from '@supabase/supabase-js'
import { useSession } from '@/src/hooks/useSession'
import {VStack} from "@/src/components/ui/vstack";
import {HStack} from "@/src/components/ui/hstack";
import {Avatar, AvatarFallbackText, AvatarImage} from "@/src/components/ui/avatar";
import {Bell, RefreshCw, UserRound} from "lucide-react-native";
import {Text} from "@/src/components/ui/text";
import {Button, ButtonText} from "@/src/components/ui/button";
import {Switch} from "@/src/components/ui/switch";
import {Divider} from "@/src/components/ui/divider";
import {Input, InputField} from "@/src/components/ui/input";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {globalStore} from "@/src/state/globalState";

export default function AccountScreen() {
    const session = useSession()

    const [loading, setLoading] = useState(true)
    const [username, setUsername] = useState('')
    const [website, setWebsite] = useState('')
    const [avatarUrl, setAvatarUrl] = useState('')
    const [backendAddress, setBackendAddress] = useState<string>("xr-vision-backend.onrender.com")

    const [showAuthScreen, setShowAuthScreen] = useState(false)

    useEffect(() => {
        // Load backend address from AsyncStorage on component mount
        (async () => {
            const storedAddress = await AsyncStorage.getItem('backendAddress');
            if (storedAddress) {
                setBackendAddress(storedAddress);
                globalStore.backendAddress.set(storedAddress);
            }
        })();
    }, []);


    const handleBackendAddressChange = async (text: string) => {
        setBackendAddress(text);
        await AsyncStorage.setItem('backendAddress', text); // Save to AsyncStorage
        globalStore.backendAddress.set(text);
    };


    useEffect(() => {
        if (session) getProfile()
    }, [session])

    async function getProfile() {
        try {
            setLoading(true)
            if (!session?.user) throw new Error('No user on the session!')

            const { data, error, status } = await supabase
                .from('profiles')
                .select(`username, website, avatar_url`)
                .eq('id', session?.user.id)
                .single()
            if (error && status !== 406) {
                throw error
            }

            if (data) {
                setUsername(data.username)
                setWebsite(data.website)
                setAvatarUrl(data.avatar_url)
            }
        } catch (error) {
            if (error instanceof Error) {
                Alert.alert(error.message)
            }
        } finally {
            setLoading(false)
        }
    }

    async function updateProfile({
                                     username,
                                     website,
                                     avatar_url,
                                 }: {
        username: string
        website: string
        avatar_url: string
    }) {
        try {
            setLoading(true)
            if (!session?.user) throw new Error('No user on the session!')

            const updates = {
                id: session?.user.id,
                username,
                website,
                avatar_url,
                updated_at: new Date(),
            }

            const { error } = await supabase.from('profiles').upsert(updates)

            if (error) {
                throw error
            }
        } catch (error) {
            if (error instanceof Error) {
                Alert.alert(error.message)
            }
        } finally {
            setLoading(false)
        }
    }

    function handleSignOut(){
        supabase.auth.signOut()
        setShowAuthScreen(false)
    }

    if(showAuthScreen && !session){
        return(
            <Auth/>
        )
    }

    const API_URL = `https://${backendAddress}/generate-heatmap/`;

    return (
        <VStack className='align-items-center justify-start h-full gap-4 p-4 bg-background-0'>
            <HStack className='gap-4 border-0 border-background-100 border-opacity-50 rounded-md'>
                {session && session.user ? (
                    <>
                        <Avatar size="md">
                            <AvatarFallbackText>
                                {session?.user?.email}
                            </AvatarFallbackText>
                            <AvatarImage src={UserRound.toString()} />
                        </Avatar>

                        <VStack>
                            <Text className='opacity-50 text-sm'>Signed in as</Text>
                            <Text className='font-bold text-lg'>{session?.user?.email}</Text>
                        </VStack>

                        <Button size="md" className='rounded-lg ml-auto' variant="outline" action="primary" onPress={handleSignOut}>
                            <ButtonText>Sign out</ButtonText>
                        </Button>
                    </>

                ) : (
                    <Button size="lg" className='rounded-lg w-full' variant="outline" action="primary" onPress={()=> setShowAuthScreen(true)}>
                        <ButtonText>Login or Sign up</ButtonText>
                    </Button>
                )}

            </HStack>



            <VStack className='gap-4 mt-4'>
                <Text>Preferences</Text>

                {/* <Divider /> */}

                <HStack >
                    <RefreshCw />
                    <Text className='text-lg mr-auto'>Auto Sync</Text>
                    <Switch />
                </HStack>

                <Divider />

                <HStack>
                    <Bell />
                    <Text className='text-lg mr-auto'>Push Notifications</Text>
                    <Switch />
                </HStack>

                <Divider />

                <HStack>
                    <Bell />
                    <Text className='text-lg mr-auto'>Export Data</Text>
                </HStack>
            </VStack>





            <VStack className='gap-4 mt-4'>
                <Text>Developer Config</Text>


                <VStack className="w-full justify-center mb-4">
                    <Input
                        variant="underlined"
                        size="md"
                        isDisabled={false}
                        isInvalid={false}
                        isReadOnly={false}
                    >
                        <InputField placeholder="Enter Backend API address..." type="text" value={backendAddress} onChangeText={handleBackendAddressChange} />
                    </Input>
                </VStack>


                <Text>{API_URL}</Text>
            </VStack>




            <VStack className='gap-4 mt-4'>
                <Text>About</Text>

                <HStack>
                    <Bell />
                    <Text className='text-lg mr-auto'>Terms of Service</Text>
                </HStack>

                <Divider />

                <HStack>
                    <Bell />
                    <Text className='text-lg mr-auto'>Privacy Policy</Text>
                </HStack>
            </VStack>



        </VStack>
    )
}
