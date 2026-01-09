'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/contexts/I18nContext";
import { Mail, Phone, MapPin, CheckCircle2, AlertCircle, Send, MessageSquare } from "lucide-react";
import { useToast } from "@/components/ui/simple-toast";

export function ContactPageClient() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // TODO: Implement actual API call
    setTimeout(() => {
      setLoading(false);
      toast({
        title: t('contact.form.success.title'),
        description: t('contact.form.success.description'),
        variant: 'success',
      });
      setFormData({
        name: '',
        email: '',
        company: '',
        subject: '',
        message: '',
      });
    }, 1000);
  };

  const contactInfo = [
    {
      icon: <Mail className="h-6 w-6 text-viridial-600" />,
      title: t('contact.info.email.title'),
      value: t('contact.info.email.value'),
      description: t('contact.info.email.description'),
    },
    {
      icon: <Mail className="h-6 w-6 text-blue-600" />,
      title: t('contact.info.sales.title'),
      value: t('contact.info.sales.value'),
      description: t('contact.info.sales.description'),
    },
    {
      icon: <Mail className="h-6 w-6 text-purple-600" />,
      title: t('contact.info.support.title'),
      value: t('contact.info.support.value'),
      description: t('contact.info.support.description'),
    },
    {
      icon: <MapPin className="h-6 w-6 text-orange-600" />,
      title: t('contact.info.address.title'),
      value: t('contact.info.address.value'),
      description: t('contact.info.address.description'),
    },
  ];

  return (
    <div className="w-full">
      {/* Hero Section - Enhanced */}
      <section className="relative bg-gradient-to-br from-viridial-600 via-viridial-500 to-teal-500 py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-white rounded-full opacity-10 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full opacity-10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center px-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-medium mb-8">
            <MessageSquare className="h-4 w-4" />
            Contactez-nous
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            {t('contact.hero.title')}
          </h1>
          <p className="text-2xl md:text-3xl text-viridial-50 font-semibold mb-4">
            {t('contact.hero.subtitle')}
          </p>
          <p className="text-xl md:text-2xl text-viridial-100 max-w-3xl mx-auto">
            {t('contact.hero.description')}
          </p>
        </div>
      </section>

      {/* Contact Section - Enhanced */}
      <section className="py-20 lg:py-28 px-4 bg-gradient-to-br from-gray-50 via-white to-viridial-50/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form - Enhanced */}
            <Card className="border-2 border-gray-200 shadow-xl bg-white hover:shadow-2xl transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-viridial-500 to-viridial-600 text-white pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Send className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-2xl font-bold">{t('contact.form.title')}</CardTitle>
                </div>
                <CardDescription className="text-viridial-100 mt-2">
                  Remplissez le formulaire et nous vous répondrons dans les plus brefs délais
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('contact.form.name')}
                    </label>
                    <Input
                      id="name"
                      type="text"
                      required
                      placeholder={t('contact.form.namePlaceholder')}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="border-2 border-gray-200 focus:border-viridial-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('contact.form.email')}
                    </label>
                    <Input
                      id="email"
                      type="email"
                      required
                      placeholder={t('contact.form.emailPlaceholder')}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="border-2 border-gray-200 focus:border-viridial-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="company" className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('contact.form.company')}
                    </label>
                    <Input
                      id="company"
                      type="text"
                      placeholder={t('contact.form.companyPlaceholder')}
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="border-2 border-gray-200 focus:border-viridial-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('contact.form.subject')}
                    </label>
                    <Select
                      value={formData.subject}
                      onValueChange={(value) => setFormData({ ...formData, subject: value })}
                      required
                    >
                      <SelectTrigger className="border-2 border-gray-200 focus:border-viridial-500">
                        <SelectValue placeholder={t('contact.form.subjectPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">{t('contact.form.subjects.general')}</SelectItem>
                        <SelectItem value="sales">{t('contact.form.subjects.sales')}</SelectItem>
                        <SelectItem value="support">{t('contact.form.subjects.support')}</SelectItem>
                        <SelectItem value="partnership">{t('contact.form.subjects.partnership')}</SelectItem>
                        <SelectItem value="press">{t('contact.form.subjects.press')}</SelectItem>
                        <SelectItem value="other">{t('contact.form.subjects.other')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('contact.form.message')}
                    </label>
                    <Textarea
                      id="message"
                      required
                      rows={6}
                      placeholder={t('contact.form.messagePlaceholder')}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="border-2 border-gray-200 focus:border-viridial-500 transition-colors resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-gradient-to-r from-viridial-500 via-viridial-600 to-viridial-700 hover:from-viridial-600 hover:via-viridial-700 hover:to-viridial-800 text-white border-0 shadow-lg hover:shadow-xl transition-all"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="mr-2">{t('contact.form.submitLoading')}</span>
                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-5 w-5" />
                        {t('contact.form.submit')}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Info - Enhanced */}
            <div className="space-y-6">
              <div className="mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {t('contact.info.title')}
                </h2>
                <p className="text-lg text-gray-600">
                  Plusieurs façons de nous contacter selon vos besoins
                </p>
              </div>

              {contactInfo.map((info, index) => (
                <Card 
                  key={index} 
                  className="group border-2 border-gray-200 hover:border-viridial-300 hover:shadow-xl transition-all duration-300 bg-white cursor-pointer"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-white group-hover:scale-110 transition-transform duration-300 shadow-md">
                        {info.icon}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg font-bold text-gray-900 mb-2 group-hover:text-viridial-600 transition-colors">
                          {info.title}
                        </CardTitle>
                        <CardDescription className="text-base font-semibold text-gray-900 mb-1">
                          {info.value}
                        </CardDescription>
                        <CardDescription className="text-sm text-gray-600 leading-relaxed">
                          {info.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
