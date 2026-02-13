/*
  Warnings:

  - You are about to drop the column `mobileNo` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "mobileNo";

-- CreateTable
CREATE TABLE "IssueDetails" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IssueDetails_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "IssueDetails" ADD CONSTRAINT "IssueDetails_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
