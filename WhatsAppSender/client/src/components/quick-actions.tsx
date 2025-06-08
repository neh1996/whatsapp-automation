import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, Upload, CalendarPlus, Search } from "lucide-react";

interface QuickActionsProps {
  onQuickSend?: () => void;
  onImportContacts?: () => void;
  onNewCampaign?: () => void;
  onSearchGroups?: () => void;
}

export default function QuickActions({
  onQuickSend,
  onImportContacts,
  onNewCampaign,
  onSearchGroups,
}: QuickActionsProps) {
  const actions = [
    {
      title: "Envio Rápido",
      description: "Mensagem instantânea",
      icon: Send,
      onClick: onQuickSend,
      color: "bg-green-50 dark:bg-green-900/10 hover:bg-green-100 dark:hover:bg-green-900/20",
      iconColor: "bg-green-500",
    },
    {
      title: "Importar Contatos",
      description: "CSV, Excel, Sheets",
      icon: Upload,
      onClick: onImportContacts,
      color: "bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/20",
      iconColor: "bg-blue-500",
    },
    {
      title: "Nova Campanha",
      description: "Agendar envios",
      icon: CalendarPlus,
      onClick: onNewCampaign,
      color: "bg-purple-50 dark:bg-purple-900/10 hover:bg-purple-100 dark:hover:bg-purple-900/20",
      iconColor: "bg-purple-500",
    },
    {
      title: "Buscar Grupos",
      description: "Encontrar audiência",
      icon: Search,
      onClick: onSearchGroups,
      color: "bg-orange-50 dark:bg-orange-900/10 hover:bg-orange-100 dark:hover:bg-orange-900/20",
      iconColor: "bg-orange-500",
    },
  ];

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                variant="ghost"
                className={`flex items-center p-4 h-auto ${action.color} transition-colors group`}
                onClick={action.onClick}
              >
                <div className={`w-10 h-10 ${action.iconColor} rounded-lg flex items-center justify-center mr-3 group-hover:scale-105 transition-transform`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white">{action.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{action.description}</p>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
