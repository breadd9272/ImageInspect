import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTimeEntrySchema, insertSettingsSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all time entries
  app.get("/api/time-entries", async (req, res) => {
    try {
      const entries = await storage.getTimeEntries();
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch time entries" });
    }
  });

  // Create time entry
  app.post("/api/time-entries", async (req, res) => {
    try {
      const validatedData = insertTimeEntrySchema.parse(req.body);
      const entry = await storage.createTimeEntry(validatedData);
      res.status(201).json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create time entry" });
      }
    }
  });

  // Update time entry
  app.put("/api/time-entries/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertTimeEntrySchema.partial().parse(req.body);
      const entry = await storage.updateTimeEntry(id, validatedData);
      
      if (!entry) {
        return res.status(404).json({ message: "Time entry not found" });
      }
      
      res.json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update time entry" });
      }
    }
  });

  // Delete time entry
  app.delete("/api/time-entries/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteTimeEntry(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Time entry not found" });
      }
      
      res.json({ message: "Time entry deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete time entry" });
    }
  });

  // Get settings
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  // Update settings
  app.put("/api/settings", async (req, res) => {
    try {
      const validatedData = insertSettingsSchema.parse(req.body);
      const settings = await storage.updateSettings(validatedData);
      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update settings" });
      }
    }
  });


  const httpServer = createServer(app);
  return httpServer;
}

