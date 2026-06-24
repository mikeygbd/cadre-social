/**
 * Cadre Social — centralized design system.
 * All UI class names live here. Pages and components import from this file only.
 */

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}

export const layout = {
  page: 'min-h-screen bg-background text-foreground',
  pageCentered: 'min-h-screen flex items-center justify-center bg-background',
  pageHero: 'min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden',
  heroGlow:
    'absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--accent-glow)_0%,_transparent_70%)] pointer-events-none',
  container: 'max-w-2xl mx-auto px-4',
  main: 'max-w-2xl mx-auto px-4 py-6',
  stack: 'space-y-4',
  nav: 'bg-surface/80 backdrop-blur-md border-b border-border sticky top-0 z-10 w-full',
  navInner: 'w-full px-6 sm:px-8 h-14 flex items-center justify-between',
  navBrand: 'text-lg font-semibold text-foreground tracking-tight hover:text-accent transition-colors',
  navLinks: 'flex items-center gap-5',
  navLink: 'text-sm font-medium text-muted hover:text-accent transition-colors',
  fullBleed: 'w-screen relative left-1/2 -translate-x-1/2',
}

/** Shared card surface — lifted from page background with border, shadow, and subtle highlight. */
const cardShell =
  'bg-surface rounded-2xl border border-border shadow-lg shadow-black/40 ring-1 ring-white/[0.06]'

export const card = {
  base: cardShell,
  shadow: cardShell,
  padded: `${cardShell} p-5`,
  paddedLg: `${cardShell} p-6`,
  auth: `${cardShell} shadow-xl shadow-black/50 p-8 w-full max-w-md`,
  post: `${cardShell} p-5`,
  postMedia: `${cardShell} overflow-hidden`,
}

export const button = {
  primary:
    'bg-accent text-white rounded-xl font-medium hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
  primaryMd: 'px-5 py-2.5 bg-accent text-white rounded-xl font-medium hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
  primarySm:
    'px-4 py-1.5 bg-accent text-white text-sm rounded-xl font-medium hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
  primaryFull:
    'w-full py-2.5 bg-accent text-white rounded-xl font-medium hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
  secondary:
    'px-4 py-2 border border-border text-muted rounded-xl font-medium text-sm hover:border-accent/50 hover:text-accent transition-colors',
  secondarySm:
    'px-3 py-1.5 border border-border rounded-xl text-sm text-muted hover:border-accent/50 hover:text-accent transition-colors',
  outline:
    'px-6 py-3 border border-accent/60 text-accent rounded-xl font-medium hover:bg-accent/10 transition-colors',
  ghost: 'text-sm font-medium text-muted hover:text-destructive transition-colors disabled:opacity-50',
  text: 'text-sm text-accent font-medium hover:text-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors',
  followActive:
    'px-4 py-1.5 rounded-xl text-sm font-medium transition-colors bg-surface-elevated text-muted border border-border hover:border-destructive/50 hover:text-destructive',
  followInactive:
    'px-4 py-1.5 rounded-xl text-sm font-medium transition-colors bg-accent text-white hover:bg-accent-hover',
}

export const form = {
  group: 'space-y-5',
  fields: 'space-y-4',
  label: 'block text-sm font-medium text-muted mb-1.5',
  input:
    'w-full bg-surface-elevated border border-border rounded-xl px-3.5 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50 transition-colors',
  textarea:
    'w-full bg-surface-elevated border border-border rounded-xl px-3.5 py-2.5 resize-none text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50 transition-colors',
  textareaSm:
    'w-full resize-none bg-surface-elevated border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50 transition-colors',
  commentInput:
    'flex-1 text-sm bg-surface-elevated border border-border rounded-full px-4 py-1.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50 transition-colors',
  error:
    'text-destructive text-sm bg-destructive/10 border border-destructive/30 rounded-xl px-3.5 py-2.5',
  errorInline: 'text-xs text-destructive',
  footer: 'mt-5 text-sm text-muted text-center',
  footerLink: 'text-accent hover:text-accent-hover transition-colors',
  actions: 'flex gap-3',
}

export const typography = {
  hero: 'text-5xl font-bold text-foreground tracking-tight',
  h1: 'text-2xl font-bold text-foreground tracking-tight',
  h2: 'text-xl font-bold text-foreground',
  subtitle: 'text-muted text-lg',
  body: 'text-foreground/90',
  postBody: 'text-foreground/90 whitespace-pre-wrap break-words leading-relaxed',
  muted: 'text-muted',
  meta: 'text-xs text-muted-foreground',
  stat: 'text-xs text-muted-foreground',
  statValue: 'font-semibold text-muted',
  link: 'font-semibold text-foreground hover:text-accent transition-colors',
  authTitle: 'text-2xl font-bold text-foreground tracking-tight mb-1',
  authSubtitle: 'text-muted mb-6',
}

