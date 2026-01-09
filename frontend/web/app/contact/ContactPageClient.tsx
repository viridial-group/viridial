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
import { Mail, Phone, MapPin, CheckCircle2, AlertCircle, Send } from "lucide-react";
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
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-viridial-50 to-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            {t('contact.hero.title')}
          </h1>
          <p className="text-2xl text-viridial-600 font-semibold mb-4">
            {t('contact.hero.subtitle')}
          </p>
          <p className="text-xl text-gray-600">
            {t('contact.hero.description')}
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Form */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl">{t('contact.form.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('contact.form.name')}
                    </label>
                    <Input
                      id="name"
                      type="text"
                      required
                      placeholder={t('contact.form.namePlaceholder')}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('contact.form.email')}
                    </label>
                    <Input
                      id="email"
                      type="email"
                      required
                      placeholder={t('contact.form.emailPlaceholder')}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('contact.form.company')}
                    </label>
                    <Input
                      id="company"
                      type="text"
                      placeholder={t('contact.form.companyPlaceholder')}
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('contact.form.subject')}
                    </label>
                    <Select
                      value={formData.subject}
                      onValueChange={(value) => setFormData({ ...formData, subject: value })}
                      required
                    >
                      <SelectTrigger>
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
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('contact.form.message')}
                    </label>
                    <Textarea
                      id="message"
                      required
                      rows={6}
                      placeholder={t('contact.form.messagePlaceholder')}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-viridial-600 hover:bg-viridial-700"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="mr-2">{t('contact.form.submitLoading')}</span>
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

            {/* Contact Info */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {t('contact.info.title')}
                </h2>
              </div>

              {contactInfo.map((info, index) => (
                <Card key={index} className="border-2 hover:border-viridial-200 transition-colors">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="mt-1">{info.icon}</div>
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">{info.title}</CardTitle>
                        <CardDescription className="text-base font-semibold text-gray-900">
                          {info.value}
                        </CardDescription>
                        <CardDescription className="mt-1">
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
