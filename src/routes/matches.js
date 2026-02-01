import { Router } from "express";
import {
  createMatchSchema,
  listMatchesQuerySchema,
} from "../validation/matches.js";
import { matches } from "../db/schema.js";
import { db } from "../db/db.js";
import { getMatchStatus } from "../utils/match-status.js";
import { desc } from "drizzle-orm";

export const matchRouter = Router();

matchRouter.get("/", async (req, res) => {
  const parseResult = listMatchesQuerySchema.safeParse(req.query);
  const MAX_LIMIT = 100;

  if (!parseResult.success) {
    return res.status(400).json({
      error: "Invalid query parameters",
      details: parseResult.error.details,
    });
  }

  const limit = Math.min(parseResult.data.limit ?? 50, MAX_LIMIT);

  try {
    const data = await db
      .select()
      .from(matches)
      .orderBy(desc(matches.createdAt))
      .limit(limit);

    return res.json({
      data,
    });
  } catch (error) {
    console.error("List matches error:", error);

    return res.status(500).json({
      message: "Failed to fetch matches",
    });
  }
});

matchRouter.post("/", async (req, res) => {
  // 1. Validate input
  const parseResult = createMatchSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({
      error: "Invalid query parameters",
      details: parseResult.error.details,
    });
  }

  const {
    sport,
    homeTeam,
    awayTeam,
    startTime,
    endTime,
    homeScore = 0,
    awayScore = 0,
  } = parseResult.data;

  // 2. Derive initial status
  const status = getMatchStatus(startTime, endTime);

  if (!status) {
    return res.status(400).json({
      message: "Invalid startTime or endTime",
    });
  }

  try {
    // 3. Insert match
    const [createdMatch] = await db
      .insert(matches)
      .values({
        sport,
        homeTeam,
        awayTeam,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status,
        homeScore,
        awayScore,
      })
      .returning();

    if(res.app.locals.broadcastMatchCreated){
      res.app.locals.broadcastMatchCreated(createdMatch)
    }

    // 4. Respond
    return res.status(201).json({
      message: "Match created successfully",
      data: createdMatch,
    });
  } catch (error) {
    console.error("Create match error:", error);

    return res.status(500).json({
      message: "Failed to create match",
    });
  }
});
