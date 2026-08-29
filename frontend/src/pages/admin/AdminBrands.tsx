import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { getUserFriendlyErrorMessage } from '@/lib/error-handler';
import { brandApi, Brand } from '@/lib/api/brand.api';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Edit, Plus, Search, Trash2, Award } from 'lucide-react';
import ImageUpload from '@/components/admin/ImageUpload';

/** A brand's colour is stored data, not a theme token — this is only the value
 *  a newly created brand starts from. */
const DEFAULT_BRAND_COLOR = '#F97316';

export default function AdminBrands() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isFormLoading, setIsFormLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    tag: '',
    tagline: '',
    primaryColor: DEFAULT_BRAND_COLOR,
    logo: '',
  });

  const { data: brands = [], isLoading, error } = useQuery({
    queryKey: ['brands'],
    queryFn: () => brandApi.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (brandId: string) => brandApi.delete(brandId),
    onSuccess: () => {
      toast({
        title: 'Brand deleted',
        description: 'Brand has been removed successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      setDeleteOpen(false);
      setSelectedBrand(null);
    },
    onError: (err: unknown) => {
      toast({
        title: 'Failed to delete brand',
        description: getUserFriendlyErrorMessage(err),
        variant: 'destructive',
      });
    },
  });

  const filteredBrands = brands.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.tag.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenForm = (brand?: Brand) => {
    setFormError(null);
    if (brand) {
      setSelectedBrand(brand);
      setFormData({
        name: brand.name,
        tag: brand.tag,
        tagline: brand.tagline || '',
        primaryColor: brand.primaryColor || DEFAULT_BRAND_COLOR,
        logo: brand.logo || '',
      });
    } else {
      setSelectedBrand(null);
      setFormData({
        name: '',
        tag: '',
        tagline: '',
        primaryColor: DEFAULT_BRAND_COLOR,
        logo: '',
      });
    }
    setFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim() || !formData.tag.trim()) {
      setFormError('Brand Name and 3-Letter Tag are required.');
      return;
    }

    setIsFormLoading(true);
    try {
      if (selectedBrand) {
        await brandApi.update(selectedBrand.id, {
          name: formData.name,
          tagline: formData.tagline,
          primaryColor: formData.primaryColor,
          logo: formData.logo,
        });
        toast({ title: 'Brand updated successfully' });
      } else {
        await brandApi.create({
          name: formData.name,
          tag: formData.tag.toUpperCase(),
          tagline: formData.tagline,
          primaryColor: formData.primaryColor,
          logo: formData.logo,
        });
        toast({ title: 'Brand created successfully' });
      }
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      setFormOpen(false);
    } catch (err: unknown) {
      setFormError(getUserFriendlyErrorMessage(err));
    } finally {
      setIsFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Brand Management</h1>
          <p className="text-sm text-muted-foreground">
            Define corporate brands, tags, colors, and logos for multi-brand POS setups.
          </p>
        </div>
        <Button onClick={() => handleOpenForm()} className="bg-primary hover:bg-primary text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Brand
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/70" />
            <Input
              placeholder="Search brands by name or 3-letter tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Content State */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertDescription>{getUserFriendlyErrorMessage(error)}</AlertDescription>
        </Alert>
      ) : filteredBrands.length === 0 ? (
        <Card className="p-12 text-center">
          <Award className="w-12 h-12 mx-auto text-muted-foreground/70 mb-3" />
          <h3 className="text-lg font-semibold text-foreground mb-1">No Brands Found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {search ? 'No brands match your search query.' : 'Create your first brand to link with branches.'}
          </p>
          <Button onClick={() => handleOpenForm()} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Brand
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBrands.map((brand) => (
            <Card
              key={brand.id}
              className="group relative overflow-hidden border-border hover:shadow-md transition-all"
            >
              {/* Brand Accent Bar */}
              <div
                className="h-2 w-full"
                style={{ backgroundColor: brand.primaryColor || DEFAULT_BRAND_COLOR }}
              />

              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                  {brand.logo ? (
                    <img src={brand.logo} alt={brand.name} className="w-10 h-10 rounded-lg object-contain bg-muted/40 border" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center font-bold text-foreground">
                      {brand.tag}
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-base font-bold text-foreground">
                      {brand.name}
                    </CardTitle>
                    <span className="inline-block mt-0.5 px-2 py-0.5 text-2xs font-bold uppercase rounded bg-info-subtle text-primary dark:bg-primary">
                      Tag: {brand.tag}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon"
            aria-label="Edit" onClick={() => handleOpenForm(brand)}>
                    <Edit className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
            aria-label="Delete"
                    onClick={() => {
                      setSelectedBrand(brand);
                      setDeleteOpen(true);
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-danger hover:text-danger-text" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="pt-2 text-xs text-muted-foreground space-y-1">
                {brand.tagline && <p className="italic">"{brand.tagline}"</p>}
                <div className="flex items-center gap-2 pt-2">
                  <span className="w-3 h-3 rounded-full border border-border" style={{ backgroundColor: brand.primaryColor || DEFAULT_BRAND_COLOR }} />
                  <span className="font-mono text-[11px]">{brand.primaryColor || DEFAULT_BRAND_COLOR}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedBrand ? 'Edit Brand' : 'Create New Brand'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 py-2">
            {formError && (
              <Alert variant="destructive">
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Brand Name *</label>
                <Input
                  placeholder="e.g. Crisp & Crumbs"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Tag (3-Letter Slug) *</label>
                <Input
                  placeholder="e.g. CC"
                  value={formData.tag}
                  maxLength={5}
                  onChange={(e) => setFormData({ ...formData, tag: e.target.value.toUpperCase() })}
                  disabled={!!selectedBrand}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Tagline</label>
              <Input
                placeholder="e.g. Crispy. Always."
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Primary Theme Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="h-9 w-12 cursor-pointer rounded border border-border p-1"
                />
                <Input
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  placeholder={DEFAULT_BRAND_COLOR}
                  className="font-mono text-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <ImageUpload
                label="Brand Logo"
                value={formData.logo}
                onChange={(url) => setFormData({ ...formData, logo: url })}
                module="brands"
              />
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isFormLoading} className="bg-primary text-white hover:bg-primary">
                {isFormLoading ? 'Saving...' : selectedBrand ? 'Update Brand' : 'Create Brand'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Brand</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete <strong className="text-foreground">{selectedBrand?.name}</strong>?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => selectedBrand && deleteMutation.mutate(selectedBrand.id)}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Brand'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
