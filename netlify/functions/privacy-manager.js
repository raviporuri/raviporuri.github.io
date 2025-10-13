const crypto = require('crypto');

// Privacy levels for different types of contact
const PRIVACY_LEVELS = {
  PUBLIC: 'public',           // Available to everyone
  VERIFIED: 'verified',       // Requires verification
  APPROVED: 'approved',       // Requires explicit approval
  PRIVATE: 'private'          // Never shared
};

// Contact information with privacy settings
const CONTACT_INFO = {
  email: {
    value: 'raviporuri@gmail.com',
    level: PRIVACY_LEVELS.PUBLIC,
    description: 'Primary professional email'
  },
  phone: {
    value: '(408) 823-6713',
    level: PRIVACY_LEVELS.APPROVED,
    description: 'Direct phone number - requires approval'
  },
  linkedin: {
    value: 'https://linkedin.com/in/raviporuri',
    level: PRIVACY_LEVELS.PUBLIC,
    description: 'LinkedIn profile'
  },
  location: {
    value: 'San Francisco Bay Area',
    level: PRIVACY_LEVELS.PUBLIC,
    description: 'General location'
  },
  address: {
    value: '[PROTECTED]',
    level: PRIVACY_LEVELS.PRIVATE,
    description: 'Home address - never shared'
  }
};

// Approved contacts database (in production, use secure database)
const APPROVED_CONTACTS = new Set([
  // Add approved contact identifiers here
  // These would be verified through secure authentication
]);

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { action, requestorInfo, authToken } = JSON.parse(event.body || '{}');

    switch (action) {
      case 'get-contact-info':
        return await getContactInfo(headers, requestorInfo, authToken);
      case 'request-access':
        return await requestContactAccess(headers, requestorInfo);
      case 'verify-professional':
        return await verifyProfessional(headers, requestorInfo, authToken);
      default:
        return await getPublicContactInfo(headers);
    }
  } catch (error) {
    console.error('Privacy Manager Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Privacy protection service failed' })
    };
  }
};

async function getPublicContactInfo(headers) {
  const publicInfo = {};

  Object.entries(CONTACT_INFO).forEach(([key, info]) => {
    if (info.level === PRIVACY_LEVELS.PUBLIC) {
      publicInfo[key] = {
        value: info.value,
        description: info.description
      };
    } else {
      publicInfo[key] = {
        available: true,
        level: info.level,
        description: info.description,
        message: getPrivacyMessage(info.level)
      };
    }
  });

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      contactInfo: publicInfo,
      privacyNotice: "Ravi values privacy and security. Some contact information requires verification or approval.",
      timestamp: new Date().toISOString()
    })
  };
}

async function getContactInfo(headers, requestorInfo, authToken) {
  // Validate requestor
  const isVerified = await verifyRequestor(requestorInfo, authToken);
  const isApproved = checkApprovalStatus(requestorInfo);

  const availableInfo = {};

  Object.entries(CONTACT_INFO).forEach(([key, info]) => {
    switch (info.level) {
      case PRIVACY_LEVELS.PUBLIC:
        availableInfo[key] = info.value;
        break;
      case PRIVACY_LEVELS.VERIFIED:
        if (isVerified) availableInfo[key] = info.value;
        break;
      case PRIVACY_LEVELS.APPROVED:
        if (isApproved) availableInfo[key] = info.value;
        break;
      case PRIVACY_LEVELS.PRIVATE:
        // Never shared
        break;
    }
  });

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      contactInfo: availableInfo,
      accessLevel: isApproved ? 'approved' : isVerified ? 'verified' : 'public',
      message: generateAccessMessage(isVerified, isApproved),
      timestamp: new Date().toISOString()
    })
  };
}

async function requestContactAccess(headers, requestorInfo) {
  const { name, email, company, reason, context } = requestorInfo;

  // Generate access request ID
  const requestId = crypto.randomBytes(16).toString('hex');

  // Log the request (in production, store in database and send notification)
  const accessRequest = {
    requestId,
    requestorInfo: {
      name: sanitize(name),
      email: sanitize(email),
      company: sanitize(company),
      reason: sanitize(reason),
      context: sanitize(context)
    },
    timestamp: new Date().toISOString(),
    status: 'pending',
    requiredInfo: getRequiredContactInfo(reason)
  };

  // In production, this would:
  // 1. Store in secure database
  // 2. Send notification to Ravi
  // 3. Initiate verification process
  console.log('Access Request:', accessRequest);

  // Send email notification (mock implementation)
  await sendAccessRequestNotification(accessRequest);

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      requestId,
      message: `Access request submitted successfully. You'll receive a response within 24 hours.`,
      expectedResponse: 'Within 24 hours',
      nextSteps: [
        'Your request has been logged and will be reviewed',
        'You may be contacted for additional verification',
        'Approved contacts receive secure access to requested information'
      ]
    })
  };
}

async function verifyProfessional(headers, requestorInfo, authToken) {
  const { email, company, linkedinUrl, verificationCode } = requestorInfo;

  // Professional verification process
  const verificationResult = await performProfessionalVerification({
    email,
    company,
    linkedinUrl,
    verificationCode
  });

  if (verificationResult.verified) {
    // Grant verified access
    const verifiedInfo = getVerifiedContactInfo();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        verified: true,
        accessLevel: 'verified',
        contactInfo: verifiedInfo,
        message: 'Professional verification successful',
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      })
    };
  } else {
    return {
      statusCode: 403,
      headers,
      body: JSON.stringify({
        verified: false,
        message: 'Professional verification failed',
        reasons: verificationResult.reasons,
        retryAllowed: verificationResult.retryAllowed
      })
    };
  }
}

