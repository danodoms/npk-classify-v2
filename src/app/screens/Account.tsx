import { useState, useEffect } from 'react'
import { supabase } from '@/src/utils/supabase'
import { StyleSheet, View, Alert } from 'react-native'
import { Session } from '@supabase/supabase-js'
import { Text } from '@/src/components/ui/text'
import { VStack } from '@/src/components/ui/vstack'
import { Center } from '@/src/components/ui/center'
import { HStack } from '@/src/components/ui/hstack'
import { Button, ButtonText } from '@/src/components/ui/button'
import { Input, InputField, InputIcon, InputSlot } from '@/src/components/ui/input'
import { Eye, Lock, Mail } from 'lucide-react-native'

export default function Account({ session }: { session: Session }) {
    const [loading, setLoading] = useState(true)
    const [username, setUsername] = useState('')
    const [website, setWebsite] = useState('')
    const [avatarUrl, setAvatarUrl] = useState('')

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

    return (
        // <View style={styles.container}>
        //     <View style={[styles.verticallySpaced, styles.mt20]}>
        //         <Input label="Email" value={session?.user?.email} disabled />
        //     </View>
        //     <View >
        //         <Input label="Username" value={username || ''} onChangeText={(text) => setUsername(text)} />
        //     </View>
        //     <View >
        //         <Input label="Website" value={website || ''} onChangeText={(text) => setWebsite(text)} />

        //     </View>

        //     <View style={[styles.verticallySpaced, styles.mt20]}>
        //         <Button
        //   title={loading ? 'Loading ...' : 'Update'}
        //   onPress={() => updateProfile({ username, website, avatar_url: avatarUrl })}
        //   disabled={loading}
        // />
        //     </View>

        //     <View style={styles.verticallySpaced}>
        //         <Button title="Sign Out" onPress={() => supabase.auth.signOut()} />
        //     </View>
        // </View>

        <VStack className='align-items-center justify-center h-full gap-4 p-4'>
            <Center>
                <Text className='font-bold text-5xl'>{username || "no username"}</Text>
            </Center>

            <VStack space="xs">
                <Text className="text-typography-500">Email</Text>
                <Input>
                    <InputField value={username} onChangeText={(text) => setUsername(text)} type="text" />
                    <InputSlot>
                        <InputIcon className='mr-2' as={Mail} />
                    </InputSlot>
                </Input>
            </VStack>

            {/* <VStack space="xs">
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
            </VStack> */}


            {/* <Button size="md" variant="solid" action="primary" onPress={() => signInWithEmail()}>
                <ButtonText>Sign in</ButtonText>
            </Button> */}


            <Button size="md" variant="link" action="secondary" onPress={() => supabase.auth.signOut()}>
                <ButtonText>Sign out</ButtonText>
            </Button>
        </VStack>



    )
}

const styles = StyleSheet.create({
    container: {
        marginTop: 40,
        padding: 12,
    },
    verticallySpaced: {
        paddingTop: 4,
        paddingBottom: 4,
        alignSelf: 'stretch',
    },
    mt20: {
        marginTop: 20,
    },
})