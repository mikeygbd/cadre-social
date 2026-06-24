import { layout, skeleton } from '@/lib/styles'

export default function FeedLoading(): JSX.Element {
  return (
    <div className={layout.stack}>
      {[1, 2, 3].map((i) => (
        <div key={i} className={`${skeleton.card} ${skeleton.wrapper}`}>
          <div className="flex gap-3 mb-4">
            <div className={skeleton.avatarMd} />
            <div className="space-y-2 flex-1">
              <div className={`h-3 ${skeleton.bar} w-1/3`} />
              <div className={`h-2 ${skeleton.barLight} w-1/4`} />
            </div>
          </div>
          <div className="space-y-2">
            <div className={`h-3 ${skeleton.barLight}`} />
            <div className={`h-3 ${skeleton.barLight} w-4/5`} />
          </div>
        </div>
      ))}
    </div>
  )
}
