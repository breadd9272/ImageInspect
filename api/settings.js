const { z } = require('zod');
const { randomUUID } = require('crypto');

// Zod schema for validation
const insertSettingsSchema = z.object({
  baseAmount: z.number()
});

// In-memory settings (will reset with each cold start)
let settings = {
  id: randomUUID(),
  baseAmount: 10000
};

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
      return res.json(settings);
    }

    if (req.method === 'PUT') {
      const validatedData = insertSettingsSchema.parse(req.body);
      settings = { ...settings, ...validatedData };
      return res.json(settings);
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