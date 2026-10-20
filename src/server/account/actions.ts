"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/server/session";
import { hashPassword, verifyPassword } from "@/lib/auth";

export type AccountFormState = { error?: string; success?: string } | undefined;

const addressSchema = z.object({
  label: z.string().max(20).optional(),
  recipientName: z.string().min(1, "받는 분 이름을 입력하세요."),
  recipientPhone: z.string().min(1, "연락처를 입력하세요."),
  addressLine: z.string().min(1, "배송지 주소를 입력하세요."),
});

/// 배송지를 새로 등록한다. 등록한 주소가 사용자의 첫 주소이거나 "기본 배송지로 설정"을
/// 체크한 경우, 트랜잭션으로 기존 기본 배송지를 해제한 뒤 이 주소를 기본으로 지정한다.
export async function createAddressAction(
  _prevState: AccountFormState,
  formData: FormData
): Promise<AccountFormState> {
  const session = await getSession();
  if (!session) redirect("/auth/login?from=/account");

  const parsed = addressSchema.safeParse({
    label: formData.get("label") ?? undefined,
    recipientName: formData.get("recipientName"),
    recipientPhone: formData.get("recipientPhone"),
    addressLine: formData.get("addressLine"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인하세요." };
  }

  const existingCount = await prisma.address.count({ where: { userId: session.sub } });
  const makeDefault = existingCount === 0 || formData.get("isDefault") === "on";

  await prisma.$transaction(async (tx) => {
    if (makeDefault) {
      await tx.address.updateMany({
        where: { userId: session.sub, isDefault: true },
        data: { isDefault: false },
      });
    }
    await tx.address.create({
      data: {
        userId: session.sub,
        label: parsed.data.label?.trim() || null,
        recipientName: parsed.data.recipientName,
        recipientPhone: parsed.data.recipientPhone,
        addressLine: parsed.data.addressLine,
        isDefault: makeDefault,
      },
    });
  });

  revalidatePath("/account");
  return { success: "배송지를 등록했습니다." };
}

export async function setDefaultAddressAction(addressId: string): Promise<void> {
  const session = await getSession();
  if (!session) redirect("/auth/login?from=/account");

  const address = await prisma.address.findUnique({ where: { id: addressId } });
  if (!address || address.userId !== session.sub) return;

  await prisma.$transaction([
    prisma.address.updateMany({
      where: { userId: session.sub, isDefault: true },
      data: { isDefault: false },
    }),
    prisma.address.update({ where: { id: addressId }, data: { isDefault: true } }),
  ]);

  revalidatePath("/account");
}

/// 배송지를 삭제한다. 삭제한 주소가 기본 배송지였다면, 남은 주소 중 가장 최근 등록된
/// 것을 새 기본 배송지로 자동 승격한다(기본 배송지가 없는 상태로 방치하지 않음).
export async function deleteAddressAction(addressId: string): Promise<void> {
  const session = await getSession();
  if (!session) redirect("/auth/login?from=/account");

  const address = await prisma.address.findUnique({ where: { id: addressId } });
  if (!address || address.userId !== session.sub) return;

  await prisma.address.delete({ where: { id: addressId } });

  if (address.isDefault) {
    const next = await prisma.address.findFirst({
      where: { userId: session.sub },
      orderBy: { createdAt: "desc" },
    });
    if (next) {
      await prisma.address.update({ where: { id: next.id }, data: { isDefault: true } });
    }
  }

  revalidatePath("/account");
}

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "현재 비밀번호를 입력하세요."),
    newPassword: z.string().min(8, "새 비밀번호는 8자 이상이어야 합니다."),
    confirmPassword: z.string().min(1, "새 비밀번호를 한 번 더 입력하세요."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "새 비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"],
  });

export async function changePasswordAction(
  _prevState: AccountFormState,
  formData: FormData
): Promise<AccountFormState> {
  const session = await getSession();
  if (!session) redirect("/auth/login?from=/account");

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인하세요." };
  }

  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  if (!user) return { error: "사용자 정보를 찾을 수 없습니다." };

  const currentOk = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
  if (!currentOk) {
    return { error: "현재 비밀번호가 올바르지 않습니다." };
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  return { success: "비밀번호를 변경했습니다." };
}
