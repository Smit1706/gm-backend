/*
  Warnings:

  - You are about to drop the column `companyEmail` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "companyEmail",
ADD COLUMN     "city" TEXT,
ADD COLUMN     "gstNumber" TEXT,
ADD COLUMN     "pinCode" TEXT,
ADD COLUMN     "state" TEXT,
ALTER COLUMN "password" DROP NOT NULL;
