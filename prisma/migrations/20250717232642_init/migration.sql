/*
  Warnings:

  - You are about to drop the column `classId` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `courseId` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `guardianId` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `classId` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `courseId` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the `Class` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `courseParallelId` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `courseParallelId` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_classId_fkey";

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_guardianId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_classId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_courseId_fkey";

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "classId",
DROP COLUMN "courseId",
DROP COLUMN "guardianId",
ADD COLUMN     "courseParallelId" INTEGER NOT NULL,
ADD COLUMN     "tutorId" INTEGER;

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "classId",
DROP COLUMN "courseId",
ADD COLUMN     "courseParallelId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Class";

-- CreateTable
CREATE TABLE "Parallel" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Parallel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseParallel" (
    "id" SERIAL NOT NULL,
    "courseId" INTEGER NOT NULL,
    "parallelId" INTEGER NOT NULL,

    CONSTRAINT "CourseParallel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Parallel_name_key" ON "Parallel"("name");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_courseParallelId_fkey" FOREIGN KEY ("courseParallelId") REFERENCES "CourseParallel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseParallel" ADD CONSTRAINT "CourseParallel_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseParallel" ADD CONSTRAINT "CourseParallel_parallelId_fkey" FOREIGN KEY ("parallelId") REFERENCES "Parallel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_courseParallelId_fkey" FOREIGN KEY ("courseParallelId") REFERENCES "CourseParallel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
