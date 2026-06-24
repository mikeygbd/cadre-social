export type Profile = {
  id: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  created_at: string
}

export type Post = {
  id: string
  user_id: string
  content: string
  image_url: string | null
  created_at: string
}

/** Client-side placeholder shown before the server confirms a new post. */
export type PendingPost = Post & {
  tempId: string
  isPending: boolean
  /** Blob URL used for instant preview while upload finishes. */
  previewImageUrl?: string
}

export type PostLike = {
  post_id: string
  user_id: string
  created_at: string
}

export type PostComment = {
  id: string
  post_id: string
  user_id: string
  content: string
  created_at: string
}

export type CommentWithProfile = PostComment & {
  display_name: string | null
  avatar_url: string | null
}

export type Follow = {
  follower_id: string
  following_id: string
  created_at: string
}

export type NotificationType = 'like' | 'comment'

export type Notification = {
  id: string
  recipient_id: string
  actor_id: string
  type: NotificationType
  post_id: string
  read_at: string | null
  created_at: string
}

export type NotificationWithActor = Notification & {
  actor_display_name: string | null
  actor_avatar_url: string | null
}
