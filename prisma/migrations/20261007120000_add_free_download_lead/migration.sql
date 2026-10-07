CREATE TABLE "FreeDownloadLead" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "userId" TEXT,
    "productId" TEXT NOT NULL,
    "consentText" TEXT NOT NULL,
    "consentedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "emailSentAt" TIMESTAMP(3),
    "halContactId" TEXT,
    "halSyncedAt" TIMESTAMP(3),
    "halError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FreeDownloadLead_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "FreeDownloadLead_email_idx" ON "FreeDownloadLead"("email");
CREATE INDEX "FreeDownloadLead_userId_idx" ON "FreeDownloadLead"("userId");
CREATE INDEX "FreeDownloadLead_productId_idx" ON "FreeDownloadLead"("productId");

ALTER TABLE "FreeDownloadLead" ADD CONSTRAINT "FreeDownloadLead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FreeDownloadLead" ADD CONSTRAINT "FreeDownloadLead_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
