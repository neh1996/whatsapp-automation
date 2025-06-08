import {
  users, contacts, campaigns, messages, groups, whatsappSessions, activities,
  type User, type InsertUser,
  type Contact, type InsertContact,
  type Campaign, type InsertCampaign,
  type Message, type InsertMessage,
  type Group, type InsertGroup,
  type WhatsappSession, type InsertWhatsappSession,
  type Activity, type InsertActivity
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;

  // Contacts
  getContacts(userId: number): Promise<Contact[]>;
  getContact(id: number): Promise<Contact | undefined>;
  createContact(contact: InsertContact): Promise<Contact>;
  createContacts(contacts: InsertContact[]): Promise<Contact[]>;
  updateContact(id: number, updates: Partial<Contact>): Promise<Contact | undefined>;
  deleteContact(id: number): Promise<boolean>;
  getContactsByPhone(phones: string[]): Promise<Contact[]>;

  // Campaigns
  getCampaigns(userId: number): Promise<Campaign[]>;
  getCampaign(id: number): Promise<Campaign | undefined>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: number, updates: Partial<Campaign>): Promise<Campaign | undefined>;
  deleteCampaign(id: number): Promise<boolean>;

  // Messages
  getMessages(campaignId: number): Promise<Message[]>;
  getMessage(id: number): Promise<Message | undefined>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateMessage(id: number, updates: Partial<Message>): Promise<Message | undefined>;
  getMessagesByCampaign(campaignId: number): Promise<Message[]>;

  // Groups
  getGroups(userId: number): Promise<Group[]>;
  getGroup(id: number): Promise<Group | undefined>;
  createGroup(group: InsertGroup): Promise<Group>;
  updateGroup(id: number, updates: Partial<Group>): Promise<Group | undefined>;
  deleteGroup(id: number): Promise<boolean>;

  // WhatsApp Sessions
  getWhatsappSessions(userId: number): Promise<WhatsappSession[]>;
  getWhatsappSession(id: number): Promise<WhatsappSession | undefined>;
  createWhatsappSession(session: InsertWhatsappSession): Promise<WhatsappSession>;
  updateWhatsappSession(id: number, updates: Partial<WhatsappSession>): Promise<WhatsappSession | undefined>;

  // Activities
  getActivities(userId: number, limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;

  // Statistics
  getStats(userId: number): Promise<{
    messagesCount: number;
    deliveryRate: number;
    activeContacts: number;
    activeCampaigns: number;
    messagesUsed: number;
    messagesLimit: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private contacts: Map<number, Contact> = new Map();
  private campaigns: Map<number, Campaign> = new Map();
  private messages: Map<number, Message> = new Map();
  private groups: Map<number, Group> = new Map();
  private whatsappSessions: Map<number, WhatsappSession> = new Map();
  private activities: Map<number, Activity> = new Map();
  
  private currentUserId = 1;
  private currentContactId = 1;
  private currentCampaignId = 1;
  private currentMessageId = 1;
  private currentGroupId = 1;
  private currentSessionId = 1;
  private currentActivityId = 1;

  constructor() {
    // Create default user
    const defaultUser: User = {
      id: 1,
      username: "admin",
      password: "admin123",
      email: "joao@empresa.com",
      name: "João Silva",
      plan: "pro",
      messagesLimit: 1000,
      messagesUsed: 850,
      createdAt: new Date(),
    };
    this.users.set(1, defaultUser);
    this.currentUserId = 2;
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date(),
      plan: insertUser.plan || "free",
      messagesLimit: insertUser.messagesLimit || 100,
      messagesUsed: insertUser.messagesUsed || 0,
      name: insertUser.name || null,
      email: insertUser.email || null,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Contacts
  async getContacts(userId: number): Promise<Contact[]> {
    return Array.from(this.contacts.values()).filter(contact => contact.userId === userId);
  }

  async getContact(id: number): Promise<Contact | undefined> {
    return this.contacts.get(id);
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = this.currentContactId++;
    const contact: Contact = { 
      ...insertContact, 
      id,
      createdAt: new Date(),
      isValid: insertContact.isValid ?? true,
      name: insertContact.name || null,
      groups: insertContact.groups || null,
      customFields: insertContact.customFields || null,
    };
    this.contacts.set(id, contact);
    return contact;
  }

  async createContacts(insertContacts: InsertContact[]): Promise<Contact[]> {
    const contacts: Contact[] = [];
    for (const insertContact of insertContacts) {
      const contact = await this.createContact(insertContact);
      contacts.push(contact);
    }
    return contacts;
  }

  async updateContact(id: number, updates: Partial<Contact>): Promise<Contact | undefined> {
    const contact = this.contacts.get(id);
    if (!contact) return undefined;
    
    const updatedContact = { ...contact, ...updates };
    this.contacts.set(id, updatedContact);
    return updatedContact;
  }

  async deleteContact(id: number): Promise<boolean> {
    return this.contacts.delete(id);
  }

  async getContactsByPhone(phones: string[]): Promise<Contact[]> {
    return Array.from(this.contacts.values()).filter(contact => 
      phones.includes(contact.phone)
    );
  }

  // Campaigns
  async getCampaigns(userId: number): Promise<Campaign[]> {
    return Array.from(this.campaigns.values()).filter(campaign => campaign.userId === userId);
  }

  async getCampaign(id: number): Promise<Campaign | undefined> {
    return this.campaigns.get(id);
  }

  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const id = this.currentCampaignId++;
    const campaign: Campaign = { 
      ...insertCampaign, 
      id,
      createdAt: new Date(),
      completedAt: null,
      status: insertCampaign.status || "draft",
      totalRecipients: insertCampaign.totalRecipients || 0,
      sentCount: insertCampaign.sentCount || 0,
      deliveredCount: insertCampaign.deliveredCount || 0,
      failedCount: insertCampaign.failedCount || 0,
      readCount: insertCampaign.readCount || 0,
      personalization: insertCampaign.personalization || false,
      scheduledAt: insertCampaign.scheduledAt || null,
      attachments: insertCampaign.attachments || null,
    };
    this.campaigns.set(id, campaign);
    return campaign;
  }

  async updateCampaign(id: number, updates: Partial<Campaign>): Promise<Campaign | undefined> {
    const campaign = this.campaigns.get(id);
    if (!campaign) return undefined;
    
    const updatedCampaign = { ...campaign, ...updates };
    this.campaigns.set(id, updatedCampaign);
    return updatedCampaign;
  }

  async deleteCampaign(id: number): Promise<boolean> {
    return this.campaigns.delete(id);
  }

  // Messages
  async getMessages(campaignId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(message => message.campaignId === campaignId);
  }

  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = { 
      ...insertMessage, 
      id,
      createdAt: new Date(),
      status: insertMessage.status || "pending",
      error: insertMessage.error || null,
      sentAt: null,
      deliveredAt: null,
      readAt: null,
    };
    this.messages.set(id, message);
    return message;
  }

  async updateMessage(id: number, updates: Partial<Message>): Promise<Message | undefined> {
    const message = this.messages.get(id);
    if (!message) return undefined;
    
    const updatedMessage = { ...message, ...updates };
    this.messages.set(id, updatedMessage);
    return updatedMessage;
  }

  async getMessagesByCampaign(campaignId: number): Promise<Message[]> {
    return this.getMessages(campaignId);
  }

  // Groups
  async getGroups(userId: number): Promise<Group[]> {
    return Array.from(this.groups.values()).filter(group => group.userId === userId);
  }

  async getGroup(id: number): Promise<Group | undefined> {
    return this.groups.get(id);
  }

  async createGroup(insertGroup: InsertGroup): Promise<Group> {
    const id = this.currentGroupId++;
    const group: Group = { 
      ...insertGroup, 
      id,
      extractedAt: new Date(),
      memberCount: insertGroup.memberCount || 0,
      isPublic: insertGroup.isPublic || false,
    };
    this.groups.set(id, group);
    return group;
  }

  async updateGroup(id: number, updates: Partial<Group>): Promise<Group | undefined> {
    const group = this.groups.get(id);
    if (!group) return undefined;
    
    const updatedGroup = { ...group, ...updates };
    this.groups.set(id, updatedGroup);
    return updatedGroup;
  }

  async deleteGroup(id: number): Promise<boolean> {
    return this.groups.delete(id);
  }

  // WhatsApp Sessions
  async getWhatsappSessions(userId: number): Promise<WhatsappSession[]> {
    return Array.from(this.whatsappSessions.values()).filter(session => session.userId === userId);
  }

  async getWhatsappSession(id: number): Promise<WhatsappSession | undefined> {
    return this.whatsappSessions.get(id);
  }

  async createWhatsappSession(insertSession: InsertWhatsappSession): Promise<WhatsappSession> {
    const id = this.currentSessionId++;
    const session: WhatsappSession = { 
      ...insertSession, 
      id,
      createdAt: new Date(),
      isConnected: insertSession.isConnected || false,
    };
    this.whatsappSessions.set(id, session);
    return session;
  }

  async updateWhatsappSession(id: number, updates: Partial<WhatsappSession>): Promise<WhatsappSession | undefined> {
    const session = this.whatsappSessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...updates };
    this.whatsappSessions.set(id, updatedSession);
    return updatedSession;
  }

  // Activities
  async getActivities(userId: number, limit = 10): Promise<Activity[]> {
    const userActivities = Array.from(this.activities.values())
      .filter(activity => activity.userId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime())
      .slice(0, limit);
    return userActivities;
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.currentActivityId++;
    const activity: Activity = { 
      ...insertActivity, 
      id,
      createdAt: new Date(),
    };
    this.activities.set(id, activity);
    return activity;
  }

  // Statistics
  async getStats(userId: number): Promise<{
    messagesCount: number;
    deliveryRate: number;
    activeContacts: number;
    activeCampaigns: number;
    messagesUsed: number;
    messagesLimit: number;
  }> {
    const user = await this.getUser(userId);
    const contacts = await this.getContacts(userId);
    const campaigns = await this.getCampaigns(userId);
    
    const todayMessages = Array.from(this.messages.values()).filter(message => {
      const today = new Date();
      const messageDate = message.createdAt;
      return messageDate && 
        messageDate.toDateString() === today.toDateString() &&
        message.userId === userId;
    });

    const totalMessages = Array.from(this.messages.values()).filter(message => message.userId === userId);
    const deliveredMessages = totalMessages.filter(message => message.status === 'delivered' || message.status === 'read');
    
    const deliveryRate = totalMessages.length > 0 ? (deliveredMessages.length / totalMessages.length) * 100 : 0;
    const activeCampaigns = campaigns.filter(campaign => 
      campaign.status === 'scheduled' || campaign.status === 'sending'
    ).length;

    return {
      messagesCount: todayMessages.length,
      deliveryRate: Math.round(deliveryRate * 10) / 10,
      activeContacts: contacts.filter(contact => contact.isValid).length,
      activeCampaigns,
      messagesUsed: user?.messagesUsed || 0,
      messagesLimit: user?.messagesLimit || 0,
    };
  }
}

export const storage = new MemStorage();
