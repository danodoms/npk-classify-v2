import { useState, useEffect } from 'react'
import { supabase } from '@/src/utils/supabase'
import Auth from '../../components/Auth'
import Account from "@/src/components/Account"
import { View } from 'react-native'
import { Session } from '@supabase/supabase-js'
import { useSession } from '@/src/hooks/useSession'

export default function App() {
    const session = useSession()

    return (
        <View>
            {session && session.user ? <Account key={session.user.id} session={session} /> : <Auth />}
        </View>
    )
}