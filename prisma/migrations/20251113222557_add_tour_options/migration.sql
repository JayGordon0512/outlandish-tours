-- AlterTable
ALTER TABLE "Tour" ADD COLUMN     "options" TEXT[] DEFAULT ARRAY[]::TEXT[];
