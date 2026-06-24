import { layout, skeleton, following as followingStyles } from '@/lib/styles'

export default function FeedLoading(): JSX.Element {
  return (
    <>
      <div className={`${layout.fullBleed} -mt-6 mb-6`}>
        <section className={followingStyles.bar} aria-hidden>
          <div className={followingStyles.inner}>
            <div className={`h-3 ${skeleton.bar} w-20`} />
            <div className="flex gap-4 overflow-hidden">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className={`${skeleton.wrapper} flex flex-col items-center gap-2 w-[5.5rem] shrink-0`}>
                  <div className={skeleton.avatarLg} />
                  <div className={`h-2 ${skeleton.barLight} w-full`} />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
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
    </>
  )
}
