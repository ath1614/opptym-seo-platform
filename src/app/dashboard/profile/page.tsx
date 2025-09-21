"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { SettingsNav } from '@/components/dashboard/settings-nav'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/components/ui/toast'
import { User, Mail, Building, Calendar, Shield, Upload, Save, AlertCircle } from 'lucide-react'

interface ExtendedUser {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  profileImage?: string | null
  role?: string
  plan?: string
  companyName?: string
  verified?: boolean
  createdAt?: string
  bio?: string
  phone?: string
  website?: string
  location?: string
}

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const { showToast } = useToast()
  
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [user, setUser] = useState<ExtendedUser | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    companyName: '',
    bio: '',
    phone: '',
    website: '',
    location: ''
  })

  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch('/api/user/profile')
          if (response.ok) {
            const data = await response.json()
            const userData = data.user
            setUser(userData)
            setFormData({
              name: userData.name || '',
              email: userData.email || '',
              companyName: userData.companyName || '',
              bio: userData.bio || '',
              phone: userData.phone || '',
              website: userData.website || '',
              location: userData.location || ''
            })
          } else {
            // Fallback to session data
            const userData = session.user as ExtendedUser
            setUser(userData)
            setFormData({
              name: userData.name || '',
              email: userData.email || '',
              companyName: userData.companyName || '',
              bio: '',
              phone: '',
              website: '',
              location: ''
            })
          }
        } catch (error) {
          console.error('Failed to fetch user data:', error)
          // Fallback to session data
          const userData = session.user as ExtendedUser
          setUser(userData)
          setFormData({
            name: userData.name || '',
            email: userData.email || '',
            companyName: userData.companyName || '',
            bio: '',
            phone: '',
            website: '',
            location: ''
          })
        }
      }
    }

    fetchUserData()
  }, [session])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        // Update the session with new data
        await update()
        showToast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated.",
        })
      } else {
        throw new Error('Failed to update profile')
      }
    } catch (error) {
      showToast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/user/upload-avatar', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        // Update the user state with the new profile image
        setUser(prev => prev ? { ...prev, profileImage: data.profileImage, image: data.profileImage } : null)
        // Force session update
        await update()
        // Dispatch custom event to update profile dropdown
        window.dispatchEvent(new CustomEvent('avatarUpdated'))
        showToast({
          title: "Avatar Updated",
          description: "Your profile picture has been updated.",
        })
      } else {
        throw new Error('Failed to upload image')
      }
    } catch (error) {
      showToast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const initials = user.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'U'

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
            <p className="text-muted-foreground">
              Manage your personal information and account preferences.
            </p>
          </div>
          <SettingsNav />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Profile Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={user.profileImage || user.image || ''} alt={user.name || ''} />
                      <AvatarFallback className="text-2xl font-medium">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <label
                      htmlFor="avatar-upload"
                      className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors"
                    >
                      <Upload className="h-4 w-4" />
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={isLoading}
                      />
                    </label>
                  </div>
                  
                  <div className="text-center">
                    <h3 className="font-semibold text-lg">{user.name || 'User'}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    {user.companyName && (
                      <p className="text-sm text-muted-foreground">{user.companyName}</p>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2 w-full">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Plan:</span>
                      <Badge variant={user.plan === 'free' ? 'secondary' : 'default'} className="capitalize">
                        {user.plan || 'free'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status:</span>
                      <Badge variant={user.verified ? 'default' : 'destructive'}>
                        {user.verified ? 'Verified' : 'Unverified'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Role:</span>
                      <Badge variant="outline" className="capitalize">
                        {user.role || 'user'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{user.email}</span>
                  </div>
                  {user.companyName && (
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Building className="h-4 w-4" />
                      <span>{user.companyName}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal details and contact information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      placeholder="Enter your company name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="https://your-website.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="City, Country"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself..."
                    rows={4}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Security Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Your email address is used for account verification and important notifications. 
                    Changing your email will require verification of the new address.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
