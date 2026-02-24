import React, { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Mic, MicOff, Leaf, Users, TrendingUp, Utensils, MapPin, ArrowRight, TreePine, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCityContext } from '../hooks/useCityContext';
import { useLanguage } from '../hooks/useLanguage';
import { startVoiceRecognition, parseDonateSpeech } from '../lib/speechUtils';

const CITIES = ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Kolhapur'];

const DEMO_STATS = [
  { label: 'Meals Saved', value: 12500, icon: Utensils, unit: '', color: 'text-primary' },
  { label: 'People Fed', value: 31250, icon: Users, unit: '', color: 'text-secondary' },
  { label: 'CO₂ Reduced', value: 26250, icon: TreePine, unit: 'kg', color: 'text-primary' },
];

function AnimatedCounter({ target, unit }: { target: number; unit: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setCount(Math.min(Math.round(increment * step), target));
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target]);

  return (
    <span>
      {count.toLocaleString()}
      {unit && <span className="text-lg ml-1">{unit}</span>}
    </span>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const { selectedCity, setSelectedCity } = useCityContext();
  const { t } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [stopRecognition, setStopRecognition] = useState<(() => void) | null>(null);

  const handleVoiceInput = () => {
    if (isListening) {
      if (stopRecognition) stopRecognition();
      setIsListening(false);
      setStopRecognition(null);
      return;
    }

    setIsListening(true);
    setVoiceTranscript('');

    const stop = startVoiceRecognition(
      (transcript) => {
        setVoiceTranscript(transcript);
        setIsListening(false);
        const parsed = parseDonateSpeech(transcript);
        const params = new URLSearchParams();
        if (parsed.foodType) params.set('foodType', parsed.foodType);
        if (parsed.quantity) params.set('quantity', String(parsed.quantity));
        if (parsed.timeSinceCooked) params.set('timeSinceCooked', String(parsed.timeSinceCooked));
        navigate({ to: '/donate', search: Object.fromEntries(params) });
      },
      () => {
        setIsListening(false);
      }
    );
    if (stop) setStopRecognition(() => stop);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/assets/generated/hero-banner.dim_1200x400.png)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/60 to-secondary/70" />
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-20 md:py-32">
          <div className="text-center text-white">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2 text-sm font-medium mb-6">
              <Leaf className="w-4 h-4" />
              <span>Maharashtra Edition • AI-Powered Food Redistribution</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
              {t('heroTitle')}
            </h1>
            <p className="text-xl md:text-2xl font-light mb-3 text-white/90">
              {t('heroSubtitle')}
            </p>
            <p className="text-base md:text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              {t('tagline')}
            </p>

            {/* City Selector */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {CITIES.map((city) => (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                    selectedCity === city
                      ? 'bg-white text-primary border-white shadow-lg scale-105'
                      : 'bg-white/20 text-white border-white/40 hover:bg-white/30 hover:scale-105'
                  }`}
                >
                  <MapPin className="w-3 h-3 inline mr-1" />
                  {city}
                </button>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Button
                size="lg"
                onClick={() => navigate({ to: '/donate' })}
                className="bg-secondary hover:bg-secondary/90 text-white font-bold px-8 py-4 rounded-full shadow-orange-glow hover:scale-105 transition-all"
              >
                <Utensils className="w-5 h-5 mr-2" />
                {t('donateFood')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate({ to: '/login' })}
                className="bg-white/20 backdrop-blur-sm border-white/50 text-white hover:bg-white/30 font-bold px-8 py-4 rounded-full hover:scale-105 transition-all"
              >
                {t('iAmAnNGO')}
              </Button>
            </div>

            {/* Voice Input */}
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={handleVoiceInput}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg ${
                  isListening
                    ? 'bg-red-500 animate-pulse scale-110'
                    : 'bg-white/20 backdrop-blur-sm border-2 border-white/50 hover:bg-white/30 hover:scale-110'
                }`}
              >
                {isListening ? (
                  <MicOff className="w-7 h-7 text-white" />
                ) : (
                  <Mic className="w-7 h-7 text-white" />
                )}
              </button>
              <span className="text-white/80 text-sm">
                {isListening ? t('listening') : t('voiceInput')}
              </span>
              {voiceTranscript && (
                <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-2 text-white text-sm max-w-md">
                  "{voiceTranscript}"
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Impact Counters */}
      <section className="py-16 bg-gradient-to-b from-background to-muted/30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-2">Our Impact in Maharashtra</h2>
            <p className="text-muted-foreground">Real-time food redistribution across 6 cities</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DEMO_STATS.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="glass-card rounded-2xl p-8 text-center border border-primary/20 bg-card hover-lift"
                >
                  <div className={`inline-flex p-4 rounded-2xl bg-primary/10 mb-4 ${stat.color}`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <div className={`text-4xl font-bold mb-2 ${stat.color}`}>
                    <AnimatedCounter target={stat.value} unit={stat.unit} />
                  </div>
                  <div className="text-muted-foreground font-medium">{stat.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">in {selectedCity}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-muted/20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-2">How It Works</h2>
            <p className="text-muted-foreground">AI-powered food redistribution in 3 simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: Utensils,
                title: 'Donate Surplus Food',
                desc: 'Hotels, hostels, and households submit food donations with AI safety analysis',
                color: 'text-secondary',
                bg: 'bg-secondary/10',
              },
              {
                step: '02',
                icon: Zap,
                title: 'AI Matches NGO',
                desc: 'Our AI finds the nearest verified NGO using Haversine distance and urgency scoring',
                color: 'text-primary',
                bg: 'bg-primary/10',
              },
              {
                step: '03',
                icon: Users,
                title: 'Volunteer Delivers',
                desc: 'Nearby volunteers pick up and deliver food to those in need with route optimization',
                color: 'text-secondary',
                bg: 'bg-secondary/10',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="glass-card rounded-2xl p-6 border border-primary/20 bg-card hover-lift text-center">
                  <div className="text-5xl font-black text-primary/10 mb-3">{item.step}</div>
                  <div className={`inline-flex p-3 rounded-xl ${item.bg} mb-4 ${item.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-primary/80">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Make a Difference?</h2>
          <p className="text-white/80 mb-8 text-lg">
            Join thousands of donors, NGOs, and volunteers across Maharashtra
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate({ to: '/donate' })}
              className="bg-secondary hover:bg-secondary/90 text-white font-bold px-8 rounded-full hover:scale-105 transition-all"
            >
              <Utensils className="w-5 h-5 mr-2" />
              Donate Food Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate({ to: '/impact' })}
              className="border-white/50 text-white hover:bg-white/20 font-bold px-8 rounded-full hover:scale-105 transition-all"
            >
              <TrendingUp className="w-5 h-5 mr-2" />
              View Impact
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
