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
