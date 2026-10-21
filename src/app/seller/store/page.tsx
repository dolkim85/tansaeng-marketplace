import Link from "next/link";
import { getSession } from "@/server/session";
import { getSellerWithLatestApplication } from "@/server/seller/queries";
import { SellerStoreForm } from "./SellerStoreForm";

export default async function SellerStorePage() {
  const session = await getSession();
  const result = session
    ? await getSellerWithLatestApplication(session.sub)
    : null;

  if (!result) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
        <p className="text-sm text-brand-deepgreen/70">
          <Link href="/seller/onboarding" className="text-brand-green underline">
            입점 심사를 먼저 신청하세요 →
          </Link>
        </p>
      </div>
    );
  }

  const { seller } = result;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <p className="font-mono text-xs text-brand-green">/seller/store</p>
      <h1 className="mt-1 text-2xl font-semibold text-brand-deepgreen">
        생산자 스토어 소개·정책
      </h1>
      <p className="mt-1 text-xs text-brand-deepgreen/70">
        {seller.storeName}
      </p>
      <Link
        href={`/farms/${seller.storeSlug}`}
        className="mt-1 inline-block text-xs text-brand-green hover:underline"
      >
        공개 스토어 페이지 미리보기 →
      </Link>

      <SellerStoreForm
        introduction={seller.introduction ?? ""}
        shippingPolicy={seller.shippingPolicy ?? ""}
        returnPolicy={seller.returnPolicy ?? ""}
      />
    </div>
  );
}
