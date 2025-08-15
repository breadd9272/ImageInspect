const { z } = require('zod');
const { randomUUID } = require('crypto');

// Zod schema for validation
const insertTimeEntrySchema = z.object({
  date: z.string(),
  nafees: z.number().default(0),
  waqas: z.number().default(0),
  cheetan: z.number().default(0),
  nadeem: z.number().default(0)
});

// In-memory storage (will reset with each cold start)
let timeEntries = new Map();

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const entries = Array.from(timeEntries.values()).sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      return res.json(entries);
    }

    if (req.method === 'POST') {
      const validatedData = insertTimeEntrySchema.parse(req.body);
      const id = randomUUID();
      const nafees = validatedData.nafees ?? 0;
      const waqas = validatedData.waqas ?? 0;
      const cheetan = validatedData.cheetan ?? 0;
      const nadeem = validatedData.nadeem ?? 0;
      const totalMinutes = nafees + waqas + cheetan + nadeem;
      
      const entry = {
        ...validatedData,
        id,
        nafees,
        waqas,
        cheetan,
        nadeem,
        totalMinutes
      };
      
      timeEntries.set(id, entry);
      return res.status(201).json(entry);
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