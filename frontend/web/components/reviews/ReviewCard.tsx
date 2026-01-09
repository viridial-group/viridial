'use client';

import { memo, useState } from 'react';
import Image from 'next/image';
import { Review, ReviewResponse } from '@/lib/api/review';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  Camera,
  CheckCircle2,
  Calendar,
  Edit,
  Trash2,
  Reply,
  MoreVertical,
} from 'lucide-react';
// Format date helper (fallback if date-fns is not installed)
const formatDateDistance = (date: Date | string): string => {
  try {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    if (diffDays < 7) return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    if (diffWeeks < 4) return `Il y a ${diffWeeks} semaine${diffWeeks > 1 ? 's' : ''}`;
    if (diffMonths < 12) return `Il y a ${diffMonths} mois`;
    return `Il y a ${diffYears} an${diffYears > 1 ? 's' : ''}`;
  } catch {
    return 'Il y a quelque temps';
  }
};

interface ReviewCardProps {
  review: Review;
  currentUserId?: string;
  onVote?: (reviewId: string, voteType: 'helpful' | 'not_helpful') => void;
  onEdit?: (review: Review) => void;
  onDelete?: (reviewId: string) => void;
  onRespond?: (review: Review) => void;
  showEntityInfo?: boolean;
}

const ReviewTagLabels: Record<string, string> = {
  security: 'Sécurité',
  location: 'Localisation',
  price: 'Prix',
  quality: 'Qualité',
  neighborhood: 'Quartier',
  transport: 'Transport',
  cleanliness: 'Propreté',
  communication: 'Communication',
  value: 'Rapport qualité-prix',
  amenities: 'Équipements',
};

export const ReviewCard = memo(function ReviewCard({
  review,
  currentUserId,
  onVote,
  onEdit,
  onDelete,
  onRespond,
  showEntityInfo = false,
}: ReviewCardProps) {
  const [imageError, setImageError] = useState<Record<number, boolean>>({});
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [showFullComment, setShowFullComment] = useState(false);

  const isOwner = currentUserId === review.userId;
  const hasPhotos = review.photos && review.photos.length > 0;
  const photosToShow = hasPhotos && showAllPhotos ? review.photos! : review.photos?.slice(0, 3);
  const remainingPhotos = hasPhotos ? Math.max(0, review.photos!.length - 3) : 0;

  const formatDate = (date: Date | string) => {
    return formatDateDistance(date);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
      </div>
    );
  };

  const handleVote = (voteType: 'helpful' | 'not_helpful') => {
    if (!onVote) return;
    
    // If user already voted the same way, remove vote
    if (review.userVote === voteType) {
      // onUnvote will be handled by parent
      return;
    }
    
    onVote(review.id, voteType);
  };

  const commentPreview = review.comment && review.comment.length > 300;
  const displayComment = review.comment && showFullComment
    ? review.comment
    : review.comment?.substring(0, 300);

  return (
    <Card className="border border-gray-200 hover:border-gray-300 transition-colors bg-white">
      <CardContent className="p-6">
        {/* Header: User info, rating, date */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4 flex-1">
            {/* Avatar placeholder */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-viridial-400 to-primary flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              {review.userId.substring(0, 2).toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="font-semibold text-gray-900">Utilisateur vérifié</span>
                {review.verified && (
                  <Badge variant="success" className="text-xs flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Vérifié
                  </Badge>
                )}
                {review.recommended !== null && review.recommended && (
                  <Badge variant="success" className="text-xs">
                    Recommande
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-3 flex-wrap">
                {renderStars(review.rating)}
                <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
                {review.visitDate && (
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>Visite: {formatDate(review.visitDate)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions menu */}
          {isOwner && (
            <div className="flex items-center gap-2">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(review)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(review.id)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Title */}
        {review.title && (
          <h4 className="font-semibold text-lg text-gray-900 mb-2">{review.title}</h4>
        )}

        {/* Tags */}
        {review.tags && review.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {review.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {ReviewTagLabels[tag] || tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Comment */}
        {review.comment && (
          <div className="mb-4">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {displayComment}
              {commentPreview && !showFullComment && '...'}
            </p>
            {commentPreview && (
              <button
                onClick={() => setShowFullComment(!showFullComment)}
                className="text-primary hover:text-viridial-700 text-sm font-medium mt-1"
              >
                {showFullComment ? 'Voir moins' : 'Voir plus'}
              </button>
            )}
          </div>
        )}

        {/* Photos */}
        {hasPhotos && photosToShow && (
          <div className="mb-4">
            <div className="grid grid-cols-3 gap-2">
              {photosToShow.map((photo, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:opacity-90 transition-opacity group"
                  onClick={() => {
                    // Open photo viewer (implement modal later)
                    window.open(photo, '_blank');
                  }}
                >
                  <Image
                    src={photo}
                    alt={review.title || `Photo ${index + 1}`}
                    fill
                    className="object-cover"
                    onError={() => setImageError((prev) => ({ ...prev, [index]: true }))}
                    unoptimized
                  />
                  {index === 2 && remainingPhotos > 0 && !showAllPhotos && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-semibold">
                      +{remainingPhotos}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {remainingPhotos > 0 && !showAllPhotos && (
              <button
                onClick={() => setShowAllPhotos(true)}
                className="text-sm text-primary hover:text-viridial-700 font-medium mt-2 flex items-center gap-1"
              >
                <Camera className="h-4 w-4" />
                Voir toutes les photos ({review.photos!.length})
              </button>
            )}
          </div>
        )}

        {/* Responses (Owner/Manager responses) */}
        {review.responses && review.responses.length > 0 && (
          <div className="mb-4 pl-4 border-l-2 border-viridial-200 bg-viridial-50 rounded-r-lg p-3">
            {review.responses.map((response) => (
              <div key={response.id} className="mb-2 last:mb-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-viridial-900">Réponse du propriétaire</span>
                  <span className="text-xs text-gray-500">{formatDate(response.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-700">{response.content}</p>
              </div>
            ))}
          </div>
        )}

        {/* Footer: Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4">
            {/* Helpful vote */}
            <button
              onClick={() => handleVote('helpful')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                review.userVote === 'helpful'
                  ? 'bg-viridial-100 text-viridial-700 border border-viridial-300'
                  : 'text-gray-600 hover:bg-gray-100 border border-transparent'
              }`}
              disabled={!onVote || isOwner}
            >
              <ThumbsUp className={`h-4 w-4 ${review.userVote === 'helpful' ? 'fill-current' : ''}`} />
              <span>Utile</span>
              {review.helpfulCount > 0 && (
                <span className="text-xs">({review.helpfulCount})</span>
              )}
            </button>

            {/* Not helpful vote */}
            <button
              onClick={() => handleVote('not_helpful')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                review.userVote === 'not_helpful'
                  ? 'bg-red-100 text-red-700 border border-red-300'
                  : 'text-gray-600 hover:bg-gray-100 border border-transparent'
              }`}
              disabled={!onVote || isOwner}
            >
              <ThumbsDown className={`h-4 w-4 ${review.userVote === 'not_helpful' ? 'fill-current' : ''}`} />
              {review.notHelpfulCount > 0 && (
                <span className="text-xs">({review.notHelpfulCount})</span>
              )}
            </button>

            {/* Respond button (for owners/managers) */}
            {!isOwner && onRespond && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRespond(review)}
                className="text-sm"
              >
                <Reply className="h-4 w-4 mr-1" />
                Répondre
              </Button>
            )}
          </div>

          {review.status === 'pending' && isOwner && (
            <Badge variant="warning" className="text-xs">
              En attente de modération
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

