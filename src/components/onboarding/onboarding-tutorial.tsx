"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  Plus, 
  Search, 
  FileText, 
  Link, 
  Target,
  Zap,
  BarChart3,
  Globe,
  Users,
  Star,
  Sparkles,
  Rocket,
  Lightbulb,
  Shield,
  Award
} from 'lucide-react'

interface TutorialStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  content: React.ReactNode
  action?: {
    text: string
    href: string
    onClick?: () => void
  }
}

interface OnboardingTutorialProps {
  isOpen: boolean
  onClose: () => void
  userPlan?: string
}

export function OnboardingTutorial({ isOpen, onClose, userPlan = 'free' }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const router = useRouter()

  const steps: TutorialStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Opptym AI SEO!',
      description: 'Let\'s get you started with your SEO journey',
      icon: Sparkles,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Opptym AI SEO!</h3>
            <p className="text-gray-600 mb-6">
              You're about to discover the most powerful AI-driven SEO platform that will transform your website's search engine performance.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Zap className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-semibold text-blue-900">AI-Powered Analysis</h4>
              <p className="text-sm text-blue-700">Advanced AI algorithms analyze your website</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-semibold text-green-900">Comprehensive Tools</h4>
              <p className="text-sm text-green-700">All-in-one SEO toolkit for success</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <BarChart3 className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-semibold text-purple-900">Real Results</h4>
              <p className="text-sm text-purple-700">Track your progress with detailed reports</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'create-project',
      title: 'Step 1: Create Your First Project',
      description: 'Set up a project to start tracking your website\'s SEO performance',
      icon: Plus,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Create Your First Project</h3>
            <p className="text-gray-600">
              A project is like a container for all your SEO activities. You'll add your website details, track progress, and generate reports.
            </p>
          </div>
          
          <Card className="border-2 border-dashed border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-lg text-blue-900">What you'll need:</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3">
                <Globe className="w-5 h-5 text-blue-600" />
                <span className="text-blue-800">Your website URL</span>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-blue-800">Company/business information</span>
              </div>
              <div className="flex items-center space-x-3">
                <Target className="w-5 h-5 text-blue-600" />
                <span className="text-blue-800">Target keywords (optional)</span>
              </div>
            </CardContent>
          </Card>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Lightbulb className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-900">Pro Tip:</h4>
                <p className="text-sm text-yellow-800">
                  You can create multiple projects for different websites or campaigns. Each project tracks its own SEO performance independently.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
      action: {
        text: 'Create Project',
        href: '/dashboard/projects/new',
        onClick: () => {
          setCompletedSteps(prev => [...prev, 'create-project'])
          router.push('/dashboard/projects/new')
        }
      }
    },
    {
      id: 'seo-tools',
      title: 'Step 2: Use SEO Analysis Tools',
      description: 'Analyze your website with our comprehensive SEO tools',
      icon: Search,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Analyze Your Website</h3>
            <p className="text-gray-600">
              Our AI-powered SEO tools will analyze your website and identify areas for improvement. Each tool provides specific recommendations.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-green-200 bg-green-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-green-900 flex items-center space-x-2">
                  <Search className="w-5 h-5" />
                  <span>Broken Link Scanner</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-green-800 mb-3">
                  Find broken links that hurt your SEO and user experience
                </p>
                <Badge className="bg-green-200 text-green-800">Essential</Badge>
              </CardContent>
            </Card>
            
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-blue-900 flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Meta Tag Analyzer</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-blue-800 mb-3">
                  Check title tags, meta descriptions, and other important meta tags
                </p>
                <Badge className="bg-blue-200 text-blue-800">Important</Badge>
              </CardContent>
            </Card>
            
            <Card className="border-purple-200 bg-purple-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-purple-900 flex items-center space-x-2">
                  <Zap className="w-5 h-5" />
                  <span>Page Speed Analyzer</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-purple-800 mb-3">
                  Analyze page speed and performance metrics
                </p>
                <Badge className="bg-purple-200 text-purple-800">Performance</Badge>
              </CardContent>
            </Card>
            
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-orange-900 flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Keyword Research</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-orange-800 mb-3">
                  Discover high-value keywords for your content
                </p>
                <Badge className="bg-orange-200 text-orange-800">Research</Badge>
              </CardContent>
            </Card>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900">Your Plan: {userPlan.charAt(0).toUpperCase() + userPlan.slice(1)}</h4>
                <p className="text-sm text-blue-800">
                  {userPlan === 'free' 
                    ? 'You have 5 SEO tool uses per month. Use them wisely on your most important pages!'
                    : `You have unlimited SEO tool usage with your ${userPlan} plan.`
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
      action: {
        text: 'Explore SEO Tools',
        href: '/dashboard/seo-tools',
        onClick: () => {
          setCompletedSteps(prev => [...prev, 'seo-tools'])
          router.push('/dashboard/seo-tools')
        }
      }
    },
    {
      id: 'directory-submission',
      title: 'Step 3: Submit to Directories',
      description: 'Use our bookmarklet to submit your website to directories',
      icon: Link,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Link className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Submit to Directories</h3>
            <p className="text-gray-600">
              Build high-quality backlinks by submitting your website to relevant directories. Our bookmarklet makes it super easy!
            </p>
          </div>
          
          <div className="space-y-4">
            <Card className="border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="text-lg text-purple-900">How Directory Submission Works:</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <h4 className="font-semibold text-purple-900">Get Your Bookmarklet</h4>
                    <p className="text-sm text-purple-800">We'll generate a custom bookmarklet for your project</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <h4 className="font-semibold text-purple-900">Visit Directory Websites</h4>
                    <p className="text-sm text-purple-800">Go to any directory submission website</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <h4 className="font-semibold text-purple-900">Click the Bookmarklet</h4>
                    <p className="text-sm text-purple-800">Our AI will automatically fill in all the form fields</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                  <div>
                    <h4 className="font-semibold text-purple-900">Submit & Track</h4>
                    <p className="text-sm text-purple-800">Submit the form and track your progress in the dashboard</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Award className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-green-900">Why Directory Submissions Matter:</h4>
                  <ul className="text-sm text-green-800 mt-2 space-y-1">
                    <li>• Build high-quality backlinks to improve search rankings</li>
                    <li>• Increase your website's authority and trustworthiness</li>
                    <li>• Drive targeted traffic from relevant directories</li>
                    <li>• Improve your local SEO presence</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      action: {
        text: 'Learn About Bookmarklet',
        href: '/dashboard/projects',
        onClick: () => {
          setCompletedSteps(prev => [...prev, 'directory-submission'])
          router.push('/dashboard/projects')
        }
      }
    },
    {
      id: 'generate-reports',
      title: 'Step 4: Generate SEO Reports',
      description: 'Create comprehensive reports to track your progress',
      icon: BarChart3,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Generate SEO Reports</h3>
            <p className="text-gray-600">
              Create detailed reports to track your SEO progress, identify issues, and measure your success over time.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-lg text-orange-900">What's in Your Report:</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-orange-600" />
                  <span className="text-orange-800">SEO Issues Analysis</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-orange-600" />
                  <span className="text-orange-800">Performance Metrics</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-orange-600" />
                  <span className="text-orange-800">Actionable Recommendations</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-orange-600" />
                  <span className="text-orange-800">Progress Tracking</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg text-blue-900">Report Features:</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Star className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-800">PDF Export</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Star className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-800">Visual Charts</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Star className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-800">Client-Ready Format</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Star className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-800">Historical Data</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Rocket className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-orange-900">Pro Tip:</h4>
                <p className="text-sm text-orange-800">
                  Generate reports regularly to track your progress. Compare reports over time to see how your SEO efforts are paying off!
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
      action: {
        text: 'Generate Report',
        href: '/dashboard/reports',
        onClick: () => {
          setCompletedSteps(prev => [...prev, 'generate-reports'])
          router.push('/dashboard/reports')
        }
      }
    },
    {
      id: 'complete',
      title: 'You\'re All Set!',
      description: 'Start your SEO journey with confidence',
      icon: CheckCircle,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Congratulations!</h3>
            <p className="text-gray-600 mb-6">
              You now know how to use Opptym AI SEO effectively. Let's start improving your website's search engine performance!
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-lg text-green-900">Next Steps:</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <ArrowRight className="w-4 h-4 text-green-600" />
                  <span className="text-green-800">Create your first project</span>
                </div>
                <div className="flex items-center space-x-3">
                  <ArrowRight className="w-4 h-4 text-green-600" />
                  <span className="text-green-800">Run SEO analysis tools</span>
                </div>
                <div className="flex items-center space-x-3">
                  <ArrowRight className="w-4 h-4 text-green-600" />
                  <span className="text-green-800">Submit to directories</span>
                </div>
                <div className="flex items-center space-x-3">
                  <ArrowRight className="w-4 h-4 text-green-600" />
                  <span className="text-green-800">Generate your first report</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg text-blue-900">Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Lightbulb className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-800">Check the help section</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-800">Contact support</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Star className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-800">Upgrade your plan</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 text-center">
            <h4 className="font-bold text-lg text-gray-900 mb-2">Ready to boost your SEO?</h4>
            <p className="text-gray-600 mb-4">
              Start with creating your first project and begin your journey to better search rankings!
            </p>
            <div className="flex justify-center space-x-3">
              <Button 
                onClick={() => {
                  setCompletedSteps(prev => [...prev, 'complete'])
                  router.push('/dashboard/projects/new')
                }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Project
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setCompletedSteps(prev => [...prev, 'complete'])
                  router.push('/dashboard')
                }}
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        </div>
      )
    }
  ]

  const progress = ((currentStep + 1) / steps.length) * 100
  const currentStepData = steps[currentStep]
  const IconComponent = currentStepData.icon

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    onClose()
  }

  const handleActionClick = () => {
    if (currentStepData.action?.onClick) {
      currentStepData.action.onClick()
    }
    if (currentStep < steps.length - 1) {
      handleNext()
    } else {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <IconComponent className="w-4 h-4 text-white" />
              </div>
              <span>{currentStepData.title}</span>
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">{currentStepData.description}</p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Content */}
          <div className="min-h-[400px]">
            {currentStepData.content}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="flex items-center space-x-2">
              <Button variant="ghost" onClick={handleSkip}>
                Skip Tutorial
              </Button>
              {currentStepData.action ? (
                <Button onClick={handleActionClick}>
                  {currentStepData.action.text}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
