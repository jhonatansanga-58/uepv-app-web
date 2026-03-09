/*
  Warnings:

  - You are about to drop the column `subject` on the `Meeting` table. All the data in the column will be lost.
  - You are about to drop the column `read` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `teacherId` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the `TaskGrade` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `topic` to the `Meeting` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subjectId` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "TaskGrade" DROP CONSTRAINT "TaskGrade_studentId_fkey";

-- DropForeignKey
ALTER TABLE "TaskGrade" DROP CONSTRAINT "TaskGrade_taskId_fkey";

-- AlterTable
ALTER TABLE "Meeting" DROP COLUMN "subject",
ADD COLUMN     "topic" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "read",
ADD COLUMN     "courseParallelId" INTEGER,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "teacherId",
ADD COLUMN     "subjectId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "TaskGrade";

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_courseParallelId_fkey" FOREIGN KEY ("courseParallelId") REFERENCES "CourseParallel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
