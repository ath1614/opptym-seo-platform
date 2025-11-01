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
      // Basic Info
      projectName: project.projectName || '',
      title: project.title || '',
      websiteURL: project.websiteURL || project.websiteUrl || '',
      email: project.email || '',
      companyName: project.companyName || '',
      phone: project.phone || '',
      whatsapp: project.whatsapp || '',
      businessDescription: project.businessDescription || project.description || '',
      category: project.category || '',
      
      // Project-specific fields
      keywords: project.keywords || [],
      targetAudience: project.targetAudience || '',
      competitors: project.competitors || [],
      goals: project.goals || '',
      notes: project.notes || '',
      businessHours: project.businessHours || '',
      establishedYear: project.establishedYear || '',
      logoImageURL: project.logoImageURL || '',
      
      // Address
      address: {
        building: (project.address && project.address.building) || '',
        addressLine1: (project.address && project.address.addressLine1) || '',
        addressLine2: (project.address && project.address.addressLine2) || '',
        addressLine3: (project.address && project.address.addressLine3) || '',
        district: (project.address && project.address.district) || '',
        city: (project.address && project.address.city) || '',
        state: (project.address && project.address.state) || '',
        country: (project.address && project.address.country) || '',
        pincode: (project.address && project.address.pincode) || ''
      },
      
      // SEO Metadata
      seoMetadata: {
        metaTitle: (project.seoMetadata && project.seoMetadata.metaTitle) || '',
        metaDescription: (project.seoMetadata && project.seoMetadata.metaDescription) || '',
        keywords: (project.seoMetadata && project.seoMetadata.keywords) || [],
        targetKeywords: (project.seoMetadata && project.seoMetadata.targetKeywords) || [],
        sitemapURL: (project.seoMetadata && project.seoMetadata.sitemapURL) || '',
        robotsURL: (project.seoMetadata && project.seoMetadata.robotsURL) || ''
      },
      
      // Article Submission
      articleSubmission: {
        articleTitle: (project.articleSubmission && project.articleSubmission.articleTitle) || '',
        articleContent: (project.articleSubmission && project.articleSubmission.articleContent) || '',
        authorName: (project.articleSubmission && project.articleSubmission.authorName) || '',
        authorBio: (project.articleSubmission && project.articleSubmission.authorBio) || '',
        tags: (project.articleSubmission && project.articleSubmission.tags) || []
      },
      
      // Classified
      classified: {
        productName: (project.classified && project.classified.productName) || '',
        price: (project.classified && project.classified.price) || '',
        condition: (project.classified && project.classified.condition) || '',
        productImageURL: (project.classified && project.classified.productImageURL) || ''
      },
      
      // Social Media
      social: {
        facebook: (project.social && project.social.facebook) || '',
        twitter: (project.social && project.social.twitter) || '',
        instagram: (project.social && project.social.instagram) || '',
        linkedin: (project.social && project.social.linkedin) || '',
        youtube: (project.social && project.social.youtube) || ''
      },
      
      // Custom Fields
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

  // Helper to find label text for an element
  function __getLabelText(el) {
    var txt = '';
    if (el && el.labels && el.labels.length) {
      txt = Array.from(el.labels).map(function(l){ return (l.textContent || '').trim(); }).join(' ');
    } else if (el && el.id) {
      var lab = document.querySelector('label[for="' + el.id + '"]');
      txt = (lab && lab.textContent ? lab.textContent.trim() : '');
    }
    return (txt || '').toLowerCase();
  }

  // Enhanced field value setter with better framework support
  function __setFieldValue(el, value) {
    if (!el || !value) return false;
    var tag = (el.tagName || '').toLowerCase();
    var type = (el.getAttribute('type') || '').toLowerCase();
    var stringValue = String(value).trim();
    
    if (tag === 'select') {
      var options = Array.from(el.options || []);
      var valLower = stringValue.toLowerCase();
      var match = options.find(function(opt){
        return (opt.value && opt.value.toLowerCase() === valLower) ||
               (opt.text && opt.text.toLowerCase().includes(valLower)) ||
               (opt.value && opt.value.toLowerCase().includes(valLower)) ||
               (valLower.includes(opt.text.toLowerCase()) && opt.text.length > 2);
      });
      if (match) {
        el.value = match.value;
        el.selectedIndex = match.index;
      }
    } else if (type === 'checkbox') {
      var checkValue = stringValue.toLowerCase();
      el.checked = ['true', '1', 'yes', 'on', 'checked'].includes(checkValue);
    } else if (type === 'radio') {
      if (el.value.toLowerCase() === stringValue.toLowerCase()) {
        el.checked = true;
      }
    } else {
      // Handle React and other framework inputs
      try {
        var proto = tag === 'textarea' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
        var desc = Object.getOwnPropertyDescriptor(proto, 'value');
        var setter = desc && desc.set;
        if (setter) {
          setter.call(el, stringValue);
        } else {
          el.value = stringValue;
        }
      } catch(e) {
        el.value = stringValue;
      }
    }
    
    // Comprehensive event triggering for modern frameworks
    var events = ['input', 'change', 'blur', 'keyup', 'paste'];
    events.forEach(function(eventType) {
      try {
        var event;
        if (eventType === 'keyup') {
          event = new KeyboardEvent(eventType, { bubbles: true, cancelable: true, key: 'Tab' });
        } else {
          event = new Event(eventType, { bubbles: true, cancelable: true });
        }
        el.dispatchEvent(event);
      } catch(e) {
        try {
          var fallbackEvent = document.createEvent('Event');
          fallbackEvent.initEvent(eventType, true, true);
          el.dispatchEvent(fallbackEvent);
        } catch(e2) {}
      }
    });
    
    // Focus and blur for validation triggers
    try { 
      el.focus(); 
      setTimeout(function() { try { el.blur(); } catch(e) {} }, 10);
    } catch(e) {}
    
    return true;
  }
  
  // Enhanced field matching function
  function findFieldCandidates(searchTerms) {
    var allFields = Array.from(document.querySelectorAll('input:not([type="hidden"]):not([type="button"]):not([type="submit"]):not([type="file"]):not([type="image"]), textarea, select'));
    var candidates = [];
    
    allFields.forEach(function(el) {
      var composite = [
        el.name || '',
        el.id || '',
        el.placeholder || '',
        el.getAttribute('aria-label') || '',
        el.getAttribute('data-label') || '',
        el.className || '',
        __getLabelText(el)
      ].join(' ').toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
      
      var score = 0;
      searchTerms.forEach(function(term) {
        if (composite.includes(term.toLowerCase())) {
          score += term.length;
        }
      });
      
      if (score > 0) {
        candidates.push({ element: el, score: score });
      }
    });
    
    return candidates.sort(function(a, b) { return b.score - a.score; }).map(function(c) { return c.element; });
  }

  // Process custom fields FIRST with enhanced matching
  if (projectData.customFields && projectData.customFields.length) {
    projectData.customFields.forEach(function(cf) {
      if (!cf.key || !cf.value) return;
      
      var searchTerms = [
        cf.key,
        cf.key.replace(/[^a-zA-Z0-9]/g, ''),
        cf.key.replace(/\s+/g, '_'),
        cf.key.replace(/\s+/g, '-'),
        cf.key.split(/\s+/)[0],
        cf.key.split(/\s+/).pop()
      ].filter(Boolean);
      
      var candidates = findFieldCandidates(searchTerms);
      if (candidates.length > 0 && !candidates[0].value) {
        if (__setFieldValue(candidates[0], cf.value)) {
          filledCount++;
        }
      }
    });
  }

  // Then process required fields with enhanced matching
  linkData.requiredFields.forEach(function(field) {
    var fieldName = (field && field.name) ? String(field.name) : '';
    if (!fieldName) return;
    
    var searchTerms = [fieldName, fieldName.replace(/[^a-zA-Z0-9]/g, '')];
    var candidates = findFieldCandidates(searchTerms);
    
    if (candidates.length) {
      var value = getFieldValue(fieldName, projectData);
      if (value) {
        candidates.forEach(function(el){
          if (!el.value) {
            if (__setFieldValue(el, value)) { filledCount++; }
          }
        });
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

    // Enhanced fallback with comprehensive field mapping
    var fieldMappings = [
      // Basic Info
      { terms: ['title', 'heading', 'site_title', 'page_title'], value: projectData.title || projectData.projectName },
      { terms: ['project', 'project_name', 'business_name', 'company_name', 'site_name', 'name'], value: projectData.projectName },
      { terms: ['url', 'website', 'site', 'link', 'domain', 'web', 'homepage'], value: projectData.websiteURL },
      { terms: ['email', 'mail', 'e_mail', 'contact_email', 'email_address'], value: projectData.email },
      { terms: ['company', 'business', 'organization', 'firm', 'corp', 'enterprise'], value: projectData.companyName },
      { terms: ['phone', 'tel', 'mobile', 'contact', 'number', 'telephone', 'cell'], value: projectData.phone },
      { terms: ['whatsapp', 'whats_app', 'wa', 'whatsapp_number'], value: projectData.whatsapp },
      { terms: ['description', 'about', 'bio', 'summary', 'details', 'info', 'overview'], value: projectData.businessDescription },
      { terms: ['category', 'type', 'industry', 'sector', 'field', 'niche'], value: projectData.category },
      
      // Address Fields
      { terms: ['building', 'building_name', 'building_number'], value: projectData.address.building },
      { terms: ['address', 'location', 'street', 'address_line_1', 'address1'], value: projectData.address.addressLine1 },
      { terms: ['address_line_2', 'address2', 'apartment', 'suite', 'unit'], value: projectData.address.addressLine2 },
      { terms: ['address_line_3', 'address3', 'additional_address'], value: projectData.address.addressLine3 },
      { terms: ['district', 'area', 'locality'], value: projectData.address.district },
      { terms: ['city', 'town', 'municipality'], value: projectData.address.city },
      { terms: ['state', 'province', 'region', 'territory'], value: projectData.address.state },
      { terms: ['country', 'nation'], value: projectData.address.country },
      { terms: ['zip', 'postal', 'pincode', 'postcode', 'postal_code', 'zip_code'], value: projectData.address.pincode },
      
      // Project-specific Fields
      { terms: ['keywords', 'tags', 'search_terms'], value: (projectData.keywords || []).join(', ') },
      { terms: ['target_audience', 'audience', 'customers', 'market'], value: projectData.targetAudience },
      { terms: ['competitors', 'competition', 'rivals'], value: (projectData.competitors || []).join(', ') },
      { terms: ['goals', 'objectives', 'targets', 'aims'], value: projectData.goals },
      { terms: ['notes', 'comments', 'remarks', 'additional_info'], value: projectData.notes },
      { terms: ['business_hours', 'hours', 'operating_hours', 'schedule'], value: projectData.businessHours },
      { terms: ['established', 'founded', 'year', 'established_year', 'founded_year'], value: projectData.establishedYear },
      { terms: ['logo', 'logo_url', 'logo_image', 'brand_logo'], value: projectData.logoImageURL },
      
      // SEO Fields
      { terms: ['meta_title', 'seo_title', 'page_title'], value: projectData.seoMetadata.metaTitle },
      { terms: ['meta_description', 'seo_description', 'page_description'], value: projectData.seoMetadata.metaDescription },
      { terms: ['seo_keywords', 'meta_keywords'], value: (projectData.seoMetadata.keywords || []).join(', ') },
      { terms: ['target_keywords', 'focus_keywords'], value: (projectData.seoMetadata.targetKeywords || []).join(', ') },
      { terms: ['sitemap', 'sitemap_url'], value: projectData.seoMetadata.sitemapURL },
      { terms: ['robots', 'robots_url', 'robots_txt'], value: projectData.seoMetadata.robotsURL },
      
      // Article Fields
      { terms: ['article_title', 'post_title', 'content_title'], value: projectData.articleSubmission.articleTitle },
      { terms: ['article_content', 'content', 'post_content', 'article_body'], value: projectData.articleSubmission.articleContent },
      { terms: ['author', 'author_name', 'writer'], value: projectData.articleSubmission.authorName },
      { terms: ['author_bio', 'bio', 'author_description'], value: projectData.articleSubmission.authorBio },
      { terms: ['article_tags', 'post_tags', 'content_tags'], value: (projectData.articleSubmission.tags || []).join(', ') },
      
      // Classified Fields
      { terms: ['product', 'product_name', 'item', 'listing_title'], value: projectData.classified.productName },
      { terms: ['price', 'cost', 'amount', 'value'], value: projectData.classified.price },
      { terms: ['condition', 'state', 'quality'], value: projectData.classified.condition },
      { terms: ['product_image', 'image', 'photo', 'picture'], value: projectData.classified.productImageURL },
      
      // Social Media Fields
      { terms: ['facebook', 'fb', 'facebook_url', 'facebook_page'], value: projectData.social.facebook },
      { terms: ['twitter', 'twitter_url', 'twitter_handle'], value: projectData.social.twitter },
      { terms: ['instagram', 'ig', 'instagram_url', 'instagram_handle'], value: projectData.social.instagram },
      { terms: ['linkedin', 'linkedin_url', 'linkedin_profile'], value: projectData.social.linkedin },
      { terms: ['youtube', 'youtube_url', 'youtube_channel'], value: projectData.social.youtube }
    ];
    
    var allFields = Array.from(document.querySelectorAll('input:not([type="hidden"]):not([type="button"]):not([type="submit"]):not([type="file"]):not([type="image"]), textarea, select'));
    
    allFields.forEach(function(field) {
      if (field.value) return;
      
      var fieldIdentifier = [
        field.name || '',
        field.id || '',
        field.placeholder || '',
        field.getAttribute('aria-label') || '',
        field.className || '',
        __getLabelText(field)
      ].join(' ').toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
      
      for (var i = 0; i < fieldMappings.length; i++) {
        var mapping = fieldMappings[i];
        if (!mapping.value) continue;
        
        var matched = mapping.terms.some(function(term) {
          return fieldIdentifier.includes(term.toLowerCase());
        });
        
        if (matched) {
          if (__setFieldValue(field, mapping.value)) {
            filledCount++;
            break;
          }
        }
      }
    });
  
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
      
      // Enhanced custom field matching first
      if (projectData.customFields && projectData.customFields.length) {
        for (var i = 0; i < projectData.customFields.length; i++) {
          var cf = projectData.customFields[i];
          if (!cf.key || !cf.value) continue;
          
          var cfKeyLower = cf.key.toLowerCase();
          if (cfKeyLower === fieldNameLower || 
              cfKeyLower.includes(fieldNameLower) || 
              fieldNameLower.includes(cfKeyLower) ||
              cfKeyLower.replace(/[^a-z0-9]/g, '') === fieldNameLower.replace(/[^a-z0-9]/g, '')) {
            return cf.value;
          }
        }
      }
      
      // Comprehensive field mapping
      var mappings = {
        // Basic Info
        'title': projectData.title || projectData.projectName,
        'project_name': projectData.projectName,
        'name': projectData.projectName,
        'url': projectData.websiteURL,
        'website': projectData.websiteURL,
        'site': projectData.websiteURL,
        'homepage': projectData.websiteURL,
        'email': projectData.email,
        'company': projectData.companyName,
        'business': projectData.companyName,
        'organization': projectData.companyName,
        'phone': projectData.phone,
        'telephone': projectData.phone,
        'mobile': projectData.phone,
        'whatsapp': projectData.whatsapp,
        'description': projectData.businessDescription,
        'about': projectData.businessDescription,
        'summary': projectData.businessDescription,
        'category': projectData.category,
        'industry': projectData.category,
        'sector': projectData.category,
        
        // Address Fields
        'building': projectData.address.building,
        'address': projectData.address.addressLine1,
        'street': projectData.address.addressLine1,
        'address_line_1': projectData.address.addressLine1,
        'address1': projectData.address.addressLine1,
        'address_line_2': projectData.address.addressLine2,
        'address2': projectData.address.addressLine2,
        'apartment': projectData.address.addressLine2,
        'suite': projectData.address.addressLine2,
        'address_line_3': projectData.address.addressLine3,
        'address3': projectData.address.addressLine3,
        'district': projectData.address.district,
        'area': projectData.address.district,
        'city': projectData.address.city,
        'town': projectData.address.city,
        'state': projectData.address.state,
        'province': projectData.address.state,
        'region': projectData.address.state,
        'country': projectData.address.country,
        'nation': projectData.address.country,
        'zip': projectData.address.pincode,
        'postal': projectData.address.pincode,
        'pincode': projectData.address.pincode,
        'postcode': projectData.address.pincode,
        'zip_code': projectData.address.pincode,
        'postal_code': projectData.address.pincode,
        
        // Project Fields
        'keywords': (projectData.keywords || []).join(', '),
        'tags': (projectData.keywords || []).join(', '),
        'target_audience': projectData.targetAudience,
        'audience': projectData.targetAudience,
        'market': projectData.targetAudience,
        'competitors': (projectData.competitors || []).join(', '),
        'competition': (projectData.competitors || []).join(', '),
        'goals': projectData.goals,
        'objectives': projectData.goals,
        'notes': projectData.notes,
        'comments': projectData.notes,
        'business_hours': projectData.businessHours,
        'hours': projectData.businessHours,
        'schedule': projectData.businessHours,
        'established': projectData.establishedYear,
        'founded': projectData.establishedYear,
        'year': projectData.establishedYear,
        'established_year': projectData.establishedYear,
        'founded_year': projectData.establishedYear,
        'logo': projectData.logoImageURL,
        'logo_url': projectData.logoImageURL,
        'logo_image': projectData.logoImageURL,
        
        // SEO Fields
        'meta_title': projectData.seoMetadata.metaTitle,
        'seo_title': projectData.seoMetadata.metaTitle,
        'page_title': projectData.seoMetadata.metaTitle,
        'meta_description': projectData.seoMetadata.metaDescription,
        'seo_description': projectData.seoMetadata.metaDescription,
        'page_description': projectData.seoMetadata.metaDescription,
        'seo_keywords': (projectData.seoMetadata.keywords || []).join(', '),
        'meta_keywords': (projectData.seoMetadata.keywords || []).join(', '),
        'target_keywords': (projectData.seoMetadata.targetKeywords || []).join(', '),
        'focus_keywords': (projectData.seoMetadata.targetKeywords || []).join(', '),
        'sitemap': projectData.seoMetadata.sitemapURL,
        'sitemap_url': projectData.seoMetadata.sitemapURL,
        'robots': projectData.seoMetadata.robotsURL,
        'robots_url': projectData.seoMetadata.robotsURL,
        'robots_txt': projectData.seoMetadata.robotsURL,
        
        // Article Fields
        'article_title': projectData.articleSubmission.articleTitle,
        'post_title': projectData.articleSubmission.articleTitle,
        'content_title': projectData.articleSubmission.articleTitle,
        'article_content': projectData.articleSubmission.articleContent,
        'content': projectData.articleSubmission.articleContent,
        'post_content': projectData.articleSubmission.articleContent,
        'article_body': projectData.articleSubmission.articleContent,
        'author': projectData.articleSubmission.authorName,
        'author_name': projectData.articleSubmission.authorName,
        'writer': projectData.articleSubmission.authorName,
        'author_bio': projectData.articleSubmission.authorBio,
        'bio': projectData.articleSubmission.authorBio,
        'author_description': projectData.articleSubmission.authorBio,
        'article_tags': (projectData.articleSubmission.tags || []).join(', '),
        'post_tags': (projectData.articleSubmission.tags || []).join(', '),
        'content_tags': (projectData.articleSubmission.tags || []).join(', '),
        
        // Classified Fields
        'product': projectData.classified.productName,
        'product_name': projectData.classified.productName,
        'item': projectData.classified.productName,
        'listing_title': projectData.classified.productName,
        'price': projectData.classified.price,
        'cost': projectData.classified.price,
        'amount': projectData.classified.price,
        'value': projectData.classified.price,
        'condition': projectData.classified.condition,
        'state': projectData.classified.condition,
        'quality': projectData.classified.condition,
        'product_image': projectData.classified.productImageURL,
        'image': projectData.classified.productImageURL,
        'photo': projectData.classified.productImageURL,
        'picture': projectData.classified.productImageURL,
        
        // Social Media Fields
        'facebook': projectData.social.facebook,
        'fb': projectData.social.facebook,
        'facebook_url': projectData.social.facebook,
        'facebook_page': projectData.social.facebook,
        'twitter': projectData.social.twitter,
        'twitter_url': projectData.social.twitter,
        'twitter_handle': projectData.social.twitter,
        'instagram': projectData.social.instagram,
        'ig': projectData.social.instagram,
        'instagram_url': projectData.social.instagram,
        'instagram_handle': projectData.social.instagram,
        'linkedin': projectData.social.linkedin,
        'linkedin_url': projectData.social.linkedin,
        'linkedin_profile': projectData.social.linkedin,
        'youtube': projectData.social.youtube,
        'youtube_url': projectData.social.youtube,
        'youtube_channel': projectData.social.youtube
      };
      
      // Direct match
      if (mappings[fieldNameLower] && mappings[fieldNameLower] !== '') {
        return mappings[fieldNameLower];
      }
      
      // Partial match
      for (var key in mappings) {
        if (mappings[key] && mappings[key] !== '' && (fieldNameLower.includes(key) || key.includes(fieldNameLower))) {
          return mappings[key];
        }
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