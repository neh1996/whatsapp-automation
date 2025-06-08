import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export default function Schedule() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Agendamentos</h1>
        <p className="text-gray-500 dark:text-gray-400">Gerencie suas campanhas agendadas</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Página em Desenvolvimento
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
            A funcionalidade de agendamentos está sendo desenvolvida. Em breve você poderá agendar suas campanhas de forma avançada.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
