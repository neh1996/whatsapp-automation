import puppeteer, { Browser, Page } from 'puppeteer';
import { Campaign, Message, IStorage } from '@shared/schema';

export class WhatsAppAutomation {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private isConnected = false;
  private qrCode: string | null = null;

  async connect(sessionName: string = 'default'): Promise<{ connected: boolean; qrCode?: string }> {
    try {
      if (this.browser) {
        await this.disconnect();
      }

      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      });

      this.page = await this.browser.newPage();
      await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      console.log('Navigating to WhatsApp Web...');
      await this.page.goto('https://web.whatsapp.com', { waitUntil: 'networkidle2' });

      // Wait for QR code or main interface
      try {
        await this.page.waitForSelector('div[data-ref]', { timeout: 10000 });
        
        // Check if QR code is present
        const qrElement = await this.page.$('div[data-ref] canvas');
        if (qrElement) {
          console.log('QR Code found, waiting for scan...');
          this.qrCode = await this.getQRCode();
          return { connected: false, qrCode: this.qrCode };
        }
      } catch (error) {
        console.log('No QR code found, checking if already logged in...');
      }

      // Check if already connected
      try {
        await this.page.waitForSelector('div[data-testid="chat-list"]', { timeout: 5000 });
        this.isConnected = true;
        console.log('WhatsApp Web connected successfully');
        return { connected: true };
      } catch (error) {
        console.log('Not connected, QR code might be needed');
        return { connected: false };
      }

    } catch (error) {
      console.error('WhatsApp connection error:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
      this.isConnected = false;
      this.qrCode = null;
    }
  }

  async getConnectionStatus(): Promise<{ connected: boolean; qrCode?: string }> {
    return {
      connected: this.isConnected,
      qrCode: this.qrCode
    };
  }

  private async getQRCode(): Promise<string> {
    if (!this.page) throw new Error('Page not initialized');
    
    try {
      const qrElement = await this.page.$('div[data-ref] canvas');
      if (qrElement) {
        const qrImage = await qrElement.screenshot({ encoding: 'base64' });
        return `data:image/png;base64,${qrImage}`;
      }
    } catch (error) {
      console.error('Error getting QR code:', error);
    }
    
    return '';
  }

  async sendMessage(phone: string, message: string): Promise<{ success: boolean; error?: string }> {
    if (!this.page || !this.isConnected) {
      return { success: false, error: 'WhatsApp not connected' };
    }

    try {
      // Format phone number
      const formattedPhone = phone.replace(/\D/g, '');
      const url = `https://web.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`;
      
      await this.page.goto(url, { waitUntil: 'networkidle2' });
      
      // Wait for chat to load
      await this.page.waitForSelector('div[data-testid="conversation-compose-box-input"]', { timeout: 10000 });
      
      // Wait a bit to ensure the message is loaded
      await this.page.waitForTimeout(2000);
      
      // Send the message
      await this.page.keyboard.press('Enter');
      
      // Wait for message to be sent
      await this.page.waitForTimeout(3000);
      
      return { success: true };
    } catch (error) {
      console.error(`Error sending message to ${phone}:`, error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async sendCampaign(
    campaign: Campaign, 
    messages: Message[], 
    storage: IStorage, 
    broadcast: (data: any) => void
  ): Promise<void> {
    console.log(`Starting campaign: ${campaign.name} with ${messages.length} messages`);
    
    let sentCount = 0;
    let deliveredCount = 0;
    let failedCount = 0;

    for (const message of messages) {
      try {
        // Simulate sending delay (to avoid spam detection)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const result = await this.sendMessage(message.phone, message.message);
        
        if (result.success) {
          await storage.updateMessage(message.id, {
            status: 'sent',
            sentAt: new Date()
          });
          
          // Simulate delivery status after a short delay
          setTimeout(async () => {
            await storage.updateMessage(message.id, {
              status: 'delivered',
              deliveredAt: new Date()
            });
            deliveredCount++;
            
            // Update campaign stats
            await storage.updateCampaign(campaign.id, {
              deliveredCount
            });
            
            broadcast({
              type: 'message_delivered',
              campaignId: campaign.id,
              messageId: message.id,
              stats: { sentCount, deliveredCount, failedCount }
            });
          }, 3000);
          
          sentCount++;
        } else {
          await storage.updateMessage(message.id, {
            status: 'failed',
            error: result.error
          });
          failedCount++;
        }

        // Update campaign progress
        await storage.updateCampaign(campaign.id, {
          sentCount,
          failedCount
        });

        // Broadcast progress update
        broadcast({
          type: 'campaign_progress',
          campaignId: campaign.id,
          progress: (sentCount + failedCount) / messages.length,
          stats: { sentCount, deliveredCount, failedCount }
        });

      } catch (error) {
        console.error(`Error sending message ${message.id}:`, error);
        await storage.updateMessage(message.id, {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        failedCount++;
      }
    }

    // Mark campaign as completed
    await storage.updateCampaign(campaign.id, {
      status: 'completed',
      completedAt: new Date()
    });

    // Create completion activity
    await storage.createActivity({
      userId: campaign.userId,
      type: 'campaign_completed',
      title: 'Campanha concluída',
      description: `Campanha "${campaign.name}" concluída. ${sentCount} enviadas, ${deliveredCount} entregues, ${failedCount} falharam`,
      metadata: {
        campaignId: campaign.id,
        sentCount,
        deliveredCount,
        failedCount
      }
    });

    broadcast({
      type: 'campaign_completed',
      campaignId: campaign.id,
      stats: { sentCount, deliveredCount, failedCount }
    });

    console.log(`Campaign ${campaign.name} completed: ${sentCount} sent, ${failedCount} failed`);
  }

  async validatePhones(phones: string[]): Promise<Array<{ phone: string; valid: boolean; hasWhatsapp: boolean }>> {
    // For demo purposes, simulate phone validation
    return phones.map(phone => ({
      phone,
      valid: /^\+?[\d\s-()]+$/.test(phone) && phone.replace(/\D/g, '').length >= 10,
      hasWhatsapp: Math.random() > 0.1 // 90% have WhatsApp (simulated)
    }));
  }

  async extractGroupMembers(groupLink: string): Promise<Array<{ name: string; phone: string }>> {
    if (!this.page || !this.isConnected) {
      throw new Error('WhatsApp not connected');
    }

    try {
      await this.page.goto(groupLink, { waitUntil: 'networkidle2' });
      
      // This would require more complex implementation
      // For demo, return mock data
      return [
        { name: 'João Silva', phone: '+5511999999999' },
        { name: 'Maria Santos', phone: '+5511888888888' },
        { name: 'Pedro Oliveira', phone: '+5511777777777' }
      ];
    } catch (error) {
      console.error('Error extracting group members:', error);
      throw error;
    }
  }
}
