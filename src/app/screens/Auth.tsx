import React, { useState } from 'react'
import { Alert, StyleSheet, View, AppState, Pressable } from 'react-native'
import { supabase } from '@/src/utils/supabase'
import { Button, ButtonText } from '@/src/components/ui/button'
import { Input, InputField, InputIcon, InputSlot } from '@/src/components/ui/input'
import { Eye, Lock, Mail } from 'lucide-react-native'
import { Text } from '@/src/components/ui/text'
import { VStack } from '@/src/components/ui/vstack'
import { Center } from '@/src/components/ui/center'
import { HStack } from '@/src/components/ui/hstack'

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
        <VStack className='align-items-center justify-center h-full gap-4 p-4'>
            <Center>
                <Text className='font-bold text-5xl'>XR Vision</Text>
            </Center>

            <VStack space="xs">
                {/* <Input
                    label="Email"
                    leftIcon={{ type: 'font-awesome', name: 'envelope' }}
                    onChangeText={(text) => setEmail(text)}
                    value={email}
                    placeholder="email@address.com"
                    autoCapitalize={'none'}
                /> */}

                <Text className="text-typography-500">Email</Text>
                <Input>
                    <InputField value={email} onChangeText={(text) => setEmail(text)} type="text" />
                    <InputSlot>
                        <InputIcon className='mr-2' as={Mail} />
                    </InputSlot>
                </Input>
            </VStack>

            <VStack space="xs">
                {/* <Input
                    label="Password"
                    leftIcon={{ type: 'font-awesome', name: 'lock' }}
                    onChangeText={(text) => setPassword(text)}
                    value={password}
                    secureTextEntry={true}
                    placeholder="Password"
                    autoCapitalize={'none'}
                /> */}

                <HStack className='justify-between'>
                    <Text className="text-typography-500">Password</Text>


                    <HStack >
                        <Eye className='size-4' />

                        <Pressable onPress={() => setShowPassword(!showPassword)}>
                            <Text className="text-typography-500"> {showPassword ? "Hide" : "Show"}</Text>
                        </Pressable>
                    </HStack>
                </HStack>

                <Input>
                    <InputField value={password} onChangeText={(text) => setPassword(text)} type={showPassword ? "text" : "password"} />
                    <InputSlot>
                        <InputIcon className='mr-2' as={Lock} />
                    </InputSlot>
                </Input>
            </VStack>


            <Button size="md" variant="solid" action="primary" onPress={() => signInWithEmail()}>
                <ButtonText>Sign in</ButtonText>
            </Button>


            <Button size="md" variant="link" action="secondary" onPress={() => signUpWithEmail()}>
                <ButtonText>Sign up</ButtonText>
            </Button>
        </VStack>
    )
}
