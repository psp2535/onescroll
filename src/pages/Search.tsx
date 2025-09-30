import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Search as SearchIcon, MapPin, Building2, Users } from 'lucide-react';
import { toast } from 'sonner';
import Layout from '@/components/Layout';

interface Profile {
  id: string;
  name: string;
  email: string;
  role: 'distributor' | 'retailer';
  address: string | null;
  categories: string[];
}

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    let query = supabase
      .from('profiles')
      .select('*')
      .neq('id', user?.id || '');

    if (searchQuery) {
      query = query.or(`name.ilike.%${searchQuery}%,address.ilike.%${searchQuery}%`);
    }

    const { data, error } = await query.limit(20);

    if (error) {
      toast.error('Failed to fetch profiles');
    } else {
      setProfiles(data || []);
    }
    setLoading(false);
  };

  const sendConnectionRequest = async (responderId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('connections').insert({
      requester_id: user.id,
      responder_id: responderId,
      status: 'pending',
    });

    if (error) {
      toast.error('Failed to send connection request');
    } else {
      toast.success('Connection request sent!');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Find Partners</h1>
          <p className="text-muted-foreground">Search for distributors and retailers</p>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchProfiles()}
              className="pl-10"
            />
          </div>
          <Button onClick={fetchProfiles} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((profile) => (
            <Card key={profile.id} className="hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{profile.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{profile.email}</p>
                  </div>
                  <Badge variant={profile.role === 'distributor' ? 'default' : 'secondary'}>
                    {profile.role === 'distributor' ? (
                      <Building2 className="h-3 w-3 mr-1" />
                    ) : (
                      <Users className="h-3 w-3 mr-1" />
                    )}
                    {profile.role}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.address && (
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{profile.address}</span>
                  </div>
                )}
                {profile.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {profile.categories.map((category, idx) => (
                      <Badge key={idx} variant="outline">
                        {category}
                      </Badge>
                    ))}
                  </div>
                )}
                <Button
                  onClick={() => sendConnectionRequest(profile.id)}
                  className="w-full"
                  size="sm"
                >
                  Connect
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {!loading && profiles.length === 0 && (
          <Card className="p-12 text-center">
            <SearchIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No partners found</h3>
            <p className="text-muted-foreground">Try adjusting your search criteria</p>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Search;
