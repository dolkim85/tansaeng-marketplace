-- AlterEnum
ALTER TYPE "SupportTicketCategory" ADD VALUE 'REPORT';

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "isAdminSuspended" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "suspendedAt" TIMESTAMP(3),
ADD COLUMN     "suspendedBy" TEXT,
ADD COLUMN     "suspendedReason" TEXT;
