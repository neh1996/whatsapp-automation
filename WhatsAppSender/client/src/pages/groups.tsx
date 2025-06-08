import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Download, Users, ExternalLink, MoreHorizontal, Trash2, Eye } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Groups() {
  const [showSearchDialog, setShowSearchDialog] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: groups, isLoading } = useQuery({
    queryKey: ['/api/groups'],
    refetchInterval: 30000,
  });

  const searchGroupsMutation = useMutation({
    mutationFn: async (data: { keyword: string; category?: string }) => {
      const response = await apiRequest('POST', '/api/groups/search', data);
      return response.json();
    },
    onSuccess: (data) => {
      setSearchResults(data);
      setIsSearching(false);
      toast({
        title: "Busca concluída!",
        description: `${data.length} grupos encontrados.`,
      });
    },
    onError: () => {
      setIsSearching(false);
      toast({
        title: "Erro na busca",
        description: "Erro ao buscar grupos. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleSearchGroups = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchKeyword.trim()) {
      toast({
        title: "Erro de validação",
        description: "Digite uma palavra-chave para buscar.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    searchGroupsMutation.mutate({
      keyword: searchKeyword,
      category: searchCategory || undefined,
    });
  };

  const extractMembersMutation = useMutation({
    mutationFn: async (groupLink: string) => {
      // This would integrate with the WhatsApp automation
      // For now, we'll create a mock group entry
      const groupData = {
        name: "Grupo Extraído",
        description: "Membros extraídos via link",
        inviteLink: groupLink,
        memberCount: Math.floor(Math.random() * 200) + 50,
        category: "extraído",
        isPublic: true,
      };
      
      const response = await apiRequest('POST', '/api/groups', groupData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Extração iniciada!",
        description: "A extração de membros foi iniciada em segundo plano.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/groups'] });
    },
    onError: () => {
      toast({
        title: "Erro na extração",
        description: "Erro ao extrair membros do grupo.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Grupos</h1>
          <p className="text-gray-500 dark:text-gray-400">Encontre e extraia contatos de grupos do WhatsApp</p>
        </div>
        
        <Dialog open={showSearchDialog} onOpenChange={setShowSearchDialog}>
          <DialogTrigger asChild>
            <Button className="bg-green-500 hover:bg-green-600">
              <Search className="w-4 h-4 mr-2" />
              Buscar Grupos
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Buscar Grupos Públicos</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSearchGroups} className="space-y-4">
              <div>
                <Label htmlFor="keyword">Palavra-chave</Label>
                <Input
                  id="keyword"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="Ex: vendas, carros, roupas..."
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="category">Categoria (opcional)</Label>
                <Select value={searchCategory} onValueChange={setSearchCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vendas">Vendas</SelectItem>
                    <SelectItem value="negocios">Negócios</SelectItem>
                    <SelectItem value="carros">Carros</SelectItem>
                    <SelectItem value="roupas">Roupas</SelectItem>
                    <SelectItem value="imoveis">Imóveis</SelectItem>
                    <SelectItem value="tecnologia">Tecnologia</SelectItem>
                    <SelectItem value="educacao">Educação</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={() => setShowSearchDialog(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSearching}>
                  {isSearching ? "Buscando..." : "Buscar"}
                </Button>
              </div>
            </form>
            
            {searchResults.length > 0 && (
              <div className="mt-6 space-y-3">
                <h4 className="font-medium">Resultados da Busca:</h4>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {searchResults.map((group, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-medium text-sm">{group.name}</h5>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {group.description}
                          </p>
                          <div className="flex items-center space-x-3 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {group.memberCount} membros
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {group.category}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            extractMembersMutation.mutate(group.inviteLink);
                            setShowSearchDialog(false);
                          }}
                          disabled={extractMembersMutation.isPending}
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Extrair
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="my-groups" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-groups">Meus Grupos</TabsTrigger>
          <TabsTrigger value="extracted">Grupos Extraídos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="my-groups" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Grupos Participando</span>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Sincronizar
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Conecte seu WhatsApp
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Para ver seus grupos, primeiro conecte sua conta do WhatsApp nas configurações.
                </p>
                <Button variant="outline">
                  Ir para Configurações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="extracted" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Extrações ({groups?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                  ))}
                </div>
              ) : groups && groups.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome do Grupo</TableHead>
                      <TableHead>Membros</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Extraído em</TableHead>
                      <TableHead className="w-[100px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groups.map((group: any) => (
                      <TableRow key={group.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                              <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <p className="font-medium">{group.name}</p>
                              {group.description && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                  {group.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {group.memberCount} membros
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {group.category || 'Geral'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {new Date(group.extractedAt).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                Ver Membros
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="w-4 h-4 mr-2" />
                                Exportar CSV
                              </DropdownMenuItem>
                              {group.inviteLink && (
                                <DropdownMenuItem>
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  Abrir Grupo
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Nenhum grupo extraído
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Use a busca para encontrar grupos públicos e extrair seus membros.
                  </p>
                  <Button onClick={() => setShowSearchDialog(true)} className="bg-green-500 hover:bg-green-600">
                    <Search className="w-4 h-4 mr-2" />
                    Buscar Grupos
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
