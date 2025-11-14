-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'GUIDE';

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "guideId" TEXT;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "Guide"("id") ON DELETE SET NULL ON UPDATE CASCADE;
