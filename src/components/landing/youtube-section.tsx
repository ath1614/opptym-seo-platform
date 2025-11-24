"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Clock, ExternalLink, Youtube } from "lucide-react"
import Link from "next/link"

const videos = [
  {
    id: "YPjWGvls4hM",
    title: "About Opptym - Complete SEO Platform Overview",
    description: "Learn what Opptym SEO Platform offers and how it can transform your digital marketing strategy.",
    duration: "3:45",
    url: "https://youtu.be/YPjWGvls4hM?si=EPRa5rOhO045QLzo",
    thumbnail: "https://img.youtube.com/vi/YPjWGvls4hM/maxresdefault.jpg"
  },
  {
    id: "m9lNC_-FpoM", 
    title: "How to Create Project in Opptym SEO",
    description: "Step-by-step guide to setting up your first SEO project and configuring it for maximum results.",
    duration: "5:20",
    url: "https://youtu.be/m9lNC_-FpoM?si=6oaPcg53dUYsvpsO",
    thumbnail: "https://img.youtube.com/vi/m9lNC_-FpoM/maxresdefault.jpg"
  },
  {
    id: "ynP0xnSBYKg",
    title: "Directory Submission with Opptym Bookmarklet",
    description: "Master the automated directory submission process using our smart bookmarklet tool.",
    duration: "7:15", 
    url: "https://youtu.be/ynP0xnSBYKg?si=SUASH1x2b8B2nTce",
    thumbnail: "https://img.youtube.com/vi/ynP0xnSBYKg/maxresdefault.jpg"
  }
]

export function YouTubeSection() {
  return (
    <section id="video-tutorials" className="py-24 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6 }} 
          viewport={{ once: true }} 
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            <Youtube className="w-4 h-4 mr-2" />
            Video Tutorials
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Learn SEO with{" "}
            <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Expert Video Guides
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Master Opptym SEO Platform with our comprehensive video tutorials. From basic setup to advanced strategies, 
            learn directly from our experts and get the most out of your SEO efforts.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {videos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm overflow-hidden">
                <div className="relative">
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <Play className="w-8 h-8 text-primary-foreground ml-1" fill="currentColor" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {video.duration}
                    </div>
                  </div>
                </div>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                    {video.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4">
                    {video.description}
                  </p>
                  <Link href={video.url} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full">
                      <Play className="w-4 h-4 mr-2" />
                      Watch Video
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Channel CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Card className="bg-gradient-to-r from-primary/5 to-blue-600/5 border-primary/20">
            <CardContent className="p-8">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <Youtube className="w-8 h-8 text-primary-foreground" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Subscribe to Opptym AI Channel
              </h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Get the latest SEO tips, platform updates, and advanced tutorials delivered directly to your feed. 
                Join our growing community of SEO professionals and stay ahead of the competition.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="https://www.youtube.com/@OpptymAI" target="_blank" rel="noopener noreferrer">
                  <Button size="lg">
                    <Youtube className="w-5 h-5 mr-2" />
                    Subscribe to Channel
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                    Start Free Trial
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}