'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery, useMutation } from '@apollo/client';
import {
  Plus, Search, Filter, Calendar, Eye, Edit, Trash2,
  Clock, CheckCircle, XCircle, AlertCircle, Image as ImageIcon,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { GET_NEWS, DELETE_NEWS, type News } from '@/lib/graphql/news';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const categories = [
  { value: 'all', label: 'Todas las categorías' },
  { value: 'general', label: 'General' },
  { value: 'eventos', label: 'Eventos' },
  { value: 'deportes', label: 'Deportes' },
  { value: 'actividades', label: 'Actividades' },
  { value: 'importante', label: 'Importante' },
];

const priorities = [
  { value: 'all', label: 'Todas las prioridades' },
  { value: 'low', label: 'Baja' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'Alta' },
  { value: 'urgent', label: 'Urgente' },
];

export default function NewsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [deleteNewsId, setDeleteNewsId] = useState<string | null>(null);

  // Default tenant ID - in production this should come from user context or environment
  const tenantId = user?.tenantId || 'default-tenant';

  // Fetch news
  const { data, loading, error, refetch } = useQuery(GET_NEWS, {
    variables: {
      tenantId,
      filter: searchTerm || undefined,
    },
    skip: !tenantId,
  });

  // Delete mutation
  const [deleteNewsMutation, { loading: deleting }] = useMutation(DELETE_NEWS, {
    onCompleted: () => {
      toast({
        title: 'Noticia eliminada',
        description: 'La noticia ha sido eliminada exitosamente.',
      });
      setDeleteNewsId(null);
      refetch();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la noticia: ' + error.message,
        variant: 'destructive',
      });
    },
  });

  // Filter news
  const filteredNews = (data?.news || []).filter((news: News) => {
    const matchesCategory = categoryFilter === 'all' || news.category === categoryFilter;
    const matchesPriority = priorityFilter === 'all' || news.priority === priorityFilter;
    return matchesCategory && matchesPriority;
  });

  const getStatusBadge = (news: News) => {
    if (!news.isPublished) {
      return <Badge variant="secondary"><Edit className="h-3 w-3 mr-1" />Borrador</Badge>;
    }
    if (news.publishedAt && new Date(news.publishedAt) > new Date()) {
      return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />Programado</Badge>;
    }
    if (news.expiresAt && new Date(news.expiresAt) < new Date()) {
      return <Badge variant="secondary"><XCircle className="h-3 w-3 mr-1" />Expirado</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Publicado</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-gray-100 text-gray-800',
      normal: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800',
    };
    const label = priorities.find(p => p.value === priority)?.label || priority;
    return <Badge className={colors[priority] || ''}>{label}</Badge>;
  };

  const getCategoryBadge = (category: string) => {
    const categoryData = categories.find(c => c.value === category);
    return <Badge variant="outline">{categoryData?.label || category}</Badge>;
  };

  const handleDelete = async () => {
    if (!deleteNewsId) return;
    await deleteNewsMutation({
      variables: {
        id: deleteNewsId,
        tenantId,
      },
    });
  };

  const publishedNewsCount = filteredNews.filter((n: News) => n.isPublished).length;
  const draftNewsCount = filteredNews.filter((n: News) => !n.isPublished).length;

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-muted-foreground">Error al cargar las noticias</p>
            <p className="text-sm text-red-500 mt-2">{error.message}</p>
            <Button onClick={() => refetch()} className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Noticias</h1>
          <p className="text-muted-foreground">
            Gestiona las noticias y comunicados del colegio
          </p>
        </div>
        <Link href="/dashboard/news/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Noticia
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Noticias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredNews.length}</div>
            <p className="text-xs text-muted-foreground">
              {publishedNewsCount} publicadas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Publicadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publishedNewsCount}</div>
            <p className="text-xs text-muted-foreground">
              Actualmente visibles
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Borradores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draftNewsCount}</div>
            <p className="text-xs text-muted-foreground">
              Pendientes de publicar
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Última actualización</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : 'Ahora'}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              disabled={loading}
              className="text-xs p-0 h-auto mt-1"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar noticias..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {priorities.map(priority => (
                  <SelectItem key={priority.value} value={priority.value}>
                    {priority.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200" />
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* News Grid */}
      {!loading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredNews.map((news: News) => (
            <Card key={news.id} className="overflow-hidden">
              {news.imageUrl && (
                <div className="relative h-48 bg-gray-100">
                  <img
                    src={news.imageUrl}
                    alt={news.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <ImageIcon className="absolute inset-0 m-auto h-12 w-12 text-gray-400" />
                </div>
              )}
              <CardHeader>
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="line-clamp-2">{news.title}</CardTitle>
                    <div className="flex gap-2 flex-wrap">
                      {getStatusBadge(news)}
                      {news.priority && getPriorityBadge(news.priority)}
                      {news.category && getCategoryBadge(news.category)}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        •••
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/news/${news.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/news/${news.id}/edit`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => setDeleteNewsId(news.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="line-clamp-3">
                  {news.summary || news.content}
                </CardDescription>
              </CardContent>
              <CardFooter className="text-sm text-muted-foreground">
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {news.authorName?.[0] || 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <span>{news.authorName || 'Admin'}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    {news.publishedAt && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(news.publishedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredNews.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No se encontraron noticias</p>
            {(categoryFilter !== 'all' || priorityFilter !== 'all' || searchTerm) && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setCategoryFilter('all');
                  setPriorityFilter('all');
                  setSearchTerm('');
                }}
              >
                Limpiar filtros
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteNewsId} onOpenChange={() => setDeleteNewsId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La noticia será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}