// Helper functions
function getPrivacyMessage(level) {
  switch (level) {
    case PRIVACY_LEVELS.VERIFIED:
      return 'Available after professional verification';
    case PRIVACY_LEVELS.APPROVED:
      return 'Requires explicit approval - submit access request';
    case PRIVACY_LEVELS.PRIVATE:
      return 'Not available through this platform';
    default:
      return 'Contact for access';
  }
}

function sanitize(input) {
  if (typeof input !== 'string') return '';
  return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
              .replace(/[<>&'"]/g, (char) => {
                switch (char) {
                  case '<': return '&lt;';
                  case '>': return '&gt;';
                  case '&': return '&amp;';
                  case '"': return '&quot;';
                  case "'": return '&#x27;';
                  default: return char;
                }
              });
}

async function verifyRequestor(requestorInfo, authToken) {
  // Implement professional verification logic
  // This could include:
  // - LinkedIn verification
  // - Company email domain verification
  // - Professional reference checks
  // - Industry credentials verification

  if (!requestorInfo || !authToken) return false;

  // Mock verification - in production, implement real verification
  const hasValidDomain = requestorInfo.email &&
    (requestorInfo.email.includes('@cisco.com') ||
     requestorInfo.email.includes('@dropbox.com') ||
     requestorInfo.email.includes('@yahoo.com') ||
     requestorInfo.email.includes('@google.com') ||
     requestorInfo.email.includes('@microsoft.com') ||
     requestorInfo.email.includes('.edu'));

  return hasValidDomain;
}

function checkApprovalStatus(requestorInfo) {
  // Check if requestor is in approved list
  if (!requestorInfo) return false;

  const identifier = generateRequestorIdentifier(requestorInfo);
  return APPROVED_CONTACTS.has(identifier);
}

function generateRequestorIdentifier(requestorInfo) {
  // Generate unique identifier for requestor
  const data = `${requestorInfo.email}:${requestorInfo.company}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

function generateAccessMessage(isVerified, isApproved) {
  if (isApproved) {
    return 'You have full access to contact information. Thank you for your approved status.';
  } else if (isVerified) {
    return 'You have verified professional access. Some information requires additional approval.';
  } else {
    return 'You have public access. Submit a request for additional contact information.';
  }
}

function getRequiredContactInfo(reason) {
  // Determine what contact info is needed based on request reason
  const reasonMap = {
    'speaking-engagement': ['email', 'phone'],
    'collaboration': ['email'],
    'investment': ['email', 'phone'],
    'job-opportunity': ['email'],
    'consulting': ['email', 'phone'],
    'media-interview': ['email', 'phone'],
    'default': ['email']
  };

  return reasonMap[reason] || reasonMap['default'];
}

function getVerifiedContactInfo() {
  const verifiedInfo = {};

  Object.entries(CONTACT_INFO).forEach(([key, info]) => {
    if (info.level === PRIVACY_LEVELS.PUBLIC || info.level === PRIVACY_LEVELS.VERIFIED) {
      verifiedInfo[key] = info.value;
    }
  });

  return verifiedInfo;
}

async function sendAccessRequestNotification(accessRequest) {
  // In production, this would send actual notifications
  // For now, log the request
  console.log('📧 Access Request Notification:', {
    to: 'raviporuri@gmail.com',
    subject: `Contact Access Request from ${accessRequest.requestorInfo.name}`,
    body: `
      New contact access request:

      Name: ${accessRequest.requestorInfo.name}
      Email: ${accessRequest.requestorInfo.email}
      Company: ${accessRequest.requestorInfo.company}
      Reason: ${accessRequest.requestorInfo.reason}
      Context: ${accessRequest.requestorInfo.context}

      Request ID: ${accessRequest.requestId}
      Timestamp: ${accessRequest.timestamp}

      Required Info: ${accessRequest.requiredInfo.join(', ')}

      Review and approve at: [Your Admin Panel URL]
    `
  });

  return true;
}

async function performProfessionalVerification({ email, company, linkedinUrl, verificationCode }) {
  // Professional verification logic
  // This would implement real verification in production

  const reasons = [];
  let verified = false;

  // Check email domain
  const emailDomain = email.split('@')[1];
  const knownDomains = ['cisco.com', 'dropbox.com', 'yahoo.com', 'google.com', 'microsoft.com'];
  const isKnownDomain = knownDomains.some(domain => emailDomain.includes(domain));

  if (isKnownDomain) {
    verified = true;
  } else {
    reasons.push('Email domain not recognized for automatic verification');
  }

  // Check LinkedIn URL format
  if (linkedinUrl && linkedinUrl.includes('linkedin.com/in/')) {
    // LinkedIn verification would happen here
    verified = true;
  } else {
    reasons.push('Valid LinkedIn profile URL required');
  }

  // Verification code check (sent via email)
  if (verificationCode && verificationCode.length === 6) {
    // Code verification logic
    verified = true;
  } else {
    reasons.push('Valid verification code required');
  }

  return {
    verified,
    reasons,
    retryAllowed: reasons.length < 3
  };
}