import {
  listAllBannersForAdmin,
  listAllNoticesForAdmin,
  listFaqs,
} from "@/server/content/queries";
import {
  toggleBannerActiveAction,
  deleteBannerAction,
  deleteNoticeAction,
  deleteFaqAction,
} from "@/server/content/actions";
import { BannerForm } from "./BannerForm";
import { NoticeForm } from "./NoticeForm";
import { FaqForm } from "./FaqForm";

export default async function AdminContentPage() {
  const [banners, notices, faqs] = await Promise.all([
    listAllBannersForAdmin(),
    listAllNoticesForAdmin(),
    listFaqs(),
  ]);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <p className="font-mono text-xs text-brand-deepgreen/50">/admin/content</p>
      <h1 className="mt-1 text-2xl font-semibold text-brand-deepgreen">
        배너·공지·FAQ
      </h1>
      <p className="mt-1 text-xs text-brand-deepgreen/60">
        카테고리 구조 편집은 범위 밖입니다(시드로 고정된 카테고리만 사용).
      </p>

      <h2 className="mt-8 text-base font-semibold text-brand-deepgreen">
        메인 배너
      </h2>
      <p className="mt-1 text-xs text-brand-deepgreen/60">
        활성 상태인 배너 중 우선순위가 가장 높은(숫자가 가장 작은) 1건만 홈 화면에 노출됩니다.
      </p>
      {banners.length === 0 ? (
        <p className="mt-2 text-sm text-brand-deepgreen/60">등록된 배너가 없습니다.</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {banners.map((b) => (
            <li
              key={b.id}
              className="flex items-center justify-between rounded-lg border border-brand-deepgreen/15 bg-white p-3 text-sm"
            >
              <div>
                <p className="font-medium text-brand-deepgreen">
                  {b.title}{" "}
                  <span className="text-xs text-brand-deepgreen/50">
                    (우선순위 {b.sortOrder})
                  </span>
                </p>
                {b.subtitle && (
                  <p className="text-xs text-brand-deepgreen/60">{b.subtitle}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    b.isActive
                      ? "bg-brand-green/10 text-brand-green"
                      : "bg-brand-deepgreen/10 text-brand-deepgreen/50"
                  }`}
                >
                  {b.isActive ? "활성" : "비활성"}
                </span>
                <form action={toggleBannerActiveAction.bind(null, b.id)}>
                  <button type="submit" className="text-xs text-brand-green underline-offset-2 hover:underline">
                    {b.isActive ? "비활성화" : "활성화"}
                  </button>
                </form>
                <form action={deleteBannerAction.bind(null, b.id)}>
                  <button type="submit" className="text-xs text-red-600 underline-offset-2 hover:underline">
                    삭제
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
      <BannerForm />

      <h2 className="mt-8 text-base font-semibold text-brand-deepgreen">
        공지사항
      </h2>
      {notices.length === 0 ? (
        <p className="mt-2 text-sm text-brand-deepgreen/60">등록된 공지가 없습니다.</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {notices.map((n) => (
            <li
              key={n.id}
              className="rounded-lg border border-brand-deepgreen/15 bg-white p-3 text-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-brand-deepgreen">
                  {n.isPinned && (
                    <span className="mr-1 rounded bg-brand-orange/20 px-1.5 py-0.5 text-[10px] font-semibold text-brand-orange">
                      고정
                    </span>
                  )}
                  {n.title}
                </span>
                <form action={deleteNoticeAction.bind(null, n.id)}>
                  <button type="submit" className="text-xs text-red-600 underline-offset-2 hover:underline">
                    삭제
                  </button>
                </form>
              </div>
              <p className="mt-1 text-xs text-brand-deepgreen/70">{n.body}</p>
            </li>
          ))}
        </ul>
      )}
      <NoticeForm />

      <h2 className="mt-8 text-base font-semibold text-brand-deepgreen">FAQ</h2>
      {faqs.length === 0 ? (
        <p className="mt-2 text-sm text-brand-deepgreen/60">등록된 FAQ가 없습니다.</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {faqs.map((f) => (
            <li
              key={f.id}
              className="rounded-lg border border-brand-deepgreen/15 bg-white p-3 text-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-brand-deepgreen">{f.question}</span>
                <form action={deleteFaqAction.bind(null, f.id)}>
                  <button type="submit" className="text-xs text-red-600 underline-offset-2 hover:underline">
                    삭제
                  </button>
                </form>
              </div>
              <p className="mt-1 text-xs text-brand-deepgreen/70">{f.answer}</p>
            </li>
          ))}
        </ul>
      )}
      <FaqForm />
    </div>
  );
}
