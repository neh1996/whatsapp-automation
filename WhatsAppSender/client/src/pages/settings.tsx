import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Smartphone, 
  QrCode, 
  Settings as SettingsIcon, 
  Bell, 
  Moon, 
  Sun, 
  Globe, 
  Shield,
  Wifi,
  WifiOff,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Settings() {
  const [sessionName, setSessionName] = useState("default");
  const [qrCodeVisible, setQrCodeVisible] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();

  const { data: whatsappStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['/api/whatsapp/status'],
    refetchInterval: 5000,
  });

  const connectMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/whatsapp/connect', { sessionName });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.qrCode) {
        setQrCodeVisible(true);
        toast({
          title: "QR Code gerado!",
          description: "Escaneie o QR Code com seu WhatsApp para conectar.",
        });
      } else if (data.connected) {
        toast({
          title: "WhatsApp conectado!",
          description: "Sua conta foi conectada com sucesso.",
        });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/whatsapp/status'] });
    },
    onError: () => {
      toast({
        title: "Erro de conexão",
        description: "Erro ao conectar com o WhatsApp. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/whatsapp/disconnect');
      return response.json();
    },
    onSuccess: () => {
      setQrCodeVisible(false);
      toast({
        title: "WhatsApp desconectado",
        description: "Sua conta foi desconectada com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/whatsapp/status'] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao desconectar. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Configurações</h1>
        <p className="text-gray-500 dark:text-gray-400">Gerencie suas preferências e conexões</p>
      </div>

      <Tabs defaultValue="whatsapp" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="account">Conta</TabsTrigger>
        </TabsList>
        
        <TabsContent value="whatsapp" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Smartphone className="w-5 h-5" />
                <span>Conexão WhatsApp</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Connection Status */}
              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  {whatsappStatus?.connected ? (
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  ) : (
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                  )}
                  <div>
                    <p className="font-medium">
                      {whatsappStatus?.connected ? "Conectado" : "Desconectado"}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {whatsappStatus?.connected 
                        ? "WhatsApp Web está ativo e funcionando"
                        : "Conecte seu WhatsApp para usar as funcionalidades"
                      }
                    </p>
                  </div>
                </div>
                
                <Badge variant={whatsappStatus?.connected ? "default" : "destructive"}>
                  {whatsappStatus?.connected ? (
                    <><Wifi className="w-3 h-3 mr-1" /> Online</>
                  ) : (
                    <><WifiOff className="w-3 h-3 mr-1" /> Offline</>
                  )}
                </Badge>
              </div>

              {/* Session Management */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="session">Nome da Sessão</Label>
                  <Input
                    id="session"
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                    placeholder="Ex: Minha Conta Principal"
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Use nomes diferentes para múltiplas contas
                  </p>
                </div>

                <div className="flex space-x-3">
                  {!whatsappStatus?.connected ? (
                    <Button 
                      onClick={() => connectMutation.mutate()}
                      disabled={connectMutation.isPending}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      {connectMutation.isPending ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <QrCode className="w-4 h-4 mr-2" />
                      )}
                      {connectMutation.isPending ? "Conectando..." : "Conectar WhatsApp"}
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => disconnectMutation.mutate()}
                      disabled={disconnectMutation.isPending}
                      variant="destructive"
                    >
                      {disconnectMutation.isPending ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <WifiOff className="w-4 h-4 mr-2" />
                      )}
                      {disconnectMutation.isPending ? "Desconectando..." : "Desconectar"}
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline"
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/whatsapp/status'] })}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Atualizar Status
                  </Button>
                </div>
              </div>

              {/* QR Code Display */}
              {(qrCodeVisible || whatsappStatus?.qrCode) && !whatsappStatus?.connected && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-semibold">Escaneie o QR Code</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      1. Abra o WhatsApp no seu celular<br/>
                      2. Toque em Mais opções ou Configurações<br/>
                      3. Toque em Aparelhos conectados<br/>
                      4. Toque em Conectar um aparelho<br/>
                      5. Aponte para esta tela para capturar o código
                    </p>
                    
                    <div className="flex justify-center">
                      {whatsappStatus?.qrCode ? (
                        <div className="p-4 bg-white rounded-lg">
                          <img 
                            src={whatsappStatus.qrCode} 
                            alt="QR Code WhatsApp" 
                            className="w-64 h-64"
                          />
                        </div>
                      ) : (
                        <div className="w-64 h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                          <QrCode className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Warning */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Importante:</strong> Mantenha esta aba aberta durante o uso. 
                  Fechar pode interromper o envio de mensagens em andamento.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <SettingsIcon className="w-5 h-5" />
                <span>Configurações Gerais</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Theme Settings */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Tema</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Escolha entre modo claro, escuro ou automático
                  </p>
                </div>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center space-x-2">
                        <Sun className="w-4 h-4" />
                        <span>Claro</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center space-x-2">
                        <Moon className="w-4 h-4" />
                        <span>Escuro</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center space-x-2">
                        <SettingsIcon className="w-4 h-4" />
                        <span>Sistema</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Language Settings */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Idioma</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Idioma da interface do aplicativo
                  </p>
                </div>
                <Select defaultValue="pt-br">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-br">
                      <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4" />
                        <span>Português (BR)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="en">
                      <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4" />
                        <span>English</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="es">
                      <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4" />
                        <span>Español</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Auto-save Settings */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Salvamento Automático</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Salvar automaticamente rascunhos de campanhas
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              {/* Message Delay Settings */}
              <div className="space-y-2">
                <Label>Intervalo entre Mensagens (segundos)</Label>
                <Input 
                  type="number" 
                  defaultValue="2" 
                  min="1" 
                  max="60"
                  className="w-32"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Tempo de espera entre cada envio para evitar bloqueios
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Notificações</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Notificações de Campanha</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Receber notificações quando campanhas forem concluídas
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Alertas de Erro</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Notificar sobre falhas no envio de mensagens
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Relatórios Diários</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Receber resumo diário das atividades
                  </p>
                </div>
                <Switch />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Som das Notificações</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Reproduzir som ao receber notificações
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Informações da Conta</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Nome</Label>
                  <Input defaultValue="João Silva" className="mt-2" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input defaultValue="joao@empresa.com" className="mt-2" />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Plano Atual</h3>
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium">Plano Pro</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        1.000 mensagens por mês
                      </p>
                    </div>
                    <Badge>Ativo</Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Mensagens utilizadas</span>
                      <span>850 / 1.000</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Segurança</h3>
                <Button variant="outline">
                  Alterar Senha
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
