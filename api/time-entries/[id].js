const { storage } = require('../../server/storage');
const { insertTimeEntrySchema } = require('../../shared/schema');
const { z } = require('zod');

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
      const entry = await storage.updateTimeEntry(id, validatedData);
      
      if (!entry) {
        return res.status(404).json({ message: "Time entry not found" });
      }
      
      return res.json(entry);
    }

    if (req.method === 'DELETE') {
      const deleted = await storage.deleteTimeEntry(id);
      
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