"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ContentFormProps {
  type: 'carousel' | 'testimonials' | 'ambassadors';
  endpoint: string;
  onSuccess?: () => void;
  trigger: React.ReactNode;
  item?: any; // For editing existing items
}

const ContentForm: React.FC<ContentFormProps> = ({
  type,
  endpoint,
  onSuccess,
  trigger,
  item
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(() => {
    if (item) {
      return { ...item };
    }

    // Default form data based on type
    switch (type) {
      case 'carousel':
        return { name: '', display_order: 0, is_active: true };
      case 'testimonials':
        return { 
          name: '', 
          position: '', 
          company: '', 
          content: '', 
          display_order: 0, 
          is_active: true 
        };
      case 'ambassadors':
        return { 
          name: '', 
          position: '', 
          image_url: '', 
          instagram_url: '', 
          display_order: 0, 
          is_active: true 
        };
      default:
        return {};
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = item ? `${endpoint}/${item.id}` : endpoint;
      const method = item ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${item ? 'update' : 'create'} ${type}`);
      }

      setOpen(false);
      onSuccess?.();
    } catch (err) {
      console.error('Form submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const renderFormFields = () => {
    switch (type) {
      case 'carousel':
        return (
          <>
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter carousel item name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="display_order">Display Order</Label>
              <Input
                id="display_order"
                type="number"
                value={formData.display_order || 0}
                onChange={(e) => handleChange('display_order', parseInt(e.target.value))}
                min="0"
              />
            </div>
          </>
        );

      case 'testimonials':
        return (
          <>
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter customer name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                value={formData.position || ''}
                onChange={(e) => handleChange('position', e.target.value)}
                placeholder="Job title (optional)"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={formData.company || ''}
                onChange={(e) => handleChange('company', e.target.value)}
                placeholder="Company name (optional)"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">Testimonial Content</Label>
              <Textarea
                id="content"
                value={formData.content || ''}
                onChange={(e) => handleChange('content', e.target.value)}
                placeholder="Enter testimonial text"
                rows={4}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="display_order">Display Order</Label>
              <Input
                id="display_order"
                type="number"
                value={formData.display_order || 0}
                onChange={(e) => handleChange('display_order', parseInt(e.target.value))}
                min="0"
              />
            </div>
          </>
        );

      case 'ambassadors':
        return (
          <>
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter ambassador name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                value={formData.position || ''}
                onChange={(e) => handleChange('position', e.target.value)}
                placeholder="Ambassador title/role"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                value={formData.image_url || ''}
                onChange={(e) => handleChange('image_url', e.target.value)}
                placeholder="https://example.com/image.jpg"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="instagram_url">Instagram URL</Label>
              <Input
                id="instagram_url"
                value={formData.instagram_url || ''}
                onChange={(e) => handleChange('instagram_url', e.target.value)}
                placeholder="https://instagram.com/username"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="display_order">Display Order</Label>
              <Input
                id="display_order"
                type="number"
                value={formData.display_order || 0}
                onChange={(e) => handleChange('display_order', parseInt(e.target.value))}
                min="0"
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {item ? 'Edit' : 'Add'} {type === 'carousel' ? 'Carousel Item' : 
             type === 'testimonials' ? 'Testimonial' : 'Ambassador'}
          </DialogTitle>
          <DialogDescription>
            {item ? 'Update the details below.' : 'Add a new item to your content.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {renderFormFields()}
          
          {/* Active Status Toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleChange('is_active', checked)}
            />
            <Label htmlFor="is_active">Active</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (item ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContentForm;