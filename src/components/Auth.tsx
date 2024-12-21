import React, { useState } from 'react'
import { Alert, StyleSheet, View, AppState, Pressable } from 'react-native'
import { supabase } from '@/src/utils/supabase'
import { Button, ButtonText } from '@/src/components/ui/button'
import { Input, InputField, InputIcon, InputSlot } from '@/src/components/ui/input'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react-native'
import { Text } from '@/src/components/ui/text'
import { VStack } from '@/src/components/ui/vstack'
import { Center } from '@/src/components/ui/center'
import { HStack } from '@/src/components/ui/hstack'
import { Box } from './ui/box'

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
AppState.addEventListener('change', (state) => {
    if (state === 'active') {
        supabase.auth.startAutoRefresh()
    } else {
        supabase.auth.stopAutoRefresh()
    }
})

export default function Auth() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [isSignUp, setIsSignUp] = useState(true)

    async function signInWithEmail() {
        setLoading(true)
        const { error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        })

        if (error) Alert.alert(error.message)
        setLoading(false)
    }

    async function signUpWithEmail() {
        setLoading(true)
        const {
            data: { session },
            error,
        } = await supabase.auth.signUp({
            email: email,
            password: password,
        })

        if (error) Alert.alert(error.message)
        if (!session) Alert.alert('Please check your inbox for email verification!')
        setLoading(false)
    }

    return (
        <VStack className='align-items-center justify-start h-full gap-4 p-4 bg-background-0'>
            <Box className='gap-2'>
                <Text className='font-bold text-5xl'>
                    {isSignUp ? "Sign Up" : "Login"}
                </Text>

                <Text className='opacity-50'>
                    Sync your results, and generate XAI visualizations
                </Text>
            </Box>

            <VStack space="xs">
                {/* <Text className="text-typography-500">Email</Text> */}
                <Input size="lg" className='rounded-lg' >
                    <InputField placeholder='Email' value={email} onChangeText={(text) => setEmail(text)} type="text" />
                    {/* <InputSlot>
                        <InputIcon className='mr-2' as={Mail} />
                    </InputSlot> */}
                </Input>
            </VStack>

            <VStack space="xs">
                <HStack className='justify-between'>
                    {/* <Text className="text-typography-500">Password</Text> */}


                    {/* <HStack >
                        <Eye className='size-4' />

                        <Pressable onPress={() => setShowPassword(!showPassword)}>
                            <Text className="text-typography-500"> {showPassword ? "Hide" : "Show"}</Text>
                        </Pressable>
                    </HStack> */}
                </HStack>

                <Input size="lg" className='rounded-lg'>
                    <InputField placeholder='Password' value={password} onChangeText={(text) => setPassword(text)} type={showPassword ? "text" : "password"} />

                    <Pressable onPress={() => setShowPassword(!showPassword)}>
                        <InputSlot>
                            {showPassword ? (
                                <InputIcon className='mr-2' as={Eye} />
                            ) : <InputIcon className='mr-2' as={EyeOff} />}
                        </InputSlot>
                    </Pressable>
                </Input>

                {!isSignUp && (
                    <Pressable>
                        <Text className='ml-auto opacity-50'>
                            Forgot Password?
                        </Text>
                    </Pressable>
                )}


            </VStack>

            {isSignUp ? (
                <Button className='rounded-lg' size="lg" variant="solid" action="primary" onPress={() => signUpWithEmail()}>
                    <ButtonText>Sign up</ButtonText>
                </Button>
            ) : (
                <Button className='rounded-lg' size="lg" variant="solid" action="primary" onPress={() => signInWithEmail()}>
                    <ButtonText>Log in</ButtonText>
                </Button>
            )}




            <Pressable onPress={() => setIsSignUp(!isSignUp)}>
                <Text className='text-center'>
                    {isSignUp ? "Already have an Account? Log in" : "Don't have an Account? Sign up"}
                </Text>
            </Pressable>


        </VStack>
    )
}
