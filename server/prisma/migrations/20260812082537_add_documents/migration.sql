-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "content" BYTEA NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Document_roomId_key" ON "Document"("roomId");
