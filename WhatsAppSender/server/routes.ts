import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertContactSchema, insertCampaignSchema, insertMessageSchema, insertGroupSchema, insertActivitySchema } from "@shared/schema";
import { WhatsAppAutomation } from "./whatsapp";
import multer from "multer";
import csv from "csv-parser";
import { Readable } from "stream";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const whatsapp = new WhatsAppAutomation();

  // WebSocket connections
  const clients = new Set<WebSocket>();

  wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('Client connected to WebSocket');

    ws.on('close', () => {
      clients.delete(ws);
      console.log('Client disconnected from WebSocket');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });
  });

  // Broadcast function
  function broadcast(data: any) {
    const message = JSON.stringify(data);
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: '1.0.0'
    });
  });

  // Auth middleware (simplified for demo)
  const requireAuth = (req: any, res: any, next: any) => {
    req.userId = 1; // Default user for demo
    next();
  };

  // Dashboard stats
  app.get('/api/stats', requireAuth, async (req: any, res) => {
    try {
      const stats = await storage.getStats(req.userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  });

  // Activities
  app.get('/api/activities', requireAuth, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const activities = await storage.getActivities(req.userId, limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch activities' });
    }
  });

  // Contacts
  app.get('/api/contacts', requireAuth, async (req: any, res) => {
    try {
      const contacts = await storage.getContacts(req.userId);
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch contacts' });
    }
  });

  app.post('/api/contacts', requireAuth, async (req: any, res) => {
    try {
      const contactData = insertContactSchema.parse({ ...req.body, userId: req.userId });
      const contact = await storage.createContact(contactData);
      
      await storage.createActivity({
        userId: req.userId,
        type: 'contact_created',
        title: 'Novo contato adicionado',
        description: `Contato ${contact.name || contact.phone} foi adicionado`,
        metadata: { contactId: contact.id }
      });

      broadcast({ type: 'contact_created', contact });
      res.json(contact);
    } catch (error) {
      res.status(400).json({ error: 'Failed to create contact' });
    }
  });

  app.post('/api/contacts/import', requireAuth, upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const results: any[] = [];
      const stream = Readable.from(req.file.buffer);

      await new Promise((resolve, reject) => {
        stream
          .pipe(csv())
          .on('data', (data) => results.push(data))
          .on('end', resolve)
          .on('error', reject);
      });

      const contacts = [];
      const errors = [];

      for (const row of results) {
        try {
          const contactData = {
            userId: req.userId,
            name: row.name || row.nome || '',
            phone: row.phone || row.telefone || row.numero || '',
            customFields: row
          };

          if (!contactData.phone) {
            errors.push(`Linha sem telefone: ${JSON.stringify(row)}`);
            continue;
          }

          const contact = await storage.createContact(contactData);
          contacts.push(contact);
        } catch (error) {
          errors.push(`Erro na linha ${JSON.stringify(row)}: ${error}`);
        }
      }

      await storage.createActivity({
        userId: req.userId,
        type: 'contacts_imported',
        title: 'Contatos importados',
        description: `${contacts.length} contatos importados via CSV`,
        metadata: { imported: contacts.length, errors: errors.length }
      });

      broadcast({ type: 'contacts_imported', count: contacts.length });
      res.json({ imported: contacts.length, errors });
    } catch (error) {
      res.status(500).json({ error: 'Failed to import contacts' });
    }
  });

  app.delete('/api/contacts/:id', requireAuth, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteContact(id);
      
      if (success) {
        broadcast({ type: 'contact_deleted', contactId: id });
        res.json({ success: true });
      } else {
        res.status(404).json({ error: 'Contact not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete contact' });
    }
  });

  // Campaigns
  app.get('/api/campaigns', requireAuth, async (req: any, res) => {
    try {
      const campaigns = await storage.getCampaigns(req.userId);
      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch campaigns' });
    }
  });

  app.post('/api/campaigns', requireAuth, async (req: any, res) => {
    try {
      const campaignData = insertCampaignSchema.parse({ ...req.body, userId: req.userId });
      const campaign = await storage.createCampaign(campaignData);
      
      await storage.createActivity({
        userId: req.userId,
        type: 'campaign_created',
        title: 'Nova campanha criada',
        description: `Campanha "${campaign.name}" foi criada`,
        metadata: { campaignId: campaign.id }
      });

      broadcast({ type: 'campaign_created', campaign });
      res.json(campaign);
    } catch (error) {
      res.status(400).json({ error: 'Failed to create campaign' });
    }
  });

  app.post('/api/campaigns/:id/send', requireAuth, async (req: any, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      const campaign = await storage.getCampaign(campaignId);
      
      if (!campaign || campaign.userId !== req.userId) {
        return res.status(404).json({ error: 'Campaign not found' });
      }

      // Get recipients (from request or all contacts)
      const recipients = req.body.recipients || await storage.getContacts(req.userId);
      
      // Update campaign with recipient count
      await storage.updateCampaign(campaignId, {
        status: 'sending',
        totalRecipients: recipients.length
      });

      // Create message records
      const messages = [];
      for (const recipient of recipients) {
        const personalizedMessage = campaign.personalization && recipient.name
          ? campaign.message.replace(/{nome}/g, recipient.name)
          : campaign.message;

        const message = await storage.createMessage({
          campaignId,
          contactId: recipient.id,
          userId: req.userId,
          phone: recipient.phone,
          message: personalizedMessage,
          status: 'pending'
        });
        messages.push(message);
      }

      // Start sending process (async)
      setImmediate(async () => {
        await whatsapp.sendCampaign(campaign, messages, storage, broadcast);
      });

      await storage.createActivity({
        userId: req.userId,
        type: 'campaign_sent',
        title: 'Campanha iniciada',
        description: `Campanha "${campaign.name}" iniciada com ${recipients.length} destinatários`,
        metadata: { campaignId, recipients: recipients.length }
      });

      broadcast({ type: 'campaign_started', campaignId, recipients: recipients.length });
      res.json({ success: true, messages: messages.length });
    } catch (error) {
      console.error('Campaign send error:', error);
      res.status(500).json({ error: 'Failed to send campaign' });
    }
  });

  // Quick send
  app.post('/api/send-quick', requireAuth, async (req: any, res) => {
    try {
      const { phones, message, scheduled } = req.body;
      
      if (!phones || !message) {
        return res.status(400).json({ error: 'Phones and message are required' });
      }

      const phoneList = Array.isArray(phones) ? phones : phones.split(',').map((p: string) => p.trim());
      
      // Create quick campaign
      const campaign = await storage.createCampaign({
        userId: req.userId,
        name: 'Envio Rápido',
        message,
        status: scheduled ? 'scheduled' : 'sending',
        scheduledAt: scheduled ? new Date(scheduled) : null,
        totalRecipients: phoneList.length
      });

      // Create messages
      const messages = [];
      for (const phone of phoneList) {
        const message = await storage.createMessage({
          campaignId: campaign.id,
          contactId: 0, // Quick send doesn't require contact record
          userId: req.userId,
          phone,
          message: campaign.message,
          status: 'pending'
        });
        messages.push(message);
      }

      if (!scheduled) {
        // Send immediately
        setImmediate(async () => {
          await whatsapp.sendCampaign(campaign, messages, storage, broadcast);
        });
      }

      await storage.createActivity({
        userId: req.userId,
        type: 'quick_send',
        title: 'Envio rápido',
        description: `Mensagem enviada para ${phoneList.length} números`,
        metadata: { phones: phoneList.length }
      });

      broadcast({ type: 'quick_send', phones: phoneList.length });
      res.json({ success: true, campaignId: campaign.id });
    } catch (error) {
      res.status(500).json({ error: 'Failed to send quick message' });
    }
  });

  // Groups
  app.get('/api/groups', requireAuth, async (req: any, res) => {
    try {
      const groups = await storage.getGroups(req.userId);
      res.json(groups);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch groups' });
    }
  });

  app.post('/api/groups/search', requireAuth, async (req: any, res) => {
    try {
      const { keyword, category } = req.body;
      
      // Simulate group search (in real implementation, this would search public groups)
      const mockGroups = [
        {
          name: `${keyword} - Vendas SP`,
          description: 'Grupo de vendas em São Paulo',
          memberCount: 245,
          category: category || 'vendas',
          inviteLink: 'https://chat.whatsapp.com/mock-link-1'
        },
        {
          name: `${keyword} - Negócios RJ`,
          description: 'Networking e negócios no Rio de Janeiro',
          memberCount: 189,
          category: category || 'negócios',
          inviteLink: 'https://chat.whatsapp.com/mock-link-2'
        }
      ];

      res.json(mockGroups);
    } catch (error) {
      res.status(500).json({ error: 'Failed to search groups' });
    }
  });

  // WhatsApp Session Management
  app.get('/api/whatsapp/status', requireAuth, async (req: any, res) => {
    try {
      const sessions = await storage.getWhatsappSessions(req.userId);
      const status = await whatsapp.getConnectionStatus();
      
      res.json({
        connected: status.connected,
        qrCode: status.qrCode,
        sessions
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get WhatsApp status' });
    }
  });

  app.post('/api/whatsapp/connect', requireAuth, async (req: any, res) => {
    try {
      const { sessionName } = req.body;
      
      const result = await whatsapp.connect(sessionName || 'default');
      
      if (result.qrCode) {
        // Save session
        await storage.createWhatsappSession({
          userId: req.userId,
          sessionName: sessionName || 'default',
          qrCode: result.qrCode,
          isConnected: false
        });
      }

      broadcast({ type: 'whatsapp_status', ...result });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to connect to WhatsApp' });
    }
  });

  app.post('/api/whatsapp/disconnect', requireAuth, async (req: any, res) => {
    try {
      await whatsapp.disconnect();
      broadcast({ type: 'whatsapp_status', connected: false });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to disconnect from WhatsApp' });
    }
  });

  // Messages and Reports
  app.get('/api/messages/:campaignId', requireAuth, async (req: any, res) => {
    try {
      const campaignId = parseInt(req.params.campaignId);
      const messages = await storage.getMessagesByCampaign(campaignId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  });

  // Validate phone numbers
  app.post('/api/validate-phones', requireAuth, async (req: any, res) => {
    try {
      const { phones } = req.body;
      const results = await whatsapp.validatePhones(phones);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: 'Failed to validate phones' });
    }
  });

  return httpServer;
}
