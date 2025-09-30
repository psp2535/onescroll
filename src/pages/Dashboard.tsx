import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Users, MessageSquare, TrendingUp, Target } from 'lucide-react';
import Layout from '@/components/Layout';

const Dashboard = () => {
  const [stats, setStats] = useState({
    connections: 0,
    conversations: 0,
    pendingRequests: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [connectionsRes, conversationsRes, pendingRes] = await Promise.all([
        supabase
          .from('connections')
          .select('id', { count: 'exact' })
          .eq('status', 'accepted')
          .or(`requester_id.eq.${user.id},responder_id.eq.${user.id}`),
        supabase
          .from('conversations')
          .select('id', { count: 'exact' })
          .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`),
        supabase
          .from('connections')
          .select('id', { count: 'exact' })
          .eq('status', 'pending')
          .eq('responder_id', user.id),
      ]);

      setStats({
        connections: connectionsRes.count || 0,
        conversations: conversationsRes.count || 0,
        pendingRequests: pendingRes.count || 0,
      });
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Active Connections',
      value: stats.connections,
      icon: Users,
      color: 'from-primary to-accent',
    },
    {
      title: 'Active Chats',
      value: stats.conversations,
      icon: MessageSquare,
      color: 'from-accent to-primary',
    },
    {
      title: 'Pending Requests',
      value: stats.pendingRequests,
      icon: TrendingUp,
      color: 'from-primary/80 to-accent/80',
    },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back to OneScroll</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statCards.map((stat) => (
            <Card key={stat.title} className="hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <CardTitle>Featured Ads</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                <h3 className="font-semibold text-lg mb-2">Premium Business Tools</h3>
                <p className="text-muted-foreground">Upgrade your B2B operations with our premium suite</p>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/20">
                <h3 className="font-semibold text-lg mb-2">Connect More, Grow More</h3>
                <p className="text-muted-foreground">Expand your network with OneScroll Premium</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
