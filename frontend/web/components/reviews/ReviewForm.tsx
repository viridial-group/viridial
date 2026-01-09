'use client';

import { memo, useState, useEffect } from 'react';
import { Review, ReviewTag, CreateReviewRequest, UpdateReviewRequest } from '@/lib/api/review';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Star, X, CheckCircle2, Camera, Calendar } from 'lucide-react';

interface ReviewFormProps {
  entityType: string;
  entityId: string;
  review?: Review | null; // For editing existing review
  onSubmit: (review: CreateReviewRequest | UpdateReviewRequest) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

const ReviewTagLabels: Record<ReviewTag, string> = {
  [ReviewTag.SECURITY]: 'Sécurité',
  [ReviewTag.LOCATION]: 'Localisation',
  [ReviewTag.PRICE]: 'Prix',
  [ReviewTag.QUALITY]: 'Qualité',
  [ReviewTag.NEIGHBORHOOD]: 'Quartier',
  [ReviewTag.TRANSPORT]: 'Transport',
  [ReviewTag.CLEANLINESS]: 'Propreté',
  [ReviewTag.COMMUNICATION]: 'Communication',
  [ReviewTag.VALUE]: 'Rapport qualité-prix',
  [ReviewTag.AMENITIES]: 'Équipements',
};

const allTags = Object.values(ReviewTag);

export const ReviewForm = memo(function ReviewForm({
  entityType,
  entityId,
  review,
  onSubmit,
  onCancel,
  loading = false,
}: ReviewFormProps) {
  const [rating, setRating] = useState<number>(review?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [title, setTitle] = useState<string>(review?.title || '');
  const [comment, setComment] = useState<string>(review?.comment || '');
  const [photos, setPhotos] = useState<string[]>(review?.photos || []);
  const [selectedTags, setSelectedTags] = useState<ReviewTag[]>(review?.tags || []);
  const [recommended, setRecommended] = useState<boolean | null>(review?.recommended ?? null);
  const [visitDate, setVisitDate] = useState<string>(
    review?.visitDate ? new Date(review.visitDate).toISOString().split('T')[0] : '',
  );
  const [photoInput, setPhotoInput] = useState<string>('');

  const isEditing = !!review;

  const handleTagToggle = (tag: ReviewTag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleAddPhoto = () => {
    if (photoInput.trim() && !photos.includes(photoInput.trim())) {
      if (photos.length < 10) {
        setPhotos([...photos, photoInput.trim()]);
        setPhotoInput('');
      }
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating < 1 || rating > 5) {
      alert('Veuillez sélectionner une note entre 1 et 5 étoiles');
      return;
    }

    const reviewData: CreateReviewRequest | UpdateReviewRequest = {
      ...(isEditing ? {} : { entityType: entityType as any, entityId }),
      rating,
      title: title.trim() || undefined,
      comment: comment.trim() || undefined,
      photos: photos.length > 0 ? photos : undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      recommended: recommended !== null ? recommended : undefined,
      visitDate: visitDate || undefined,
    };

    await onSubmit(reviewData);
  };

  return (
    <Card className="border border-gray-200 bg-white">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
          {isEditing ? 'Modifier votre avis' : 'Laisser un avis'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Note <span className="text-red-500">*</span>
            </Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-10 w-10 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-gray-200 text-gray-200'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-4 text-lg font-semibold text-gray-700">
                  {rating} {rating === 1 ? 'étoile' : 'étoiles'}
                </span>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="review-title" className="text-base font-semibold mb-2 block">
              Titre (optionnel)
            </Label>
            <Input
              id="review-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Excellent bien immobilier"
              maxLength={200}
              className="w-full"
            />
          </div>

          {/* Comment */}
          <div>
            <Label htmlFor="review-comment" className="text-base font-semibold mb-2 block">
              Commentaire (optionnel)
            </Label>
            <Textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Décrivez votre expérience..."
              rows={6}
              maxLength={2000}
              className="w-full"
            />
            <p className="text-sm text-gray-500 mt-1">{comment.length}/2000 caractères</p>
          </div>

          {/* Tags */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Catégories (optionnel) - Sélectionnez les points importants
            </Label>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                  className="cursor-pointer hover:opacity-80 transition-opacity px-3 py-1.5 text-sm"
                  onClick={() => handleTagToggle(tag)}
                >
                  {ReviewTagLabels[tag]}
                </Badge>
              ))}
            </div>
          </div>

          {/* Photos */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Photos (optionnel) - Maximum 10 photos
            </Label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  type="url"
                  value={photoInput}
                  onChange={(e) => setPhotoInput(e.target.value)}
                  placeholder="URL de la photo (https://...)"
                  className="flex-1"
                  disabled={photos.length >= 10}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddPhoto}
                  disabled={photos.length >= 10 || !photoInput.trim()}
                  className="flex items-center gap-2"
                >
                  <Camera className="h-4 w-4" />
                  Ajouter
                </Button>
              </div>
              {photos.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group">
                      <img
                        src={photo}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-image.svg';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {photos.length >= 10 && (
                <p className="text-sm text-amber-600">Vous avez atteint la limite de 10 photos</p>
              )}
            </div>
          </div>

          {/* Visit Date */}
          <div>
            <Label htmlFor="visit-date" className="text-base font-semibold mb-2 block flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Date de visite/séjour (optionnel)
            </Label>
            <Input
              id="visit-date"
              type="date"
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]} // Can't be in the future
              className="w-full max-w-xs"
            />
          </div>

          {/* Recommendation */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Recommanderiez-vous cette propriété ?
            </Label>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant={recommended === true ? 'default' : 'outline'}
                onClick={() => setRecommended(recommended === true ? null : true)}
                className="flex items-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                Oui
              </Button>
              <Button
                type="button"
                variant={recommended === false ? 'default' : 'outline'}
                onClick={() => setRecommended(recommended === false ? null : false)}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Non
              </Button>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                Annuler
              </Button>
            )}
            <Button type="submit" variant="default" disabled={loading || rating < 1}>
              {loading ? 'Envoi...' : isEditing ? 'Modifier l\'avis' : 'Publier l\'avis'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
});

