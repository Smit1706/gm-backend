-- AlterTable
ALTER TABLE "User" ADD COLUMN     "forgetPasswordAttempt" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "forgetPasswordLastAttempt" TIMESTAMP(3),
ADD COLUMN     "forgetPasswordTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN     "otp" TEXT,
ADD COLUMN     "otpExpiresAt" TIMESTAMP(3);
