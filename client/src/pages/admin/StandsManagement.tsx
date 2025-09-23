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
  Building2,
  MapPin, 
  DollarSign, 
  Ruler,
  Users,
  Search,
  Plus,
  Edit3,
  Trash2,
  UserCheck,
  UserMinus,
  Calculator,
  CheckCircle,
  AlertCircle,
  Clock
} from "lucide-react";

// Stand interface
interface Stand {
  id: number;
  eventId: number;
  standNumber: string;
  location?: string;
  width: number;
  length: number;
  squareMetres: number;
  standardCost: number;
  specialRate?: number;
  finalCost: number;
  exhibitorRegistrationId?: number;
  status: "available" | "reserved" | "occupied" | "maintenance";
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Related data
  event?: {
    id: number;
    eventName: string;
    hasExhibitionArea: boolean;
    pricePerSquareMetre?: number;
  };
  exhibitor?: {
    id: number;
    contactName: string;
    email: string;
    companyName?: string;
  };
}

// Event interface for dropdown
interface Event {
  id: number;
  eventName: string;
  hasExhibitionArea: boolean;
  pricePerSquareMetre?: number;
  eventDate: string;
  status: string;
}

// Create stand schema
const createStandSchema = z.object({
  eventId: z.string().min(1, "Please select an event"),
  standNumber: z.string().min(1, "Stand number is required"),
  location: z.string().optional(),
  width: z.number().min(0.1, "Width must be greater than 0"),
  length: z.number().min(0.1, "Length must be greater than 0"),
  specialRate: z.number().optional(),
  notes: z.string().optional(),
});

type CreateStandFormData = z.infer<typeof createStandSchema>;

