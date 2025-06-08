import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Upload, Download, Search, MoreHorizontal, Trash2, Edit, Phone } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Contacts() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: contacts, isLoading } = useQuery({
    queryKey: ['/api/contacts'],
    refetchInterval: 10000,
  });

  const createContactMutation = useMutation({
    mutationFn: async (data: { name: string; phone: string }) => {
      const response = await apiRequest('POST', '/api/contacts', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Contato adicionado!",
        description: "O contato foi adicionado com sucesso.",
      });
      setShowCreateDialog(false);
      setContactName("");
      setContactPhone("");
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao adicionar contato.",
        variant: "destructive",
      });
    },
  });

  const importContactsMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/contacts/import', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Import failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Importação concluída!",
        description: `${data.imported} contatos importados com sucesso.`,
      });
      setShowImportDialog(false);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
    },
    onError: () => {
      toast({
        title: "Erro na importação",
        description: "Erro ao importar contatos. Verifique o formato do arquivo.",
        variant: "destructive",
      });
    },
  });

  const deleteContactMutation = useMutation({
    mutationFn: async (contactId: number) => {
      const response = await apiRequest('DELETE', `/api/contacts/${contactId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Contato removido",
        description: "O contato foi removido com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao remover contato.",
        variant: "destructive",
      });
    },
  });

  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    createContactMutation.mutate({ name: contactName, phone: contactPhone });
  };

  const handleImportContacts = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile) {
      importContactsMutation.mutate(selectedFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const filteredContacts = contacts?.filter((contact: any) =>
    contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone.includes(searchTerm)
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Contatos</h1>
          <p className="text-gray-500 dark:text-gray-400">Gerencie sua lista de contatos</p>
        </div>
        
        <div className="flex space-x-3">
          <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Importar CSV
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Importar Contatos</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleImportContacts} className="space-y-4">
                <div>
                  <Label htmlFor="file">Arquivo CSV</Label>
                  <Input
                    ref={fileInputRef}
                    id="file"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileSelect}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Formatos aceitos: CSV, Excel. Colunas: nome, telefone
                  </p>
                </div>
                
                {selectedFile && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <p className="text-sm">Arquivo selecionado: {selectedFile.name}</p>
                    <p className="text-xs text-gray-500">Tamanho: {(selectedFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                )}
                
                <div className="flex justify-end space-x-3">
                  <Button type="button" variant="outline" onClick={() => setShowImportDialog(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={importContactsMutation.isPending || !selectedFile}>
                    {importContactsMutation.isPending ? "Importando..." : "Importar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-green-500 hover:bg-green-600">
                <Plus className="w-4 h-4 mr-2" />
                Novo Contato
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Contato</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateContact} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Digite o nome do contato"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="Digite o telefone com DDD"
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createContactMutation.isPending}>
                    {createContactMutation.isPending ? "Adicionando..." : "Adicionar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Contatos ({filteredContacts.length})</CardTitle>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar contatos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
              ))}
            </div>
          ) : filteredContacts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Adicionado em</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.map((contact: any) => (
                  <TableRow key={contact.id}>
                    <TableCell className="font-medium">
                      {contact.name || 'Sem nome'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{contact.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={contact.isValid ? "default" : "destructive"}>
                        {contact.isValid ? "Válido" : "Inválido"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(contact.createdAt).toLocaleDateString('pt-BR')}
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
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => deleteContactMutation.mutate(contact.id)}
                            className="text-red-600"
                          >
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
              <Phone className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchTerm ? "Nenhum contato encontrado" : "Nenhum contato adicionado"}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {searchTerm 
                  ? "Tente usar outros termos de busca."
                  : "Comece adicionando seus primeiros contatos."
                }
              </p>
              {!searchTerm && (
                <div className="flex justify-center space-x-3">
                  <Button onClick={() => setShowCreateDialog(true)} className="bg-green-500 hover:bg-green-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Contato
                  </Button>
                  <Button variant="outline" onClick={() => setShowImportDialog(true)}>
                    <Upload className="w-4 h-4 mr-2" />
                    Importar CSV
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
