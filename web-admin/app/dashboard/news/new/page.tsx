'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Save, Send, Clock, Image as ImageIcon, Calendar,
  FileText, Tag, User, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import toast from 'react-hot-toast';

// Importar el editor dinámicamente para evitar problemas de SSR
const RichTextEditor = dynamic(() => import('@/components/editor/RichTextEditor'), {
  ssr: false,
  loading: () => <div className="border rounded-md p-4 min-h-[300px] bg-muted/10">Cargando editor...</div>,
});

export default function NewNewsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [publishType, setPublishType] = useState<'now' | 'schedule' | 'draft'>('now');

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'general',
    featured: false,
    allowComments: true,
    notifyUsers: false,
    scheduledDate: '',
    scheduledTime: '',
    imageUrl: '',
    tags: '',
    author: 'Admin', // Por defecto, se tomaría del usuario logueado
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validaciones
      if (!formData.title.trim()) {
        throw new Error('El título es requerido');
      }
      if (!formData.excerpt.trim()) {
        throw new Error('El resumen es requerido');
      }
      if (!formData.content.trim()) {
        throw new Error('El contenido es requerido');
      }

      // Preparar datos para enviar
      const dataToSend = {
        ...formData,
        status: publishType === 'draft' ? 'draft' : publishType === 'now' ? 'published' : 'scheduled',
        publishedAt: publishType === 'now' ? new Date().toISOString() : null,
        scheduledFor: publishType === 'schedule'
          ? new Date(`${formData.scheduledDate}T${formData.scheduledTime}`).toISOString()
          : null,
      };

      console.log('Creating news:', dataToSend);

      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success(
        publishType === 'draft'
          ? 'Borrador guardado exitosamente'
          : publishType === 'now'
          ? 'Noticia publicada exitosamente'
          : 'Noticia programada exitosamente'
      );

      router.push('/news');
    } catch (error: any) {
      console.error('Error creating news:', error);
      toast.error(error.message || 'Error al crear la noticia');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/news">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Nueva Noticia</h1>
            <p className="text-muted-foreground">
              Crea una nueva noticia para el colegio
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información básica */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <FileText className="h-5 w-5 inline-block mr-2" />
                  Información Básica
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="Título de la noticia"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="excerpt">Resumen *</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => handleChange('excerpt', e.target.value)}
                    placeholder="Breve descripción de la noticia (máx. 200 caracteres)"
                    rows={3}
                    maxLength={200}
                    required
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {formData.excerpt.length}/200
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Contenido *</Label>
                  <RichTextEditor
                    content={formData.content}
                    onChange={(content) => handleChange('content', content)}
                    placeholder="Escribe el contenido de la noticia..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Imagen */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <ImageIcon className="h-5 w-5 inline-block mr-2" />
                  Imagen Destacada
                </CardTitle>
                <CardDescription>
                  Añade una imagen para hacer la noticia más atractiva
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  {formData.imageUrl ? (
                    <div className="space-y-4">
                      <div className="relative h-48 bg-gray-100 rounded-md">
                        <ImageIcon className="absolute inset-0 m-auto h-12 w-12 text-gray-400" />
                      </div>
                      <Input
                        value={formData.imageUrl}
                        onChange={(e) => handleChange('imageUrl', e.target.value)}
                        placeholder="URL de la imagen"
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div>
                        <Button type="button" variant="outline">
                          Subir imagen
                        </Button>
                        <p className="text-sm text-muted-foreground mt-2">
                          o arrastra y suelta aquí
                        </p>
                      </div>
                      <Input
                        value={formData.imageUrl}
                        onChange={(e) => handleChange('imageUrl', e.target.value)}
                        placeholder="O pega una URL de imagen"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Columna lateral */}
          <div className="space-y-6">
            {/* Publicación */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <Send className="h-5 w-5 inline-block mr-2" />
                  Publicación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={publishType} onValueChange={(value: any) => setPublishType(value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="now" id="now" />
                    <Label htmlFor="now">Publicar ahora</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="schedule" id="schedule" />
                    <Label htmlFor="schedule">Programar publicación</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="draft" id="draft" />
                    <Label htmlFor="draft">Guardar como borrador</Label>
                  </div>
                </RadioGroup>

                {publishType === 'schedule' && (
                  <div className="space-y-2 pt-2">
                    <Label>Fecha y hora de publicación</Label>
                    <Input
                      type="date"
                      value={formData.scheduledDate}
                      onChange={(e) => handleChange('scheduledDate', e.target.value)}
                      required={publishType === 'schedule'}
                    />
                    <Input
                      type="time"
                      value={formData.scheduledTime}
                      onChange={(e) => handleChange('scheduledTime', e.target.value)}
                      required={publishType === 'schedule'}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Categorización */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <Tag className="h-5 w-5 inline-block mr-2" />
                  Categorización
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="eventos">Eventos</SelectItem>
                      <SelectItem value="deportes">Deportes</SelectItem>
                      <SelectItem value="actividades">Actividades</SelectItem>
                      <SelectItem value="importante">Importante</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Etiquetas</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => handleChange('tags', e.target.value)}
                    placeholder="Separadas por comas"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Opciones */}
            <Card>
              <CardHeader>
                <CardTitle>Opciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="featured">Noticia destacada</Label>
                  <Switch
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => handleChange('featured', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="comments">Permitir comentarios</Label>
                  <Switch
                    id="comments"
                    checked={formData.allowComments}
                    onCheckedChange={(checked) => handleChange('allowComments', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="notify">Notificar usuarios</Label>
                  <Switch
                    id="notify"
                    checked={formData.notifyUsers}
                    onCheckedChange={(checked) => handleChange('notifyUsers', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <Button type="button" variant="outline" asChild>
            <Link href="/news">Cancelar</Link>
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Vista previa
            </Button>
            <Button type="submit" disabled={isLoading}>
              {publishType === 'draft' ? (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Guardando...' : 'Guardar borrador'}
                </>
              ) : publishType === 'schedule' ? (
                <>
                  <Clock className="h-4 w-4 mr-2" />
                  {isLoading ? 'Programando...' : 'Programar'}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  {isLoading ? 'Publicando...' : 'Publicar'}
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}