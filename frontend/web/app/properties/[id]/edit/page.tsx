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
import MediaUpload from '@/components/property/MediaUpload';
import { useToast } from '@/components/ui/simple-toast';

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const propertyService = usePropertyService();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [type, setType] = useState<PropertyType>(PropertyType.APARTMENT);
  const [price, setPrice] = useState<string>('');
  const [priceError, setPriceError] = useState<string | null>(null);
  const [currency, setCurrency] = useState<string>('EUR');
  const [street, setStreet] = useState<string>('');
  const [postalCode, setPostalCode] = useState<string>('');
  const [postalCodeError, setPostalCodeError] = useState<string | null>(null);
  const [city, setCity] = useState<string>('');
  const [region, setRegion] = useState<string>('');
  const [country, setCountry] = useState<string>('France');
  const [status, setStatus] = useState<PropertyStatus>(PropertyStatus.DRAFT);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  
  // Translation (French by default, first translation)
  const [language, setLanguage] = useState<string>('fr');
  const [title, setTitle] = useState<string>('');
  const [titleError, setTitleError] = useState<string | null>(null);
  const [description, setDescription] = useState<string>('');

  // Validation functions
  const validatePrice = (value: string): boolean => {
    const numValue = parseFloat(value);
    if (!value || value.trim() === '') {
      setPriceError('Le prix est requis');
      return false;
    }
    if (isNaN(numValue) || numValue <= 0) {
      setPriceError('Le prix doit être un nombre positif');
      return false;
    }
    if (numValue > 1000000000) {
      setPriceError('Le prix est trop élevé (max 1 milliard)');
      return false;
    }
    setPriceError(null);
    return true;
  };

  const validatePostalCode = (value: string): boolean => {
    if (value && value.trim() !== '') {
      // French postal code: 5 digits
      const frenchPostalCodeRegex = /^\d{5}$/;
      if (!frenchPostalCodeRegex.test(value.trim())) {
        setPostalCodeError('Le code postal français doit contenir 5 chiffres');
        return false;
      }
    }
    setPostalCodeError(null);
    return true;
  };

  const validateTitle = (value: string): boolean => {
    if (!value || value.trim() === '') {
      setTitleError('Le titre est requis');
      return false;
    }
    if (value.trim().length < 5) {
      setTitleError('Le titre doit contenir au moins 5 caractères');
      return false;
    }
    if (value.trim().length > 200) {
      setTitleError('Le titre ne doit pas dépasser 200 caractères');
      return false;
    }
    setTitleError(null);
    return true;
  };

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
      setMediaUrls(property.mediaUrls && property.mediaUrls.length > 0 ? property.mediaUrls : []);
      
      // First translation
      if (property.translations && property.translations.length > 0) {
        const mainTrans = property.translations[0];
        setLanguage(mainTrans.language);
        setTitle(mainTrans.title);
        setDescription(mainTrans.description || '');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement de la propriété';
      toast({
        variant: 'error',
        title: 'Erreur',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMediaUrlsChange = (urls: string[]) => {
    setMediaUrls(urls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all required fields
    const isPriceValid = validatePrice(price);
    const isPostalCodeValid = validatePostalCode(postalCode);
    const isTitleValid = validateTitle(title);

    if (!isPriceValid || !isPostalCodeValid || !isTitleValid) {
      toast({
        variant: 'error',
        title: 'Erreur de validation',
        description: 'Veuillez corriger les erreurs dans le formulaire.',
      });
      return;
    }

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
            title: title.trim(),
            description: description.trim() || undefined,
          },
        ],
        status,
      };

      await propertyService.update(propertyId, updateData);
      toast({
        variant: 'success',
        title: 'Modifications enregistrées',
        description: 'La propriété a été mise à jour avec succès.',
      });
      router.push(`/properties/${propertyId}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour de la propriété';
      toast({
        variant: 'error',
        title: 'Erreur',
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-primary mb-4"></div>
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
      <main id="main-content" className="flex flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8">
            <Link href={`/properties/${propertyId}`} className="text-sm text-gray-500 hover:text-gray-700 font-medium inline-flex items-center gap-1 mb-4">
              ← Retour à la propriété
            </Link>
            <h1 className="text-2xl font-semibold text-gray-900">
              Modifier la Propriété
            </h1>
            <p className="mt-1.5 text-sm text-gray-500">
              Modifiez les informations de votre propriété
            </p>
          </div>

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
                        onChange={(e) => {
                          setPrice(e.target.value);
                          if (priceError) setPriceError(null);
                        }}
                        onBlur={() => validatePrice(price)}
                        required
                        className={priceError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                      />
                      {priceError && (
                        <p className="text-xs text-red-600 mt-1">{priceError}</p>
                      )}
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

                  <div>
                    <Label htmlFor="status">Statut</Label>
                    <Select value={status} onValueChange={(value) => setStatus(value as PropertyStatus)}>
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Sélectionner un statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={PropertyStatus.DRAFT}>Brouillon</SelectItem>
                        <SelectItem value={PropertyStatus.REVIEW}>En révision</SelectItem>
                        <SelectItem value={PropertyStatus.LISTED}>Publiée</SelectItem>
                        <SelectItem value={PropertyStatus.ARCHIVED}>Archivée</SelectItem>
                      </SelectContent>
                    </Select>
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
                        onChange={(e) => {
                          setPostalCode(e.target.value);
                          if (postalCodeError) setPostalCodeError(null);
                        }}
                        onBlur={() => validatePostalCode(postalCode)}
                        placeholder="75001"
                        className={postalCodeError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                      />
                      {postalCodeError && (
                        <p className="text-xs text-red-600 mt-1">{postalCodeError}</p>
                      )}
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
                      onChange={(e) => {
                        setTitle(e.target.value);
                        if (titleError) setTitleError(null);
                      }}
                      onBlur={() => validateTitle(title)}
                      required
                      className={titleError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                    />
                    {titleError ? (
                      <p className="text-xs text-red-600 mt-1">{titleError}</p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-1">
                        {title.length}/200 caractères
                      </p>
                    )}
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
              <Card className="border border-gray-200 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900">Médias</CardTitle>
                  <CardDescription className="text-sm text-gray-500 mt-1">
                    Téléversez des images ou ajoutez des URLs (max 10 fichiers)
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <MediaUpload
                    value={mediaUrls}
                    onChange={handleMediaUrlsChange}
                    maxFiles={10}
                    disabled={isSubmitting}
                  />
                </CardContent>
              </Card>

              <div className="flex justify-end gap-3 pt-2">
                <Link href={`/properties/${propertyId}`}>
                  <Button type="button" variant="outline" className="border-gray-300 hover:bg-gray-50">
                    Annuler
                  </Button>
                </Link>
                <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-viridial-700 text-white border-0">
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

