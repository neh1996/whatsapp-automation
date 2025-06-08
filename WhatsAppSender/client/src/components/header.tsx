import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Moon, Sun, Menu } from "lucide-react";
import { useTheme } from "next-themes";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const { data: whatsappStatus } = useQuery({
    queryKey: ['/api/whatsapp/status'],
    refetchInterval: 10000,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={onMenuClick}
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Visão geral das suas campanhas de marketing
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* WhatsApp Connection Status */}
            <div className="flex items-center space-x-2">
              {whatsappStatus?.connected ? (
                <>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <Badge variant="secondary" className="text-green-600 dark:text-green-400">
                    WhatsApp Conectado
                  </Badge>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <Badge variant="destructive">
                    WhatsApp Desconectado
                  </Badge>
                </>
              )}
            </div>
            
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </Button>
            
            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-green-500 text-white text-sm font-medium">
                  JS
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white">João Silva</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">joao@empresa.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
