import { layout, skeleton } from '@/lib/styles'

export default function ProfileLoading(): JSX.Element {
  return (
    <div className={skeleton.wrapper}>
      <div className={`${skeleton.cardLg} mb-6`}>
        <div className="flex items-center gap-4">
          <div className={skeleton.avatarLg} />
          <div className="space-y-2">
            <div className={`h-4 ${skeleton.bar} w-32`} />
            <div className={`h-3 ${skeleton.barLight} w-48`} />
          </div>
        </div>
      </div>
      <div className={layout.stack}>
        {[1, 2].map((i) => (
          <div key={i} className={skeleton.card}>
            <div className="space-y-2">
              <div className={`h-3 ${skeleton.barLight}`} />
              <div className={`h-3 ${skeleton.barLight} w-3/4`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
