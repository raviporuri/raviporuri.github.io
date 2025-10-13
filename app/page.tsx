'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Brain,
  FileText,
  Search,
  Zap,
  ArrowRight,
  Check,
  Sparkles,
  Bot,
  MessageSquare,
  Download,
  Target,
  BarChart3,
  Users,
  Star,
  ChevronRight,
  Play
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function HomePage() {
  const [activeFeature, setActiveFeature] = useState(0)

  const features = [
    {
      icon: Brain,
      title: "AI Career Assistant",
      description: "Chat with my AI assistant trained on 25+ years of technology leadership experience",
      details: "Get personalized career advice, leadership insights, and technical guidance based on real-world experience scaling organizations from startup to IPO.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: FileText,
      title: "Smart Resume Generator",
      description: "Create ATS-optimized resumes tailored to specific roles and companies",
      details: "Generate professional resumes using AI that understands job requirements, optimizes keywords, and formats for maximum impact.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Search,
      title: "Intelligent Job Matching",
      description: "Find opportunities that align with your skills and career goals",
      details: "Advanced AI analyzes your background against job postings to find the perfect matches and provide actionable application strategies.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Target,
      title: "Resume Tailoring",
      description: "Automatically customize your resume for each application",
      details: "Upload your resume and job description to get a perfectly tailored version that highlights relevant experience and skills.",
      color: "from-orange-500 to-red-500"
    }
  ]

  const stats = [
    { label: "Years of Experience", value: "25+", icon: Star },
    { label: "Companies Scaled", value: "10+", icon: BarChart3 },
    { label: "Team Members Led", value: "500+", icon: Users },
    { label: "Revenue Impact", value: "$3.2B+", icon: Target }
  ]

  const testimonials = [
    {
      quote: "The AI career assistant provided insights that transformed my approach to leadership.",
      author: "Sarah Chen",
      role: "Engineering Manager at Google",
      avatar: "SC"
    },
    {
      quote: "Generated resume helped me land my dream job at Microsoft in just 3 weeks.",
      author: "Michael Torres",
      role: "Senior Software Engineer",
      avatar: "MT"
    },
    {
      quote: "The job matching algorithm found opportunities I never would have discovered.",
      author: "Priya Patel",
      role: "Product Manager at Stripe",
      avatar: "PP"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <Brain className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold text-white">Ravi Poruri</span>
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-400/30">
                AI-Powered
              </Badge>
            </motion.div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#about" className="text-slate-300 hover:text-white transition-colors">About</a>
              <a href="#features" className="text-slate-300 hover:text-white transition-colors">Features</a>
              <a href="#testimonials" className="text-slate-300 hover:text-white transition-colors">Success Stories</a>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat with AI
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="flex items-center space-x-2"
                >
                  <Sparkles className="h-5 w-5 text-yellow-400" />
                  <span className="text-blue-300 font-medium">AI-Powered Career Platform</span>
                </motion.div>

                <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight">
                  Transform Your
                  <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Career Journey
                  </span>
                </h1>

                <p className="text-xl text-slate-300 leading-relaxed">
                  Leverage 25+ years of technology leadership experience through AI. Get personalized career guidance,
                  generate optimized resumes, and discover opportunities that accelerate your growth.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6 group">
                  <Bot className="h-5 w-5 mr-2" />
                  Start AI Chat
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 text-lg px-8 py-6 group">
                  <Play className="h-5 w-5 mr-2" />
                  Watch Demo
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1, duration: 0.6 }}
                    className="text-center group cursor-pointer"
                  >
                    <div className="flex items-center justify-center mb-2">
                      <stat.icon className="h-5 w-5 text-blue-400 mr-1" />
                      <div className="text-2xl font-bold text-blue-400 group-hover:text-blue-300 transition-colors">
                        {stat.value}
                      </div>
                    </div>
                    <div className="text-sm text-slate-400">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Interactive Demo */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="relative"
            >
              <div className="relative">
                <Card className="bg-white/10 backdrop-blur-xl border-white/20 overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <MessageSquare className="h-5 w-5 mr-2 text-blue-400" />
                      AI Career Assistant
                      <Badge className="ml-auto bg-green-500/20 text-green-300 border-green-400/30">
                        Live
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-slate-300">
                      Experience intelligent career guidance
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="bg-blue-500/20 p-4 rounded-lg border border-blue-400/30"
                    >
                      <p className="text-white text-sm">
                        "How can I transition from a senior engineer to an engineering manager role?"
                      </p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      className="bg-slate-800/50 p-4 rounded-lg border border-slate-600/30"
                    >
                      <div className="flex items-start space-x-2">
                        <Bot className="h-4 w-4 text-blue-400 mt-1 flex-shrink-0" />
                        <div className="space-y-2">
                          <p className="text-slate-300 text-sm leading-relaxed">
                            Based on my experience scaling teams at Dropbox and Cisco, here's a strategic approach...
                          </p>
                          <div className="flex space-x-2">
                            <Badge variant="outline" className="text-xs border-blue-400/30 text-blue-300">
                              Leadership
                            </Badge>
                            <Badge variant="outline" className="text-xs border-purple-400/30 text-purple-300">
                              Career Growth
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      Try Live Demo
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold text-white mb-4">
                AI-Powered Career Tools
              </h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                Comprehensive suite of intelligent tools designed to accelerate your career growth
              </p>
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                >
                  <Card
                    className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                      activeFeature === index
                        ? 'bg-gradient-to-r ' + feature.color + ' bg-opacity-20 border-white/30'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                    onClick={() => setActiveFeature(index)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-r ${feature.color}`}>
                          <feature.icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-2">
                            {feature.title}
                          </h3>
                          <p className="text-slate-300 text-sm">
                            {feature.description}
                          </p>
                        </div>
                        <Check className={`h-5 w-5 transition-colors ${
                          activeFeature === index ? 'text-blue-400' : 'text-slate-600'
                        }`} />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <motion.div
              key={activeFeature}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:pl-8"
            >
              <Card className={`bg-gradient-to-br ${features[activeFeature].color} bg-opacity-10 backdrop-blur-xl border-white/20 overflow-hidden`}>
                <CardContent className="p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className={`p-4 bg-gradient-to-r ${features[activeFeature].color} rounded-xl`}>
                      {(() => {
                        const Icon = features[activeFeature].icon
                        return <Icon className="h-8 w-8 text-white" />
                      })()}
                    </div>
                    <h3 className="text-2xl font-bold text-white">
                      {features[activeFeature].title}
                    </h3>
                  </div>
                  <p className="text-slate-300 leading-relaxed mb-6">
                    {features[activeFeature].details}
                  </p>
                  <Button className={`bg-gradient-to-r ${features[activeFeature].color} hover:opacity-90`}>
                    <Zap className="h-4 w-4 mr-2" />
                    Try Now
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold text-white mb-4">
                Success Stories
              </h2>
              <p className="text-xl text-slate-300">
                See how professionals are accelerating their careers with AI
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <Card className="bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <blockquote className="text-slate-300 mb-4">
                      "{testimonial.quote}"
                    </blockquote>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {testimonial.avatar}
                        </span>
                      </div>
                      <div>
                        <div className="text-white font-semibold">{testimonial.author}</div>
                        <div className="text-slate-400 text-sm">{testimonial.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <h2 className="text-4xl font-bold text-white">
              Ready to Accelerate Your Career?
            </h2>
            <p className="text-xl text-slate-300">
              Join thousands of professionals who've transformed their careers with AI-powered guidance
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6">
                <MessageSquare className="h-5 w-5 mr-2" />
                Start Free Consultation
              </Button>
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 text-lg px-8 py-6">
                <Download className="h-5 w-5 mr-2" />
                Download Resume Sample
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Brain className="h-6 w-6 text-blue-400" />
                <span className="text-lg font-bold text-white">Ravi Poruri</span>
              </div>
              <p className="text-slate-400 mb-4">
                AI-powered career platform built on 25+ years of technology leadership experience.
              </p>
              <div className="flex space-x-4">
                <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                  LinkedIn
                </Button>
                <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                  GitHub
                </Button>
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-slate-400">
                <li>AI Career Assistant</li>
                <li>Resume Generator</li>
                <li>Job Matching</li>
                <li>Career Analytics</li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-slate-400">
                <li>About</li>
                <li>Blog</li>
                <li>Careers</li>
                <li>Contact</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2024 Ravi Poruri. All rights reserved. Powered by AI.</p>
          </div>
        </div>
      </footer>

      {/* Schema.org JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            "name": "Ravi Poruri",
            "jobTitle": "AI Entrepreneur & Technology Leader",
            "description": "25+ year technology executive, AI entrepreneur, and founder of Equiti Ventures. Expert in scaling data platforms, leading global teams, and building AI-powered applications.",
            "url": "https://raviporuri.com",
            "sameAs": [
              "https://linkedin.com/in/raviporuri",
              "https://github.com/raviporuri"
            ]
          })
        }}
      />
    </div>
  )
}