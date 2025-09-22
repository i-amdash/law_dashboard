"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye, EyeOff } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ContentTableProps {
  type: 'carousel' | 'testimonials' | 'ambassadors';
  columns: string[];
  endpoint: string;
}

interface ContentItem {
  id: string;
  name: string;
  display_order: number;
  is_active: boolean;
  position?: string;
  company?: string;
  content?: string;
  image_url?: string;
  instagram_url?: string;
  created_at: string;
  updated_at: string;
}

const ContentTable: React.FC<ContentTableProps> = ({ type, columns, endpoint }) => {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${type}`);
      }
      
      const data = await response.json();
      const itemsKey = type === 'carousel' ? 'carouselItems' : 
                      type === 'testimonials' ? 'testimonials' : 'ambassadors';
      setItems(data[itemsKey] || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to load ${type}`);
    } finally {
      setLoading(false);
    }
  }, [endpoint, type]);

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`${endpoint}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_active: !currentStatus
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update ${type}`);
      }

      await fetchItems(); // Refresh the list
    } catch (err) {
      console.error('Error toggling status:', err);
      setError(err instanceof Error ? err.message : `Failed to update ${type}`);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const response = await fetch(`${endpoint}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete ${type}`);
      }

      await fetchItems(); // Refresh the list
    } catch (err) {
      console.error('Error deleting item:', err);
      setError(err instanceof Error ? err.message : `Failed to delete ${type}`);
    }
  };

  const formatCellValue = (column: string, item: ContentItem) => {
    const value = item[column as keyof ContentItem];
    
    switch (column) {
      case 'is_active':
        return (
          <Badge variant={value ? "default" : "secondary"}>
            {value ? "Active" : "Inactive"}
          </Badge>
        );
      case 'content':
        return value ? (
          <div className="max-w-xs truncate" title={String(value)}>
            {String(value)}
          </div>
        ) : '-';
      case 'image_url':
      case 'instagram_url':
        return value ? (
          <a
            href={String(value)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline max-w-xs truncate block"
          >
            {String(value)}
          </a>
        ) : '-';
      default:
        return value || '-';
    }
  };

  const formatColumnHeader = (column: string) => {
    return column
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  useEffect(() => {
    fetchItems();
  }, [endpoint, fetchItems]);

  if (loading) {
    return <div className="text-center py-8">Loading {type}...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        <p>{error}</p>
        <Button onClick={fetchItems} className="mt-2">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column}>
                {formatColumnHeader(column)}
              </TableHead>
            ))}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length + 1} className="text-center py-8">
                No {type} found. Add your first item to get started.
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <TableRow key={item.id}>
                {columns.map((column) => (
                  <TableCell key={column}>
                    {formatCellValue(column, item)}
                  </TableCell>
                ))}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleActive(item.id, item.is_active)}
                      title={item.is_active ? "Deactivate" : "Activate"}
                    >
                      {item.is_active ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button variant="ghost" size="sm" title="Edit">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" title="Delete">
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the {type.slice(0, -1)} &ldquo;{item.name}&rdquo;.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteItem(item.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ContentTable;