import { getSession } from "@/server/session";
import { getCartForUser } from "@/server/cart/queries";
import { getDefaultAddress } from "@/server/account/queries";
import { formatKRW } from "@/lib/currency";
import { CheckoutForm } from "./CheckoutForm";

export default async function CheckoutPage() {
  const session = await getSession();
  const { items, totalKrw } = session
    ? await getCartForUser(session.sub)
    : { items: [], totalKrw: 0 };
  const defaultAddress = session ? await getDefaultAddress(session.sub) : null;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <p className="font-mono text-xs text-brand-green">/checkout</p>
      <h1 className="mt-1 text-2xl font-semibold text-brand-deepgreen">
        주문·결제 (샌드박스)
      </h1>
      <p className="mt-1 text-xs text-brand-orange">
        Mock PG 전용입니다. 실제 결제 수단은 연결되지 않습니다.
      </p>

      <div className="mt-5 rounded-lg border border-brand-green/15 bg-white p-4 text-sm">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between py-1">
            <span>
              {item.product.title} × {item.quantity}
            </span>
            <span>{formatKRW(item.product.priceKrw * item.quantity)}</span>
          </div>
        ))}
        <div className="mt-2 flex justify-between border-t border-brand-green/15 pt-2 font-semibold">
          <span>합계</span>
          <span>{formatKRW(totalKrw)}</span>
        </div>
      </div>

      <CheckoutForm defaultAddress={defaultAddress} />
    </div>
  );
}
