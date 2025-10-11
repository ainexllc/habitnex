'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Home, Users, UserPlus, ArrowRight, Star, Trophy, Gift, Target } from 'lucide-react';
import Link from 'next/link';
import { theme } from '@/lib/theme';

export default function FamilyOnboardingPage() {
  const features = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Family Dashboard",
      description: "See everyone&apos;s habits and progress on one beautiful screen"
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: "Point System", 
      description: "Earn points for completing habits, with streaks and bonuses"
    },
    {
      icon: <Gift className="w-8 h-8" />,
      title: "Rewards Store",
      description: "Parents set up rewards that kids can earn with their points"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Touch Optimized",
      description: "Perfect for wall-mounted displays and tablet interfaces"
    }
  ];
  
  return (
    <ProtectedRoute>
      <div className={`min-h-screen ${theme.gradients.rainbow} py-8 px-4`}>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                <Home className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className={`text-4xl font-bold ${theme.text.primary} mb-4`}>
              Welcome to Family Mode! 
            </h1>
            <p className={`text-xl ${theme.text.secondary} max-w-2xl mx-auto leading-relaxed`}>
              Transform your habit tracking into a family adventure. Build better habits together, 
              celebrate each other's wins, and create lasting positive changes as a team.
            </p>
          </div>
          
          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {features.map((feature, index) => (
              <Card key={index} className={`${theme.components.card} ${theme.components.cardHover} border-2 border-purple-200 dark:border-purple-700`}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold ${theme.text.primary} mb-2`}>
                        {feature.title}
                      </h3>
                      <p className={`${theme.text.secondary} leading-relaxed`}>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* How It Works */}
          <Card className={`mb-12 ${theme.components.card} border-2 border-blue-200 dark:border-blue-700`}>
            <CardHeader>
              <CardTitle className="text-2xl text-center flex items-center justify-center">
                <Star className="w-6 h-6 mr-2 text-yellow-500" />
                How Family Mode Works
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-green-600">1</span>
                  </div>
                  <h4 className={`font-bold ${theme.text.primary} mb-2`}>Create Your Family</h4>
                  <p className={theme.text.secondary}>Set up your family name and get an invite code to share</p>
                </div>
                <div>
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-blue-600">2</span>
                  </div>
                  <h4 className={`font-bold ${theme.text.primary} mb-2`}>Invite Family Members</h4>
                  <p className={theme.text.secondary}>Share the code with everyone who wants to join your family</p>
                </div>
                <div>
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-purple-600">3</span>
                  </div>
                  <h4 className={`font-bold ${theme.text.primary} mb-2`}>Track Together</h4>
                  <p className={theme.text.secondary}>See everyone&apos;s progress and celebrate wins together</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
            <Link href="/family/create">
              <Button size="lg" className="w-full md:w-auto px-8 py-4 text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <Users className="w-5 h-5 mr-2" />
                Create New Family
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            
            <div className={`flex items-center ${theme.text.muted}`}>
              <span className="mx-4">or</span>
            </div>
            
            <Link href="/family/join">
              <Button variant="outline" size="lg" className="w-full md:w-auto px-8 py-4 text-lg font-semibold border-2">
                <UserPlus className="w-5 h-5 mr-2" />
                Join Existing Family
              </Button>
            </Link>
          </div>
          
          {/* Continue Individual */}
          <div className={`mt-12 text-center p-6 ${theme.surface.secondary} rounded-xl`}>
            <p className={`${theme.text.secondary} mb-4`}>
              Not ready for family mode? You can always continue with individual habit tracking.
            </p>
            <Link href="/">
              <Button variant="ghost" className={theme.components.button.ghost}>
                Continue with Individual Mode
              </Button>
            </Link>
          </div>
          
          {/* Footer */}
          <div className={`mt-12 text-center ${theme.text.muted}`}>
            <p className="text-sm">
              Family mode keeps all your individual data safe. You can switch between family and individual tracking anytime.
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}