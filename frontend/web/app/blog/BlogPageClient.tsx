'use client';

import { useTranslation } from "@/contexts/I18nContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Calendar, Clock, ArrowRight, BookOpen, TrendingUp, Leaf } from "lucide-react";
import Image from "next/image";

export function BlogPageClient() {
  const { t } = useTranslation();

  // Sample blog posts - in real app, these would come from API/CMS
  const blogPosts = [
    {
      id: 1,
      title: t('blog.posts.ecoQuartiers.title'),
      excerpt: t('blog.posts.ecoQuartiers.excerpt'),
      category: 'eco-quartiers',
      author: 'Équipe Viridial',
      date: '2024-01-15',
      readTime: '5 min',
      image: '/images/blog/eco-quartiers.jpg',
    },
    {
      id: 2,
      title: t('blog.posts.marketTrends.title'),
      excerpt: t('blog.posts.marketTrends.excerpt'),
      category: 'tendances',
      author: 'Équipe Viridial',
      date: '2024-01-10',
      readTime: '7 min',
      image: '/images/blog/market-trends.jpg',
    },
    {
      id: 3,
      title: t('blog.posts.sustainableBuilding.title'),
      excerpt: t('blog.posts.sustainableBuilding.excerpt'),
      category: 'construction',
      author: 'Équipe Viridial',
      date: '2024-01-05',
      readTime: '6 min',
      image: '/images/blog/sustainable-building.jpg',
    },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'eco-quartiers':
        return 'bg-green-100 text-green-700';
      case 'tendances':
        return 'bg-blue-100 text-blue-700';
      case 'construction':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-viridial-600 via-viridial-500 to-teal-500 py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-white rounded-full opacity-5 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full opacity-5 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-medium mb-6">
            <BookOpen className="h-4 w-4" />
            {t('blog.hero.badge')}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            {t('blog.hero.title')}
          </h1>
          <p className="text-xl md:text-2xl text-viridial-50 max-w-3xl mx-auto">
            {t('blog.hero.description')}
          </p>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          {blogPosts.length === 0 ? (
            <Card className="border-2 border-gray-200 bg-white shadow-lg">
              <CardContent className="pt-12 pb-12 text-center">
                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {t('blog.empty.title')}
                </h3>
                <p className="text-gray-600">
                  {t('blog.empty.description')}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post, index) => (
                <Card 
                  key={post.id} 
                  className="group border-2 border-gray-200 hover:border-viridial-300 hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative h-48 bg-gradient-to-br from-viridial-100 to-teal-100 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Leaf className="h-20 w-20 text-viridial-300 opacity-50" />
                    </div>
                    <Badge className={`absolute top-4 left-4 ${getCategoryColor(post.category)} border-0`}>
                      {t(`blog.categories.${post.category}`)}
                    </Badge>
                  </div>
                  <CardHeader>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(post.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      <span>•</span>
                      <Clock className="h-4 w-4" />
                      <span>{post.readTime}</span>
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-viridial-700 transition-colors mb-2">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600 leading-relaxed">
                      {post.excerpt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{post.author}</span>
                      <Button variant="ghost" size="sm" className="group/btn">
                        {t('blog.posts.readMore')}
                        <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-viridial-200 bg-gradient-to-r from-viridial-50 to-teal-50">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {t('blog.newsletter.title')}
              </CardTitle>
              <CardDescription className="text-lg text-gray-600">
                {t('blog.newsletter.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button size="lg" className="bg-viridial-600 hover:bg-viridial-700 text-white">
                {t('blog.newsletter.button')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

