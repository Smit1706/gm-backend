-- CreateEnum
CREATE TYPE "SheetType" AS ENUM ('MARBLE', 'GRANITE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "country" TEXT,
ADD COLUMN     "mobileNo" TEXT;

-- CreateTable
CREATE TABLE "Sheets" (
    "sheetId" TEXT NOT NULL,
    "sheetName" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "vehicleNo" TEXT,
    "lotNo" TEXT,
    "image" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "sheetType" "SheetType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sheets_pkey" PRIMARY KEY ("sheetId")
);

-- CreateTable
CREATE TABLE "SheetEntries" (
    "entryId" TEXT NOT NULL,
    "len" DOUBLE PRECISION NOT NULL,
    "width" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SheetEntries_pkey" PRIMARY KEY ("entryId")
);
