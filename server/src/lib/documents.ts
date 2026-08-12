import * as Y from "yjs";
import { prisma } from "./prisma";

// Load a saved document snapshot from DB into a fresh Y.Doc
export async function loadDocument(roomId: string): Promise<Uint8Array | null> {
  const doc = await prisma.document.findUnique({ where: { roomId } });
  return doc ? new Uint8Array(doc.content) : null;
}

// Save the current Y.Doc state into DB (create or update)
export async function saveDocument(roomId: string, ydoc: Y.Doc) {
  const update = Y.encodeStateAsUpdate(ydoc);
  await prisma.document.upsert({
    where: { roomId },
    update: { content: Buffer.from(update) },
    create: { roomId, content: Buffer.from(update) },
  });
}
