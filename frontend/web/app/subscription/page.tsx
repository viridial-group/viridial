'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
  Shield,
  TrendingUp,
  Star,
  Zap,
  Calculator,
  CreditCard,
  Lock,
  RefreshCw,
  Heart,
  ThumbsUp,
  MessageSquare,
  BarChart3,
  Users,
  Building2,
  Rocket,
  Award,
  Clock,
  HelpCircle,
  BadgeCheck,
  Target,
  DollarSign,
  Percent,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Coins,
  PiggyBank,
  Smile,
  AlertCircle,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from '@/contexts/I18nContext';
import { TrustSignals, GuaranteeBadge } from '@/components/marketing/TrustSignals';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: React.ReactNode;
  popular?: boolean;
}

export default function SubscriptionPage() {
  const { t } = useTranslation();
  const [transactionAmount, setTransactionAmount] = useState(250000);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Calculate commission
  const calculateCommission = (amount: number) => {
    const base = 19;
    const percentage = amount * 0.0015; // 0.15%
    const total = base + percentage;
    return Math.min(total, 499); // Cap at 499€
  };

  const commission = calculateCommission(transactionAmount);

  const addOns: AddOn[] = [
    {
      id: 'ai-pack',
      name: 'Pack IA',
      description: 'Automatisation intelligente, scoring de leads avancé, recommandations personnalisées',
      price: 49,
      icon: <Sparkles className="h-5 w-5" />,
      popular: true,
    },
    {
      id: 'multi-diffusion',
      name: 'Multi-diffusion Pro',
      description: 'Diffusion automatique sur tous les portails, synchronisation en temps réel',
      price: 39,
      icon: <Rocket className="h-5 w-5" />,
    },
    {
      id: 'signature-electronique',
      name: 'Signature électronique',
      description: 'Signatures sécurisées, workflow complet, intégration CRM',
      price: 29,
      icon: <BadgeCheck className="h-5 w-5" />,
    },
    {
      id: 'portail-client',
      name: 'Portail client brandé',
      description: 'Espace client personnalisé, suivi de dossier, notifications automatiques',
      price: 59,
      icon: <Users className="h-5 w-5" />,
    },
    {
      id: 'support-premium',
      name: 'Support Premium',
      description: 'Support prioritaire 24/7, account manager dédié, formation personnalisée',
      price: 79,
      icon: <MessageSquare className="h-5 w-5" />,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-viridial-50 via-white to-blue-50 pt-24 pb-20 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-viridial-300 rounded-full opacity-10 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-200 rounded-full opacity-10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-200 rounded-full opacity-5 blur-3xl"></div>
        </div>
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            {/* Social Proof Banner */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-8 animate-fade-in">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-viridial-200">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-8 w-8 rounded-full bg-gradient-to-br from-viridial-400 to-viridial-600 border-2 border-white"></div>
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-900 ml-2">
                  <span className="text-viridial-700">2,500+</span> agents nous font confiance
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-green-200">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-semibold text-gray-900">
                  <span className="text-green-700">1.2M€</span> économisés ce mois
                </span>
              </div>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-viridial-100 to-blue-100 text-viridial-700 rounded-full text-sm font-semibold mb-6 animate-fade-in shadow-sm">
                <Target className="h-4 w-4" />
                Modèle révolutionnaire • Pay-per-success
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 animate-fade-in leading-tight">
                Le CRM immobilier qui gagne
                <span className="block gradient-text-artistic mt-3 bg-clip-text text-transparent bg-gradient-to-r from-viridial-600 via-blue-600 to-viridial-600 animate-gradient">
                  uniquement quand vous gagnez
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-700 mb-4 max-w-3xl mx-auto font-medium animate-fade-in">
                Zéro abonnement. Zéro risque. Payez uniquement quand une vente ou une location est signée.
              </p>
              <p className="text-sm text-gray-500 mb-8 max-w-2xl mx-auto animate-fade-in flex items-center justify-center gap-2">
                <Lock className="h-4 w-4 text-viridial-600" />
                <span>🔒 Activation sécurisée : 1€ (une seule fois)</span>
              </p>

            {/* Proof Points - Enhanced */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 max-w-3xl mx-auto animate-fade-in">
              <div className="flex flex-col items-center gap-2 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-viridial-200 hover:border-viridial-300 hover:shadow-md transition-all">
                <CheckCircle2 className="h-6 w-6 text-viridial-600" />
                <span className="font-semibold text-gray-900 text-sm text-center">CRM complet</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-viridial-200 hover:border-viridial-300 hover:shadow-md transition-all">
                <Zap className="h-6 w-6 text-viridial-600" />
                <span className="font-semibold text-gray-900 text-sm text-center">Illimité</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-viridial-200 hover:border-viridial-300 hover:shadow-md transition-all">
                <CreditCard className="h-6 w-6 text-viridial-600" />
                <span className="font-semibold text-gray-900 text-sm text-center">Sans abonnement</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-viridial-200 hover:border-viridial-300 hover:shadow-md transition-all">
                <Shield className="h-6 w-6 text-viridial-600" />
                <span className="font-semibold text-gray-900 text-sm text-center">Sans engagement</span>
              </div>
            </div>

            <div className="space-y-4 animate-fade-in" style={{ animationDelay: '400ms' }}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-viridial-600 to-viridial-500 text-white hover:from-viridial-700 hover:to-viridial-600 shadow-xl hover:shadow-2xl transition-all px-8 py-6 text-lg w-full sm:w-auto group relative overflow-hidden"
                >
                  <Link href="/signup" className="relative z-10 flex items-center">
                    <span className="mr-2">👉</span>
                    Créer mon compte gratuit
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-2 border-gray-300 hover:border-viridial-500 hover:bg-viridial-50 w-full sm:w-auto px-6 py-6"
                >
                  <Link href="#pricing" className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Calculer mes économies
                  </Link>
                </Button>
              </div>
              <div className="flex items-center justify-center gap-2 p-3 bg-white/80 backdrop-blur-sm rounded-lg border border-viridial-200 max-w-md mx-auto">
                <Lock className="h-4 w-4 text-viridial-600 flex-shrink-0" />
                <span className="text-sm text-gray-700">
                  <span className="font-semibold">🔒 Activation sécurisée : 1€</span> (une seule fois)
                </span>
              </div>
            </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section - Enhanced */}
      <section className="py-20 bg-gradient-to-b from-white to-orange-50/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="bg-orange-100 text-orange-700 border-orange-300 mb-4 px-4 py-1">
                <AlertCircle className="h-4 w-4 mr-2" />
                Le problème actuel
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Les CRM traditionnels vous coûtent cher,
                <span className="block text-orange-600 mt-2">même quand vous ne gagnez rien</span>
              </h2>
            </div>
            
            {/* Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="border-2 border-orange-200 bg-white hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-orange-100 rounded-full">
                      <TrendingDown className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-orange-600">50-150€</div>
                      <div className="text-sm text-gray-600">par mois</div>
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Coûts fixes élevés</h3>
                  <p className="text-gray-600 text-sm">
                    Même en période creuse, vous payez chaque mois sans garantie de résultats
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-2 border-orange-200 bg-white hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-orange-100 rounded-full">
                      <XCircle className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-orange-600">0%</div>
                      <div className="text-sm text-gray-600">alignement</div>
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Aucun alignement</h3>
                  <p className="text-gray-600 text-sm">
                    Le CRM gagne même si vous ne vendez rien. Le risque est toujours pour vous
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-2 border-orange-200 bg-white hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-orange-100 rounded-full">
                      <PiggyBank className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-orange-600">1,800€</div>
                      <div className="text-sm text-gray-600">par an minimum</div>
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Coût annuel élevé</h3>
                  <p className="text-gray-600 text-sm">
                    Sur une année, vous dépensez au minimum 1,800€ même sans vente
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Impact Statement */}
            <Card className="border-2 border-orange-300 bg-gradient-to-r from-orange-50 to-amber-50">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="p-4 bg-orange-100 rounded-full flex-shrink-0">
                    <AlertCircle className="h-8 w-8 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      Le problème : vous payez même quand vous ne gagnez pas
                    </h3>
                    <div className="space-y-3 text-gray-700">
                      <div className="flex items-start gap-2">
                        <XCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                        <p><strong>50 à 150€/mois</strong> de CRM, même quand vous ne vendez rien</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <XCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                        <p><strong>Aucune garantie de résultats</strong> - le risque est toujours pour l'agent</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <XCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                        <p><strong>Coûts fixes récurrents</strong> - même en période creuse, vous payez</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Solution Section - Enhanced */}
      <section className="py-20 bg-gradient-to-br from-viridial-50 via-white to-blue-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="bg-viridial-100 text-viridial-700 border-viridial-300 mb-4 px-4 py-1">
                <Sparkles className="h-4 w-4 mr-2" />
                La solution révolutionnaire
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Nous avons inversé le modèle
                <span className="block text-viridial-700 mt-2">Alignement total des intérêts</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Nous gagnons uniquement si vous gagnez. C'est aussi simple que ça.
              </p>
            </div>
            
            {/* Solution Cards - Enhanced */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <Card className="border-2 border-viridial-200 bg-white hover:border-viridial-400 hover:shadow-xl transition-all group">
                <CardContent className="p-8 text-center">
                  <div className="inline-flex p-4 bg-gradient-to-br from-viridial-100 to-viridial-50 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
                    <Sparkles className="h-8 w-8 text-viridial-600" />
                  </div>
                  <h3 className="font-bold text-xl text-gray-900 mb-3">
                    CRM gratuit à vie
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Utilisez tout le CRM gratuitement, sans limite. Biens, leads, utilisateurs - tout est illimité.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-viridial-700 font-semibold">
                    <CheckCircle2 className="h-5 w-5" />
                    <span>0€ / mois</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-2 border-viridial-400 bg-gradient-to-br from-viridial-50 to-white shadow-xl hover:shadow-2xl transition-all group relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-viridial-600 text-white px-3 py-1 text-xs font-semibold">
                    ⭐ Populaire
                  </Badge>
                </div>
                <CardContent className="p-8 text-center">
                  <div className="inline-flex p-4 bg-gradient-to-br from-viridial-200 to-viridial-100 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
                    <DollarSign className="h-8 w-8 text-viridial-700" />
                  </div>
                  <h3 className="font-bold text-xl text-gray-900 mb-3">
                    Payez uniquement à la réussite
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Vous ne payez que lorsque vous encaissez. Commission équitable et transparente.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-viridial-700 font-semibold">
                    <ArrowUpRight className="h-5 w-5" />
                    <span>19€ + 0,15%</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-2 border-viridial-200 bg-white hover:border-viridial-400 hover:shadow-xl transition-all group">
                <CardContent className="p-8 text-center">
                  <div className="inline-flex p-4 bg-gradient-to-br from-blue-100 to-viridial-50 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
                    <TrendingUp className="h-8 w-8 text-viridial-600" />
                  </div>
                  <h3 className="font-bold text-xl text-gray-900 mb-3">
                    Alignement total
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Nous gagnons uniquement si vous gagnez. Vos intérêts sont nos intérêts.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-viridial-700 font-semibold">
                    <Heart className="h-5 w-5 fill-viridial-600 text-viridial-600" />
                    <span>Win-win</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Key Message */}
            <Card className="border-2 border-viridial-400 bg-gradient-to-r from-viridial-50 to-blue-50 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="p-3 bg-viridial-100 rounded-full">
                    <Target className="h-6 w-6 text-viridial-700" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                    👉 Si vous ne signez rien, vous ne payez rien.
                  </h3>
                </div>
                <p className="text-gray-700 text-lg">
                  C'est la promesse. Simple, claire, transparente.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works - Enhanced */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="bg-blue-100 text-blue-700 border-blue-300 mb-4 px-4 py-1">
                <Zap className="h-4 w-4 mr-2" />
                Simple et rapide
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Comment ça marche ?
                <span className="block text-viridial-700 mt-2 text-3xl md:text-4xl">3 étapes simples</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                En moins de 5 minutes, vous êtes opérationnel
              </p>
            </div>
            
            {/* Connection Lines (Desktop) */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 transform -translate-y-1/2 z-0">
              <div className="max-w-5xl mx-auto px-12">
                <div className="flex justify-between">
                  <div className="w-full h-0.5 bg-gradient-to-r from-viridial-300 to-transparent"></div>
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-viridial-300 to-transparent mx-4"></div>
                  <div className="w-full h-0.5 bg-gradient-to-l from-viridial-300 to-transparent"></div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
              <div className="relative group">
                <div className="absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-br from-viridial-500 to-viridial-600 text-white rounded-full flex items-center justify-center font-bold text-2xl z-10 shadow-lg group-hover:scale-110 transition-transform">
                  1
                </div>
                <Card className="border-2 border-viridial-200 pt-10 hover:border-viridial-400 hover:shadow-xl transition-all bg-white">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-viridial-100 rounded-lg">
                        <Zap className="h-6 w-6 text-viridial-600" />
                      </div>
                      <CardTitle className="text-xl font-bold">Utilisez le CRM</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-gray-700 mb-4">
                      <li className="flex items-center gap-3">
                        <div className="p-1 bg-viridial-100 rounded-full">
                          <CheckCircle2 className="h-4 w-4 text-viridial-600 flex-shrink-0" />
                        </div>
                        <span className="font-medium">Gérez vos biens</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="p-1 bg-viridial-100 rounded-full">
                          <CheckCircle2 className="h-4 w-4 text-viridial-600 flex-shrink-0" />
                        </div>
                        <span className="font-medium">Vos leads</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="p-1 bg-viridial-100 rounded-full">
                          <CheckCircle2 className="h-4 w-4 text-viridial-600 flex-shrink-0" />
                        </div>
                        <span className="font-medium">Vos clients</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="p-1 bg-viridial-100 rounded-full">
                          <CheckCircle2 className="h-4 w-4 text-viridial-600 flex-shrink-0" />
                        </div>
                        <span className="font-medium">Vos automatisations</span>
                      </li>
                    </ul>
                    <div className="mt-6 p-3 bg-viridial-50 rounded-lg border border-viridial-200">
                      <p className="text-sm font-bold text-viridial-700 text-center">
                        👉 Sans aucune limite
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="relative group">
                <div className="absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-2xl z-10 shadow-lg group-hover:scale-110 transition-transform">
                  2
                </div>
                <Card className="border-2 border-blue-200 pt-10 hover:border-blue-400 hover:shadow-xl transition-all bg-white">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <BadgeCheck className="h-6 w-6 text-blue-600" />
                      </div>
                      <CardTitle className="text-xl font-bold">Signez une transaction</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-center gap-3">
                        <div className="p-1 bg-blue-100 rounded-full">
                          <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        </div>
                        <span className="font-medium">Marquez comme signée</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="p-1 bg-blue-100 rounded-full">
                          <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        </div>
                        <span className="font-medium">Déclenchement automatique</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="p-1 bg-blue-100 rounded-full">
                          <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        </div>
                        <span className="font-medium">Signature électronique</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <div className="relative group">
                <div className="absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-2xl z-10 shadow-lg group-hover:scale-110 transition-transform">
                  3
                </div>
                <Card className="border-2 border-purple-200 pt-10 hover:border-purple-400 hover:shadow-xl transition-all bg-white">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <CreditCard className="h-6 w-6 text-purple-600" />
                      </div>
                      <CardTitle className="text-xl font-bold">Commission équitable</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-center gap-3">
                        <div className="p-1 bg-purple-100 rounded-full">
                          <CheckCircle2 className="h-4 w-4 text-purple-600 flex-shrink-0" />
                        </div>
                        <span className="font-medium">Montant clair</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="p-1 bg-purple-100 rounded-full">
                          <CheckCircle2 className="h-4 w-4 text-purple-600 flex-shrink-0" />
                        </div>
                        <span className="font-medium">Sans surprise</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="p-1 bg-purple-100 rounded-full">
                          <CheckCircle2 className="h-4 w-4 text-purple-600 flex-shrink-0" />
                        </div>
                        <span className="font-medium">Facturation auto</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Bottom CTA */}
            <div className="mt-12 text-center">
              <Card className="border-2 border-viridial-300 bg-gradient-to-r from-viridial-50 to-blue-50 inline-block px-8 py-4">
                <CardContent className="p-0">
                  <p className="text-lg font-semibold text-gray-900">
                    ⏱️ Temps total : <span className="text-viridial-700">moins de 5 minutes</span> pour commencer
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-br from-viridial-50 via-white to-blue-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="bg-viridial-100 text-viridial-700 border-viridial-300 mb-4 px-4 py-1">
                <Coins className="h-4 w-4 mr-2" />
                Tarification transparente
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Un modèle simple, équitable
                <span className="block text-viridial-700 mt-2">et aligné sur votre réussite</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Comparez avec les CRM traditionnels et découvrez combien vous économisez
              </p>
            </div>
            
            {/* Savings Comparison Banner */}
            <div className="mb-12 max-w-4xl mx-auto">
              <Card className="border-2 border-green-300 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-green-100 rounded-full">
                        <PiggyBank className="h-8 w-8 text-green-700" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          Économisez jusqu'à 1,800€ par an
                        </h3>
                        <p className="text-gray-700 text-sm">
                          vs. les CRM traditionnels (50-150€/mois)
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold text-green-700 mb-1">
                        -100%
                      </div>
                      <p className="text-sm text-gray-600">
                        de frais fixes
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Free CRM Card - Enhanced */}
            <div className="mb-12">
              <Card className="border-2 border-viridial-300 bg-gradient-to-br from-white to-viridial-50/30 max-w-2xl mx-auto shadow-xl hover:shadow-2xl transition-shadow">
                <CardHeader className="text-center pb-4">
                  <div className="inline-flex p-4 bg-gradient-to-br from-viridial-100 to-viridial-50 rounded-2xl mb-4">
                    <Sparkles className="h-10 w-10 text-viridial-600" />
                  </div>
                  <CardTitle className="text-4xl mb-3 flex items-center justify-center gap-2">
                    🆓 CRM – Gratuit à vie
                  </CardTitle>
                  <div className="flex items-baseline justify-center gap-2 mb-3">
                    <span className="text-6xl font-bold text-gray-900">0€</span>
                    <span className="text-2xl text-gray-500">/ mois</span>
                  </div>
                  <CardDescription className="text-xl font-medium text-gray-700">
                    Utilisez tout le CRM sans limite, pour toujours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                    <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
                      <CheckCircle2 className="h-5 w-5 text-viridial-600 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">CRM complet</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
                      <CheckCircle2 className="h-5 w-5 text-viridial-600 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">Biens & leads illimités</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
                      <CheckCircle2 className="h-5 w-5 text-viridial-600 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">Utilisateurs illimités</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
                      <CheckCircle2 className="h-5 w-5 text-viridial-600 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">Dashboard & stats</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-3 p-4 bg-viridial-100 rounded-lg">
                    <CheckCircle2 className="h-6 w-6 text-viridial-700 flex-shrink-0" />
                    <span className="text-gray-900 font-semibold">Support communautaire inclus</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Commission Model Card - Enhanced */}
            <Card className="border-2 border-viridial-500 bg-gradient-to-br from-viridial-50 via-white to-blue-50 shadow-2xl max-w-3xl mx-auto relative overflow-hidden">
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-viridial-100/50 via-transparent to-blue-100/50 opacity-50"></div>
              
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                <Badge className="bg-gradient-to-r from-viridial-600 to-viridial-500 text-white px-5 py-2 text-sm font-semibold shadow-lg">
                  ⭐ Modèle recommandé (par défaut)
                </Badge>
              </div>
              
              <CardHeader className="text-center pt-10 pb-6 relative z-10">
                <div className="inline-flex p-4 bg-gradient-to-br from-viridial-200 to-viridial-100 rounded-2xl mb-4">
                  <DollarSign className="h-10 w-10 text-viridial-700" />
                </div>
                <CardTitle className="text-3xl md:text-4xl mb-3 flex items-center justify-center gap-2">
                  Paiement uniquement à la réussite
                </CardTitle>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-viridial-100 rounded-full mb-3">
                  <BadgeCheck className="h-5 w-5 text-viridial-700" />
                  <span className="text-2xl md:text-3xl font-bold text-viridial-700">
                    HYBRIDE
                  </span>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="text-3xl md:text-4xl font-bold text-gray-900">
                    19€ + 0,15% du montant
                  </div>
                  <div className="flex items-center justify-center gap-2 text-lg text-gray-600">
                    <Lock className="h-5 w-5 text-viridial-600" />
                    <span>Plafond mensuel : <strong className="text-gray-900">499€</strong></span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                {/* Activation Fee Explanation - Enhanced */}
                <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100/50 mb-6 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="p-3 bg-blue-100 rounded-full">
                          <Lock className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 mb-2 flex items-center gap-2">
                          🔒 Activation sécurisée : 1€ (une seule fois)
                        </h3>
                        <div className="space-y-2 text-gray-700 text-sm">
                          <p>
                            <strong>Pourquoi 1€ ?</strong> Cette vérification unique permet de :
                          </p>
                          <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Valider votre carte bancaire de manière sécurisée</li>
                            <li>Protéger la plateforme contre les faux comptes et abus</li>
                            <li>Garantir un environnement de confiance pour tous les agents</li>
                            <li>Activer votre compte de façon définitive</li>
                          </ul>
                          <div className="mt-3 pt-3 border-t border-blue-200">
                            <p className="font-semibold text-gray-900">
                              ✅ C'est tout ! Aucun autre frais jusqu'à votre première transaction réussie.
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              Le 1€ est débité une seule fois lors de l'activation. Ensuite, vous ne payez que lorsque vous signez une vente ou une location.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Calculator - Enhanced */}
                <div className="bg-gradient-to-br from-white to-viridial-50/30 rounded-xl p-6 border-2 border-viridial-200 mb-6 shadow-lg">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-br from-viridial-100 to-viridial-50 rounded-xl">
                      <Calculator className="h-7 w-7 text-viridial-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-gray-900">Calculateur de commission</h3>
                      <p className="text-sm text-gray-600">Testez avec votre montant réel</p>
                    </div>
                  </div>
                  <div className="space-y-5">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-semibold text-gray-900">
                          Montant de la transaction
                        </label>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {transactionAmount.toLocaleString('fr-FR')}€
                        </span>
                      </div>
                      <input
                        type="range"
                        min="50000"
                        max="1000000"
                        step="10000"
                        value={transactionAmount}
                        onChange={(e) => setTransactionAmount(Number(e.target.value))}
                        className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-viridial-600 hover:accent-viridial-700 transition-colors"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>50k€</span>
                        <span>1M€</span>
                      </div>
                      <div className="mt-3">
                        <input
                          type="number"
                          value={transactionAmount}
                          onChange={(e) => setTransactionAmount(Math.max(50000, Math.min(1000000, Number(e.target.value))))}
                          className="w-full px-4 py-3 border-2 border-viridial-200 rounded-lg focus:ring-2 focus:ring-viridial-500 focus:border-viridial-500 text-lg font-semibold text-gray-900 transition-all"
                          min="50000"
                          max="1000000"
                          step="1000"
                        />
                      </div>
                    </div>
                    
                    {/* Result Card */}
                    <div className="bg-gradient-to-br from-viridial-100 to-viridial-50 rounded-xl p-6 border-2 border-viridial-300 shadow-inner">
                      <div className="text-center mb-4">
                        <p className="text-sm text-gray-600 mb-2">Pour une transaction de</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {transactionAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 })}
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-4 mb-4 border border-viridial-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-700 font-medium">Votre commission :</span>
                          <span className="text-4xl font-extrabold text-viridial-700">
                            {commission.toFixed(2)}€
                          </span>
                        </div>
                        {commission >= 499 && (
                          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200">
                            <BadgeCheck className="h-4 w-4 text-green-600" />
                            <span className="text-xs text-gray-600">
                              Plafond mensuel appliqué (499€ max)
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center bg-white/60 rounded px-3 py-2">
                          <span className="text-gray-600">Frais fixes</span>
                          <span className="font-semibold text-gray-900">19€</span>
                        </div>
                        <div className="flex justify-between items-center bg-white/60 rounded px-3 py-2">
                          <span className="text-gray-600">0,15% du montant</span>
                          <span className="font-semibold text-gray-900">
                            {(transactionAmount * 0.0015).toFixed(2)}€
                          </span>
                        </div>
                        {commission >= 499 && (
                          <div className="flex justify-between items-center bg-green-50 rounded px-3 py-2 border border-green-200">
                            <span className="text-green-700 font-medium">Économie grâce au plafond</span>
                            <span className="font-bold text-green-700">
                              {((19 + transactionAmount * 0.0015) - 499).toFixed(2)}€
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Examples - Enhanced */}
                <div className="space-y-4">
                  <h4 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    Exemples concrets :
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white hover:border-viridial-300 hover:shadow-md transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600 font-medium">Vente</span>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-1">150 000€</div>
                        <div className="flex items-center gap-2">
                          <div className="text-lg font-bold text-viridial-700">244€</div>
                          <Badge variant="outline" className="text-xs">commission</Badge>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white hover:border-viridial-300 hover:shadow-md transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600 font-medium">Vente</span>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-1">300 000€</div>
                        <div className="flex items-center gap-2">
                          <div className="text-lg font-bold text-viridial-700">469€</div>
                          <Badge variant="outline" className="text-xs">commission</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-viridial-200">
                  <p className="text-sm text-gray-600 mb-4">
                    <strong>Autres options disponibles :</strong>
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-700">Fixe : 29€ / transaction</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-700">% Premium : 0,3% (plafonné à 999€)</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    Accessibles dans les paramètres ou sur demande
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button
                  asChild
                  className="w-full bg-viridial-600 hover:bg-viridial-700 text-white"
                  size="lg"
                >
                  <Link href="/signup">
                    Activer mon compte (1€)
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <p className="text-xs text-center text-gray-600">
                  🔒 Activation sécurisée : 1€ (une seule fois)
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Add-ons Section - Enhanced */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="bg-purple-100 text-purple-700 border-purple-300 mb-4 px-4 py-1">
                <Sparkles className="h-4 w-4 mr-2" />
                Modules premium
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Besoin de plus de puissance ?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Modules optionnels pour booster votre productivité – le CRM de base reste gratuit
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {addOns.map((addon, index) => (
                <Card
                  key={addon.id}
                  className={`border-2 relative overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 ${
                    addon.popular
                      ? 'border-viridial-500 bg-gradient-to-br from-viridial-50 to-white shadow-lg'
                      : 'border-gray-200 bg-white hover:border-viridial-300'
                  }`}
                >
                  {addon.popular && (
                    <div className="absolute -top-3 right-4 z-10">
                      <Badge className="bg-gradient-to-r from-viridial-600 to-viridial-500 text-white text-xs shadow-md">
                        ⭐ Populaire
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className={`p-3 rounded-xl transition-transform hover:scale-110 ${
                          addon.popular
                            ? 'bg-gradient-to-br from-viridial-100 to-viridial-50 text-viridial-600'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {addon.icon}
                      </div>
                    </div>
                    <CardTitle className="text-xl font-bold mb-2">{addon.name}</CardTitle>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-gray-900">{addon.price}€</span>
                      <span className="text-lg text-gray-500">/mois</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base text-gray-700 leading-relaxed mb-4">
                      {addon.description}
                    </CardDescription>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="h-4 w-4 text-viridial-600" />
                      <span>Activation immédiate</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      asChild
                      variant={addon.popular ? 'default' : 'outline'}
                      className={`w-full group ${
                        addon.popular
                          ? 'bg-viridial-600 hover:bg-viridial-700'
                          : 'hover:border-viridial-500 hover:bg-viridial-50'
                      }`}
                    >
                      <Link href="/signup" className="flex items-center justify-center">
                        Ajouter ce module
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                👉 Tous les modules sont optionnels – le CRM de base reste gratuit
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section - New */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="bg-orange-100 text-orange-700 border-orange-300 mb-4 px-4 py-1">
                <BarChart3 className="h-4 w-4 mr-2" />
                Comparaison
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Viridial vs. CRM traditionnels
              </h2>
              <p className="text-xl text-gray-600">
                Voyez la différence en un coup d'œil
              </p>
            </div>
            
            <Card className="border-2 border-gray-200 shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <th className="px-6 py-4 text-left font-bold text-gray-900">Critère</th>
                      <th className="px-6 py-4 text-center font-bold text-orange-600">CRM traditionnels</th>
                      <th className="px-6 py-4 text-center font-bold text-viridial-700 bg-viridial-50">Viridial</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-900">Coût mensuel</td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-orange-600 font-bold">50-150€</span>
                        <XCircle className="h-5 w-5 text-orange-500 mx-auto mt-1" />
                      </td>
                      <td className="px-6 py-4 text-center bg-viridial-50/50">
                        <span className="text-viridial-700 font-bold">0€</span>
                        <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto mt-1" />
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-900">Paiement sans vente</td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-orange-600 font-bold">Oui</span>
                        <XCircle className="h-5 w-5 text-orange-500 mx-auto mt-1" />
                      </td>
                      <td className="px-6 py-4 text-center bg-viridial-50/50">
                        <span className="text-green-600 font-bold">Non</span>
                        <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto mt-1" />
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-900">Limites</td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-gray-600">Souvent limitées</span>
                        <XCircle className="h-5 w-5 text-orange-500 mx-auto mt-1" />
                      </td>
                      <td className="px-6 py-4 text-center bg-viridial-50/50">
                        <span className="text-green-600 font-bold">Illimité</span>
                        <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto mt-1" />
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-900">Alignement d'intérêts</td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-orange-600">Aucun</span>
                        <XCircle className="h-5 w-5 text-orange-500 mx-auto mt-1" />
                      </td>
                      <td className="px-6 py-4 text-center bg-viridial-50/50">
                        <span className="text-green-600 font-bold">Total</span>
                        <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto mt-1" />
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors bg-green-50/30">
                      <td className="px-6 py-4 font-bold text-gray-900">Économie annuelle estimée</td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-orange-600 font-bold">-1,800€</span>
                      </td>
                      <td className="px-6 py-4 text-center bg-viridial-50">
                        <span className="text-green-700 font-bold text-xl">+1,800€</span>
                        <TrendingUp className="h-6 w-6 text-green-600 mx-auto mt-1" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust & Anti-Fraud Section - Enhanced */}
      <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-viridial-50/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="bg-viridial-100 text-viridial-700 border-viridial-300 mb-4 px-4 py-1">
                <Shield className="h-4 w-4 mr-2" />
                Sécurité & Confiance
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Un système basé sur la confiance
                <span className="block text-viridial-700 mt-2 text-3xl md:text-4xl">(et l'intelligence)</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                99% des agents jouent le jeu quand le modèle est juste et transparent
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="border-2 border-viridial-200 bg-white hover:border-viridial-400 hover:shadow-lg transition-all">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex p-4 bg-viridial-100 rounded-2xl mb-4">
                    <Shield className="h-8 w-8 text-viridial-600" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">
                    Déclaration simple
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Marquez simplement vos transactions signées dans l'interface CRM
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-2 border-blue-200 bg-white hover:border-blue-400 hover:shadow-lg transition-all">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex p-4 bg-blue-100 rounded-2xl mb-4">
                    <BadgeCheck className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">
                    Vérifications intelligentes
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Système de validation automatique et contrôles aléatoires pour garantir l'intégrité
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-2 border-yellow-200 bg-white hover:border-yellow-400 hover:shadow-lg transition-all">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex p-4 bg-yellow-100 rounded-2xl mb-4">
                    <Award className="h-8 w-8 text-yellow-600" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">
                    Badge "Agent transparent"
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Valorisez votre transparence auprès de vos clients avec un badge vérifié
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <Card className="border-2 border-viridial-400 bg-gradient-to-r from-viridial-50 to-blue-50 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="p-3 bg-viridial-100 rounded-full">
                    <ThumbsUp className="h-6 w-6 text-viridial-700" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    99% des agents jouent le jeu
                  </h3>
                </div>
                <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                  Quand le modèle est juste et aligné sur leurs intérêts, les agents sont naturellement transparents.
                  C'est la beauté de l'alignement parfait.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials - Enhanced */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300 mb-4 px-4 py-1">
                <Star className="h-4 w-4 mr-2 fill-yellow-600" />
                Témoignages clients
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Ce que disent nos utilisateurs
              </h2>
              <p className="text-xl text-gray-600">
                Plus de 2,500 agents nous font confiance
              </p>
            </div>
            
            {/* Stats Banner */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              <Card className="border-2 border-viridial-200 bg-white text-center">
                <CardContent className="p-6">
                  <div className="text-4xl font-bold text-viridial-700 mb-2">2,500+</div>
                  <div className="text-sm text-gray-600">Agents actifs</div>
                </CardContent>
              </Card>
              <Card className="border-2 border-green-200 bg-white text-center">
                <CardContent className="p-6">
                  <div className="text-4xl font-bold text-green-700 mb-2">1.2M€</div>
                  <div className="text-sm text-gray-600">Économisés/mois</div>
                </CardContent>
              </Card>
              <Card className="border-2 border-blue-200 bg-white text-center">
                <CardContent className="p-6">
                  <div className="text-4xl font-bold text-blue-700 mb-2">4.9/5</div>
                  <div className="text-sm text-gray-600">Note moyenne</div>
                </CardContent>
              </Card>
              <Card className="border-2 border-purple-200 bg-white text-center">
                <CardContent className="p-6">
                  <div className="text-4xl font-bold text-purple-700 mb-2">99%</div>
                  <div className="text-sm text-gray-600">Satisfaction</div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-2 border-gray-200 hover:border-viridial-400 hover:shadow-xl transition-all bg-white">
                <CardContent className="p-8">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic text-lg leading-relaxed">
                    "Enfin un CRM qui ne me coûte rien quand je ne vends pas. J'ai économisé plus de 1,200€ cette année comparé à mon ancien CRM."
                  </p>
                  <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-viridial-400 to-viridial-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                      JD
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Jean Dupont</p>
                      <p className="text-sm text-gray-600">Agent indépendant • Paris</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-2 border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all bg-white">
                <CardContent className="p-8">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic text-lg leading-relaxed">
                    "J'ai payé ma première commission avec plaisir. C'est la première fois que je me réjouis de payer un CRM ! Le modèle est vraiment juste."
                  </p>
                  <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                      ML
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Marie Laurent</p>
                      <p className="text-sm text-gray-600">Responsable d'agence • Lyon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA - Enhanced */}
      <section className="py-24 bg-gradient-to-br from-viridial-600 via-viridial-700 to-blue-700 text-white relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold mb-6">
              <Rocket className="h-4 w-4" />
              Prêt à transformer votre façon de travailler ?
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Commencez sans risque
              <span className="block text-3xl md:text-4xl mt-3 text-viridial-100">
                Rejoignez 2,500+ agents qui ont fait le choix intelligent
              </span>
            </h2>
            
            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 mb-10">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Sans engagement</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Sans abonnement</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Payez uniquement à la réussite</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="bg-white text-viridial-700 hover:bg-gray-100 px-10 py-7 text-xl font-bold shadow-2xl hover:shadow-3xl transition-all hover:scale-105 group"
              >
                <Link href="/signup" className="flex items-center">
                  <span className="mr-2 text-2xl">👉</span>
                  Activer mon compte (1€)
                  <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <div className="flex items-center justify-center gap-2 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 max-w-md mx-auto">
                <Lock className="h-5 w-5" />
                <span className="text-sm font-medium">
                  🔒 Activation sécurisée : 1€ (une seule fois) • Aucun autre frais jusqu'à votre première transaction
                </span>
              </div>
            </div>
            
            {/* Social proof */}
            <div className="mt-12 pt-8 border-t border-white/20">
              <p className="text-sm text-white/80 mb-4">Rejoignez des milliers d'agents satisfaits</p>
              <div className="flex items-center justify-center gap-8 flex-wrap">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-white/80" />
                  <span className="text-white/90">2,500+ agents</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-300 fill-yellow-300" />
                  <span className="text-white/90">4.9/5 étoiles</span>
                </div>
                <div className="flex items-center gap-2">
                  <Smile className="h-5 w-5 text-white/80" />
                  <span className="text-white/90">99% satisfaits</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ - Enhanced */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="bg-blue-100 text-blue-700 border-blue-300 mb-4 px-4 py-1">
                <HelpCircle className="h-4 w-4 mr-2" />
                Questions fréquentes
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Tout ce que vous devez savoir
              </h2>
              <p className="text-xl text-gray-600">
                Des réponses claires à vos questions les plus courantes
              </p>
            </div>
            <Accordion type="single" collapsible className="w-full space-y-4">
              <AccordionItem value="item-1" className="border-2 border-gray-200 rounded-xl px-6 bg-white hover:border-viridial-300 hover:shadow-md transition-all">
                <AccordionTrigger className="text-left font-bold text-lg text-gray-900 hover:no-underline py-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-viridial-100 rounded-lg">
                      <DollarSign className="h-5 w-5 text-viridial-600" />
                    </div>
                    <span>Comment fonctionne le paiement à la réussite ?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 leading-relaxed pb-5">
                  <div className="pl-12 space-y-3">
                    <p>
                      Vous utilisez le CRM gratuitement. Lorsque vous signez une vente ou une location,
                      vous marquez la transaction dans le CRM. Une commission équitable (19€ + 0,15% du montant,
                      plafonnée à 499€/mois) est alors facturée automatiquement.
                    </p>
                    <div className="bg-viridial-50 rounded-lg p-3 border border-viridial-200">
                      <p className="text-sm font-semibold text-viridial-900">
                        💡 Exemple : Pour une vente de 200 000€, vous payez 319€ (19€ + 300€)
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2" className="border-2 border-gray-200 rounded-xl px-6 bg-white hover:border-viridial-300 hover:shadow-md transition-all">
                <AccordionTrigger className="text-left font-bold text-lg text-gray-900 hover:no-underline py-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <span>Que se passe-t-il si je ne signe aucune transaction ?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 leading-relaxed pb-5">
                  <div className="pl-12">
                    <p className="text-lg font-semibold text-green-700 mb-2">
                      Rien ! Vous continuez à utiliser le CRM gratuitement, sans aucun frais.
                    </p>
                    <p>
                      Le modèle est conçu pour que vous ne payiez que lorsque vous générez des revenus.
                      C'est la promesse fondamentale de Viridial : zéro risque pour vous.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3" className="border-2 border-gray-200 rounded-xl px-6 bg-white hover:border-viridial-300 hover:shadow-md transition-all">
                <AccordionTrigger className="text-left font-bold text-lg text-gray-900 hover:no-underline py-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Zap className="h-5 w-5 text-blue-600" />
                    </div>
                    <span>Le CRM est-il vraiment illimité ?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 leading-relaxed pb-5">
                  <div className="pl-12 space-y-3">
                    <p className="font-semibold text-lg">Oui, absolument !</p>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-viridial-600 flex-shrink-0" />
                        <span><strong>Biens illimités</strong> - Ajoutez autant de biens que vous voulez</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-viridial-600 flex-shrink-0" />
                        <span><strong>Leads illimités</strong> - Gérez tous vos contacts sans limite</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-viridial-600 flex-shrink-0" />
                        <span><strong>Utilisateurs illimités</strong> - Invitez toute votre équipe</span>
                      </li>
                    </ul>
                    <p className="mt-3">
                      Toutes les fonctionnalités de base sont disponibles sans restriction. Seuls les modules premium
                      (IA, multi-diffusion, etc.) sont payants et optionnels.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4" className="border-2 border-gray-200 rounded-xl px-6 bg-white hover:border-viridial-300 hover:shadow-md transition-all">
                <AccordionTrigger className="text-left font-bold text-lg text-gray-900 hover:no-underline py-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Shield className="h-5 w-5 text-purple-600" />
                    </div>
                    <span>Comment êtes-vous sûrs que je déclare mes transactions ?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 leading-relaxed pb-5">
                  <div className="pl-12 space-y-3">
                    <p>
                      Nous combinons plusieurs mécanismes pour garantir l'intégrité :
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <BadgeCheck className="h-5 w-5 text-viridial-600 flex-shrink-0 mt-0.5" />
                        <span><strong>Déclaration simple</strong> dans le CRM</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <BadgeCheck className="h-5 w-5 text-viridial-600 flex-shrink-0 mt-0.5" />
                        <span><strong>Vérifications intelligentes</strong> automatiques</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <BadgeCheck className="h-5 w-5 text-viridial-600 flex-shrink-0 mt-0.5" />
                        <span><strong>Contrôles aléatoires</strong> pour garantir la transparence</span>
                      </li>
                    </ul>
                    <div className="bg-viridial-50 rounded-lg p-3 border border-viridial-200 mt-4">
                      <p className="text-sm">
                        <strong>99% des agents jouent le jeu</strong> car le modèle est juste et aligné sur leur réussite.
                        Les agents transparents reçoivent un badge valorisant.
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5" className="border-2 border-gray-200 rounded-xl px-6 bg-white hover:border-viridial-300 hover:shadow-md transition-all">
                <AccordionTrigger className="text-left font-bold text-lg text-gray-900 hover:no-underline py-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <RefreshCw className="h-5 w-5 text-orange-600" />
                    </div>
                    <span>Puis-je changer de modèle de tarification ?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 leading-relaxed pb-5">
                  <div className="pl-12 space-y-3">
                    <p className="font-semibold">Oui, vous pouvez changer à tout moment !</p>
                    <p>Trois modèles disponibles :</p>
                    <ul className="space-y-2 bg-gray-50 rounded-lg p-4">
                      <li className="flex items-center gap-2">
                        <Badge className="bg-viridial-600 text-white text-xs">Recommandé</Badge>
                        <span><strong>Hybride :</strong> 19€ + 0,15% (plafonné à 499€/mois)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-16"></span>
                        <span><strong>Fixe :</strong> 29€ par transaction</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-16"></span>
                        <span><strong>Premium :</strong> 0,3% (plafonné à 999€)</span>
                      </li>
                    </ul>
                    <p className="text-sm text-gray-600">
                      Vous pouvez changer à tout moment dans vos paramètres, sans frais supplémentaires.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-6" className="border-2 border-blue-300 rounded-xl px-6 bg-blue-50/50 hover:border-blue-400 hover:shadow-md transition-all">
                <AccordionTrigger className="text-left font-bold text-lg text-gray-900 hover:no-underline py-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-200 rounded-lg">
                      <Lock className="h-5 w-5 text-blue-700" />
                    </div>
                    <span>Pourquoi dois-je payer 1€ à l'activation ?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 leading-relaxed pb-5">
                  <div className="pl-12 space-y-4">
                    <p className="font-semibold text-lg">
                      Le paiement unique de 1€ lors de l'activation sert à :
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <div className="p-1 bg-blue-100 rounded-full mt-0.5">
                          <CheckCircle2 className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <strong className="text-gray-900">Valider votre carte bancaire</strong>
                          <p className="text-sm text-gray-600">de manière sécurisée pour les futures commissions</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="p-1 bg-blue-100 rounded-full mt-0.5">
                          <CheckCircle2 className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <strong className="text-gray-900">Protéger la plateforme</strong>
                          <p className="text-sm text-gray-600">contre les faux comptes et les abus</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="p-1 bg-blue-100 rounded-full mt-0.5">
                          <CheckCircle2 className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <strong className="text-gray-900">Garantir un environnement de confiance</strong>
                          <p className="text-sm text-gray-600">pour tous les agents immobiliers</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="p-1 bg-blue-100 rounded-full mt-0.5">
                          <CheckCircle2 className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <strong className="text-gray-900">Activer votre compte</strong>
                          <p className="text-sm text-gray-600">de façon définitive</p>
                        </div>
                      </li>
                    </ul>
                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mt-4">
                      <p className="font-bold text-green-900 mb-1">
                        ✅ C'est le seul paiement jusqu'à votre première transaction réussie
                      </p>
                      <p className="text-sm text-green-800">
                        Ensuite, vous ne payez que lorsque vous signez une vente ou une location.
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-7" className="border-2 border-gray-200 rounded-xl px-6 bg-white hover:border-viridial-300 hover:shadow-md transition-all">
                <AccordionTrigger className="text-left font-bold text-lg text-gray-900 hover:no-underline py-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <CreditCard className="h-5 w-5 text-yellow-600" />
                    </div>
                    <span>Le 1€ d'activation est-il remboursable ?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 leading-relaxed pb-5">
                  <div className="pl-12 space-y-3">
                    <p>
                      Le 1€ d'activation n'est pas remboursable car il sert à valider votre compte et protéger la plateforme.
                      Cependant, c'est le seul frais fixe que vous paierez.
                    </p>
                    <div className="bg-viridial-50 rounded-lg p-4 border border-viridial-200">
                      <p className="font-semibold text-gray-900 mb-2">
                        En résumé :
                      </p>
                      <ul className="space-y-1 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-viridial-600" />
                          <span><strong>1€ une fois</strong> pour toujours</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-viridial-600" />
                          <span>Ensuite, <strong>payez uniquement quand vous gagnez</strong></span>
                        </li>
                      </ul>
                    </div>
                    <p className="text-sm text-gray-600">
                      Tous les autres paiements sont uniquement liés à vos transactions réussies (ventes ou locations signées).
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-8" className="border-2 border-gray-200 rounded-xl px-6 bg-white hover:border-viridial-300 hover:shadow-md transition-all">
                <AccordionTrigger className="text-left font-bold text-lg text-gray-900 hover:no-underline py-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <XCircle className="h-5 w-5 text-orange-600" />
                    </div>
                    <span>Puis-je utiliser le CRM sans payer le 1€ d'activation ?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 leading-relaxed pb-5">
                  <div className="pl-12 space-y-3">
                    <p className="font-semibold text-lg">
                      Non, le paiement de 1€ est obligatoire pour activer votre compte.
                    </p>
                    <p>
                      Cette vérification unique permet de garantir la sécurité et la qualité de la plateforme
                      pour tous les utilisateurs. C'est une mesure de protection essentielle.
                    </p>
                    <div className="bg-viridial-50 rounded-lg p-4 border border-viridial-200 mt-4">
                      <p className="font-semibold text-gray-900 mb-2">
                        💡 Rappel important :
                      </p>
                      <p className="text-sm">
                        Après cette activation unique, vous utilisez le CRM <strong>gratuitement</strong>
                        et ne payez que lorsque vous signez une transaction (19€ + 0,15% du montant, plafonné à 499€/mois).
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}


