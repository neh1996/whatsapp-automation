import { Card, CardContent } from "@/components/ui/card";
import { Send, CheckCircle, Users, Megaphone, TrendingUp, TrendingDown, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export default function StatsCards() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/stats'],
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Mensagens Hoje",
      value: stats?.messagesCount || 0,
      change: "+12% vs ontem",
      changeType: "positive" as const,
      icon: Send,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
    {
      title: "Taxa de Entrega",
      value: `${stats?.deliveryRate || 0}%`,
      change: "+2.1% vs semana",
      changeType: "positive" as const,
      icon: CheckCircle,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
    {
      title: "Contatos Ativos",
      value: (stats?.activeContacts || 0).toLocaleString(),
      change: "+157 novos",
      changeType: "positive" as const,
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      title: "Campanhas Ativas",
      value: stats?.activeCampaigns || 0,
      change: "3 agendadas",
      changeType: "neutral" as const,
      icon: Megaphone,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const ChangeIcon = card.changeType === "positive" ? TrendingUp : 
                          card.changeType === "negative" ? TrendingDown : Clock;
        
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {card.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {card.value}
                  </p>
                  <p className={`text-sm flex items-center mt-1 ${
                    card.changeType === "positive" ? "text-green-600 dark:text-green-400" :
                    card.changeType === "negative" ? "text-red-600 dark:text-red-400" :
                    "text-orange-600 dark:text-orange-400"
                  }`}>
                    <ChangeIcon className="w-3 h-3 mr-1" />
                    {card.change}
                  </p>
                </div>
                <div className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
