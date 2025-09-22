"use client";

import { useState } from "react";
import { ArrowLeft, User, Package, MapPin, Phone, Mail, Calendar, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";

import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { formatter } from "@/lib/utils";

interface SaleDetailsClientProps {
  sale: any;
  userData?: any;
  orderTotal: number;
  totalItems: number;
}

export const SaleDetailsClient: React.FC<SaleDetailsClientProps> = ({
  sale,
  userData,
  orderTotal,
  totalItems
}) => {
  const router = useRouter();
  const params = useParams();

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'out for delivery':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Use userData or fallback to sale data
  const customerName = userData?.full_name || 
                      sale.customer_name || 
                      'Unknown Customer';

  const customerEmail = userData?.email || 
                       sale.email || 
                       'No email';

  const customerPhone = userData?.phone || 
                       sale.phone || 
                       'No phone';

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/${params.storeId}/sales`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sales
          </Button>
          <Heading 
            title={`Sale Details - ${sale.reference}`} 
            description="Complete information about this sale" 
          />
        </div>
        <Badge className={`${getStatusColor(sale.status)} capitalize`}>
          {sale.status || 'pending'}
        </Badge>
      </div>
      <Separator />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Name:</span>
                <span>{customerName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Email:</span>
                <span>{customerEmail}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Phone:</span>
                <span>{customerPhone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Address:</span>
                <span className="text-sm">{sale.shipping_address || 'No address provided'}</span>
              </div>
              {userData?.created_at && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Customer Since:</span>
                  <span>{format(new Date(userData.created_at), 'MMM dd, yyyy')}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Order Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Order Reference:</span>
                <span className="font-mono text-sm">{sale.reference}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Order Date:</span>
                <span>{format(new Date(sale.created_at), 'MMM dd, yyyy HH:mm')}</span>
              </div>
              {sale.updated_at && (
                <div className="flex items-center justify-between">
                  <span className="font-medium">Last Updated:</span>
                  <span>{format(new Date(sale.updated_at), 'MMM dd, yyyy HH:mm')}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="font-medium">Total Items:</span>
                <span>{totalItems}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Payment Status:</span>
                <Badge className="bg-green-100 text-green-800">
                  <CreditCard className="h-3 w-3 mr-1" />
                  Paid
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Total Amount:</span>
                <span className="text-green-600">{formatter.format(orderTotal)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          {sale.order_items && sale.order_items.length > 0 ? (
            <div className="space-y-4">
              {sale.order_items.map((item: any, index: number) => (
                <div key={item.id || index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    {item.product?.images && item.product.images[0] && (
                      <Image
                        src={item.product.images[0]}
                        alt={item.product?.name || 'Product'}
                        width={64}
                        height={64}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    )}
                    <div>
                      <h3 className="font-medium">{item.product?.name || 'Unknown Product'}</h3>
                      <div className="text-sm text-muted-foreground space-y-1">
                        {item.size && <p>Size: {item.size}</p>}
                        {item.gender && <p>Gender: {item.gender}</p>}
                        <p>Quantity: {item.quantity || 1}</p>
                        <p>Unit Price: {formatter.format(Number(item.product?.price || 0))}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {formatter.format(Number(item.product?.price || 0) * (item.quantity || 1))}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {item.quantity || 1} × {formatter.format(Number(item.product?.price || 0))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No order items found for this sale.
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};