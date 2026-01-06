-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('SILVER', 'GOLD', 'URGENT');

-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "post_type" "PostType" NOT NULL DEFAULT 'SILVER';
