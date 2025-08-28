'use client';

import Link from 'next/link'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { ArrowRight, Users, Trophy, Brain, Quote } from 'lucide-react'
import { useState } from 'react'

// Wave animation from site's lib/waveAnimations.ts style
const waveStyle = `
  @keyframes wave {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  .wave-container {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 50px;
    overflow: hidden;
  }
  .wave {
    position: absolute;
    bottom: 0;
    width: 200%;
    height: 100%;
    background: repeating-radial-gradient(circle at 10px -5px, transparent 12px, rgba(255,255,255,0.2) 13px);
    animation: wave 8s linear infinite;
  }
`

export default function HomePage() {
  const features = [
    {
      icon: Users,
      title: "Family Dashboard",
      description: "Track everyone's progress in one place with shared views and analytics."
    },
    {
      icon: Trophy,
      title: "Rewards System",
      description: "Earn points for habits and redeem family rewards to stay motivated."
    },
    {
      icon: Brain,
      title: "AI Coach",
      description: "Get personalized habit suggestions and insights powered by AI."
    }
  ]

  const testimonials = [
    {
      quote: "GrokVibe transformed our family routines - now everyone is excited about habits!",
      author: "Sarah M., Parent of 2",
      mood: "😊"
    },
    {
      quote: "The AI coach helped me build lasting habits while connecting with my kids.",
      author: "Mike D., Father",
      mood: "🏆"
    },
    {
      quote: "Simple, visual, and fun - perfect for our family's busy life.",
      author: "Emma L., Mother",
      mood: "🌟"
    }
  ]

  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 dark:from-primary-950 dark:to-secondary-900">
      <style>{waveStyle}</style>
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      {/* Hero Section - ~60% viewport */}
      <div className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="wave-container">
          <div className="wave" />
        </div>
        <div className="container mx-auto px-4 text-center z-10">
          <h1 className="text-5xl md:text-6xl font-bold text-primary-800 dark:text-primary-200 mb-6">
            Build Family Habits That Last
          </h1>
          <p className="text-xl md:text-2xl text-secondary-600 dark:text-secondary-400 mb-12 max-w-3xl mx-auto">
            Track habits together, earn rewards, and grow as a family with our powerful yet simple habit tracker.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="btn-primary text-lg px-8 py-3">
              Get Started Free
            </Link>
            <Link href="/login" className="btn-outline text-lg px-8 py-3">
              Sign In
            </Link>
          </div>
        </div>
      </div>
      
      {/* Features Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div key={i} className="card text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-secondary-600 dark:text-secondary-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Testimonial Carousel */}
      <div className="bg-secondary-50 dark:bg-secondary-900 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-primary-800 dark:text-primary-200 mb-12">
            What Families Are Saying
          </h2>
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-md">
                <Quote className="w-12 h-12 text-primary-300 mx-auto mb-4" />
                <p className="text-lg text-secondary-600 dark:text-secondary-400 mb-4">
                  "{testimonials[currentTestimonial].quote}"
                </p>
                <p className="font-semibold">{testimonials[currentTestimonial].author}</p>
                <span className="text-2xl">{testimonials[currentTestimonial].mood}</span>
              </div>
              <div className="flex justify-center gap-2 mt-4">
                {testimonials.map((_, i) => (
                  <button 
                    key={i}
                    onClick={() => setCurrentTestimonial(i)}
                    className={`w-3 h-3 rounded-full ${i === currentTestimonial ? 'bg-primary-600' : 'bg-secondary-300'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer CTA */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-primary-800 dark:text-primary-200 mb-6">
          Join Your Family's Journey Today
        </h2>
        <Link href="/signup" className="btn-primary text-lg px-8 py-3 inline-flex items-center">
          Start Building Habits <ArrowRight className="ml-2 w-5 h-5" />
        </Link>
      </div>
    </div>
  )
}