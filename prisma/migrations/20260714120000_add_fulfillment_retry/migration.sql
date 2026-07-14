ALTER TABLE "Order"
ADD COLUMN "fulfillmentAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "fulfillmentNextTryAt" TIMESTAMP(3);

UPDATE "Order"
SET "fulfillmentNextTryAt" = NOW()
WHERE "status" = 'completed' AND "fulfillmentCompletedAt" IS NULL;

CREATE INDEX "Order_fulfillmentNextTryAt_idx" ON "Order"("fulfillmentNextTryAt");

ALTER TABLE "Product" ADD COLUMN "courseId" TEXT;
