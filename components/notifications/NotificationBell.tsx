'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Avatar from '@/components/Avatar'
import {
  markAllNotificationsRead,
  markNotificationRead,
} from '@/lib/actions/notifications'
import { getNotificationPostHref } from '@/lib/notifications'
import type { NotificationWithActor } from '@/lib/types'
import { cn, notifications as notifStyles } from '@/lib/styles'

type Props = {
  notifications: NotificationWithActor[]
  unreadCount: number
  currentUserId: string
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function getNotificationMessage(notification: NotificationWithActor): string {
  const name = notification.actor_display_name ?? 'Someone'
  if (notification.type === 'like') {
    return `${name} liked your post`
  }
  return `${name} commented on your post`
}

export default function NotificationBell({
  notifications,
  unreadCount,
  currentUserId,
}: Props): JSX.Element {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    function handleClickOutside(event: MouseEvent): void {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  async function handleToggle(): Promise<void> {
    const nextOpen = !open
    setOpen(nextOpen)
    if (nextOpen) {
      router.refresh()
    }
  }

  async function handleMarkAllRead(): Promise<void> {
    await markAllNotificationsRead()
    router.refresh()
  }

  async function handleNotificationClick(
    notification: NotificationWithActor,
  ): Promise<void> {
    if (!notification.read_at) {
      await markNotificationRead(notification.id)
    }
    setOpen(false)
    router.push(getNotificationPostHref(currentUserId, notification.post_id))
  }

  const badgeLabel = unreadCount > 99 ? '99+' : String(unreadCount)

  return (
    <div ref={containerRef} className={notifStyles.wrapper}>
      <button
        type="button"
        onClick={handleToggle}
        className={notifStyles.bellBtn}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={notifStyles.bellIcon}
          aria-hidden="true"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className={notifStyles.badge} aria-hidden="true">
            {badgeLabel}
          </span>
        )}
      </button>

      {open && (
        <div className={notifStyles.dropdown} role="menu">
          <div className={notifStyles.dropdownHeader}>
            <span className={notifStyles.dropdownTitle}>Notifications</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className={notifStyles.markAllBtn}
              >
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className={notifStyles.empty}>No notifications yet.</p>
          ) : (
            notifications.map((notification) => {
              const isUnread = !notification.read_at
              return (
                <button
                  key={notification.id}
                  type="button"
                  role="menuitem"
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    notifStyles.item,
                    isUnread && notifStyles.itemUnread,
                  )}
                >
                  <Avatar
                    src={notification.actor_avatar_url}
                    name={notification.actor_display_name}
                    size="sm"
                  />
                  <div className={notifStyles.itemContent}>
                    <p className={notifStyles.itemText}>
                      {getNotificationMessage(notification)}
                    </p>
                    <p className={notifStyles.itemMeta}>
                      {formatRelativeTime(notification.created_at)}
                    </p>
                  </div>
                  {isUnread && (
                    <span className={notifStyles.unreadDot} aria-hidden="true" />
                  )}
                </button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