export default function StandsManagement() {
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingStand, setEditingStand] = useState<Stand | null>(null);
  const [selectedStand, setSelectedStand] = useState<Stand | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch events with exhibition areas
  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ["/api/admin/events"],
    select: (data) => data.filter(event => event.hasExhibitionArea)
  });

  // Fetch stands for selected event
  const { data: stands = [], isLoading: standsLoading } = useQuery<Stand[]>({
    queryKey: selectedEventId ? [`/api/admin/events/${selectedEventId}/stands`] : [],
    enabled: !!selectedEventId,
  });

  const createStandForm = useForm<CreateStandFormData>({
    resolver: zodResolver(createStandSchema),
    defaultValues: {
      eventId: selectedEventId,
    },
  });

  const createStandMutation = useMutation({
    mutationFn: (data: CreateStandFormData) => {
      const standData = {
        ...data,
        eventId: parseInt(data.eventId),
        // Calculate square metres
        squareMetres: data.width * data.length,
      };
      return apiRequest('POST', `/api/admin/events/${data.eventId}/stands`, standData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Exhibition stand created successfully!",
      });
      createStandForm.reset();
      setCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: [`/api/admin/events/${selectedEventId}/stands`] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create stand",
        variant: "destructive",
      });
    },
  });

  const updateStandMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => {
      return apiRequest('PATCH', `/api/admin/stands/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Stand updated successfully!",
      });
      setEditingStand(null);
      queryClient.invalidateQueries({ queryKey: [`/api/admin/events/${selectedEventId}/stands`] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update stand",
        variant: "destructive",
      });
    },
  });

  const deleteStandMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest('DELETE', `/api/admin/stands/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Stand deleted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/events/${selectedEventId}/stands`] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete stand",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: CreateStandFormData) => {
    createStandMutation.mutate(data);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-green-100 text-green-800";
      case "reserved": return "bg-yellow-100 text-yellow-800";
      case "occupied": return "bg-blue-100 text-blue-800";
      case "maintenance": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available": return <CheckCircle className="w-4 h-4" />;
      case "reserved": return <Clock className="w-4 h-4" />;
      case "occupied": return <UserCheck className="w-4 h-4" />;
      case "maintenance": return <AlertCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  // Filter stands
  const filteredStands = stands.filter((stand) => {
    const matchesSearch = 
      stand.standNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stand.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stand.exhibitor?.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stand.exhibitor?.contactName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || stand.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const selectedEvent = events.find(event => event.id.toString() === selectedEventId);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Exhibition Stands Management</h1>
          <p className="text-gray-600 mt-1">Manage exhibition stands for events with exhibition areas</p>
        </div>
        <div className="flex gap-2">
          {selectedEventId && (
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-stand">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Stand
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Add Exhibition Stand</DialogTitle>
                  <DialogDescription>
                    Create a new exhibition stand for {selectedEvent?.eventName}
                  </DialogDescription>
                </DialogHeader>
                <AddStandForm 
                  event={selectedEvent}
                  form={createStandForm}
                  onSubmit={handleSubmit}
                  isLoading={createStandMutation.isPending}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Event Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Select Event
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Select value={selectedEventId} onValueChange={setSelectedEventId}>
              <SelectTrigger className="w-full" data-testid="select-event">
                <SelectValue placeholder="Choose an event with exhibition area..." />
              </SelectTrigger>
              <SelectContent>
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.id.toString()}>
                    <div className="flex items-center justify-between w-full">
                      <span>{event.eventName}</span>
                      <div className="flex items-center gap-2 ml-2">
                        <Badge variant="outline" className="text-xs">
                          {event.eventDate && format(new Date(event.eventDate), 'MMM dd, yyyy')}
                        </Badge>
                        {event.pricePerSquareMetre && (
                          <Badge variant="secondary" className="text-xs">
                            £{event.pricePerSquareMetre}/m²
                          </Badge>
                        )}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {events.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                <Building2 className="mx-auto h-8 w-8 mb-2" />
                <p>No events with exhibition areas found</p>
                <p className="text-sm">Events need to have "Enable Exhibition Area" checked</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stands Management */}
      {selectedEventId && (
        <>
          {/* Filters and Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search stands..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-stands"
                    />
                  </div>
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48" data-testid="select-filter-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Stands Grid */}
          {standsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredStands.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStands.map((stand) => (
                <StandCard 
                  key={stand.id}
                  stand={stand}
                  onEdit={setEditingStand}
                  onDelete={(id) => deleteStandMutation.mutate(id)}
                  onSelect={setSelectedStand}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Exhibition Stands Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || filterStatus !== "all" 
                    ? "No stands match your current filters"
                    : "No exhibition stands have been created for this event yet"
                  }
                </p>
                {!searchTerm && filterStatus === "all" && (
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Stand
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

// Stand Card Component
function StandCard({ 
  stand, 
  onEdit, 
  onDelete, 
  onSelect 
}: { 
  stand: Stand; 
  onEdit: (stand: Stand) => void;
  onDelete: (id: number) => void;
  onSelect: (stand: Stand) => void;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow" data-testid={`stand-card-${stand.standNumber}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {stand.standNumber}
          </CardTitle>
          <Badge className={getStatusColor(stand.status)} variant="secondary">
            <div className="flex items-center gap-1">
              {getStatusIcon(stand.status)}
              <span className="capitalize">{stand.status}</span>
            </div>
          </Badge>
        </div>
        {stand.location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {stand.location}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Dimensions */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Ruler className="h-4 w-4 text-muted-foreground" />
            <span>{stand.width}m × {stand.length}m</span>
          </div>
          <div className="flex items-center gap-2">
            <Calculator className="h-4 w-4 text-muted-foreground" />
            <span>{stand.squareMetres}m²</span>
          </div>
        </div>

        {/* Pricing */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Standard Cost:</span>
            <span>£{stand.standardCost.toFixed(2)}</span>
          </div>
          {stand.specialRate && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Special Rate:</span>
              <span className="text-orange-600">£{stand.specialRate.toFixed(2)}/m²</span>
            </div>
          )}
          <div className="flex items-center justify-between font-medium border-t pt-2">
            <span>Final Cost:</span>
            <span className="text-lg">£{stand.finalCost.toFixed(2)}</span>
          </div>
        </div>

        {/* Exhibitor Info */}
        {stand.exhibitor ? (
          <div className="bg-blue-50 p-3 rounded-lg space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium text-blue-900">
              <UserCheck className="h-4 w-4" />
              Assigned to:
            </div>
            <div className="text-sm text-blue-800">
              <div className="font-medium">{stand.exhibitor.contactName}</div>
              {stand.exhibitor.companyName && (
                <div className="text-blue-600">{stand.exhibitor.companyName}</div>
              )}
              <div className="text-blue-600">{stand.exhibitor.email}</div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <UserMinus className="h-4 w-4" />
              Not assigned
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onSelect(stand)}
            data-testid={`button-view-stand-${stand.standNumber}`}
          >
            View Details
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onEdit(stand)}
            data-testid={`button-edit-stand-${stand.standNumber}`}
          >
            <Edit3 className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onDelete(stand.id)}
            className="text-red-600 hover:text-red-700"
            data-testid={`button-delete-stand-${stand.standNumber}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {stand.notes && (
          <div className="text-xs text-muted-foreground border-t pt-2">
            <strong>Notes:</strong> {stand.notes}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Add Stand Form Component
function AddStandForm({ 
  event, 
  form, 
  onSubmit, 
  isLoading 
}: { 
  event?: Event;
  form: any;
  onSubmit: (data: CreateStandFormData) => void;
  isLoading: boolean;
}) {
  const watchWidth = form.watch("width");
  const watchLength = form.watch("length");
  const watchSpecialRate = form.watch("specialRate");
  
  const squareMetres = watchWidth && watchLength ? watchWidth * watchLength : 0;
  const pricePerSqm = watchSpecialRate || event?.pricePerSquareMetre || 0;
  const totalCost = squareMetres * pricePerSqm;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <input type="hidden" name="eventId" value={event?.id} />
        
        {/* Event Info Display */}
        {event && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Creating stand for:</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <div><strong>Event:</strong> {event.eventName}</div>
              <div><strong>Standard Rate:</strong> £{event.pricePerSquareMetre || 0}/m²</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="standNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stand Number *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., A12, B45" {...field} data-testid="input-stand-number" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Main Hall, Hall A" {...field} data-testid="input-stand-location" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="width"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Width (metres) *</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.1" 
                    min="0.1"
                    placeholder="3.0"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    data-testid="input-stand-width"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="length"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Length (metres) *</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.1" 
                    min="0.1"
                    placeholder="3.0"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    data-testid="input-stand-length"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Calculations Display */}
        {squareMetres > 0 && (
          <div className="bg-green-50 p-4 rounded-lg space-y-2">
            <h4 className="font-medium text-green-900">Calculated Values:</h4>
            <div className="text-sm text-green-800 space-y-1">
              <div><strong>Square Metres:</strong> {squareMetres.toFixed(2)} m²</div>
              <div><strong>Rate:</strong> £{pricePerSqm.toFixed(2)}/m²</div>
              <div><strong>Total Cost:</strong> £{totalCost.toFixed(2)}</div>
            </div>
          </div>
        )}

        <FormField
          control={form.control}
          name="specialRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Special Rate Override (£ per m²)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01" 
                  min="0"
                  placeholder="Leave empty to use standard rate"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                  data-testid="input-special-rate"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Additional information about this stand..."
                  rows={3}
                  {...field}
                  data-testid="textarea-stand-notes"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={isLoading} data-testid="button-submit-stand">
            {isLoading ? "Creating..." : "Create Stand"}
          </Button>
        </div>
      </form>
    </Form>
  );
}