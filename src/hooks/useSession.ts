import { useEffect, useState } from "react";
import { supabase } from "@/src/utils/supabase";
import { Session } from "@supabase/supabase-js";

export const useSession = () => {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Get the current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      console.log("session set", session?.user.id);
    });

    // Subscribe to session changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      console.log("session set", session?.user.id);
    });

    // Cleanup the subscription on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return session;
};
