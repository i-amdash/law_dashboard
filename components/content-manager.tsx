import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ContentTable from "@/components/content-table";
import ContentForm from "@/components/content-form";

interface ContentManagerProps {
  type: 'carousel' | 'testimonials' | 'ambassadors';
  title: string;
}

const ContentManager: React.FC<ContentManagerProps> = ({ type, title }) => {
  const getColumns = () => {
    switch (type) {
      case 'carousel':
        return ['name', 'display_order', 'is_active'];
      case 'testimonials':
        return ['name', 'position', 'company', 'content', 'display_order', 'is_active'];
      case 'ambassadors':
        return ['name', 'position', 'image_url', 'instagram_url', 'display_order', 'is_active'];
      default:
        return [];
    }
  };

  const getApiEndpoint = () => `/api/content/${type}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title} Management</h1>
          <p className="text-muted-foreground">
            Manage your {title.toLowerCase()} content dynamically
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add {type === 'carousel' ? 'Item' : type === 'testimonials' ? 'Testimonial' : 'Ambassador'}
        </Button>
      </div>

      {/* Content Table */}
      <ContentTable
        type={type}
        columns={getColumns()}
        endpoint={getApiEndpoint()}
      />

      {/* Content Form Modal would be rendered here when needed */}
    </div>
  );
};

export default ContentManager;