export const avatar = {
  sm: 'w-6 h-6 rounded-full object-cover flex-shrink-0',
  md: 'w-10 h-10 rounded-full object-cover',
  lg: 'w-16 h-16 rounded-full object-cover',
  initialsSm:
    'w-6 h-6 rounded-full bg-accent/80 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0',
  initialsMd:
    'w-10 h-10 rounded-full bg-accent/80 flex items-center justify-center text-white font-semibold',
  initialsLg:
    'w-16 h-16 rounded-full bg-accent/80 flex items-center justify-center text-white text-2xl font-bold',
}

export const post = {
  header: 'flex items-center gap-3 mb-4',
  mediaHero: 'relative w-full',
  mediaImage: 'w-full aspect-[3/4] object-cover block',
  mediaOverlay: 'absolute inset-0 bg-black/35 pointer-events-none',
  mediaHeader: 'absolute inset-x-0 top-0 z-10 flex items-center gap-3 p-4',
  mediaAuthor: 'block font-semibold text-white truncate hover:text-white/90 transition-colors',
  mediaTime: 'text-xs text-white/80',
  mediaBody: 'px-5 pt-4 pb-5',
  actions: 'mt-4 pt-4 border-t border-border-subtle',
  comments: 'mt-4 pt-4 border-t border-border',
  commentList: 'space-y-3 mb-4',
  commentItem: 'flex items-start gap-2.5',
  commentText: 'text-sm text-muted',
  commentAuthor: 'font-semibold text-foreground mr-1',
  commentForm: 'flex gap-2 items-center',
  imageWrap: '-mx-5 overflow-hidden border-y border-border-subtle bg-surface-elevated',
  image: 'w-full aspect-[4/3] object-cover block',
  imagePending: 'opacity-90',
  imageRemove:
    'absolute top-3 right-3 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-black/50 border border-white/20 text-white hover:bg-black/70 transition-colors backdrop-blur-sm disabled:opacity-50',
  imagePickerRow: 'mb-3',
  imagePickerIcon:
    'p-2 rounded-xl text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
  pendingBadge: 'text-xs text-muted-foreground italic',
}

export const like = {
  base: 'flex items-center gap-1.5 text-sm transition-colors',
  active: 'text-rose-400',
  inactive: 'text-muted-foreground hover:text-rose-400',
}

export const profile = {
  header: 'flex items-start justify-between',
  headerInner: 'flex items-center gap-4',
  stats: 'flex gap-4 mt-2',
  avatarPicker: 'flex items-center gap-4 mt-1.5',
  avatarPickerActions: 'flex flex-col items-start gap-2',
  avatarPickerStatus: 'text-xs text-muted-foreground italic',
  editStatus: 'text-xs text-muted-foreground italic',
}

export const following = {
  bar: 'w-full bg-surface/60 backdrop-blur-sm',
  inner: 'flex flex-col gap-3 px-6 sm:px-8 py-4',
  title: 'text-xs font-semibold uppercase tracking-wider text-muted-foreground',
  empty: 'text-sm text-muted-foreground',
  list: 'flex items-start gap-4 overflow-x-auto pb-1',
  listItem: 'shrink-0',
  item: 'flex flex-col items-center gap-2 w-[5.5rem] group',
  avatar: 'shadow-lg shadow-black/30 transition-transform duration-200 group-hover:scale-105',
  name: 'text-xs text-muted text-center truncate w-full group-hover:text-accent transition-colors',
}

export const empty = {
  message: 'text-center text-muted-foreground py-16',
}

export const skeleton = {
  wrapper: 'animate-pulse',
  card: `${cardShell} p-5`,
  cardLg: `${cardShell} p-6`,
  bar: 'bg-border rounded-lg',
  barLight: 'bg-border-subtle rounded-lg',
  avatarMd: 'w-10 h-10 rounded-full bg-border',
  avatarLg: 'w-16 h-16 rounded-full bg-border',
}

export const errorState = {
  wrapper: 'text-center py-16',
  message: 'text-destructive mb-5',
  button: 'px-5 py-2.5 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent-hover transition-colors',
}

export const landing = {
  content: 'text-center space-y-8 relative z-10',
  actions: 'flex gap-4 justify-center',
}
