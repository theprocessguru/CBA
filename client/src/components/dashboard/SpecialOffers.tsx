import { useState } from "react";
import { useGetMyOffers, useCreateOffer, useUpdateOffer, useDeleteOffer } from "@/hooks/useOffers";
import { Offer } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Tag, Plus, Clock, Store, CalendarIcon, PenSquare, Trash2, AlertCircle, MoreVertical, Upload, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

// Offer form schema
const offerSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(500, "Description must be less than 500 characters"),
  discountPercentage: z.string().transform(val => val === "" ? null : parseInt(val)).optional().nullable(),
  discountValue: z.string().transform(val => val === "" ? null : parseFloat(val)).optional().nullable(),
  imageUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  validFrom: z.date().optional().nullable(),
  validUntil: z.date().optional().nullable(),
  isActive: z.boolean().default(true),
}).refine(data => data.discountPercentage || data.discountValue, {
  message: "Please provide either a discount percentage or value",
  path: ["discountPercentage"],
});

type OfferFormValues = z.infer<typeof offerSchema>;

const SpecialOffers = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  const { data: offers, isLoading } = useGetMyOffers();
  
  const createOffer = useCreateOffer();
  const updateOffer = useUpdateOffer();
  const deleteOffer = useDeleteOffer();

  // Image upload functionality
  const handleImageUpload = async (file: File, setValue: (value: string) => void) => {
    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      const result = await response.json();
      setValue(result.imageUrl);
    } catch (error) {
      console.error('Image upload error:', error);
    } finally {
      setIsUploadingImage(false);
    }
  };
  
  const form = useForm<OfferFormValues>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      title: "",
      description: "",
      discountPercentage: "",
      discountValue: "",
      imageUrl: "",
      validFrom: new Date(),
      validUntil: null,
      isActive: true,
    },
  });
  
  const openCreateDialog = () => {
    form.reset({
      title: "",
      description: "",
      discountPercentage: "",
      discountValue: "",
      imageUrl: "",
      validFrom: new Date(),
      validUntil: null,
      isActive: true,
    });
    setEditingOffer(null);
    setIsCreateDialogOpen(true);
  };
  
  const openEditDialog = (offer: Offer) => {
    form.reset({
      title: offer.title,
      description: offer.description || "",
      discountPercentage: offer.discountPercentage ? String(offer.discountPercentage) : "",
      discountValue: offer.discountValue ? String(offer.discountValue) : "",
      imageUrl: offer.imageUrl || "",
      validFrom: offer.validFrom ? new Date(offer.validFrom) : new Date(),
      validUntil: offer.validUntil ? new Date(offer.validUntil) : null,
      isActive: offer.isActive !== false, // default to true if undefined
    });
    setEditingOffer(offer);
    setIsCreateDialogOpen(true);
  };
  
  const onSubmit = (data: OfferFormValues) => {
    if (editingOffer) {
      updateOffer.mutate({
        id: editingOffer.id,
        data
      }, {
        onSuccess: () => {
          setIsCreateDialogOpen(false);
        }
      });
    } else {
      createOffer.mutate(data, {
        onSuccess: () => {
          setIsCreateDialogOpen(false);
        }
      });
    }
  };
  
  const handleDeleteOffer = (id: number) => {
    deleteOffer.mutate(id);
  };
  
  const isOfferExpired = (offer: Offer): boolean => {
    if (!offer.validUntil) return false;
    return new Date(offer.validUntil) < new Date();
  };
  
  const isOfferActive = (offer: Offer): boolean => {
    if (!offer.isActive) return false;
    if (isOfferExpired(offer)) return false;
    if (offer.validFrom && new Date(offer.validFrom) > new Date()) return false;
    return true;
  };
  
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Special Offers</h1>
          <p className="text-neutral-600">Create and manage special offers for other association members.</p>
        </div>
        <Button 
          onClick={openCreateDialog} 
          className="mt-4 sm:mt-0"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Offer
        </Button>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="h-48">
                <Skeleton className="h-full w-full" />
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-4 w-full mb-4" />
                <div className="flex justify-between items-center text-sm">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : offers && offers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer) => (
            <Card key={offer.id} className={`overflow-hidden ${!isOfferActive(offer) ? 'opacity-70' : ''}`}>
              <div className="h-48 overflow-hidden bg-neutral-100 relative">
                {offer.imageUrl ? (
                  <img 
                    src={offer.imageUrl}
                    alt={offer.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-neutral-200 text-neutral-400">
                    <Tag size={48} />
                  </div>
                )}
                
                {!offer.isActive && (
                  <div className="absolute top-2 right-2 bg-neutral-800 text-white px-2 py-1 rounded text-xs font-medium">
                    Inactive
                  </div>
                )}
                
                {isOfferExpired(offer) && (
                  <div className="absolute top-2 right-2 bg-error text-white px-2 py-1 rounded text-xs font-medium">
                    Expired
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold">{offer.title}</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success text-white">
                    {offer.discountPercentage 
                      ? `${offer.discountPercentage}% OFF` 
                      : offer.discountValue 
                        ? `£${offer.discountValue} OFF` 
                        : 'SPECIAL OFFER'
                    }
                  </span>
                </div>
                <p className="text-neutral-600 text-sm mb-4 line-clamp-2">{offer.description}</p>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-neutral-500 flex items-center">
                    <Clock className="inline mr-2 h-4 w-4" />
                    {offer.validUntil 
                      ? `Until: ${formatDate(offer.validUntil)}` 
                      : 'No expiration'
                    }
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">More</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(offer)}>
                        <PenSquare className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={(e) => {
                          e.preventDefault();
                          document.getElementById(`delete-offer-${offer.id}`)?.click();
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                        <AlertDialogTrigger className="hidden" id={`delete-offer-${offer.id}`} />
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <AlertDialog>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete this special offer. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteOffer(offer.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-neutral-50 border-dashed border-2">
          <CardContent className="p-6 text-center">
            <Tag className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">No special offers yet</h3>
            <p className="text-neutral-600 mb-4">Create your first special offer for other association members.</p>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Create Offer
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingOffer ? "Edit Special Offer" : "Create Special Offer"}</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between space-x-3 space-y-0 rounded-md border p-4">
                    <div className="space-y-1 leading-none">
                      <FormLabel>Active</FormLabel>
                      <FormDescription>
                        Deactivate to temporarily hide this offer
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title*</FormLabel>
                    <FormControl>
                      <Input placeholder="Special Offer Title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description*</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your special offer" 
                        className="min-h-[100px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="discountPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Percentage (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          max="100"
                          placeholder="e.g. 25" 
                          {...field} 
                          onChange={(e) => {
                            field.onChange(e);
                            if (e.target.value) {
                              form.setValue("discountValue", "");
                            }
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Percentage discount (0-100)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="discountValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Value (£)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          min="0"
                          placeholder="e.g. 10.99" 
                          {...field} 
                          onChange={(e) => {
                            field.onChange(e);
                            if (e.target.value) {
                              form.setValue("discountPercentage", "");
                            }
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Fixed amount discount
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="validFrom"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Valid From</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={
                                "w-full pl-3 text-left font-normal"
                              }
                            >
                              {field.value ? (
                                formatDate(field.value)
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        When the offer becomes active
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="validUntil"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Valid Until</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={
                                "w-full pl-3 text-left font-normal"
                              }
                            >
                              {field.value ? (
                                formatDate(field.value)
                              ) : (
                                <span>No expiration</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date <= new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Leave blank for no expiration
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                    <FormDescription>
                      Provide a URL to an image for your special offer
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createOffer.isPending || updateOffer.isPending}
                >
                  {createOffer.isPending || updateOffer.isPending
                    ? "Saving..." 
                    : editingOffer 
                      ? "Update" 
                      : "Create"
                  }
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SpecialOffers;
