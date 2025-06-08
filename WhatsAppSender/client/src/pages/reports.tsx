import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Download, Calendar, MessageSquare, TrendingUp, TrendingDown, Users, Send } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

export default function Reports() {
  const [timeRange, setTimeRange] = useState("7d");
  const [selectedCampaign, setSelectedCampaign] = useState<string>("all");

  const { data: campaigns } = useQuery({
    queryKey: ['/api/campaigns'],
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/stats'],
    refetchInterval: 30000,
  });

  // Mock data for demonstration - in real implementation this would come from API
  const performanceData = {
    totalMessages: 15420,
    delivered: 14568,
    read: 12245,
    failed: 852,
    deliveryRate: 94.5,
    readRate: 84.1,
    errorRate: 5.5,
  };

  const campaignMetrics = campaigns?.map((campaign: any) => ({
    ...campaign,
    deliveryRate: campaign.totalRecipients > 0 ? (campaign.deliveredCount / campaign.totalRecipients * 100) : 0,
    readRate: campaign.totalRecipients > 0 ? (campaign.readCount / campaign.totalRecipients * 100) : 0,
    errorRate: campaign.totalRecipients > 0 ? (campaign.failedCount / campaign.totalRecipients * 100) : 0,
  })) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 dark:text-green-400';
      case 'sending': return 'text-blue-600 dark:text-blue-400';
      case 'scheduled': return 'text-orange-600 dark:text-orange-400';
      case 'failed': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Relatórios</h1>
          <p className="text-gray-500 dark:text-gray-400">Análise detalhada do desempenho das suas campanhas</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Últimas 24h</SelectItem>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 3 meses</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Enviadas</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {performanceData.totalMessages.toLocaleString()}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +15% vs período anterior
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Send className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Taxa de Entrega</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {performanceData.deliveryRate}%
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +2.3% vs período anterior
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Taxa de Leitura</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {performanceData.readRate}%
                </p>
                <p className="text-sm text-orange-600 dark:text-orange-400 flex items-center mt-1">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  -1.2% vs período anterior
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Taxa de Erro</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {performanceData.errorRate}%
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  -0.8% vs período anterior
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="campaigns">Por Campanha</TabsTrigger>
          <TabsTrigger value="timeline">Linha do Tempo</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Performance das Mensagens</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">Gráfico de Performance</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Integração com biblioteca de gráficos
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Entregas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Entregues</span>
                    <span className="text-sm font-medium">{performanceData.delivered.toLocaleString()}</span>
                  </div>
                  <Progress value={94.5} className="h-2" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Lidas</span>
                    <span className="text-sm font-medium">{performanceData.read.toLocaleString()}</span>
                  </div>
                  <Progress value={84.1} className="h-2" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Falharam</span>
                    <span className="text-sm font-medium">{performanceData.failed.toLocaleString()}</span>
                  </div>
                  <Progress value={5.5} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Desempenho por Campanha</CardTitle>
                <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Todas as campanhas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as campanhas</SelectItem>
                    {campaigns?.map((campaign: any) => (
                      <SelectItem key={campaign.id} value={campaign.id.toString()}>
                        {campaign.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {campaignMetrics.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campanha</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Destinatários</TableHead>
                      <TableHead>Entregues</TableHead>
                      <TableHead>Taxa de Entrega</TableHead>
                      <TableHead>Taxa de Leitura</TableHead>
                      <TableHead>Criada em</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaignMetrics.map((campaign: any) => (
                      <TableRow key={campaign.id}>
                        <TableCell className="font-medium">
                          {campaign.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            campaign.status === 'completed' ? 'default' :
                            campaign.status === 'sending' ? 'secondary' :
                            campaign.status === 'failed' ? 'destructive' : 'outline'
                          }>
                            {campaign.status === 'completed' ? 'Concluída' :
                             campaign.status === 'sending' ? 'Enviando' :
                             campaign.status === 'scheduled' ? 'Agendada' :
                             campaign.status === 'failed' ? 'Falhou' : 'Rascunho'}
                          </Badge>
                        </TableCell>
                        <TableCell>{campaign.totalRecipients || 0}</TableCell>
                        <TableCell>{campaign.deliveredCount || 0}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm ${getStatusColor(campaign.status)}`}>
                              {campaign.deliveryRate.toFixed(1)}%
                            </span>
                            <Progress value={campaign.deliveryRate} className="w-12 h-2" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm ${getStatusColor(campaign.status)}`}>
                              {campaign.readRate.toFixed(1)}%
                            </span>
                            <Progress value={campaign.readRate} className="w-12 h-2" />
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {new Date(campaign.createdAt).toLocaleDateString('pt-BR')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Nenhuma campanha encontrada
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Crie campanhas para ver relatórios detalhados aqui.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Atividade Recente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Timeline em Desenvolvimento
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  A visualização da linha do tempo estará disponível em breve.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
