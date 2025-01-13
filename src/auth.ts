import { createClient } from '@/utils/db';

export async function validatePassphrase(login: string, passphrase: string) {
    console.log('validatePassphrase')
    const supabase = await createClient();
}
