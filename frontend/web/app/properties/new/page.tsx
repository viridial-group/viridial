'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { usePropertyService } from '@/hooks/usePropertyService';
import { CreatePropertyDto, PropertyType, PropertyStatus } from '@/lib/api/property';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function NewPropertyPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const propertyService = usePropertyService();
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
  const [mediaUrls, setMediaUrls] = useState<string[]>(['']);
  
  // Translation (French by default)
  const [language, setLanguage] = useState<string>('fr');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

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
      const propertyData: CreatePropertyDto = {
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
        status: PropertyStatus.DRAFT,
      };

      const property = await propertyService.create(propertyData);
      router.push(`/properties/${property.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création de la propriété');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-green-600 mb-4"></div>
          <div className="text-sm font-medium text-gray-700">Chargement...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <main className="flex flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8">
            <Link href="/properties" className="text-sm text-gray-500 hover:text-gray-700 font-medium inline-flex items-center gap-1 mb-4">
              ← Retour à la liste
            </Link>
            <h1 className="text-2xl font-semibold text-gray-900">
              Nouvelle Propriété
            </h1>
            <p className="mt-1.5 text-sm text-gray-500">
              Créez une nouvelle annonce immobilière
            </p>
          </div>

          {error && (
            <Card className="mb-6 border border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <p className="text-sm font-medium text-red-700">{error}</p>
              </CardContent>
            </Card>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              {/* Type et Prix */}
              <Card className="border border-gray-200 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900">Informations de base</CardTitle>
                  <CardDescription className="text-sm text-gray-500 mt-1">Type de propriété et prix</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  <div>
                    <Label htmlFor="type">Type de propriété *</Label>
                    <Select value={type} onValueChange={(value) => setType(value as PropertyType)}>
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Sélectionner un type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={PropertyType.APARTMENT}>Appartement</SelectItem>
                        <SelectItem value={PropertyType.HOUSE}>Maison</SelectItem>
                        <SelectItem value={PropertyType.VILLA}>Villa</SelectItem>
                        <SelectItem value={PropertyType.LAND}>Terrain</SelectItem>
                        <SelectItem value={PropertyType.COMMERCIAL}>Commercial</SelectItem>
                        <SelectItem value={PropertyType.OTHER}>Autre</SelectItem>
                      </SelectContent>
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
                        placeholder="250000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="currency">Devise</Label>
                      <Select value={currency} onValueChange={(value) => setCurrency(value)}>
                        <SelectTrigger id="currency">
                          <SelectValue placeholder="Sélectionner une devise" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="GBP">GBP (£)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Adresse */}
              <Card className="border border-gray-200 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900">Adresse</CardTitle>
                  <CardDescription className="text-sm text-gray-500 mt-1">L'adresse sera géocodée automatiquement</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
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
              <Card className="border border-gray-200 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900">Description</CardTitle>
                  <CardDescription className="text-sm text-gray-500 mt-1">Informations multilingues sur la propriété</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  <div>
                    <Label htmlFor="language">Langue *</Label>
                    <Select value={language} onValueChange={(value) => setLanguage(value)}>
                      <SelectTrigger id="language">
                        <SelectValue placeholder="Sélectionner une langue" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="title">Titre *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      placeholder="Appartement 3 pièces centre ville"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={6}
                      placeholder="Décrivez la propriété en détail..."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Médias */}
              <Card className="border border-gray-200 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900">Médias</CardTitle>
                  <CardDescription className="text-sm text-gray-500 mt-1">URLs des images de la propriété</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
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
                    className="border-gray-300 hover:bg-gray-50"
                  >
                    + Ajouter une URL
                  </Button>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-3 pt-2">
                <Link href="/properties">
                  <Button type="button" variant="outline" className="border-gray-300 hover:bg-gray-50">
                    Annuler
                  </Button>
                </Link>
                <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 text-white border-0">
                  {isSubmitting ? 'Création...' : 'Créer la propriété'}
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

