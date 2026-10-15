import Link from "next/link";
import { getSession } from "@/server/session";
import { getCartForUser } from "@/server/cart/queries";
import {
  removeCartItemAction,
  updateCartItemQuantityAction,
} from "@/server/cart/actions";
import { formatKRW } from "@/lib/currency";

export default async function CartPage() {
  const session = await getSession();
  const { items, totalKrw } = session
    ? await getCartForUser(session.sub)
    : { items: [], totalKrw: 0 };

  const bySeller = new Map<string, typeof items>();
  for (const item of items) {
    const list = bySeller.get(item.product.seller.storeName) ?? [];
    list.push(item);
    bySeller.set(item.product.seller.storeName, list);
  }

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <p className="font-mono text-xs text-brand-green">/cart</p>
      <h1 className="mt-1 text-2xl font-semibold text-brand-deepgreen">
        장바구니
      </h1>

      {items.length === 0 ? (
        <p className="mt-6 text-sm text-brand-deepgreen/60">
          장바구니가 비어 있습니다.{" "}
          <Link href="/categories" className="text-brand-green hover:underline">
            상품 보러가기 →
          </Link>
        </p>
      ) : (
        <>
          {[...bySeller.entries()].map(([sellerName, sellerItems]) => (
            <div key={sellerName} className="mt-6">
              <p className="text-sm font-semibold text-brand-deepgreen/70">
                {sellerName}
              </p>
              <ul className="mt-2 space-y-2">
                {sellerItems.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-brand-green/15 bg-white p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-brand-deepgreen">
                        {item.product.title}
                      </p>
                      <p className="text-xs text-brand-deepgreen/60">
                        {formatKRW(item.product.priceKrw)} / 개
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <form
                        action={updateCartItemQuantityAction.bind(
                          null,
                          item.id,
                          item.quantity - 1
                        )}
                      >
                        <button
                          type="submit"
                          className="h-7 w-7 rounded border border-brand-green/30 text-sm"
                          aria-label="수량 감소"
                        >
                          −
                        </button>
                      </form>
                      <span className="w-6 text-center text-sm">
                        {item.quantity}
                      </span>
                      <form
                        action={updateCartItemQuantityAction.bind(
                          null,
                          item.id,
                          item.quantity + 1
                        )}
                      >
                        <button
                          type="submit"
                          className="h-7 w-7 rounded border border-brand-green/30 text-sm"
                          aria-label="수량 증가"
                        >
                          ＋
                        </button>
                      </form>
                    </div>
                    <p className="w-20 shrink-0 text-right text-sm font-semibold text-brand-deepgreen">
                      {formatKRW(item.product.priceKrw * item.quantity)}
                    </p>
                    <form action={removeCartItemAction.bind(null, item.id)}>
                      <button
                        type="submit"
                        className="text-xs text-red-500 hover:underline"
                      >
                        삭제
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="mt-8 flex items-center justify-between border-t border-brand-green/15 pt-4">
            <p className="text-sm text-brand-deepgreen/60">
              총 {items.length}개 상품
            </p>
            <p className="text-lg font-bold text-brand-green">
              {formatKRW(totalKrw)}
            </p>
          </div>
          <Link
            href="/checkout"
            className="mt-4 block rounded-md bg-brand-green px-4 py-3 text-center text-sm font-semibold text-white"
          >
            주문하기
          </Link>
        </>
      )}

      <p className="mt-8 rounded-lg border border-dashed border-brand-green/30 bg-white/60 p-3 text-xs text-brand-deepgreen/60">
        M2 단계: 배송비/쿠폰/재고 예약 타이머는 아직 반영되지 않음.
      </p>
    </section>
  );
}
