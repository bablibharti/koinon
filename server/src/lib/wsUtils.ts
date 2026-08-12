import * as Y from "yjs";
import * as syncProtocol from "y-protocols/sync";
import * as awarenessProtocol from "y-protocols/awareness";
import * as encoding from "lib0/encoding";
import * as decoding from "lib0/decoding";
import { WebSocket } from "ws";

const MESSAGE_SYNC = 0;
const MESSAGE_AWARENESS = 1;

interface SharedDoc extends Y.Doc {
  conns: Map<WebSocket, Set<number>>;
  awareness: awarenessProtocol.Awareness;
}

const docs = new Map<string, SharedDoc>();

function send(doc: SharedDoc, conn: WebSocket, message: Uint8Array) {
  if (conn.readyState !== WebSocket.OPEN) return;
  try {
    conn.send(message);
  } catch {
    closeConn(doc, conn);
  }
}

function closeConn(doc: SharedDoc, conn: WebSocket) {
  const controlledIds = doc.conns.get(conn);
  if (controlledIds) {
    doc.conns.delete(conn);
    awarenessProtocol.removeAwarenessStates(
      doc.awareness,
      Array.from(controlledIds),
      null,
    );
  }
}

export function getYDoc(docName: string): SharedDoc {
  let doc = docs.get(docName);
  if (!doc) {
    doc = new Y.Doc() as SharedDoc;
    doc.conns = new Map();
    doc.awareness = new awarenessProtocol.Awareness(doc);

    doc.awareness.on(
      "update",
      ({ added, updated, removed }: any, conn: WebSocket | null) => {
        const changedClients = added.concat(updated, removed);
        const encoder = encoding.createEncoder();
        encoding.writeVarUint(encoder, MESSAGE_AWARENESS);
        encoding.writeVarUint8Array(
          encoder,
          awarenessProtocol.encodeAwarenessUpdate(
            doc!.awareness,
            changedClients,
          ),
        );
        const buff = encoding.toUint8Array(encoder);
        doc!.conns.forEach((_, c) => send(doc!, c, buff));
      },
    );

    doc.on("update", (update: Uint8Array) => {
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, MESSAGE_SYNC);
      syncProtocol.writeUpdate(encoder, update);
      const message = encoding.toUint8Array(encoder);
      doc!.conns.forEach((_, conn) => send(doc!, conn, message));
    });

    docs.set(docName, doc);
  }
  return doc;
}

export function setupWSConnection(conn: WebSocket, docName: string) {
  conn.binaryType = "arraybuffer";
  const doc = getYDoc(docName);
  doc.conns.set(conn, new Set());

  conn.on("message", (data: ArrayBuffer) => {
    const message = new Uint8Array(data);
    const encoder = encoding.createEncoder();
    const decoder = decoding.createDecoder(message);
    const messageType = decoding.readVarUint(decoder);

    if (messageType === MESSAGE_SYNC) {
      encoding.writeVarUint(encoder, MESSAGE_SYNC);
      syncProtocol.readSyncMessage(decoder, encoder, doc, conn);
      if (encoding.length(encoder) > 1)
        send(doc, conn, encoding.toUint8Array(encoder));
    } else if (messageType === MESSAGE_AWARENESS) {
      awarenessProtocol.applyAwarenessUpdate(
        doc.awareness,
        decoding.readVarUint8Array(decoder),
        conn,
      );
    }
  });

  conn.on("close", () => closeConn(doc, conn));

  // Send initial sync step so the new client gets the current document state
  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, MESSAGE_SYNC);
  syncProtocol.writeSyncStep1(encoder, doc);
  send(doc, conn, encoding.toUint8Array(encoder));

  const awarenessStates = doc.awareness.getStates();
  if (awarenessStates.size > 0) {
    const awEncoder = encoding.createEncoder();
    encoding.writeVarUint(awEncoder, MESSAGE_AWARENESS);
    encoding.writeVarUint8Array(
      awEncoder,
      awarenessProtocol.encodeAwarenessUpdate(
        doc.awareness,
        Array.from(awarenessStates.keys()),
      ),
    );
    send(doc, conn, encoding.toUint8Array(awEncoder));
  }
}
