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
import { Bell, Eye, Lock, Mail, RefreshCw, UserRound } from 'lucide-react-native'
import { Avatar, AvatarBadge, AvatarFallbackText, AvatarImage } from './ui/avatar'
import { Divider } from './ui/divider'
import { Switch } from './ui/switch'

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

        <VStack className='align-items-center justify-start h-full gap-4 p-4 bg-background-0'>
            <HStack className='gap-4 border-0 border-background-100 border-opacity-50 rounded-md'>
                <Avatar size="md">
                    <AvatarFallbackText>
                        {session?.user?.email}
                    </AvatarFallbackText>
                    <AvatarImage src={UserRound.toString()} />

                    {/* <AvatarBadge /> */}
                </Avatar>

                <VStack>
                    <Text className='opacity-50 text-sm'>Signed in as</Text>
                    <Text className='font-bold text-lg'>{session?.user?.email}</Text>
                </VStack>
            </HStack>

            <Button size="md" className='rounded-lg' variant="outline" action="primary" onPress={() => supabase.auth.signOut()}>
                <ButtonText>Sign out</ButtonText>
            </Button>

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