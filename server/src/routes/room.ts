import { Router, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, AuthRequest } from "../middleware/auth.js";

const router = Router();

// CREATE ROOM — creator becomes "owner"
router.post("/", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body;

    const room = await prisma.room.create({
      data: {
        name: name || "Untitled Room",
        members: {
          create: {
            userId: req.userId!,
            role: "owner",
          },
        },
      },
      include: { members: true },
    });

    res.status(201).json(room);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create room" });
  }
});

// JOIN ROOM — default role "editor"
router.post(
  "/:id/join",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const roomId = req.params.id as string;

      const room = await prisma.room.findUnique({ where: { id: roomId } });
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }

      const existingMember = await prisma.roomMember.findUnique({
        where: { userId_roomId: { userId: req.userId!, roomId } },
      });

      if (existingMember) {
        return res.json({
          message: "Already a member",
          role: existingMember.role,
        });
      }

      const member = await prisma.roomMember.create({
        data: {
          userId: req.userId!,
          roomId,
          role: "editor",
        },
      });

      res.status(201).json(member);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to join room" });
    }
  },
);

// GET ROOM DETAILS + MEMBERS
router.get("/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const roomId = req.params.id as string;

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        members: {
          include: { user: { select: { id: true, email: true, name: true } } },
        },
      },
    });

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    res.json(room);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch room" });
  }
});

export default router;
