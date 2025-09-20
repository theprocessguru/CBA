import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Search, 
  Filter,
  ExternalLink,
  Mic,
  Target,
  User,
  Building,
  Phone,
  Mail,
  Globe,
  Clock,
  Users,
  Tag,
  BookOpen
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";

interface SpeakerProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  company?: string;
  jobTitle?: string;
  bio: string;
  expertise: string[];
  talks: string[];
  speakingExperience: string;
  websiteUrl?: string;
  linkedinUrl?: string;
  phone?: string;
  presentationFormats: string[];
  audienceSize: string[];
  availabilityType: string;
  travelWillingness: string;
}

interface WorkshopProvider {
  id: string;
  userId: string;
  name: string;
  email: string;
  company?: string;
  jobTitle?: string;
  bio: string;
  workshopTopics: string[];
  workshops: string[];
  trainingExperience: string;
  qualifications?: string;
  workshopFormats: string[];
  targetAudience: string[];
  groupSizePreference: string;
  pricingStructure: string;
  onlineCapability: string;
}

interface AdminSpeakerWorkshopSearchProps {
  userRole?: string;
}

export function AdminSpeakerWorkshopSearch({ userRole }: AdminSpeakerWorkshopSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  // Fetch all speaker profiles with their topics
  const { data: speakers = [], isLoading: speakersLoading } = useQuery<SpeakerProfile[]>({
    queryKey: ['/api/admin/speakers/profiles'],
  });

  // Fetch all workshop providers with their offerings
  const { data: providers = [], isLoading: providersLoading } = useQuery<WorkshopProvider[]>({
    queryKey: ['/api/admin/workshop-providers/profiles'],
  });

  // Extract all unique topics and formats for filtering
  const allSpeakerTopics = [...new Set(speakers.flatMap(s => s.expertise))].sort();
  const allWorkshopTopics = [...new Set(providers.flatMap(p => p.workshopTopics))].sort();
  const allTopics = [...new Set([...allSpeakerTopics, ...allWorkshopTopics])].sort();
  
  const allFormats = [...new Set([
    ...speakers.flatMap(s => s.presentationFormats),
    ...providers.flatMap(p => p.workshopFormats)
  ])].filter(Boolean).sort();

  // Filter speakers based on search criteria
  const filteredSpeakers = speakers.filter(speaker => {
    const matchesSearch = !searchTerm || 
      speaker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      speaker.expertise.some(topic => topic.toLowerCase().includes(searchTerm.toLowerCase())) ||
      speaker.talks.some(talk => talk.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (speaker.company && speaker.company.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTopic = !selectedTopic || speaker.expertise.includes(selectedTopic);
    const matchesFormat = !selectedFormat || speaker.presentationFormats.includes(selectedFormat);
    
    return matchesSearch && matchesTopic && matchesFormat;
  });

  // Filter workshop providers based on search criteria
  const filteredProviders = providers.filter(provider => {
    const matchesSearch = !searchTerm || 
      provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.workshopTopics.some(topic => topic.toLowerCase().includes(searchTerm.toLowerCase())) ||
      provider.workshops.some(workshop => workshop.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (provider.company && provider.company.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTopic = !selectedTopic || provider.workshopTopics.includes(selectedTopic);
    const matchesFormat = !selectedFormat || provider.workshopFormats.includes(selectedFormat);
    
    return matchesSearch && matchesTopic && matchesFormat;
  });

  const handleContactSpeaker = (speaker: SpeakerProfile) => {
    if (speaker.email) {
      window.open(`mailto:${speaker.email}?subject=Speaking Opportunity`, '_blank');
    }
  };

  const handleContactProvider = (provider: WorkshopProvider) => {
    if (provider.email) {
      window.open(`mailto:${provider.email}?subject=Workshop Opportunity`, '_blank');
    }
  };

  const SpeakerCard = ({ speaker }: { speaker: SpeakerProfile }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <Avatar className="w-12 h-12">
              <AvatarFallback>
                {speaker.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900">{speaker.name}</h3>
              {speaker.company && (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Building className="w-4 h-4" />
                  <span>{speaker.jobTitle ? `${speaker.jobTitle} at ${speaker.company}` : speaker.company}</span>
                </div>
              )}
            </div>
          </div>
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <Mic className="w-3 h-3 mr-1" />
            Speaker
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 line-clamp-2">{speaker.bio}</p>

        {/* Expertise Topics */}
        <div>
          <h4 className="font-medium text-sm text-gray-900 mb-2">Expertise Areas:</h4>
          <div className="flex flex-wrap gap-1">
            {speaker.expertise.slice(0, 6).map((topic, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {topic}
              </Badge>
            ))}
            {speaker.expertise.length > 6 && (
              <Badge variant="outline" className="text-xs">
                +{speaker.expertise.length - 6} more
              </Badge>
            )}
          </div>
        </div>

        {/* Signature Talks */}
        {speaker.talks && speaker.talks.length > 0 && (
          <div>
            <h4 className="font-medium text-sm text-gray-900 mb-2">Signature Talks:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {speaker.talks.slice(0, 3).map((talk, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="line-clamp-1">{talk}</span>
                </li>
              ))}
              {speaker.talks.length > 3 && (
                <li className="text-xs text-gray-500">+{speaker.talks.length - 3} more talks</li>
              )}
            </ul>
          </div>
        )}

        {/* Speaker Details */}
        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{speaker.speakingExperience}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{speaker.availabilityType}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            onClick={() => handleContactSpeaker(speaker)}
            data-testid={`button-contact-speaker-${speaker.id}`}
          >
            <Mail className="w-4 h-4 mr-1" />
            Contact
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation(`/admin/speakers/${speaker.id}`)}
            data-testid={`button-view-speaker-${speaker.id}`}
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            View Profile
          </Button>

          {speaker.websiteUrl && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(speaker.websiteUrl, '_blank')}
              data-testid={`button-speaker-website-${speaker.id}`}
            >
              <Globe className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const ProviderCard = ({ provider }: { provider: WorkshopProvider }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <Avatar className="w-12 h-12">
              <AvatarFallback>
                {provider.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900">{provider.name}</h3>
              {provider.company && (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Building className="w-4 h-4" />
                  <span>{provider.jobTitle ? `${provider.jobTitle} at ${provider.company}` : provider.company}</span>
                </div>
              )}
            </div>
          </div>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            <Target className="w-3 h-3 mr-1" />
            Workshop Provider
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 line-clamp-2">{provider.bio}</p>

        {/* Workshop Topics */}
        <div>
          <h4 className="font-medium text-sm text-gray-900 mb-2">Workshop Topics:</h4>
          <div className="flex flex-wrap gap-1">
            {provider.workshopTopics.slice(0, 6).map((topic, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {topic}
              </Badge>
            ))}
            {provider.workshopTopics.length > 6 && (
              <Badge variant="outline" className="text-xs">
                +{provider.workshopTopics.length - 6} more
              </Badge>
            )}
          </div>
        </div>

        {/* Available Workshops */}
        {provider.workshops && provider.workshops.length > 0 && (
          <div>
            <h4 className="font-medium text-sm text-gray-900 mb-2">Available Workshops:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {provider.workshops.slice(0, 3).map((workshop, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="line-clamp-1">{workshop}</span>
                </li>
              ))}
              {provider.workshops.length > 3 && (
                <li className="text-xs text-gray-500">+{provider.workshops.length - 3} more workshops</li>
              )}
            </ul>
          </div>
        )}

        {/* Provider Details */}
        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{provider.trainingExperience}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{provider.groupSizePreference}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            onClick={() => handleContactProvider(provider)}
            data-testid={`button-contact-provider-${provider.id}`}
          >
            <Mail className="w-4 h-4 mr-1" />
            Contact
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation(`/admin/workshop-providers/${provider.id}`)}
            data-testid={`button-view-provider-${provider.id}`}
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            View Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (speakersLoading || providersLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Speaker & Workshop Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-pulse">Loading speaker and workshop data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Search className="w-5 h-5 mr-2" />
          Speaker & Workshop Search
        </CardTitle>
        <p className="text-sm text-gray-600">
          Search and discover all available speakers and workshop providers by topic, expertise, or name
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search and Filter Controls */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by name, topic, company, or talk title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-speaker-workshop-search"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            <select
              value={selectedTopic || ''}
              onChange={(e) => setSelectedTopic(e.target.value || null)}
              className="text-sm border rounded px-2 py-1"
              data-testid="select-topic-filter"
            >
              <option value="">All Topics</option>
              {allTopics.map(topic => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>

            <select
              value={selectedFormat || ''}
              onChange={(e) => setSelectedFormat(e.target.value || null)}
              className="text-sm border rounded px-2 py-1"
              data-testid="select-format-filter"
            >
              <option value="">All Formats</option>
              {allFormats.map(format => (
                <option key={format} value={format}>{format}</option>
              ))}
            </select>

            {(selectedTopic || selectedFormat || searchTerm) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedTopic(null);
                  setSelectedFormat(null);
                }}
                data-testid="button-clear-filters"
              >
                Clear Filters
              </Button>
            )}
          </div>

          {/* Results Summary */}
          <div className="text-sm text-gray-600">
            Found {filteredSpeakers.length} speakers and {filteredProviders.length} workshop providers
            {(selectedTopic || selectedFormat || searchTerm) && ' matching your criteria'}
          </div>
        </div>

        {/* Results Tabs */}
        <Tabs defaultValue="speakers" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="speakers" className="flex items-center gap-2">
              <Mic className="w-4 h-4" />
              Speakers ({filteredSpeakers.length})
            </TabsTrigger>
            <TabsTrigger value="providers" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Workshop Providers ({filteredProviders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="speakers" className="space-y-4">
            {filteredSpeakers.length === 0 ? (
              <div className="text-center py-8">
                <Mic className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Speakers Found</h3>
                <p className="text-gray-600">
                  {searchTerm || selectedTopic || selectedFormat 
                    ? 'Try adjusting your search criteria' 
                    : 'No speakers have been added yet'
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredSpeakers.map(speaker => (
                  <SpeakerCard key={speaker.id} speaker={speaker} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="providers" className="space-y-4">
            {filteredProviders.length === 0 ? (
              <div className="text-center py-8">
                <Target className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Workshop Providers Found</h3>
                <p className="text-gray-600">
                  {searchTerm || selectedTopic || selectedFormat 
                    ? 'Try adjusting your search criteria' 
                    : 'No workshop providers have been added yet'
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredProviders.map(provider => (
                  <ProviderCard key={provider.id} provider={provider} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}