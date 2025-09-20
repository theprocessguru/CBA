import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  CheckCircle, 
  Clock, 
  Phone, 
  Mail, 
  User, 
  Building, 
  Calendar,
  MessageSquare,
  Filter,
  X,
  Smartphone
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";

interface InterestContact {
  id: number;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  userCompany?: string;
  personTypeId: number;
  personTypeName: string;
  personTypeDisplayName: string;
  personTypeCategory: 'role' | 'interest';
  actionType: 'selected' | 'deselected';
  selectedAt: string;
  needsContact: boolean;
  contactedBy?: string;
  contactedAt?: string;
  contactMethod?: 'email' | 'phone' | 'in_person';
  contactNotes?: string;
}

interface ContactFormData {
  contactMethod: 'email' | 'phone' | 'in_person';
  contactNotes: string;
}

export function InterestContactManager() {
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterPersonType, setFilterPersonType] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContact, setSelectedContact] = useState<InterestContact | null>(null);
  const [contactFormData, setContactFormData] = useState<ContactFormData>({
    contactMethod: 'email',
    contactNotes: ''
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch pending contacts
  const { data: contacts = [], isLoading, refetch } = useQuery<InterestContact[]>({
    queryKey: ['/api/admin/interest-contacts'],
  });

  // Mark as contacted mutation
  const markContactedMutation = useMutation({
    mutationFn: async ({ contactId, data }: { contactId: number; data: ContactFormData }) => {
      return await apiRequest(`/api/admin/interest-contacts/${contactId}/contacted`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Contact Marked",
        description: "User has been marked as contacted about their interest",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/interest-contacts'] });
      setSelectedContact(null);
      setContactFormData({ contactMethod: 'email', contactNotes: '' });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to mark contact as contacted",
        variant: "destructive",
      });
    },
  });

  // Filter contacts based on search and filters
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = !searchTerm || 
      contact.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.personTypeDisplayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.userCompany && contact.userCompany.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !filterCategory || contact.personTypeCategory === filterCategory;
    const matchesPersonType = !filterPersonType || contact.personTypeName === filterPersonType;
    
    return matchesSearch && matchesCategory && matchesPersonType;
  });

  // Get unique categories and person types for filtering
  const categories = [...new Set(contacts.map(c => c.personTypeCategory))];
  const personTypes = [...new Set(contacts.map(c => c.personTypeName))].sort();

  const handleMarkContacted = () => {
    if (!selectedContact) return;
    
    markContactedMutation.mutate({
      contactId: selectedContact.id,
      data: contactFormData
    });
  };

  const ContactCard = ({ contact }: { contact: InterestContact }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900">{contact.userName}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
              <Mail className="w-4 h-4" />
              <span>{contact.userEmail}</span>
            </div>
            {contact.userPhone && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                <Phone className="w-4 h-4" />
                <span>{contact.userPhone}</span>
              </div>
            )}
            {contact.userCompany && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                <Building className="w-4 h-4" />
                <span>{contact.userCompany}</span>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Badge 
              variant={contact.personTypeCategory === 'role' ? 'default' : 'secondary'}
              className={contact.personTypeCategory === 'role' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}
            >
              {contact.personTypeDisplayName}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {contact.personTypeCategory}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>Selected: {format(new Date(contact.selectedAt), 'PPp')}</span>
        </div>

        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                size="sm" 
                onClick={() => setSelectedContact(contact)}
                data-testid={`button-mark-contacted-${contact.id}`}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark as Contacted
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Mark as Contacted</DialogTitle>
                <DialogDescription>
                  Record how you contacted {contact.userName} about their interest in "{contact.personTypeDisplayName}".
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="contactMethod" className="text-sm font-medium">
                    Contact Method
                  </label>
                  <Select 
                    value={contactFormData.contactMethod} 
                    onValueChange={(value: 'email' | 'phone' | 'in_person') => 
                      setContactFormData(prev => ({ ...prev, contactMethod: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Phone Call</SelectItem>
                      <SelectItem value="in_person">In Person</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="contactNotes" className="text-sm font-medium">
                    Contact Notes (Optional)
                  </label>
                  <Textarea
                    id="contactNotes"
                    placeholder="Add any notes about the contact..."
                    value={contactFormData.contactNotes}
                    onChange={(e) => setContactFormData(prev => ({ ...prev, contactNotes: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button 
                  onClick={handleMarkContacted}
                  disabled={markContactedMutation.isPending}
                  data-testid="button-confirm-contacted"
                >
                  {markContactedMutation.isPending ? "Saving..." : "Mark as Contacted"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.open(`mailto:${contact.userEmail}?subject=Re: Your interest in ${contact.personTypeDisplayName}`, '_blank')}
            data-testid={`button-email-${contact.id}`}
          >
            <Mail className="w-4 h-4 mr-2" />
            Email
          </Button>

          {contact.userPhone && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.open(`tel:${contact.userPhone}`, '_blank')}
              data-testid={`button-call-${contact.id}`}
            >
              <Smartphone className="w-4 h-4 mr-2" />
              Call
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Interest & Role Contact Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-pulse">Loading contact requests...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Interest & Role Contact Management
        </CardTitle>
        <p className="text-sm text-gray-600">
          Manage users who have selected interests or roles and need to be contacted with relevant information
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search and Filter Controls */}
        <div className="space-y-4">
          <div className="relative">
            <Input
              placeholder="Search by name, email, company, or interest type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-4"
              data-testid="input-contact-search"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="text-sm border rounded px-2 py-1"
              data-testid="select-category-filter"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}s
                </option>
              ))}
            </select>

            <select
              value={filterPersonType}
              onChange={(e) => setFilterPersonType(e.target.value)}
              className="text-sm border rounded px-2 py-1"
              data-testid="select-person-type-filter"
            >
              <option value="">All Types</option>
              {personTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            {(filterCategory || filterPersonType || searchTerm) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setFilterCategory('');
                  setFilterPersonType('');
                }}
                data-testid="button-clear-filters"
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {filteredContacts.length} of {contacts.length} pending contacts
              {(filterCategory || filterPersonType || searchTerm) && ' matching your criteria'}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              data-testid="button-refresh"
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Contact Cards */}
        {filteredContacts.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {contacts.length === 0 ? 'No Pending Contacts' : 'No Matching Contacts'}
            </h3>
            <p className="text-gray-600">
              {contacts.length === 0 
                ? 'No users have selected interests or roles requiring contact yet.' 
                : 'Try adjusting your search criteria to find the contacts you\'re looking for.'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredContacts.map(contact => (
              <ContactCard key={contact.id} contact={contact} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}