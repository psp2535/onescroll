import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Building2, Users, MessageSquare, TrendingUp, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <nav className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-2xl">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            OneScroll
          </span>
        </div>
        <Button onClick={() => navigate('/auth')} size="lg">
          Get Started
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </nav>

      <main className="container mx-auto px-4 py-20">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold leading-tight">
            Connect. Collaborate.{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Grow Together
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            OneScroll is your B2B networking platform connecting distributors and retailers.
            Build meaningful partnerships and expand your business network.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/auth')} className="text-lg px-8">
              Start Networking
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
          {[
            {
              icon: Users,
              title: 'Find Partners',
              description: 'Search and connect with distributors and retailers in your industry',
              color: 'from-primary to-accent',
            },
            {
              icon: MessageSquare,
              title: 'Real-time Chat',
              description: 'Communicate instantly with your connections and build relationships',
              color: 'from-accent to-primary',
            },
            {
              icon: TrendingUp,
              title: 'Grow Network',
              description: 'Expand your reach and discover new business opportunities',
              color: 'from-primary/80 to-accent/80',
            },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="p-8 rounded-xl bg-card border hover:shadow-elegant transition-all duration-300 hover:-translate-y-2"
            >
              <div className={`h-14 w-14 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6`}>
                <feature.icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Index;
