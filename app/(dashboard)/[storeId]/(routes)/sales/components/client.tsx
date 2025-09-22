"use client";

import { useState, useEffect } from "react";
import { Calendar, DollarSign, Package, TrendingDown, Filter, Download } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { SaleColumn, columns } from "./columns";
import { formatter } from "@/lib/utils";

interface SalesClientProps {
  data: SaleColumn[];
}

export const SalesClient: React.FC<SalesClientProps> = ({
  data
}) => {
  const [filteredData, setFilteredData] = useState<SaleColumn[]>(data);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  // Export functionality
  const exportToCSV = () => {
    const csvHeaders = [
      'Order Reference',
      'Customer Email',
      'Products', 
      'Product Count',
      'Total Amount',
      'Status',
      'Sale Date'
    ];

    const csvData = filteredData.map(sale => [
      sale.reference,
      sale.email || 'No email',
      sale.products,
      sale.productCount.toString(),
      sale.totalAmount,
      sale.status,
      sale.saleDate
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvData.map(row => 
        row.map(field => 
          // Escape commas and quotes in CSV fields
          typeof field === 'string' && (field.includes(',') || field.includes('"')) 
            ? `"${field.replace(/"/g, '""')}"` 
            : field
        ).join(',')
      )
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      
      // Generate filename with current filters and date
      const filterSuffix = [];
      if (statusFilter !== 'all') filterSuffix.push(`status-${statusFilter}`);
      if (dateFilter !== 'all') filterSuffix.push(`period-${dateFilter}`);
      
      const filename = `sales-export${filterSuffix.length > 0 ? '-' + filterSuffix.join('-') : ''}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show success message
      toast.success(`Exported ${filteredData.length} sales records to ${filename}`);
    }
  };

  const exportSummaryToCSV = () => {
    const summaryHeaders = [
      'Metric',
      'Value'
    ];

    const summaryData = [
      ['Total Revenue', formatter.format(totalRevenue)],
      ['Total Sales', totalSales.toString()],
      ['Highest Revenue Product', highestRevenueProduct.product],
      ['Highest Revenue Amount', formatter.format(highestRevenueProduct.revenue)],
      ['Highest Quantity Product', highestQuantityProduct.product],
      ['Highest Quantity Amount', Math.round(highestQuantityProduct.quantity).toString()],
      ['Least Selling Product', leastSellingProduct.product],
      ['Least Selling Quantity', (leastSellingProduct.quantity === Infinity ? 0 : Math.round(leastSellingProduct.quantity)).toString()],
      ['Export Date', format(new Date(), 'MMM dd, yyyy HH:mm:ss')],
      ['Filters Applied', `Status: ${statusFilter}, Date: ${dateFilter}`],
      ['Records Exported', filteredData.length.toString()]
    ];

    const csvContent = [
      summaryHeaders.join(','),
      ...summaryData.map(row => 
        row.map(field => 
          typeof field === 'string' && (field.includes(',') || field.includes('"')) 
            ? `"${field.replace(/"/g, '""')}"` 
            : field
        ).join(',')
      ),
      '', // Empty line
      'Detailed Sales Data:',
      'Order Reference,Customer Email,Products,Product Count,Total Amount,Status,Sale Date',
      ...filteredData.map(sale => [
        sale.reference,
        sale.email || 'No email',
        sale.products,
        sale.productCount.toString(),
        sale.totalAmount,
        sale.status,
        sale.saleDate
      ].map(field => 
        typeof field === 'string' && (field.includes(',') || field.includes('"')) 
          ? `"${field.replace(/"/g, '""')}"` 
          : field
      ).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      
      const filterSuffix = [];
      if (statusFilter !== 'all') filterSuffix.push(`status-${statusFilter}`);
      if (dateFilter !== 'all') filterSuffix.push(`period-${dateFilter}`);
      
      const filename = `sales-summary${filterSuffix.length > 0 ? '-' + filterSuffix.join('-') : ''}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show success message
      toast.success(`Exported sales summary with ${filteredData.length} records to ${filename}`);
    }
  };

  // Statistics calculations
  const totalRevenue = data.reduce((acc, sale) => {
    const amount = parseFloat(sale.totalAmount.replace(/[₦,]/g, ''));
    return acc + (isNaN(amount) ? 0 : amount);
  }, 0);

  const totalSales = data.length;
  
  // Find highest revenue product
  const productRevenues = data.reduce((acc, sale) => {
    const products = sale.products.split(', ');
    const totalAmount = parseFloat(sale.totalAmount.replace(/[₦,]/g, ''));
    const amountPerProduct = totalAmount / products.length;
    
    products.forEach(product => {
      if (!acc[product]) acc[product] = 0;
      acc[product] += isNaN(amountPerProduct) ? 0 : amountPerProduct;
    });
    
    return acc;
  }, {} as Record<string, number>);

  const highestRevenueProduct = Object.entries(productRevenues).reduce(
    (max, [product, revenue]) => revenue > max.revenue ? { product, revenue } : max,
    { product: 'N/A', revenue: 0 }
  );

  // Find highest quantity product
  const productQuantities = data.reduce((acc, sale) => {
    const products = sale.products.split(', ');
    
    products.forEach(product => {
      if (!acc[product]) acc[product] = 0;
      acc[product] += sale.productCount / products.length;
    });
    
    return acc;
  }, {} as Record<string, number>);

  const highestQuantityProduct = Object.entries(productQuantities).reduce(
    (max, [product, quantity]) => quantity > max.quantity ? { product, quantity } : max,
    { product: 'N/A', quantity: 0 }
  );

  // Find least selling product
  const leastSellingProduct = Object.entries(productQuantities).reduce(
    (min, [product, quantity]) => quantity < min.quantity ? { product, quantity } : min,
    { product: 'N/A', quantity: Infinity }
  );

  // Filter data based on filters (search is handled by DataTable)
  useEffect(() => {
    let filtered = data;

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(sale => sale.status.toLowerCase() === statusFilter);
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case "today":
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(sale => {
            const saleDate = new Date(sale.saleDate);
            return saleDate >= filterDate;
          });
          break;
        case "week":
          filterDate.setDate(now.getDate() - 7);
          filtered = filtered.filter(sale => {
            const saleDate = new Date(sale.saleDate);
            return saleDate >= filterDate;
          });
          break;
        case "month":
          filterDate.setMonth(now.getMonth() - 1);
          filtered = filtered.filter(sale => {
            const saleDate = new Date(sale.saleDate);
            return saleDate >= filterDate;
          });
          break;
      }
    }

    setFilteredData(filtered);
  }, [statusFilter, dateFilter, data]);

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading 
          title={`Sales (${totalSales})`} 
          description="Manage and view your sales data" 
        />
      </div>
      <Separator />
      
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatter.format(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              From {totalSales} sales
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Highest Revenue Product</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatter.format(highestRevenueProduct.revenue)}</div>
            <p className="text-xs text-muted-foreground">
              {highestRevenueProduct.product}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Highest Quantity Product</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(highestQuantityProduct.quantity)}</div>
            <p className="text-xs text-muted-foreground">
              {highestQuantityProduct.product}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Least Selling Product</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leastSellingProduct.quantity === Infinity ? 0 : Math.round(leastSellingProduct.quantity)}
            </div>
            <p className="text-xs text-muted-foreground">
              {leastSellingProduct.product}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="out for delivery">Out for Delivery</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">Last 7 Days</SelectItem>
            <SelectItem value="month">Last 30 Days</SelectItem>
          </SelectContent>
        </Select>

        {(statusFilter !== "all" || dateFilter !== "all") && (
          <Button
            variant="ghost"
            onClick={() => {
              setStatusFilter("all");
              setDateFilter("all");
            }}
          >
            Clear Filters
          </Button>
        )}

        <div className="flex gap-2 ml-auto">
          <Button
            variant={filteredData.length !== data.length ? "default" : "outline"}
            onClick={exportToCSV}
            disabled={filteredData.length === 0}
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Data ({filteredData.length})
          </Button>
          <Button
            variant="secondary"
            onClick={exportSummaryToCSV}
            disabled={filteredData.length === 0}
            size="sm"
          >
            <Package className="h-4 w-4 mr-2" />
            Export Summary
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <DataTable 
        searchKey="reference" 
        columns={columns} 
        data={filteredData} 
      />
    </>
  );
};