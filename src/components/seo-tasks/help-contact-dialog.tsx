"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'
import { HelpCircle, Send, Mail, MessageSquare } from 'lucide-react'

export function HelpContactDialog() {
  const { showToast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    issueType: 'submission-help'
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/seo-tasks/help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: formData.subject,
          message: formData.message,
          issueType: formData.issueType
        })
      })

      const data = await res.json()

      if (!res.ok) {
        showToast({
          title: 'Unable to send help request',
          description: data?.error || 'Please try again later.',
          variant: 'destructive'
        })
        return
      }

      showToast({
        title: 'Help request sent!',
        description: "We'll get back to you within 24 hours.",
        variant: 'default'
      })
      
      setFormData({ subject: '', message: '', issueType: 'submission-help' })
      setIsOpen(false)
    } catch (err) {
      showToast({
        title: 'Network error',
        description: 'Unable to send help request. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Need Help?</CardTitle>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <span className="text-sm text-primary font-medium">Get Support</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Confused about submissions? Contact our team
            </p>
          </CardContent>
        </Card>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            SEO Tasks Help
          </DialogTitle>
          <DialogDescription>
            Having trouble with submissions? Our team is here to help you get started.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="issueType" className="block text-sm font-medium mb-2">
              What do you need help with?
            </label>
            <select
              id="issueType"
              name="issueType"
              value={formData.issueType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="submission-help">How to make submissions</option>
              <option value="bookmarklet-setup">Bookmarklet setup</option>
              <option value="project-selection">Choosing the right project</option>
              <option value="directory-questions">Directory questions</option>
              <option value="technical-issue">Technical issue</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium mb-2">
              Subject *
            </label>
            <Input
              id="subject"
              name="subject"
              type="text"
              required
              value={formData.subject}
              onChange={handleInputChange}
              placeholder="Brief description of your issue"
              className="bg-background border-border"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-2">
              Message *
            </label>
            <Textarea
              id="message"
              name="message"
              required
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Describe your issue or question in detail..."
              rows={4}
              className="bg-background border-border"
            />
          </div>

          <div className="bg-muted/30 p-3 rounded-md">
            <div className="flex items-start gap-2">
              <Mail className="h-4 w-4 text-primary mt-0.5" />
              <div className="text-xs text-muted-foreground">
                <p className="font-medium text-foreground mb-1">How this works:</p>
                <p>Your message will be sent directly to our support team. We'll respond within 24 hours with step-by-step guidance.</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Help Request
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}