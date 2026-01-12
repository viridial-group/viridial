'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Organization, Address, Phone, Email } from '@/types/organization';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, MapPin, Phone as PhoneIcon, Mail } from 'lucide-react';

interface EditContactInfoModalProps {
  organization: Organization;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: { addresses: Address[]; phones: Phone[]; emails: Email[] }) => void;
}

export function EditContactInfoModal({
  organization,
  open,
  onOpenChange,
  onSave,
}: EditContactInfoModalProps) {
  const t = useTranslations('organizations');
  const tCommon = useTranslations('common');

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [phones, setPhones] = useState<Phone[]>([]);
  const [emails, setEmails] = useState<Email[]>([]);

  useEffect(() => {
    if (open) {
      setAddresses(
        organization.addresses?.map((addr) => ({
          ...addr,
          id: addr.id || `temp-${Date.now()}-${Math.random()}`,
        })) || []
      );
      setPhones(
        organization.phones?.map((phone) => ({
          ...phone,
          id: phone.id || `temp-${Date.now()}-${Math.random()}`,
        })) || []
      );
      setEmails(
        organization.emails?.map((email) => ({
          ...email,
          id: email.id || `temp-${Date.now()}-${Math.random()}`,
        })) || []
      );
    }
  }, [organization, open]);

  const addAddress = () => {
    setAddresses([
      ...addresses,
      {
        id: `temp-${Date.now()}-${Math.random()}`,
        type: 'headquarters',
        street: '',
        city: '',
        postalCode: '',
        country: '',
        isPrimary: addresses.length === 0,
      },
    ]);
  };

  const updateAddress = (index: number, field: keyof Address, value: any) => {
    const updated = [...addresses];
    updated[index] = { ...updated[index], [field]: value };
    
    // Si on marque comme primary, décocher les autres
    if (field === 'isPrimary' && value) {
      updated.forEach((addr, i) => {
        if (i !== index) addr.isPrimary = false;
      });
    }
    
    setAddresses(updated);
  };

  const removeAddress = (index: number) => {
    setAddresses(addresses.filter((_, i) => i !== index));
  };

  const addPhone = () => {
    setPhones([
      ...phones,
      {
        id: `temp-${Date.now()}-${Math.random()}`,
        type: 'main',
        number: '',
        isPrimary: phones.length === 0,
      },
    ]);
  };

  const updatePhone = (index: number, field: keyof Phone, value: any) => {
    const updated = [...phones];
    updated[index] = { ...updated[index], [field]: value };
    
    // Si on marque comme primary, décocher les autres
    if (field === 'isPrimary' && value) {
      updated.forEach((phone, i) => {
        if (i !== index) phone.isPrimary = false;
      });
    }
    
    setPhones(updated);
  };

  const removePhone = (index: number) => {
    setPhones(phones.filter((_, i) => i !== index));
  };

  const addEmail = () => {
    setEmails([
      ...emails,
      {
        id: `temp-${Date.now()}-${Math.random()}`,
        type: 'main',
        address: '',
        isPrimary: emails.length === 0,
      },
    ]);
  };

  const updateEmail = (index: number, field: keyof Email, value: any) => {
    const updated = [...emails];
    updated[index] = { ...updated[index], [field]: value };
    
    // Si on marque comme primary, décocher les autres
    if (field === 'isPrimary' && value) {
      updated.forEach((email, i) => {
        if (i !== index) email.isPrimary = false;
      });
    }
    
    setEmails(updated);
  };

  const removeEmail = (index: number) => {
    setEmails(emails.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ addresses, phones, emails });
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('editContactInformation')}</DialogTitle>
          <DialogDescription>
            {t('editContactInformationDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Addresses Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-viridial-600" />
                <Label className="text-base font-semibold">{t('addresses')}</Label>
                <Badge variant="secondary" className="text-xs">
                  {addresses.length}
                </Badge>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAddress}
                className="gap-2"
              >
                <Plus className="h-3.5 w-3.5" />
                {t('addAddress')}
              </Button>
            </div>

            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
              {addresses.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">{t('noAddresses')}</p>
              ) : (
                addresses.map((address, index) => (
                  <div
                    key={address.id}
                    className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {t(`addressTypes.${address.type}`)}
                      </Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAddress(index)}
                        className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor={`address-type-${index}`} className="text-xs">
                          {t('type')}
                        </Label>
                        <Select
                          value={address.type}
                          onValueChange={(value) =>
                            updateAddress(index, 'type', value as Address['type'])
                          }
                        >
                          <SelectTrigger id={`address-type-${index}`} className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="headquarters">{t('addressTypes.headquarters')}</SelectItem>
                            <SelectItem value="branch">{t('addressTypes.branch')}</SelectItem>
                            <SelectItem value="warehouse">{t('addressTypes.warehouse')}</SelectItem>
                            <SelectItem value="other">{t('addressTypes.other')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2 flex items-end">
                        <div className="flex items-center space-x-2 h-9">
                          <Checkbox
                            id={`address-primary-${index}`}
                            checked={address.isPrimary}
                            onCheckedChange={(checked) =>
                              updateAddress(index, 'isPrimary', checked === true)
                            }
                          />
                          <Label
                            htmlFor={`address-primary-${index}`}
                            className="text-xs font-normal cursor-pointer"
                          >
                            {t('primary')}
                          </Label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`address-street-${index}`} className="text-xs">
                        {t('street')}
                      </Label>
                      <Input
                        id={`address-street-${index}`}
                        value={address.street}
                        onChange={(e) => updateAddress(index, 'street', e.target.value)}
                        className="h-9"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor={`address-city-${index}`} className="text-xs">
                          {t('city')}
                        </Label>
                        <Input
                          id={`address-city-${index}`}
                          value={address.city}
                          onChange={(e) => updateAddress(index, 'city', e.target.value)}
                          className="h-9"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`address-postal-${index}`} className="text-xs">
                          {t('postalCode')}
                        </Label>
                        <Input
                          id={`address-postal-${index}`}
                          value={address.postalCode}
                          onChange={(e) => updateAddress(index, 'postalCode', e.target.value)}
                          className="h-9"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`address-country-${index}`} className="text-xs">
                          {t('country')}
                        </Label>
                        <Input
                          id={`address-country-${index}`}
                          value={address.country}
                          onChange={(e) => updateAddress(index, 'country', e.target.value)}
                          className="h-9"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Phones Section */}
          <div className="space-y-4 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PhoneIcon className="h-4 w-4 text-viridial-600" />
                <Label className="text-base font-semibold">{t('phones')}</Label>
                <Badge variant="secondary" className="text-xs">
                  {phones.length}
                </Badge>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addPhone}
                className="gap-2"
              >
                <Plus className="h-3.5 w-3.5" />
                {t('addPhone')}
              </Button>
            </div>

            <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2">
              {phones.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">{t('noPhones')}</p>
              ) : (
                phones.map((phone, index) => (
                  <div
                    key={phone.id}
                    className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {t(`phoneTypes.${phone.type}`)}
                      </Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removePhone(index)}
                        className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor={`phone-type-${index}`} className="text-xs">
                          {t('type')}
                        </Label>
                        <Select
                          value={phone.type}
                          onValueChange={(value) =>
                            updatePhone(index, 'type', value as Phone['type'])
                          }
                        >
                          <SelectTrigger id={`phone-type-${index}`} className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="main">{t('phoneTypes.main')}</SelectItem>
                            <SelectItem value="sales">{t('phoneTypes.sales')}</SelectItem>
                            <SelectItem value="support">{t('phoneTypes.support')}</SelectItem>
                            <SelectItem value="billing">{t('phoneTypes.billing')}</SelectItem>
                            <SelectItem value="other">{t('phoneTypes.other')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2 flex items-end">
                        <div className="flex items-center space-x-2 h-9">
                          <Checkbox
                            id={`phone-primary-${index}`}
                            checked={phone.isPrimary}
                            onCheckedChange={(checked) =>
                              updatePhone(index, 'isPrimary', checked === true)
                            }
                          />
                          <Label
                            htmlFor={`phone-primary-${index}`}
                            className="text-xs font-normal cursor-pointer"
                          >
                            {t('primary')}
                          </Label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`phone-number-${index}`} className="text-xs">
                        {t('phone')} *
                      </Label>
                      <Input
                        id={`phone-number-${index}`}
                        type="tel"
                        value={phone.number}
                        onChange={(e) => updatePhone(index, 'number', e.target.value)}
                        className="h-9"
                        required
                        placeholder="+33 1 23 45 67 89"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Emails Section */}
          <div className="space-y-4 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-viridial-600" />
                <Label className="text-base font-semibold">{t('emails')}</Label>
                <Badge variant="secondary" className="text-xs">
                  {emails.length}
                </Badge>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addEmail}
                className="gap-2"
              >
                <Plus className="h-3.5 w-3.5" />
                {t('addEmail')}
              </Button>
            </div>

            <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2">
              {emails.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">{t('noEmails')}</p>
              ) : (
                emails.map((email, index) => (
                  <div
                    key={email.id}
                    className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {t(`emailTypes.${email.type}`)}
                      </Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeEmail(index)}
                        className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor={`email-type-${index}`} className="text-xs">
                          {t('type')}
                        </Label>
                        <Select
                          value={email.type}
                          onValueChange={(value) =>
                            updateEmail(index, 'type', value as Email['type'])
                          }
                        >
                          <SelectTrigger id={`email-type-${index}`} className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="main">{t('emailTypes.main')}</SelectItem>
                            <SelectItem value="sales">{t('emailTypes.sales')}</SelectItem>
                            <SelectItem value="support">{t('emailTypes.support')}</SelectItem>
                            <SelectItem value="billing">{t('emailTypes.billing')}</SelectItem>
                            <SelectItem value="other">{t('emailTypes.other')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2 flex items-end">
                        <div className="flex items-center space-x-2 h-9">
                          <Checkbox
                            id={`email-primary-${index}`}
                            checked={email.isPrimary}
                            onCheckedChange={(checked) =>
                              updateEmail(index, 'isPrimary', checked === true)
                            }
                          />
                          <Label
                            htmlFor={`email-primary-${index}`}
                            className="text-xs font-normal cursor-pointer"
                          >
                            {t('primary')}
                          </Label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`email-address-${index}`} className="text-xs">
                        {t('email')} *
                      </Label>
                      <Input
                        id={`email-address-${index}`}
                        type="email"
                        value={email.address}
                        onChange={(e) => updateEmail(index, 'address', e.target.value)}
                        className="h-9"
                        required
                        placeholder="contact@example.com"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={handleCancel}>
              {tCommon('cancel')}
            </Button>
            <Button type="submit" className="bg-viridial-600 hover:bg-viridial-700 text-white">
              {tCommon('save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

