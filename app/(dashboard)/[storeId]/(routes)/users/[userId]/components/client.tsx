"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import axios from "axios";
import { toast } from "react-hot-toast";

import { User } from "@/types";

import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AlertModal } from "@/components/modals/alert-modal";

// Nigerian Naira formatter
const formatNaira = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

interface Order {
  id: string;
  reference: string;
  is_paid: boolean;
  status: string;
  phone: string;
  email: string;
  shipping_address: string;
  customer_name: string;
  created_at: string;
  updated_at: string;
  order_items: {
    id: string;
    product_id: string;
    products: {
      id: string;
      name: string;
      price: string;
      images: string[];
    }
  }[];
}

interface UserDetailsClientProps {
  user: User;
  orders: Order[];
}

export const UserDetailsClient: React.FC<UserDetailsClientProps> = ({
  user,
  orders
}) => {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  // Update order status
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      setLoading(true);
      await axios.patch(`/api/${params.storeId}/orders/${orderId}`, {
        status: newStatus
      });
      toast.success('Order status updated');
      router.refresh();
    } catch (error) {
      toast.error('Failed to update order status');
      console.error('Error updating order status:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PPP');
  };

  // Get status color
  const getStatusColor = (status: string) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'out for delivery': 'bg-blue-100 text-blue-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title="User Details"
          description={`View details for ${user.full_name}`}
        />
      </div>
      <Separator />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* User Info Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
              <p className="mt-1">{user.full_name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Email</h3>
              <p className="mt-1">{user.email}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Phone</h3>
              <p className="mt-1">{user.phone}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Joined On</h3>
              <p className="mt-1">{formatDate(user.created_at)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Orders Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Orders ({orders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <p className="text-gray-500">No orders found for this user.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left">Order Items</th>
                      <th scope="col" className="px-4 py-3 text-left">Shipping Address</th>
                      <th scope="col" className="px-4 py-3 text-left">Status</th>
                      <th scope="col" className="px-4 py-3 text-left">Total</th>
                      <th scope="col" className="px-4 py-3 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="bg-white border-b">
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            <div className="text-xs text-gray-500 font-medium">#{order.reference}</div>
                            {order.order_items.map((item, index) => (
                              <div key={index} className="text-sm">
                                {item.products?.name || 'Unknown Product'} - {formatNaira(Number(item.products?.price || 0))}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm space-y-1">
                            {order.shipping_address && (
                              <div>{order.shipping_address}</div>
                            )}
                            {order.email && (
                              <div className="text-xs text-gray-500">{order.email}</div>
                            )}
                            {!order.shipping_address && !order.email && (
                              <div className="text-gray-400">No address provided</div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={getStatusColor(order.status)}>
                            {order.status || 'Pending'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          {formatNaira(order.order_items.reduce((total, item) => {
                            const price = Number(item.products?.price || 0);
                            return total + (isNaN(price) ? 0 : price);
                          }, 0))}
                        </td>
                        <td className="px-4 py-3">
                          <Select
                            value={order.status}
                            onValueChange={(value) => handleStatusChange(order.id, value)}
                            disabled={loading}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue placeholder="Update Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="out for delivery">Out for delivery</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};
