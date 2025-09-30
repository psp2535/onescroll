import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Check, X, Users } from 'lucide-react';
import { toast } from 'sonner';
import Layout from '@/components/Layout';

interface Connection {
  id: string;
  status: 'pending' | 'accepted' | 'rejected';
  requester: { id: string; name: string; role: string };
  responder: { id: string; name: string; role: string };
}

const Connections = () => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConnections();
    
    const channel = supabase
      .channel('connections-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'connections' }, () => {
        fetchConnections();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchConnections = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('connections')
      .select(`
        id,
        status,
        requester:requester_id (id, name, role),
        responder:responder_id (id, name, role)
      `)
      .or(`requester_id.eq.${user.id},responder_id.eq.${user.id}`);

    if (!error && data) {
      setConnections(data as any);
    }
    setLoading(false);
  };

  const updateConnectionStatus = async (connectionId: string, status: 'accepted' | 'rejected') => {
    const { error } = await supabase
      .from('connections')
      .update({ status })
      .eq('id', connectionId);

    if (error) {
      toast.error('Failed to update connection');
    } else {
      toast.success(`Connection ${status}`);
      fetchConnections();
    }
  };

  const renderConnection = (connection: Connection, isPending: boolean = false, currentUserId: string) => {
    const isRequester = connection.requester.id === currentUserId;
    const otherUser = isRequester ? connection.responder : connection.requester;

    return (
      <Card key={connection.id} className="hover:shadow-card transition-all">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">{otherUser.name}</h3>
              <Badge variant="secondary" className="mt-1">
                {otherUser.role}
              </Badge>
            </div>
          </div>
          {isPending && !isRequester && (
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => updateConnectionStatus(connection.id, 'accepted')}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => updateConnectionStatus(connection.id, 'rejected')}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          {connection.status === 'pending' && isRequester && (
            <Badge variant="outline">Pending</Badge>
          )}
        </CardContent>
      </Card>
    );
  };

  const [currentUserId, setCurrentUserId] = useState<string>('');

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
    };
    getCurrentUser();
  }, []);

  const pendingConnections = connections.filter((c) => c.status === 'pending');
  const acceptedConnections = connections.filter((c) => c.status === 'accepted');

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Connections</h1>
          <p className="text-muted-foreground">Manage your business network</p>
        </div>

        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">
              Active ({acceptedConnections.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({pendingConnections.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4 mt-6">
            {acceptedConnections.map((c) => renderConnection(c, false, currentUserId))}
            {acceptedConnections.length === 0 && (
              <Card className="p-12 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No active connections</h3>
                <p className="text-muted-foreground">Start connecting with partners</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4 mt-6">
            {pendingConnections.map((c) => renderConnection(c, true, currentUserId))}
            {pendingConnections.length === 0 && (
              <Card className="p-12 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No pending requests</h3>
                <p className="text-muted-foreground">All caught up!</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Connections;
