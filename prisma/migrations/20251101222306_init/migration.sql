/*
  Warnings:

  - You are about to drop the column `teacherId` on the `Meeting` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Meeting` table without a default value. This is not possible if the table is not empty.
  - Added the required column `creatorId` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Meeting" DROP CONSTRAINT "Meeting_teacherId_fkey";

-- AlterTable
ALTER TABLE "Meeting" DROP COLUMN "teacherId",
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "creatorId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
