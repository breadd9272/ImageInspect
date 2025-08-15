import { type TimeEntry, type InsertTimeEntry, type Settings, type InsertSettings } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Time entries
  getTimeEntries(): Promise<TimeEntry[]>;
  getTimeEntry(id: string): Promise<TimeEntry | undefined>;
  createTimeEntry(entry: InsertTimeEntry): Promise<TimeEntry>;
  updateTimeEntry(id: string, entry: Partial<InsertTimeEntry>): Promise<TimeEntry | undefined>;
  deleteTimeEntry(id: string): Promise<boolean>;
  
  // Settings
  getSettings(): Promise<Settings>;
  updateSettings(settings: InsertSettings): Promise<Settings>;
}

export class MemStorage implements IStorage {
  private timeEntries: Map<string, TimeEntry>;
  private settings: Settings;

  constructor() {
    this.timeEntries = new Map();
    this.settings = {
      id: randomUUID(),
      baseAmount: 10000
    };
  }

  async getTimeEntries(): Promise<TimeEntry[]> {
    return Array.from(this.timeEntries.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  async getTimeEntry(id: string): Promise<TimeEntry | undefined> {
    return this.timeEntries.get(id);
  }

  async createTimeEntry(insertEntry: InsertTimeEntry): Promise<TimeEntry> {
    const id = randomUUID();
    const nafees = insertEntry.nafees ?? 0;
    const waqas = insertEntry.waqas ?? 0;
    const cheetan = insertEntry.cheetan ?? 0;
    const nadeem = insertEntry.nadeem ?? 0;
    const totalMinutes = nafees + waqas + cheetan + nadeem;
    const entry: TimeEntry = { 
      ...insertEntry,
      nafees,
      waqas,
      cheetan,
      nadeem,
      id, 
      totalMinutes 
    };
    this.timeEntries.set(id, entry);
    return entry;
  }

  async updateTimeEntry(id: string, updateEntry: Partial<InsertTimeEntry>): Promise<TimeEntry | undefined> {
    const existing = this.timeEntries.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updateEntry };
    const nafees = updated.nafees ?? 0;
    const waqas = updated.waqas ?? 0;
    const cheetan = updated.cheetan ?? 0;
    const nadeem = updated.nadeem ?? 0;
    updated.totalMinutes = nafees + waqas + cheetan + nadeem;
    
    this.timeEntries.set(id, updated);
    return updated;
  }

  async deleteTimeEntry(id: string): Promise<boolean> {
    return this.timeEntries.delete(id);
  }

  async getSettings(): Promise<Settings> {
    return this.settings;
  }

  async updateSettings(newSettings: InsertSettings): Promise<Settings> {
    this.settings = { ...this.settings, ...newSettings };
    return this.settings;
  }
}

export const storage = new MemStorage();
