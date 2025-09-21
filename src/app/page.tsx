"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  TrendingUp, 
  Target, 
  BarChart3, 
  Users, 
  Zap, 
  CheckCircle,
  Star,
  ArrowRight,
  Globe,
  FileText,
  Link as LinkIcon,
  Smartphone,
  Shield,
  Clock,
  Award,
  Headphones,
  Rocket,
  Database,
  Eye,
  Settings,
  Activity,
  BookOpen,
  Video,
  Calendar,
  Megaphone,
  Bookmark,
  Building,
  ShoppingCart
} from "lucide-react"
import Link from "next/link"
import { LandingPricing } from "@/components/pricing/landing-pricing"

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                🚀 #1 SEO Platform for Businesses
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
                Dominate Search Rankings with{" "}
                <span className="bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Opptym SEO
                </span>
              </h1>
              <p className="text-xl lg:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
                The most comprehensive SEO platform trusted by 10,000+ businesses. 
                Boost your organic traffic, track rankings, and outrank competitors with our 
                powerful suite of 14+ professional SEO tools.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            >
              <Link href="/auth/register">
                <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90">
                  <Rocket className="mr-2 h-5 w-5" />
                  Start Free Trial
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                <Video className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>10,000+ Active Users</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                <span>99.9% Uptime</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>SOC 2 Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>4.9/5 Rating</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section id="features" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              ✨ Powerful Features
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Everything You Need to{" "}
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Dominate SEO
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our comprehensive suite of 14+ professional SEO tools helps you analyze, 
              optimize, and track your website's performance across all major search engines.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Search,
                title: "Meta Tag Analyzer",
                description: "Analyze and optimize meta titles, descriptions, and other meta tags for better search visibility.",
                color: "bg-blue-500/10 text-blue-600"
              },
              {
                icon: BarChart3,
                title: "Keyword Density Checker",
                description: "Check keyword density and distribution to avoid keyword stuffing and optimize content.",
                color: "bg-green-500/10 text-green-600"
              },
              {
                icon: TrendingUp,
                title: "Keyword Researcher",
                description: "Discover high-value keywords with search volume, competition, and trend analysis.",
                color: "bg-purple-500/10 text-purple-600"
              },
              {
                icon: LinkIcon,
                title: "Broken Link Scanner",
                description: "Find and fix broken links that hurt your SEO and user experience.",
                color: "bg-red-500/10 text-red-600"
              },
              {
                icon: Globe,
                title: "Sitemap & Robots Checker",
                description: "Validate your sitemap and robots.txt files for proper search engine crawling.",
                color: "bg-orange-500/10 text-orange-600"
              },
              {
                icon: Target,
                title: "Backlink Scanner",
                description: "Analyze your backlink profile and discover new link building opportunities.",
                color: "bg-indigo-500/10 text-indigo-600"
              },
              {
                icon: Activity,
                title: "Keyword Tracker",
                description: "Monitor your keyword rankings across multiple search engines in real-time.",
                color: "bg-pink-500/10 text-pink-600"
              },
              {
                icon: Zap,
                title: "Page Speed Analyzer",
                description: "Test and optimize your website's loading speed for better user experience.",
                color: "bg-yellow-500/10 text-yellow-600"
              },
              {
                icon: Smartphone,
                title: "Mobile Checker",
                description: "Ensure your website is mobile-friendly and optimized for mobile search.",
                color: "bg-teal-500/10 text-teal-600"
              },
              {
                icon: Users,
                title: "Competitor Analyzer",
                description: "Analyze your competitors' SEO strategies and identify opportunities.",
                color: "bg-cyan-500/10 text-cyan-600"
              },
              {
                icon: Settings,
                title: "Technical SEO Auditor",
                description: "Comprehensive technical SEO audit to identify and fix critical issues.",
                color: "bg-emerald-500/10 text-emerald-600"
              },
              {
                icon: FileText,
                title: "Schema Validator",
                description: "Validate and test your structured data markup for rich snippets.",
                color: "bg-violet-500/10 text-violet-600"
              },
              {
                icon: Eye,
                title: "Alt Text Checker",
                description: "Check and optimize alt text for images to improve accessibility and SEO.",
                color: "bg-rose-500/10 text-rose-600"
              },
              {
                icon: LinkIcon,
                title: "Canonical Checker",
                description: "Identify and fix canonical URL issues to prevent duplicate content problems.",
                color: "bg-amber-500/10 text-amber-600"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SEO Tasks Section */}
      <section id="seo-tasks" className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              🎯 SEO Tasks
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Automated SEO{" "}
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Submission Tasks
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Streamline your SEO workflow with our automated submission tasks. 
              Submit to directories, publish articles, and build backlinks automatically.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Database,
                title: "Directory Submission",
                description: "Submit your business to 2,800+ high-quality directories automatically.",
                count: "2,800+ Directories"
              },
              {
                icon: FileText,
                title: "Article Submission",
                description: "Publish articles to top article directories and content platforms.",
                count: "500+ Platforms"
              },
              {
                icon: Megaphone,
                title: "Press Release",
                description: "Distribute press releases to major news outlets and PR networks.",
                count: "200+ Outlets"
              },
              {
                icon: Bookmark,
                title: "Social Bookmarking",
                description: "Bookmark your content on popular social bookmarking sites.",
                count: "100+ Sites"
              },
              {
                icon: Building,
                title: "Business Listing",
                description: "List your business on Google My Business and other local directories.",
                count: "50+ Platforms"
              },
              {
                icon: ShoppingCart,
                title: "Classified Ads",
                description: "Post classified ads on high-traffic classified websites.",
                count: "300+ Sites"
              }
            ].map((task, index) => (
              <motion.div
                key={task.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-card to-card/50">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <task.icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{task.title}</CardTitle>
                    <Badge variant="secondary" className="w-fit">
                      {task.count}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      {task.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <LandingPricing />

      {/* Why Choose Us Section */}
      <section id="why-choose-us" className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              🏆 Why Choose Opptym
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Trusted by{" "}
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                10,000+ Businesses
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Join thousands of successful businesses that trust Opptym SEO Platform 
              to boost their search rankings and drive organic traffic growth.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Lightning Fast",
                description: "Get results in seconds with our optimized infrastructure and real-time processing.",
                stat: "99.9% Uptime"
              },
              {
                icon: Shield,
                title: "Enterprise Security",
                description: "Your data is protected with bank-level encryption and SOC 2 compliance.",
                stat: "SOC 2 Certified"
              },
              {
                icon: Users,
                title: "Expert Support",
                description: "Get help from our team of SEO experts available 24/7 via chat, email, and phone.",
                stat: "24/7 Support"
              },
              {
                icon: BarChart3,
                title: "Proven Results",
                description: "Our users see an average 150% increase in organic traffic within 6 months.",
                stat: "150% Avg. Growth"
              },
              {
                icon: Settings,
                title: "Easy Integration",
                description: "Connect with your existing tools via our powerful API and integrations.",
                stat: "50+ Integrations"
              },
              {
                icon: Award,
                title: "Industry Leader",
                description: "Recognized as the #1 SEO platform by leading industry publications.",
                stat: "#1 Rated Platform"
              }
            ].map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <benefit.icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{benefit.title}</CardTitle>
                    <Badge variant="secondary" className="w-fit">
                      {benefit.stat}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      {benefit.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Knowledge Base Section */}
      <section id="knowledge-base" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              📚 Knowledge Base
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Learn SEO with{" "}
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Expert Resources
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Master SEO with our comprehensive knowledge base, tutorials, and expert guides. 
              Stay updated with the latest SEO trends and best practices.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: BookOpen,
                title: "SEO Fundamentals",
                description: "Learn the basics of SEO, from keyword research to on-page optimization.",
                articles: "50+ Articles"
              },
              {
                icon: TrendingUp,
                title: "Advanced Strategies",
                description: "Master advanced SEO techniques like technical SEO and link building.",
                articles: "30+ Guides"
              },
              {
                icon: Target,
                title: "Case Studies",
                description: "Real-world examples of successful SEO campaigns and their results.",
                articles: "25+ Studies"
              },
              {
                icon: Video,
                title: "Video Tutorials",
                description: "Step-by-step video guides for using our platform effectively.",
                articles: "100+ Videos"
              },
              {
                icon: FileText,
                title: "Best Practices",
                description: "Industry best practices and white-hat SEO techniques.",
                articles: "40+ Guides"
              },
              {
                icon: Calendar,
                title: "SEO News",
                description: "Stay updated with the latest SEO news, algorithm updates, and trends.",
                articles: "Daily Updates"
              }
            ].map((resource, index) => (
              <motion.div
                key={resource.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-card to-card/50 cursor-pointer group">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <resource.icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{resource.title}</CardTitle>
                    <Badge variant="secondary" className="w-fit">
                      {resource.articles}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      {resource.description}
                    </CardDescription>
                    <div className="mt-4 flex items-center text-primary group-hover:text-primary/80 transition-colors">
                      <span className="text-sm font-medium">Learn More</span>
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              💬 Customer Stories
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Loved by{" "}
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                SEO Professionals
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              See what our customers say about their success with Opptym SEO Platform.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "SEO Manager",
                company: "TechCorp",
                content: "Opptym SEO Platform helped us increase our organic traffic by 200% in just 6 months. The tools are incredibly powerful and easy to use.",
                rating: 5,
                avatar: "SJ"
              },
              {
                name: "Michael Chen",
                role: "Digital Marketing Director",
                company: "GrowthCo",
                content: "The automated submission tasks saved us hundreds of hours. We can now focus on strategy while Opptym handles the execution.",
                rating: 5,
                avatar: "MC"
              },
              {
                name: "Emily Rodriguez",
                role: "Agency Owner",
                company: "SEO Masters",
                content: "Our clients love the detailed reports and analytics. Opptym has become an essential tool in our SEO toolkit.",
                rating: 5,
                avatar: "ER"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-primary font-semibold">{testimonial.avatar}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">{testimonial.name}</h4>
                        <p className="text-sm text-muted-foreground">{testimonial.role} at {testimonial.company}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <blockquote className="text-base leading-relaxed italic">
                      "{testimonial.content}"
                    </blockquote>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary/5 via-background to-blue-600/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Ready to{" "}
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Dominate Search Rankings?
              </span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join 10,000+ businesses already using Opptym SEO Platform to boost their search rankings, 
              drive organic traffic, and grow their online presence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/auth/register">
                <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90">
                  <Rocket className="mr-2 h-5 w-5" />
                  Start Your Free Trial
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                <Headphones className="mr-2 h-5 w-5" />
                Talk to Sales
              </Button>
            </div>
            
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>30-day money-back guarantee</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
