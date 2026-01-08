'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { usePropertyService } from '@/hooks/usePropertyService';
import { Property, UpdatePropertyDto, PropertyType, PropertyStatus } from '@/lib/api/property';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const propertyService = usePropertyService();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [type, setType] = useState<PropertyType>(PropertyType.APARTMENT);
  const [price, setPrice] = useState<string>('');
  const [currency, setCurrency] = useState<string>('EUR');
  const [street, setStreet] = useState<string>('');
  const [postalCode, setPostalCode] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [region, setRegion] = useState<string>('');
  const [country, setCountry] = useState<string>('France');
  const [status, setStatus] = useState<PropertyStatus>(PropertyStatus.DRAFT);
  const [mediaUrls, setMediaUrls] = useState<string[]>(['']);
  
  // Translation (French by default, first translation)
  const [language, setLanguage] = useState<string>('fr');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated && propertyId) {
      loadProperty();
    }
  }, [isAuthenticated, propertyId]);

  const loadProperty = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const property = await propertyService.findOne(propertyId);
      
      // Populate form
      setType(property.type);
      setPrice(property.price.toString());
      setCurrency(property.currency);
      setStreet(property.street || '');
      setPostalCode(property.postalCode || '');
      setCity(property.city || '');
      setRegion(property.region || '');
      setCountry(property.country || 'France');
      setStatus(property.status);
      setMediaUrls(property.mediaUrls && property.mediaUrls.length > 0 ? property.mediaUrls : ['']);
      
      // First translation
      if (property.translations && property.translations.length > 0) {
        const mainTrans = property.translations[0];
        setLanguage(mainTrans.language);
        setTitle(mainTrans.title);
        setDescription(mainTrans.description || '');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement de la propriété');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMediaUrl = () => {
    setMediaUrls([...mediaUrls, '']);
  };

  const handleMediaUrlChange = (index: number, value: string) => {
    const newUrls = [...mediaUrls];
    newUrls[index] = value;
    setMediaUrls(newUrls);
  };

  const handleRemoveMediaUrl = (index: number) => {
    if (mediaUrls.length > 1) {
      setMediaUrls(mediaUrls.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const updateData: UpdatePropertyDto = {
        type,
        price: parseFloat(price),
        currency,
        street: street || undefined,
        postalCode: postalCode || undefined,
        city: city || undefined,
        region: region || undefined,
        country: country || undefined,
        mediaUrls: mediaUrls.filter(url => url.trim() !== ''),
        translations: [
          {
            language,
            title,
            description: description || undefined,
          },
        ],
        status,
      };

      await propertyService.update(propertyId, updateData);
      router.push(`/properties/${propertyId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour de la propriété');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-lg">Chargement...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-6">
            <Link href={`/properties/${propertyId}`} className="text-sm text-[var(--color-muted)] hover:underline">
              ← Retour à la propriété
            </Link>
            <h1 className="mt-4 text-3xl font-semibold text-[var(--color-primary)]">
              Modifier la Propriété
            </h1>
          </div>

          {error && (
            <Card className="mb-6 border-red-500 bg-red-50">
              <CardContent className="pt-6">
                <p className="text-red-700">{error}</p>
              </CardContent>
            </Card>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Type et Prix */}
              <Card>
                <CardHeader>
                  <CardTitle>Informations de base</CardTitle>
                  <CardDescription>Type de propriété et prix</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="type">Type de propriété *</Label>
                    <Select id="type" value={type} onChange={(e) => setType(e.target.value as PropertyType)} required>
                      <option value={PropertyType.APARTMENT}>Appartement</option>
                      <option value={PropertyType.HOUSE}>Maison</option>
                      <option value={PropertyType.VILLA}>Villa</option>
                      <option value={PropertyType.LAND}>Terrain</option>
                      <option value={PropertyType.COMMERCIAL}>Commercial</option>
                      <option value={PropertyType.OTHER}>Autre</option>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Prix *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="currency">Devise</Label>
                      <Select id="currency" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                        <option value="EUR">EUR (€)</option>
                        <option value="USD">USD ($)</option>
                        <option value="GBP">GBP (£)</option>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="status">Statut</Label>
                    <Select id="status" value={status} onChange={(e) => setStatus(e.target.value as PropertyStatus)}>
                      <option value={PropertyStatus.DRAFT}>Brouillon</option>
                      <option value={PropertyStatus.REVIEW}>En révision</option>
                      <option value={PropertyStatus.LISTED}>Publiée</option>
                      <option value={PropertyStatus.ARCHIVED}>Archivée</option>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Adresse */}
              <Card>
                <CardHeader>
                  <CardTitle>Adresse</CardTitle>
                  <CardDescription>L'adresse sera géocodée automatiquement</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="street">Rue</Label>
                    <Input
                      id="street"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="10 Rue Exemple"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="postalCode">Code postal</Label>
                      <Input
                        id="postalCode"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="75001"
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">Ville</Label>
                      <Input
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Paris"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="region">Région</Label>
                      <Input
                        id="region"
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        placeholder="Île-de-France"
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Pays</Label>
                      <Input
                        id="country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="France"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                  <CardDescription>Informations multilingues sur la propriété</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="language">Langue *</Label>
                    <Select id="language" value={language} onChange={(e) => setLanguage(e.target.value)} required>
                      <option value="fr">Français</option>
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="de">Deutsch</option>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="title">Titre *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={6}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Médias */}
              <Card>
                <CardHeader>
                  <CardTitle>Médias</CardTitle>
                  <CardDescription>URLs des images de la propriété</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mediaUrls.map((url, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        type="url"
                        value={url}
                        onChange={(e) => handleMediaUrlChange(index, e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="flex-1"
                      />
                      {mediaUrls.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveMediaUrl(index)}
                        >
                          Supprimer
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddMediaUrl}
                  >
                    + Ajouter une URL
                  </Button>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-4">
                <Link href={`/properties/${propertyId}`}>
                  <Button type="button" variant="outline">
                    Annuler
                  </Button>
                </Link>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}

