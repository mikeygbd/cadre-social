'use server'

import { revalidatePath } from 'next/cache'

export async function revalidateFollowing(): Promise<void> {
  revalidatePath('/feed')
}
