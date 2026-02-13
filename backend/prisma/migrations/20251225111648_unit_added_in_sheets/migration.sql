-- CreateEnum
CREATE TYPE "SheetSIUnit" AS ENUM ('INCH', 'FEET', 'METER', 'CENTIMETER');

-- AlterTable
ALTER TABLE "Sheets" ADD COLUMN     "areaUnit" "SheetSIUnit",
ADD COLUMN     "baseUnit" "SheetSIUnit" NOT NULL DEFAULT 'FEET';
