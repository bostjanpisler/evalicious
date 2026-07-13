-- AlterTable
ALTER TABLE "Product"
ADD COLUMN "published" BOOLEAN NOT NULL DEFAULT false;

-- Existing synchronized products were previously all treated as available.
UPDATE "Product" SET "published" = true;

-- AlterTable
ALTER TABLE "Order"
ADD COLUMN "fulfillmentCompletedAt" TIMESTAMP(3),
ADD COLUMN "fulfillmentError" TEXT,
ADD COLUMN "fulfillmentWorkingAt" TIMESTAMP(3),
ADD COLUMN "deliveryUrl" TEXT,
ADD COLUMN "deliveryUrlExpiresAt" TIMESTAMP(3);
