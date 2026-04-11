import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export type ContactsMap = Record<string, string>;

export function useContacts() {
  const [contacts, setContacts] = useState<ContactsMap>({});

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        const { data } = await supabase.from('contacts').select('*').eq('user_id', user.id);
        if (data) {
          const map: ContactsMap = {};
          data.forEach(c => {
            map[c.name.toLowerCase()] = c.address;
          });
          setContacts(map);
        }
      } catch (e) {
        console.error('Failed to load contacts', e);
      }
    };
    fetchContacts();
  }, []);

  const saveContacts = useCallback(async (newContacts: ContactsMap) => {
    setContacts(newContacts);
  }, []);

  const addContact = useCallback(async (name: string, address: string) => {
    setContacts((prev) => {
      return { ...prev, [name.toLowerCase()]: address };
    });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    await supabase.from('contacts').insert({
      user_id: user.id,
      name: name.toLowerCase(),
      address
    });
  }, []);

  const removeContact = useCallback(async (name: string) => {
    setContacts((prev) => {
      const next = { ...prev };
      delete next[name.toLowerCase()];
      return next;
    });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('contacts').delete().eq('user_id', user.id).eq('name', name.toLowerCase());
  }, []);

  const getContact = useCallback((name: string) => {
    return contacts[name.toLowerCase()] || null;
  }, [contacts]);

  return { contacts, addContact, removeContact, getContact, saveContacts };
}
