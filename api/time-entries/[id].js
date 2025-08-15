const { z } = require('zod');

// Zod schema for validation
const insertTimeEntrySchema = z.object({
  date: z.string(),
  nafees: z.number().default(0),
  waqas: z.number().default(0),
  cheetan: z.number().default(0),
  nadeem: z.number().default(0)
});

// In-memory storage (will reset with each cold start)
// Note: In production, this should be replaced with a database
let timeEntries = new Map();

module.exports = async function handler(req, res) {
  const { id } = req.query;

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'PUT') {
      const validatedData = insertTimeEntrySchema.partial().parse(req.body);
      const existing = timeEntries.get(id);
      
      if (!existing) {
        return res.status(404).json({ message: "Time entry not found" });
      }
      
      const updated = { ...existing, ...validatedData };
      const nafees = updated.nafees ?? 0;
      const waqas = updated.waqas ?? 0;
      const cheetan = updated.cheetan ?? 0;
      const nadeem = updated.nadeem ?? 0;
      updated.totalMinutes = nafees + waqas + cheetan + nadeem;
      
      timeEntries.set(id, updated);
      return res.json(updated);
    }

    if (req.method === 'DELETE') {
      const deleted = timeEntries.delete(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Time entry not found" });
      }
      
      return res.json({ message: "Time entry deleted successfully" });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid data", errors: error.errors });
    }
    return res.status(500).json({ message: "Server error" });
  }
}