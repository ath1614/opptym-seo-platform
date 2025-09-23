import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  const projectId = searchParams.get('projectId')
  const linkId = searchParams.get('linkId')

  if (!token || !projectId || !linkId) {
    return new NextResponse('Invalid parameters', { 
      status: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })
  }

  // Validate token directly without authentication (for script API)
  try {
    await connectDB()
    
    // Import the shared token store
    const { validateToken, bookmarkletTokens, incrementTokenUsage } = await import('@/lib/bookmarklet-tokens')
    
    // Validate the token
    const tokenData = validateToken(token)
    console.log('Token validation:', { 
      token: token?.substring(0, 10) + '...', 
      hasTokenData: !!tokenData, 
      projectId, 
      linkId,
      tokenStoreSize: bookmarkletTokens.size,
      availableTokens: Array.from(bookmarkletTokens.keys()).map(t => t.substring(0, 10) + '...')
    })
    
    if (!tokenData) {
      console.log('Token validation failed - no token data found')
      return new NextResponse('Invalid or expired token', { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      })
    }
    
    if (new Date() > tokenData.expiresAt) {
      console.log('Token expired, removing from store')
      bookmarkletTokens.delete(token)
      return new NextResponse('Token expired', { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      })
    }
    
    if (tokenData.usageCount >= tokenData.maxUsage) {
      console.log('Token usage limit reached, removing from store')
      bookmarkletTokens.delete(token)
      return new NextResponse('Token usage limit reached', { 
        status: 429,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      })
    }
    
    // Verify project and link IDs match
    console.log('ID matching:', { 
      tokenProjectId: tokenData.projectId, 
      requestProjectId: projectId, 
      tokenLinkId: tokenData.linkId, 
      requestLinkId: linkId,
      projectMatch: tokenData.projectId === projectId,
      linkMatch: tokenData.linkId === linkId
    })
    if (tokenData.projectId !== projectId || tokenData.linkId !== linkId) {
      console.log('Token does not match project/link IDs')
      return new NextResponse('Token does not match project/link', { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      })
    }

    // Store token data for script generation
    const maxUsage = tokenData.maxUsage
    const currentUsage = tokenData.usageCount + 1
    const remainingUsage = maxUsage - currentUsage

    // Increment token usage BEFORE generating the script
    const usageIncremented = incrementTokenUsage(token)
    console.log('Token usage incremented:', { 
      token: token.substring(0, 10) + '...', 
      success: usageIncremented,
      newUsageCount: currentUsage,
      maxUsage: maxUsage
    })
    
    if (!usageIncremented) {
      console.log('Failed to increment token usage')
      return new NextResponse('Failed to increment token usage', { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      })
    }

    // Validate ObjectId format BEFORE any database operations
    const mongoose = await import('mongoose')
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return new NextResponse('Invalid project ID format', { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      })
    }
    if (!mongoose.Types.ObjectId.isValid(linkId)) {
      return new NextResponse('Invalid link ID format', { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      })
    }

    // Fetch project and link data
    const db = (await connectDB()).connection.db
    const projectsCollection = db.collection('projects')
    const project = await projectsCollection.findOne({ _id: new mongoose.Types.ObjectId(projectId) })
    
    if (!project) {
      return new NextResponse('Project not found', { 
        status: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      })
    }
    const directoriesCollection = db.collection('directories')
    const link = await directoriesCollection.findOne({ _id: new mongoose.Types.ObjectId(linkId) })
    
    if (!link) {
      return new NextResponse('Link not found', { 
        status: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      })
    }

    // Generate secure bookmarklet script with embedded data
    const projectData = {
      projectName: project.projectName || '',
      title: project.title || '',
      websiteURL: project.websiteURL || '',
      email: project.email || '',
      companyName: project.companyName || '',
      phone: project.phone || '',
      whatsapp: project.whatsapp || '',
      businessDescription: project.businessDescription || '',
      category: project.category || '',
      address: project.address || {}
    };
    
    const linkData = {
      requiredFields: link.requiredFields || []
    };

    // Get the base URL for API calls
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

    const script = `
(function(){
  try {
    // Set bookmarklet icon and title
    document.title = 'Opptym Bookmarklet - ' + document.title;
    
    // Add favicon for bookmarklet
    var favicon = document.querySelector('link[rel="icon"]') || document.createElement('link');
    favicon.rel = 'icon';
    favicon.href = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23007bff"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>';
    document.head.appendChild(favicon);
    
    // Embedded project data
    var projectData = ${JSON.stringify(projectData)};
    var usageInfo = {
      maxUsage: ${maxUsage},
      currentUsage: ${currentUsage},
      remainingUsage: ${remainingUsage}
    };
    
    // Embedded link data
    var linkData = ${JSON.stringify(linkData)};
    
    // API configuration
    var apiBaseUrl = '${baseUrl}';
    var token = '${token}';
    var projectId = '${projectId}';
    var linkId = '${linkId}';
    
    // Debug info
    console.log('Bookmarklet loaded for project:', projectData.projectName);
    
    // Toast notification system
    function showToast(message, type = 'success') {
      // Remove existing toast if any
      const existingToast = document.getElementById('bookmarklet-toast');
      if (existingToast) {
        existingToast.remove();
      }
      
      // Create toast element
      const toast = document.createElement('div');
      toast.id = 'bookmarklet-toast';
      toast.style.cssText = \`
        position: fixed;
        top: 20px;
        right: 20px;
        background: \${type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#10b981'};
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        font-weight: 500;
        max-width: 400px;
        word-wrap: break-word;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
      \`;
      
      toast.innerHTML = \`
        <div style="display: flex; align-items: center; gap: 8px;">
          <span>\${message}</span>
          <button onclick="this.parentElement.parentElement.remove()" style="
            background: none;
            border: none;
            color: white;
            font-size: 18px;
            cursor: pointer;
            padding: 0;
            margin-left: 8px;
          ">×</button>
        </div>
      \`;
      
      document.body.appendChild(toast);
      
      // Animate in
      setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
      }, 10);
      
      // Auto remove after 5 seconds
      setTimeout(() => {
        if (toast.parentElement) {
          toast.style.opacity = '0';
          toast.style.transform = 'translateX(100%)';
          setTimeout(() => {
            if (toast.parentElement) {
              toast.remove();
            }
          }, 300);
        }
      }, 5000);
    }
  
  // Fill form fields based on link requirements
  var filledCount = 0;
  
  // First try to fill fields based on required fields
  linkData.requiredFields.forEach(function(field) {
    var element = document.querySelector('input[name="' + field.name + '"], textarea[name="' + field.name + '"], select[name="' + field.name + '"]');
    if (element) {
      var value = getFieldValue(field.name, projectData);
      if (value) {
        element.value = value;
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
        filledCount++;
      }
    }
  });
  
    // If no fields were filled, try common field patterns with enhanced matching
    if (filledCount === 0) {
      var commonFields = [
        { pattern: /^title$/i, value: projectData.seoMetadata?.metaTitle || projectData.title || projectData.projectName },
        { pattern: /^name$/i, value: projectData.projectName },
        { pattern: /url|website|link|site/i, value: projectData.websiteURL },
        { pattern: /email|e-mail/i, value: projectData.email },
        { pattern: /company|business|organization/i, value: projectData.companyName || projectData.projectName },
        { pattern: /phone|contact|telephone|mobile/i, value: projectData.phone },
        { pattern: /whatsapp|whats/i, value: projectData.whatsapp },
        { pattern: /description|about|summary/i, value: projectData.seoMetadata?.metaDescription || projectData.businessDescription },
        { pattern: /category|type|industry/i, value: projectData.category },
        { pattern: /keyword|tag/i, value: (projectData.seoMetadata?.keywords || []).concat(projectData.seoMetadata?.targetKeywords || []).join(', ') },
        { pattern: /meta.*title/i, value: projectData.seoMetadata?.metaTitle || projectData.title || projectData.projectName },
        { pattern: /meta.*description/i, value: projectData.seoMetadata?.metaDescription || projectData.businessDescription },
        { pattern: /address|location/i, value: [projectData.address?.addressLine1, projectData.address?.city, projectData.address?.state, projectData.address?.country].filter(Boolean).join(', ') },
        { pattern: /city|town/i, value: projectData.address?.city || '' },
        { pattern: /state|province/i, value: projectData.address?.state || '' },
        { pattern: /country|nation/i, value: projectData.address?.country || '' },
        { pattern: /pin|zip|postal/i, value: projectData.address?.pincode || '' },
        { pattern: /facebook|fb/i, value: projectData.social?.facebook || '' },
        { pattern: /twitter|x\.com/i, value: projectData.social?.twitter || '' },
        { pattern: /instagram|insta/i, value: projectData.social?.instagram || '' },
        { pattern: /linkedin|linked/i, value: projectData.social?.linkedin || '' },
        { pattern: /youtube|youtu/i, value: projectData.social?.youtube || '' }
      ];
    
    var inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="url"], textarea');
    inputs.forEach(function(input) {
      var name = (input.name || input.id || input.placeholder || '').toLowerCase();
      if (name && !input.value) {
        for (var i = 0; i < commonFields.length; i++) {
          if (commonFields[i].pattern.test(name) && commonFields[i].value) {
            input.value = commonFields[i].value;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            filledCount++;
            break;
          }
        }
      }
    });
  }
  
    if (filledCount > 0) {
      // Record the submission
      try {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', apiBaseUrl + '/api/bookmarklet/submit', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              var response = JSON.parse(xhr.responseText);
              var usageMessage = response.remainingUsage > 0 ? 
                'Usage: ' + response.usageCount + '/' + response.maxUsage + ' (Remaining: ' + response.remainingUsage + ')' :
                'Usage: ' + response.usageCount + '/' + response.maxUsage + ' (LIMIT REACHED - Generate new bookmarklet)';
              
              var message = '✅ Form filled with ' + filledCount + ' fields from project: ' + projectData.projectName + '\\n\\n' + usageMessage + '\\n\\nTotal Submissions: ' + response.totalSubmissions;
              showToast(message, response.remainingUsage > 0 ? 'success' : 'warning');
            } else {
              var errorResponse = JSON.parse(xhr.responseText);
              var message = '✅ Form filled with ' + filledCount + ' fields from project: ' + projectData.projectName + '\\n\\n⚠️ ' + (errorResponse.error || 'Submission tracking failed');
              showToast(message, 'warning');
            }
          }
        };
        xhr.send(JSON.stringify({
          token: token,
          projectId: projectId,
          linkId: linkId,
          url: window.location.href,
          title: document.title || 'Untitled Page',
          description: document.querySelector('meta[name="description"]')?.content || 'No description available'
        }));
      } catch (error) {
        var message = '✅ Form filled with ' + filledCount + ' fields from project: ' + projectData.projectName + '\\n\\n⚠️ Submission tracking failed';
        showToast(message, 'warning');
      }
    } else {
      showToast('❌ No matching form fields found. Please fill the form manually.', 'error');
    }
    
    function getFieldValue(fieldName, projectData) {
      var fieldNameLower = fieldName.toLowerCase();
      
      // Enhanced field mapping with better accuracy
      
      // Title fields - prioritize meta title, then project title
      if (fieldNameLower.includes('title') && !fieldNameLower.includes('page') && !fieldNameLower.includes('meta')) {
        return projectData.seoMetadata?.metaTitle || projectData.title || projectData.projectName;
      }
      
      // Meta title specifically
      if (fieldNameLower.includes('meta') && fieldNameLower.includes('title')) {
        return projectData.seoMetadata?.metaTitle || projectData.title || projectData.projectName;
      }
      
      // Meta description
      if (fieldNameLower.includes('meta') && fieldNameLower.includes('description')) {
        return projectData.seoMetadata?.metaDescription || projectData.businessDescription;
      }
      
      // Keywords - handle both meta keywords and target keywords
      if (fieldNameLower.includes('keyword')) {
        var keywords = [];
        if (projectData.seoMetadata?.keywords && projectData.seoMetadata.keywords.length > 0) {
          keywords = keywords.concat(projectData.seoMetadata.keywords);
        }
        if (projectData.seoMetadata?.targetKeywords && projectData.seoMetadata.targetKeywords.length > 0) {
          keywords = keywords.concat(projectData.seoMetadata.targetKeywords);
        }
        if (projectData.keywords && projectData.keywords.length > 0) {
          keywords = keywords.concat(projectData.keywords);
        }
        return keywords.length > 0 ? keywords.join(', ') : '';
      }
      
      // Description fields - prioritize meta description, then business description
      if (fieldNameLower.includes('description') || fieldNameLower.includes('about') || fieldNameLower.includes('summary')) {
        return projectData.seoMetadata?.metaDescription || projectData.businessDescription || projectData.description;
      }
      
      // Name fields - be more specific
      if (fieldNameLower.includes('name') && !fieldNameLower.includes('company') && !fieldNameLower.includes('business') && !fieldNameLower.includes('author')) {
        return projectData.projectName;
      }
      
      // Company/Business name
      if (fieldNameLower.includes('company') || fieldNameLower.includes('business') || fieldNameLower.includes('organization')) {
        return projectData.companyName || projectData.projectName;
      }
      
      // URL/Website fields
      if (fieldNameLower.includes('url') || fieldNameLower.includes('website') || fieldNameLower.includes('link') || fieldNameLower.includes('site')) {
        return projectData.websiteURL;
      }
      
      // Email fields
      if (fieldNameLower.includes('email') || fieldNameLower.includes('e-mail')) {
        return projectData.email;
      }
      
      // Phone/Contact fields
      if (fieldNameLower.includes('phone') || fieldNameLower.includes('contact') || fieldNameLower.includes('telephone') || fieldNameLower.includes('mobile')) {
        return projectData.phone;
      }
      
      // WhatsApp specifically
      if (fieldNameLower.includes('whatsapp') || fieldNameLower.includes('whats')) {
        return projectData.whatsapp;
      }
      
      // Category fields
      if (fieldNameLower.includes('category') || fieldNameLower.includes('type') || fieldNameLower.includes('industry')) {
        return projectData.category;
      }
      
      // Address fields
      if (fieldNameLower.includes('address') || fieldNameLower.includes('location')) {
        var addressParts = [];
        if (projectData.address?.addressLine1) addressParts.push(projectData.address.addressLine1);
        if (projectData.address?.addressLine2) addressParts.push(projectData.address.addressLine2);
        if (projectData.address?.city) addressParts.push(projectData.address.city);
        if (projectData.address?.state) addressParts.push(projectData.address.state);
        if (projectData.address?.country) addressParts.push(projectData.address.country);
        if (projectData.address?.pincode) addressParts.push(projectData.address.pincode);
        return addressParts.join(', ');
      }
      
      // City specifically
      if (fieldNameLower.includes('city') || fieldNameLower.includes('town')) {
        return projectData.address?.city || '';
      }
      
      // State specifically
      if (fieldNameLower.includes('state') || fieldNameLower.includes('province')) {
        return projectData.address?.state || '';
      }
      
      // Country specifically
      if (fieldNameLower.includes('country') || fieldNameLower.includes('nation')) {
        return projectData.address?.country || '';
      }
      
      // Pincode/ZIP
      if (fieldNameLower.includes('pin') || fieldNameLower.includes('zip') || fieldNameLower.includes('postal')) {
        return projectData.address?.pincode || '';
      }
      
      // Social media fields
      if (fieldNameLower.includes('facebook') || fieldNameLower.includes('fb')) {
        return projectData.social?.facebook || '';
      }
      if (fieldNameLower.includes('twitter') || fieldNameLower.includes('x.com')) {
        return projectData.social?.twitter || '';
      }
      if (fieldNameLower.includes('instagram') || fieldNameLower.includes('insta')) {
        return projectData.social?.instagram || '';
      }
      if (fieldNameLower.includes('linkedin') || fieldNameLower.includes('linked')) {
        return projectData.social?.linkedin || '';
      }
      if (fieldNameLower.includes('youtube') || fieldNameLower.includes('youtu')) {
        return projectData.social?.youtube || '';
      }
      
      // Article submission fields
      if (fieldNameLower.includes('article') && fieldNameLower.includes('title')) {
        return projectData.articleSubmission?.articleTitle || projectData.title || projectData.projectName;
      }
      if (fieldNameLower.includes('article') && fieldNameLower.includes('content')) {
        return projectData.articleSubmission?.articleContent || projectData.businessDescription;
      }
      if (fieldNameLower.includes('author') && fieldNameLower.includes('name')) {
        return projectData.articleSubmission?.authorName || projectData.companyName;
      }
      if (fieldNameLower.includes('author') && fieldNameLower.includes('bio')) {
        return projectData.articleSubmission?.authorBio || projectData.businessDescription;
      }
      if (fieldNameLower.includes('tag') && !fieldNameLower.includes('meta')) {
        var tags = [];
        if (projectData.articleSubmission?.tags && projectData.articleSubmission.tags.length > 0) {
          tags = tags.concat(projectData.articleSubmission.tags);
        }
        if (projectData.seoMetadata?.keywords && projectData.seoMetadata.keywords.length > 0) {
          tags = tags.concat(projectData.seoMetadata.keywords);
        }
        return tags.length > 0 ? tags.join(', ') : '';
      }
      
      // Classified fields
      if (fieldNameLower.includes('product') && fieldNameLower.includes('name')) {
        return projectData.classified?.productName || projectData.projectName;
      }
      if (fieldNameLower.includes('price') || fieldNameLower.includes('cost')) {
        return projectData.classified?.price || '';
      }
      if (fieldNameLower.includes('condition') || fieldNameLower.includes('status')) {
        return projectData.classified?.condition || '';
      }
      if (fieldNameLower.includes('image') || fieldNameLower.includes('photo') || fieldNameLower.includes('picture')) {
        return projectData.classified?.productImageURL || projectData.logoImageURL || '';
      }
      
      // Business hours
      if (fieldNameLower.includes('hour') || fieldNameLower.includes('time') || fieldNameLower.includes('schedule')) {
        return projectData.businessHours || '';
      }
      
      // Established year
      if (fieldNameLower.includes('established') || fieldNameLower.includes('founded') || fieldNameLower.includes('year')) {
        return projectData.establishedYear || '';
      }
      
      // Logo/Image URL
      if (fieldNameLower.includes('logo') || fieldNameLower.includes('brand')) {
        return projectData.logoImageURL || '';
      }
      
      return null;
    }
    
  } catch (error) {
    console.error('Bookmarklet error:', error);
    showToast('❌ Error: Unable to load project data. Please try again or contact support.', 'error');
  }
})();`;

    return new NextResponse(script, {
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })
    
  } catch (error) {
    console.error('Token validation error:', error)
    return new NextResponse('Token validation failed', { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })
  }
}