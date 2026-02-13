/*
  Warnings:

  - Added the required column `sheetId` to the `SheetEntries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Sheets` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SheetEntries" ADD COLUMN     "sheetId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Sheets" ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Sheets" ADD CONSTRAINT "Sheets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SheetEntries" ADD CONSTRAINT "SheetEntries_sheetId_fkey" FOREIGN KEY ("sheetId") REFERENCES "Sheets"("sheetId") ON DELETE RESTRICT ON UPDATE CASCADE;
