import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Send, Image, FileText, Smile, Users } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function MessageComposer() {
  const [recipients, setRecipients] = useState("");
  const [message, setMessage] = useState("");
  const [scheduled, setScheduled] = useState(false);
  const [scheduledTime, setScheduledTime] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sendMutation = useMutation({
    mutationFn: async (data: { phones: string; message: string; scheduled?: string }) => {
      const response = await apiRequest('POST', '/api/send-quick', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Mensagem enviada!",
        description: "Sua mensagem foi enviada com sucesso.",
      });
      setRecipients("");
      setMessage("");
      setScheduled(false);
      setScheduledTime("");
      
      // Refresh stats and activities
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
    },
    onError: () => {
      toast({
        title: "Erro ao enviar",
        description: "Houve um erro ao enviar a mensagem. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recipients.trim()) {
      toast({
        title: "Erro de validação",
        description: "Por favor, adicione pelo menos um destinatário.",
        variant: "destructive",
      });
      return;
    }
    
    if (!message.trim()) {
      toast({
        title: "Erro de validação",
        description: "Por favor, digite uma mensagem.",
        variant: "destructive",
      });
      return;
    }

    const data: any = {
      phones: recipients,
      message,
    };

    if (scheduled && scheduledTime) {
      data.scheduled = scheduledTime;
    }

    sendMutation.mutate(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Envio Rápido</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Recipients */}
          <div>
            <Label htmlFor="recipients" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Destinatários
            </Label>
            <div className="relative mt-2">
              <Input
                id="recipients"
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                placeholder="Digite os números separados por vírgula ou selecione uma lista"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <Users className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Message */}
          <div>
            <Label htmlFor="message" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Mensagem
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite sua mensagem aqui... Use {nome} para personalizar"
              rows={4}
              className="mt-2 resize-none"
            />
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-4">
                <Button type="button" variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <Image className="w-4 h-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <FileText className="w-4 h-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <Smile className="w-4 h-4" />
                </Button>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {message.length}/1000
              </span>
            </div>
          </div>

          {/* Schedule Options */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="schedule"
                  checked={scheduled}
                  onCheckedChange={(checked) => {
                    setScheduled(checked as boolean);
                    if (checked && !scheduledTime) {
                      const now = new Date();
                      now.setHours(now.getHours() + 1);
                      setScheduledTime(now.toISOString().slice(0, 16));
                    }
                  }}
                />
                <Label htmlFor="schedule" className="text-sm text-gray-700 dark:text-gray-300">
                  Agendar
                </Label>
              </div>
              <Input
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                disabled={!scheduled}
                className="px-3 py-1 text-sm"
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <Button type="button" variant="ghost" className="text-sm font-medium">
                Salvar Modelo
              </Button>
              <Button 
                type="submit" 
                disabled={sendMutation.isPending}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <Send className="w-4 h-4 mr-2" />
                {sendMutation.isPending ? "Enviando..." : "Enviar Agora"}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
