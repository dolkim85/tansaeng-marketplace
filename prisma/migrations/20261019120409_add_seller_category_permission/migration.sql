-- CreateEnum
CREATE TYPE "SellerCategoryPermissionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "SellerCategoryPermission" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "status" "SellerCategoryPermissionStatus" NOT NULL DEFAULT 'PENDING',
    "note" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SellerCategoryPermission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SellerCategoryPermission_sellerId_idx" ON "SellerCategoryPermission"("sellerId");

-- CreateIndex
CREATE INDEX "SellerCategoryPermission_categoryId_idx" ON "SellerCategoryPermission"("categoryId");

-- CreateIndex
CREATE INDEX "SellerCategoryPermission_status_idx" ON "SellerCategoryPermission"("status");

-- CreateIndex
CREATE UNIQUE INDEX "SellerCategoryPermission_sellerId_categoryId_key" ON "SellerCategoryPermission"("sellerId", "categoryId");

-- AddForeignKey
ALTER TABLE "SellerCategoryPermission" ADD CONSTRAINT "SellerCategoryPermission_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellerCategoryPermission" ADD CONSTRAINT "SellerCategoryPermission_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
