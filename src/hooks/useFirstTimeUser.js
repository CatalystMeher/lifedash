import { useState, useEffect } from 'react';
import useUser from './useUser';
import { supabase } from '../lib/supabase';

export default function useFirstTimeUser() {
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    async function checkFirstTimeUser() {
      try {
        // Check if user has completed the tour
        const tourCompleted = localStorage.getItem('lifedash-tour-completed') === 'true';
        
        if (tourCompleted) {
          setIsFirstTimeUser(false);
          setLoading(false);
          return;
        }

        if (user) {
          // Check if user has any data (stats, habits, todos)
          const [statsResult, habitsResult, todosResult] = await Promise.all([
            supabase.from('stats').select('id').eq('user_id', user.id).limit(1),
            supabase.from('habits').select('id').eq('user_id', user.id).limit(1),
            supabase.from('todos').select('id').eq('user_id', user.id).limit(1),
          ]);

          const hasAnyData = statsResult.data?.length > 0 || 
                           habitsResult.data?.length > 0 || 
                           todosResult.data?.length > 0;

          setIsFirstTimeUser(!hasAnyData);
        } else {
          // If no user, assume first time
          setIsFirstTimeUser(true);
        }
      } catch (error) {
        console.error('Error checking first time user:', error);
        // Default to first time user on error
        setIsFirstTimeUser(true);
      } finally {
        setLoading(false);
      }
    }

    checkFirstTimeUser();
  }, [user]);

  return { isFirstTimeUser, loading };
}
