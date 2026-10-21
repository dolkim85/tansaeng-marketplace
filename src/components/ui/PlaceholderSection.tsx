type PlaceholderSectionProps = {
  title: string;
  path: string;
  description: string;
  bullets?: string[];
};

/**
 * M0 단계의 라우트 자리표시자. 실제 데이터/기능은 M1 이후 마일스톤에서 구현한다.
 */
export function PlaceholderSection({
  title,
  path,
  description,
  bullets,
}: PlaceholderSectionProps) {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <p className="font-mono text-xs text-brand-green">{path}</p>
      <h1 className="mt-1 text-2xl font-semibold text-brand-deepgreen sm:text-3xl">
        {title}
      </h1>
      <p className="mt-3 text-sm text-brand-deepgreen/80 sm:text-base">
        {description}
      </p>
      {bullets && bullets.length > 0 && (
        <ul className="mt-6 space-y-2 text-sm text-brand-deepgreen/70">
          {bullets.map((b) => (
            <li key={b} className="flex gap-2">
              <span aria-hidden className="text-brand-orange">
                ・
              </span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-8 rounded-lg border border-dashed border-brand-green/30 bg-white/60 p-4 text-xs text-brand-deepgreen/70">
        M0 단계: 라우트 뼈대만 구현됨. 실제 데이터/결제/알림 연동 없음 (Mock 전용).
      </div>
    </section>
  );
}
