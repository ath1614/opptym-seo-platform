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
    const currentUsage = tokenData.usageCount
    const remainingUsage = maxUsage - currentUsage

    // Do not increment usage on script load; usage should only increase on successful submission

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
      websiteURL: project.websiteURL || project.websiteUrl || '',
      email: project.email || '',
      companyName: project.companyName || '',
      phone: project.phone || '',
      whatsapp: project.whatsapp || '',
      businessDescription: project.businessDescription || '',
      category: project.category || '',
      address: project.address || {},
      customFields: project.customFields || []
    };
    
    const linkData = {
      requiredFields: link.requiredFields || []
    };

    // Get the base URL for API calls
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

    const script = `
(function(){
  try {
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
    function showToast(message, type) {
      if (typeof type === 'undefined' || type === null) { type = 'success'; }
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
  
    // Also try to fill using custom fields defined in the project
    if (projectData.customFields && projectData.customFields.length) {
      // Helpers to normalize and map canonical keys
      function normalizeKey(key) {
        return (key || '').toLowerCase().replace(/[^a-z0-9]/g, '').trim();
      }
      function canonicalKey(key) {
        var n = normalizeKey(key);
        if (!n) return '';
        if (['username','user','username','user_name','login','loginname','account','handle'].includes(n)) return 'username';
        if (['firstname','first','fname','givenname','forename'].includes(n)) return 'firstname';
        if (['lastname','last','lname','surname','familyname'].includes(n)) return 'lastname';
        if (['fullname','name','contactname'].includes(n)) return 'fullname';
        if (['password','pass','pwd','newpassword'].includes(n)) return 'password';
        if (['confirmpassword','passwordconfirm','passwordconfirmation','passwordverification','password2','verify','verifypassword','retypepassword','repeatpassword','repeatpass'].includes(n)) return 'confirmpassword';
        if (['email','mail','emailaddress','e-mail'].includes(n)) return 'email';
        return n;
      }
      // Build canonical value map from custom fields
      var canonMap = {};
      projectData.customFields.forEach(function(cf){
        try {
          var canon = canonicalKey(cf.key);
          var value = cf.value || '';
          if (!canon || !value) return;
          if (!canonMap[canon]) canonMap[canon] = value;
        } catch (e) { /* ignore */ }
      });
      // Derive related values
      if (canonMap['password'] && !canonMap['confirmpassword']) {
        canonMap['confirmpassword'] = canonMap['password'];
      }
      if (!canonMap['firstname'] || !canonMap['lastname']) {
        var full = canonMap['fullname'];
        if (full) {
          var parts = full.trim().split(/\s+/);
          if (!canonMap['firstname']) canonMap['firstname'] = parts[0] || '';
          if (!canonMap['lastname']) canonMap['lastname'] = parts.length > 1 ? parts.slice(1).join(' ') : '';
        }
      }
      if (!canonMap['fullname'] && (canonMap['firstname'] || canonMap['lastname'])) {
        var fn = canonMap['firstname'] || '';
        var ln = canonMap['lastname'] || '';
        canonMap['fullname'] = [fn, ln].filter(Boolean).join(' ').trim();
      }
      // expose for getFieldValue usage
      window.__bookmarkletCanonMap = canonMap;

      // Fill by canonical categories across typical selectors
      function fillByCanonical(canon, value) {
        if (!value) return;
        var inputs = Array.from(document.querySelectorAll('input, textarea, select'));
        function m(el) {
          var t = (el.getAttribute('type') || '').toLowerCase();
          var n = (el.name || el.id || el.placeholder || '').toLowerCase();
          switch (canon) {
            case 'username':
              return t !== 'password' && /(user(name)?|login|account|handle)/.test(n);
            case 'password':
              return t === 'password' && !/(confirm|verify|retype|repeat)/.test(n);
            case 'confirmpassword':
              return t === 'password' && /(confirm|verify|retype|repeat|again)/.test(n);
            case 'firstname':
              return /(first|given|fname|forename)/.test(n);
            case 'lastname':
              return /(last|surname|lname|family)/.test(n);
            case 'fullname':
              return /(full.?name|^name$|\bname\b)/.test(n) && !/(user|company|business)/.test(n);
            case 'email':
              return /(email|e-mail|mail)/.test(n);
            default:
              return false;
          }
        }
        inputs.forEach(function(el){
          if (!el.value && m(el)) {
            el.value = value;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
            filledCount++;
          }
        });
      }

      // Apply fills for all canonical keys we have
      Object.keys(canonMap).forEach(function(k){ fillByCanonical(k, canonMap[k]); });
    }

    // If no fields were filled, try common field patterns
    if (filledCount === 0) {
      var commonFields = [
        { pattern: /^title$/i, value: projectData.title || projectData.projectName },
        { pattern: /^name$/i, value: projectData.projectName },
        { pattern: /url|website/i, value: projectData.websiteURL },
        { pattern: /email/i, value: projectData.email },
        { pattern: /company|business/i, value: projectData.companyName },
        { pattern: /phone|contact/i, value: projectData.phone },
        { pattern: /description|about/i, value: projectData.businessDescription },
        { pattern: /category/i, value: projectData.category }
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
          description: (function(){ var el = document.querySelector('meta[name="description"]'); return (el && el.content) ? el.content : 'No description available'; })()
        }));
      } catch (error) {
        var message = '✅ Form filled with ' + filledCount + ' fields from project: ' + projectData.projectName + '\\n\\n⚠️ Submission tracking failed';
        showToast(message, 'warning');
      }
    } else {
      showToast('❌ No matching form fields found. Please fill the form manually.', 'error');
    }
    
    function getFieldValue(fieldName, projectData) {
      var raw = fieldName || '';
      var fieldNameLower = raw.toLowerCase();
      function normalizeKeyLocal(s){ return (s||'').toLowerCase().replace(/[^a-z0-9]/g,'').trim(); }
      function canonicalKeyLocal(s){
        var n = normalizeKeyLocal(s);
        if (!n) return '';
        if (['username','user','user_name','login','loginname','account','handle'].includes(n)) return 'username';
        if (['firstname','first','fname','givenname','forename'].includes(n)) return 'firstname';
        if (['lastname','last','lname','surname','familyname'].includes(n)) return 'lastname';
        if (['fullname','name','contactname'].includes(n)) return 'fullname';
        if (['password','pass','pwd','newpassword'].includes(n)) return 'password';
        if (['confirmpassword','passwordconfirm','passwordconfirmation','passwordverification','password2','verify','verifypassword','retypepassword','repeatpassword','repeatpass'].includes(n)) return 'confirmpassword';
        if (['email','mail','emailaddress','e-mail'].includes(n)) return 'email';
        return n;
      }

      // Prefer canonical custom-field values when available
      try {
        var canonMap = (window && window.__bookmarkletCanonMap) || {};
        var canon = canonicalKeyLocal(raw);
        if (canonMap[canon]) return canonMap[canon];
        if (canon === 'firstname' && canonMap['fullname']) {
          var parts = canonMap['fullname'].trim().split(/\s+/);
          if (parts.length) return parts[0];
        }
        if (canon === 'lastname' && canonMap['fullname']) {
          var parts2 = canonMap['fullname'].trim().split(/\s+/);
          if (parts2.length > 1) return parts2.slice(1).join(' ');
        }
        if (canon === 'fullname') {
          var fn = canonMap['firstname'];
          var ln = canonMap['lastname'];
          if (fn || ln) return [fn, ln].filter(Boolean).join(' ');
        }
        if (canon === 'confirmpassword' && canonMap['password']) return canonMap['password'];
      } catch (e) { /* ignore */ }

      // More specific field mapping
      if (fieldNameLower.includes('title') && !fieldNameLower.includes('page')) {
        return projectData.title || projectData.projectName;
      }
      if (fieldNameLower.includes('name') && !fieldNameLower.includes('company') && !fieldNameLower.includes('business')) {
        return projectData.projectName;
      }
      if (fieldNameLower.includes('url') || fieldNameLower.includes('website') || fieldNameLower.includes('link')) {
        return projectData.websiteURL;
      }
      if (fieldNameLower.includes('email')) {
        return projectData.email;
      }
      if (fieldNameLower.includes('company') || fieldNameLower.includes('business')) {
        return projectData.companyName;
      }
      if (fieldNameLower.includes('phone') || fieldNameLower.includes('contact')) {
        return projectData.phone;
      }
      if (fieldNameLower.includes('whatsapp')) {
        return projectData.whatsapp;
      }
      if (fieldNameLower.includes('description') || fieldNameLower.includes('about')) {
        return projectData.businessDescription;
      }
      if (fieldNameLower.includes('category')) {
        return projectData.category;
      }
      if (fieldNameLower.includes('address')) {
        return projectData.address.street || projectData.address.city || '';
      }

      // Custom field exact key match (fallback)
      var cfMatch = (projectData.customFields || []).find(function(cf){ return (cf.key || '').toLowerCase() === fieldNameLower; });
      if (cfMatch && cfMatch.value) {
        return cfMatch.value;
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