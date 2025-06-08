import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Send, 
  Users, 
  Calendar, 
  MessageSquare, 
  BarChart3, 
  Settings,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Envio em Massa', href: '/campaigns', icon: Send },
  { name: 'Contatos', href: '/contacts', icon: Users },
  { name: 'Agendamentos', href: '/schedule', icon: Calendar },
  { name: 'Grupos', href: '/groups', icon: MessageSquare },
  { name: 'Relatórios', href: '/reports', icon: BarChart3 },
  { name: 'Configurações', href: '/settings', icon: Settings },
];

export default function Sidebar({ open, onClose }: SidebarProps) {
  const [location] = useLocation();
  
  const { data: stats } = useQuery({
    queryKey: ['/api/stats'],
    refetchInterval: 30000,
  });

  const usagePercentage = stats ? (stats.messagesUsed / stats.messagesLimit) * 100 : 0;

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div 
          className="fixed inset-0 z-40 lg:hidden bg-black bg-opacity-50"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white">WA Marketing Pro</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Automação Profissional</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 mt-6 px-3">
            <div className="space-y-1">
              {navigation.map((item) => {
                const isActive = location === item.href;
                const Icon = item.icon;
                
                return (
                  <Link key={item.name} href={item.href}>
                    <a
                      className={cn(
                        "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                        isActive
                          ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      )}
                      onClick={onClose}
                    >
                      <Icon className={cn(
                        "mr-3 flex-shrink-0 h-5 w-5",
                        isActive ? "text-green-500" : "text-gray-400"
                      )} />
                      {item.name}
                    </a>
                  </Link>
                );
              })}
            </div>
            
            {/* Plan Usage */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="px-3 mb-4">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Plano Atual
                </h3>
                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-400">Pro</span>
                    <span className="text-xs text-blue-600 dark:text-blue-400">
                      {Math.round(usagePercentage)}% usado
                    </span>
                  </div>
                  <Progress 
                    value={usagePercentage} 
                    className="mt-2 h-1"
                  />
                  <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                    {stats?.messagesUsed || 0}/{stats?.messagesLimit || 0} mensagens
                  </p>
                </div>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
