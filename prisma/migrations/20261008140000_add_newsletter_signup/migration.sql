CREATE TABLE "NewsletterSignup" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'sl',
    "source" TEXT NOT NULL DEFAULT 'site',
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

    CONSTRAINT "NewsletterSignup_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "NewsletterSignup_email_idx" ON "NewsletterSignup"("email");
