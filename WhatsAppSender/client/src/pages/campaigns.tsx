import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Send, Calendar, MoreHorizontal, Play, Pause, Edit, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Campaigns() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [campaignMessage, setCampaignMessage] = useState("");
  const [usePersonalization, setUsePersonalization] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['/api/campaigns'],
    refetchInterval: 10000,
  });

  const { data: contacts } = useQuery({
    queryKey: ['/api/contacts'],
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/campaigns', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Campanha criada!",
        description: "Sua campanha foi criada com sucesso.",
      });
      setShowCreateDialog(false);
      setCampaignName("");
      setCampaignMessage("");
      setUsePersonalization(false);
      setScheduleDate("");
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar campanha.",
        variant: "destructive",
      });
    },
  });

  const sendCampaignMutation = useMutation({
    mutationFn: async ({ campaignId, recipients }: { campaignId: number; recipients?: any[] }) => {
      const response = await apiRequest('POST', `/api/campaigns/${campaignId}/send`, { recipients });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Campanha iniciada!",
        description: "Sua campanha está sendo enviada.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao enviar campanha.",
        variant: "destructive",
      });
    },
  });

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      name: campaignName,
      message: campaignMessage,
      personalization: usePersonalization,
      status: scheduleDate ? 'scheduled' : 'draft',
      scheduledAt: scheduleDate ? new Date(scheduleDate).toISOString() : null,
    };

    createCampaignMutation.mutate(data);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      draft: { variant: "secondary", label: "Rascunho" },
      scheduled: { variant: "outline", label: "Agendada" },
      sending: { variant: "default", label: "Enviando" },
      completed: { variant: "default", label: "Concluída" },
      failed: { variant: "destructive", label: "Falhou" },
    };
    
    return variants[status] || { variant: "secondary", label: status };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Campanhas</h1>
          <p className="text-gray-500 dark:text-gray-400">Gerencie suas campanhas de envio em massa</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-green-500 hover:bg-green-600">
              <Plus className="w-4 h-4 mr-2" />
              Nova Campanha
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Criar Nova Campanha</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome da Campanha</Label>
                <Input
                  id="name"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="Digite o nome da campanha"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="message">Mensagem</Label>
                <Textarea
                  id="message"
                  value={campaignMessage}
                  onChange={(e) => setCampaignMessage(e.target.value)}
                  placeholder="Digite sua mensagem aqui..."
                  rows={4}
                  required
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="personalization"
                  checked={usePersonalization}
                  onCheckedChange={(checked) => setUsePersonalization(checked as boolean)}
                />
                <Label htmlFor="personalization" className="text-sm">
                  Usar personalização com {'{nome}'}
                </Label>
              </div>
              
              <div>
                <Label htmlFor="schedule">Agendar para (opcional)</Label>
                <Input
                  id="schedule"
                  type="datetime-local"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createCampaignMutation.isPending}>
                  {createCampaignMutation.isPending ? "Criando..." : "Criar Campanha"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Suas Campanhas</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
              ))}
            </div>
          ) : campaigns && campaigns.length > 0 ? (
            <div className="space-y-4">
              {campaigns.map((campaign: any) => {
                const statusBadge = getStatusBadge(campaign.status);
                const deliveryRate = campaign.totalRecipients > 0 
                  ? ((campaign.deliveredCount / campaign.totalRecipients) * 100).toFixed(1)
                  : 0;
                
                return (
                  <div key={campaign.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {campaign.name}
                          </h3>
                          <Badge variant={statusBadge.variant}>
                            {statusBadge.label}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {campaign.message}
                        </p>
                        
                        <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                          <span>📊 {campaign.totalRecipients || 0} destinatários</span>
                          <span>✅ {campaign.deliveredCount || 0} entregues</span>
                          <span>❌ {campaign.failedCount || 0} falharam</span>
                          <span>📈 {deliveryRate}% taxa de entrega</span>
                          <span>📅 {formatDistanceToNow(new Date(campaign.createdAt), { addSuffix: true, locale: ptBR })}</span>
                        </div>
                        
                        {campaign.scheduledAt && (
                          <div className="mt-2 text-sm text-orange-600 dark:text-orange-400">
                            🕒 Agendada para {new Date(campaign.scheduledAt).toLocaleString('pt-BR')}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {campaign.status === 'draft' && (
                          <Button
                            size="sm"
                            onClick={() => sendCampaignMutation.mutate({ campaignId: campaign.id })}
                            disabled={sendCampaignMutation.isPending}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            <Send className="w-4 h-4 mr-1" />
                            Enviar
                          </Button>
                        )}
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Calendar className="w-4 h-4 mr-2" />
                              Ver Relatório
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    
                    {/* Progress bar for sending campaigns */}
                    {campaign.status === 'sending' && campaign.totalRecipients > 0 && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                          <span>Progresso do envio</span>
                          <span>{((campaign.sentCount + campaign.failedCount) / campaign.totalRecipients * 100).toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${((campaign.sentCount + campaign.failedCount) / campaign.totalRecipients) * 100}%` 
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Send className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Nenhuma campanha criada
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Comece criando sua primeira campanha de envio em massa.
              </p>
              <Button onClick={() => setShowCreateDialog(true)} className="bg-green-500 hover:bg-green-600">
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Campanha
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
