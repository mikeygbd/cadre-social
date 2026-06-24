import type { SupabaseClient } from '@supabase/supabase-js'
import type { Notification, NotificationWithActor, Profile } from '@/lib/types'

const NOTIFICATION_LIMIT = 20

type NotificationQueryResult = {
  notifications: NotificationWithActor[]
  unreadCount: number
}

export async function getNotificationsForUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<NotificationQueryResult> {
  const { data: notificationsData, error: notificationsError } = await supabase
    .from('notifications')
    .select('*')
    .eq('recipient_id', userId)
    .order('created_at', { ascending: false })
    .limit(NOTIFICATION_LIMIT)

  if (notificationsError) {
    throw new Error(notificationsError.message)
  }

  const notifications: Notification[] = notificationsData ?? []

  const { count, error: countError } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('recipient_id', userId)
    .is('read_at', null)

  if (countError) {
    throw new Error(countError.message)
  }

  const actorIds = [...new Set(notifications.map((n) => n.actor_id))]
  const actorProfiles: Profile[] = []

  if (actorIds.length > 0) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url, bio, created_at')
      .in('id', actorIds)

    if (error) {
      throw new Error(error.message)
    }

    actorProfiles.push(...(data ?? []))
  }

  const actorMap = new Map(actorProfiles.map((p) => [p.id, p]))

  const notificationsWithActor: NotificationWithActor[] = notifications.map((n) => {
    const actor = actorMap.get(n.actor_id)
    return {
      ...n,
      actor_display_name: actor?.display_name ?? null,
      actor_avatar_url: actor?.avatar_url ?? null,
    }
  })

  return {
    notifications: notificationsWithActor,
    unreadCount: count ?? 0,
  }
}

export function getNotificationPostHref(
  recipientId: string,
  postId: string,
): string {
  return `/profile/${recipientId}#post-${postId}`
}
