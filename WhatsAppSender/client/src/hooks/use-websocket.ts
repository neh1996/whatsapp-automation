import { useEffect, useRef } from 'react';
import { websocketManager, type WebSocketMessage, type WebSocketEventHandler } from '@/lib/websocket';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export function useWebSocket() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    // Connect to WebSocket
    websocketManager.connect().catch((error) => {
      console.error('Failed to connect to WebSocket:', error);
    });

    // Set up event handlers
    const handleCampaignProgress = (data: WebSocketMessage) => {
      // Update campaign data in cache
      queryClient.setQueryData(['/api/campaigns'], (oldData: any) => {
        if (!oldData) return oldData;
        
        return oldData.map((campaign: any) => 
          campaign.id === data.campaignId 
            ? { 
                ...campaign, 
                sentCount: data.stats.sentCount,
                deliveredCount: data.stats.deliveredCount,
                failedCount: data.stats.failedCount,
              }
            : campaign
        );
      });

      // Invalidate stats to refresh dashboard
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
    };

    const handleCampaignCompleted = (data: WebSocketMessage) => {
      toast({
        title: "Campanha concluída!",
        description: `Campanha finalizada: ${data.stats.sentCount} enviadas, ${data.stats.deliveredCount} entregues.`,
      });

      // Refresh campaigns and stats
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
    };

    const handleCampaignStarted = (data: WebSocketMessage) => {
      toast({
        title: "Campanha iniciada!",
        description: `Enviando para ${data.recipients} destinatários...`,
      });

      queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
    };

    const handleMessageDelivered = (data: WebSocketMessage) => {
      // Update campaign progress in real-time
      queryClient.setQueryData(['/api/campaigns'], (oldData: any) => {
        if (!oldData) return oldData;
        
        return oldData.map((campaign: any) => 
          campaign.id === data.campaignId 
            ? { 
                ...campaign, 
                deliveredCount: data.stats.deliveredCount,
              }
            : campaign
        );
      });
    };

    const handleContactCreated = (data: WebSocketMessage) => {
      toast({
        title: "Contato adicionado",
        description: `${data.contact.name || data.contact.phone} foi adicionado à lista.`,
      });

      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
    };

    const handleContactsImported = (data: WebSocketMessage) => {
      toast({
        title: "Importação concluída!",
        description: `${data.count} contatos foram importados com sucesso.`,
      });

      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
    };

    const handleWhatsappStatus = (data: WebSocketMessage) => {
      // Update WhatsApp connection status
      queryClient.setQueryData(['/api/whatsapp/status'], (oldData: any) => ({
        ...oldData,
        connected: data.connected,
        qrCode: data.qrCode,
      }));

      if (data.connected) {
        toast({
          title: "WhatsApp conectado!",
          description: "Sua conta foi conectada com sucesso.",
        });
      } else if (data.connected === false) {
        toast({
          title: "WhatsApp desconectado",
          description: "A conexão com o WhatsApp foi perdida.",
          variant: "destructive",
        });
      }
    };

    const handleQuickSend = (data: WebSocketMessage) => {
      toast({
        title: "Mensagem enviada!",
        description: `Enviando para ${data.phones} números...`,
      });

      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
    };

    // Register event handlers
    websocketManager.on('campaign_progress', handleCampaignProgress);
    websocketManager.on('campaign_completed', handleCampaignCompleted);
    websocketManager.on('campaign_started', handleCampaignStarted);
    websocketManager.on('message_delivered', handleMessageDelivered);
    websocketManager.on('contact_created', handleContactCreated);
    websocketManager.on('contacts_imported', handleContactsImported);
    websocketManager.on('whatsapp_status', handleWhatsappStatus);
    websocketManager.on('quick_send', handleQuickSend);

    // Cleanup on unmount
    return () => {
      websocketManager.off('campaign_progress', handleCampaignProgress);
      websocketManager.off('campaign_completed', handleCampaignCompleted);
      websocketManager.off('campaign_started', handleCampaignStarted);
      websocketManager.off('message_delivered', handleMessageDelivered);
      websocketManager.off('contact_created', handleContactCreated);
      websocketManager.off('contacts_imported', handleContactsImported);
      websocketManager.off('whatsapp_status', handleWhatsappStatus);
      websocketManager.off('quick_send', handleQuickSend);
      
      websocketManager.disconnect();
      isInitialized.current = false;
    };
  }, [queryClient, toast]);

  return {
    isConnected: websocketManager.isConnected(),
    send: websocketManager.send.bind(websocketManager),
    on: websocketManager.on.bind(websocketManager),
    off: websocketManager.off.bind(websocketManager),
  };
}

// Hook for specific event types
export function useWebSocketEvent(eventType: string, handler: WebSocketEventHandler) {
  useEffect(() => {
    websocketManager.on(eventType, handler);
    
    return () => {
      websocketManager.off(eventType, handler);
    };
  }, [eventType, handler]);
}
