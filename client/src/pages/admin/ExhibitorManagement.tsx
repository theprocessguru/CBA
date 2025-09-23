import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  Mail, 
  Phone, 
  Building, 
  Briefcase,
  Globe,
  MapPin,
  Search,
  Download,
  Plus,
  Edit3,
  Trash2
} from "lucide-react";

// Exhibitor profile interface
interface ExhibitorProfile {
  id: string;
  userId: string;
  contactName: string;
  email: string;
  phone?: string;
  companyName?: string;
  website?: string;
  standLocation?: string;
  standNumber?: string;
  standSize?: string;
  boothRequirements?: string;
  businessDescription?: string;
  productsServices?: string;
  specialRequirements?: string;
  registeredAt: string;
  // Enhanced with assigned stands from new system
  assignedStands?: {
    id: number;
    standNumber: string;
    location?: string;
    squareMetres: number;
    finalCost: number;
    eventName: string;
    status: string;
  }[];
}

// Create new exhibitor user schema
const createExhibitorSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  companyName: z.string().min(1, "Company name is required"),
  website: z.string().optional(),
  businessDescription: z.string().optional(),
  productsServices: z.string().optional(),
  specialRequirements: z.string().optional(),
});

type CreateExhibitorFormData = z.infer<typeof createExhibitorSchema>;

export default function ExhibitorManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing exhibitors
  const { data: exhibitors, isLoading, error } = useQuery<ExhibitorProfile[]>({
    queryKey: ["/api/admin/exhibitors"],
  });

  const createExhibitorForm = useForm<CreateExhibitorFormData>({
    resolver: zodResolver(createExhibitorSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      companyName: "",
      website: "",
      businessDescription: "",
      productsServices: "",
      specialRequirements: "",
    },
  });

  const createExhibitorMutation = useMutation({
    mutationFn: (data: CreateExhibitorFormData) => {
      return apiRequest('POST', '/api/admin/exhibitors/provision', data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "New exhibitor user created successfully!",
      });
      createExhibitorForm.reset();
      setCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/exhibitors'] });
    },
    onError: (error: any) => {
      if (error.code === 'EMAIL_EXISTS') {
        toast({
          title: "Email Already Exists",
          description: `This email is already registered. Please use a different email address.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to create exhibitor",
          variant: "destructive",
        });
      }
    },
  });

  const handleSubmit = (data: CreateExhibitorFormData) => {
    createExhibitorMutation.mutate(data);
  };

  // Filter exhibitors
  const filteredExhibitors = exhibitors?.filter((exhibitor) => {
    const matchesSearch = 
      exhibitor.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exhibitor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exhibitor.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exhibitor.standNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  }) || [];

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-red-600">Error loading exhibitors: {(error as Error).message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Exhibitor Management</h1>
          <p className="text-gray-600 mt-1">Manage AI Summit exhibitors and their stand assignments</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-exhibitor">
              <Plus className="mr-2 h-4 w-4" />
              Add Exhibitor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Exhibitor</DialogTitle>
              <DialogDescription>
                Create a new user account and set them up as an exhibitor with business owner privileges.
              </DialogDescription>
            </DialogHeader>
            <Form {...createExhibitorForm}>
              <form onSubmit={createExhibitorForm.handleSubmit(handleSubmit)} className="space-y-4">
                {/* User Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={createExhibitorForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter first name" data-testid="input-first-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createExhibitorForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter last name" data-testid="input-last-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={createExhibitorForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="Enter email address" data-testid="input-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={createExhibitorForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter phone number" data-testid="input-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createExhibitorForm.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter company name" data-testid="input-company-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={createExhibitorForm.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://example.com" data-testid="input-website" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Business Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Business Information</h4>
                  
                  <FormField
                    control={createExhibitorForm.control}
                    name="businessDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Brief description of the business..." 
                            data-testid="textarea-business-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createExhibitorForm.control}
                    name="productsServices"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Products & Services</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Key products and services to showcase..." 
                            data-testid="textarea-products-services"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createExhibitorForm.control}
                    name="specialRequirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Special Requirements</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Setup notes, special requests, marketing materials..." 
                            data-testid="textarea-special-requirements"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createExhibitorMutation.isPending}
                    data-testid="button-submit-exhibitor"
                  >
                    {createExhibitorMutation.isPending ? "Creating..." : "Create Exhibitor"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Exhibitors</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredExhibitors.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Stands</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredExhibitors.length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stand Locations</CardTitle>
            <Edit3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(filteredExhibitors.map(e => e.standLocation).filter(Boolean)).size}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Companies</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(filteredExhibitors.map(e => e.companyName).filter(Boolean)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search exhibitors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search-exhibitors"
          />
        </div>
        <div className="text-sm text-gray-500">
          {filteredExhibitors.length} exhibitor{filteredExhibitors.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* Exhibitors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExhibitors.map((exhibitor) => (
          <Card key={exhibitor.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {exhibitor.contactName}
                  </CardTitle>
                  <p className="text-sm text-gray-600">{exhibitor.companyName}</p>
                </div>
                <Badge variant="default">
                  Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="mr-2 h-4 w-4" />
                {exhibitor.email}
              </div>
              
              {exhibitor.phone && (
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="mr-2 h-4 w-4" />
                  {exhibitor.phone}
                </div>
              )}

              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Stand Information</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Location:</strong> {exhibitor.standLocation}</p>
                  <p><strong>Stand #:</strong> {exhibitor.standNumber}</p>
                  <p><strong>Size:</strong> {exhibitor.standSize}</p>
                  {exhibitor.boothRequirements && (
                    <p><strong>Package:</strong> {exhibitor.boothRequirements}</p>
                  )}
                </div>
              </div>

              {/* Assigned Stands from New System */}
              {exhibitor.assignedStands && exhibitor.assignedStands.length > 0 && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h4 className="font-medium text-sm mb-2 text-blue-900">Assigned Exhibition Stands</h4>
                  <div className="space-y-2">
                    {exhibitor.assignedStands.map((stand, index) => (
                      <div key={stand.id} className="bg-white p-2 rounded border border-blue-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm text-blue-900">
                            Stand {stand.standNumber}
                          </span>
                          <Badge variant={stand.status === 'occupied' ? 'default' : 'secondary'} className="text-xs">
                            {stand.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
                          <p><strong>Event:</strong> {stand.eventName}</p>
                          <p><strong>Size:</strong> {stand.squareMetres}m²</p>
                          {stand.location && <p><strong>Location:</strong> {stand.location}</p>}
                          <p><strong>Cost:</strong> £{stand.finalCost.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {exhibitor.businessDescription && (
                <div>
                  <h4 className="font-medium text-sm mb-1">Business</h4>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {exhibitor.businessDescription}
                  </p>
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                <span className="text-xs text-gray-500">
                  Registered {format(new Date(exhibitor.registeredAt), 'MMM dd, yyyy')}
                </span>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" data-testid={`button-edit-exhibitor-${exhibitor.id}`}>
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" data-testid={`button-delete-exhibitor-${exhibitor.id}`}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredExhibitors.length === 0 && (
        <div className="text-center py-12">
          <Building className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No exhibitors found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterStatus !== "all" 
              ? "No exhibitors match your search criteria." 
              : "Get started by adding your first exhibitor."
            }
          </p>
          {!searchTerm && filterStatus === "all" && (
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add First Exhibitor
            </Button>
          )}
        </div>
      )}
    </div>
  );
}