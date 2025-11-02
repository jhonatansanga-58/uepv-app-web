-- AlterTable
ALTER TABLE "Meeting" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;
