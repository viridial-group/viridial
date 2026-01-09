/**
 * Trust Signals Component
 * Displays social proof and trust indicators to increase conversions
 */

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Award, Users, Zap, TrendingUp, CheckCircle2 } from "lucide-react";

interface TrustSignalsProps {
  className?: string;
}

export function TrustSignals({ className = "" }: TrustSignalsProps) {
  const signals = [
    {
      icon: <Shield className="h-6 w-6 text-viridial-600" />,
      text: "Paiement sécurisé",
      subtext: "Stripe & PCI-DSS",
    },
    {
      icon: <Award className="h-6 w-6 text-blue-600" />,
      text: "98% satisfaction",
      subtext: "500+ clients",
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-purple-600" />,
      text: "ROI en 3 mois",
      subtext: "Garanti",
    },
    {
      icon: <Zap className="h-6 w-6 text-orange-600" />,
      text: "99.9% disponibilité",
      subtext: "SLA garanti",
    },
  ];

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      {signals.map((signal, index) => (
        <Card key={index} className="text-center border-2 hover:border-viridial-200 transition-colors">
          <CardContent className="pt-6">
            <div className="flex justify-center mb-2">{signal.icon}</div>
            <p className="font-semibold text-sm text-gray-900">{signal.text}</p>
            <p className="text-xs text-gray-500 mt-1">{signal.subtext}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Social Proof Badge Component
 */
export function SocialProofBadge() {
  return (
    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
      <div className="flex -space-x-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="w-8 h-8 rounded-full bg-viridial-100 border-2 border-white flex items-center justify-center text-viridial-600 font-bold text-xs"
          >
            {i}
          </div>
        ))}
      </div>
      <span className="font-semibold">500+ clients satisfaits</span>
      <div className="flex items-center text-yellow-500">
        <span className="text-sm font-bold">4.9/5</span>
        <span className="ml-1">★★★★★</span>
      </div>
    </div>
  );
}

/**
 * Guarantee Badge Component
 */
export function GuaranteeBadge() {
  return (
    <Badge variant="outline" className="border-viridial-300 text-viridial-700 bg-viridial-50 px-4 py-2">
      <Shield className="h-4 w-4 mr-2" />
      <span className="font-semibold">Garantie satisfait ou remboursé 30 jours</span>
    </Badge>
  );
}
