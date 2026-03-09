/*
  Warnings:

  - The values [DIRECTOR] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('ADMIN', 'TEACHER', 'TUTOR', 'STUDENT');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'STUDENT';
COMMIT;

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_tutorId_fkey";

-- CreateTable
CREATE TABLE "StudentTutor" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "tutorId" INTEGER NOT NULL,

    CONSTRAINT "StudentTutor_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StudentTutor" ADD CONSTRAINT "StudentTutor_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentTutor" ADD CONSTRAINT "StudentTutor_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
