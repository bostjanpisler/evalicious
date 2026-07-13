-- AlterTable
ALTER TABLE "Order"
ADD COLUMN "spaceInvoiceId" TEXT,
ADD COLUMN "spaceInvoiceNumber" TEXT,
ADD COLUMN "spaceInvoiceIssuedAt" TIMESTAMP(3),
ADD COLUMN "spaceInvoiceSentAt" TIMESTAMP(3),
ADD COLUMN "spaceInvoiceError" TEXT,
ADD COLUMN "spaceInvoiceAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "spaceInvoiceNextTryAt" TIMESTAMP(3),
ADD COLUMN "spaceInvoiceWorkingAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Order_spaceInvoiceId_key" ON "Order"("spaceInvoiceId");

-- CreateIndex
CREATE INDEX "Order_spaceInvoiceNextTryAt_idx" ON "Order"("spaceInvoiceNextTryAt");
