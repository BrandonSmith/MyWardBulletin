# Security Documentation for MyWardBulletin

## Overview
This document outlines the security measures implemented in MyWardBulletin to protect user data and prevent common web vulnerabilities.

## Security Measures Implemented

### 1. Authentication & Authorization
- **Supabase Auth**: Secure authentication with JWT tokens
- **Session Management**: Automatic session validation and cleanup
- **Row Level Security (RLS)**: Database-level access control
- **User Isolation**: Users can only access their own data

### 2. Input Validation & Sanitization
- **HTML Sanitization**: DOMPurify with strict configuration
- **Input Validation**: Server-side validation for all inputs
- **Profile Slug Validation**: Regex pattern `/^[a-z0-9-]+$/`
- **Email Validation**: RFC-compliant email validation
- **Length Limits**: Maximum input lengths enforced

### 3. Security Headers
- **X-Frame-Options**: `DENY` (prevents clickjacking)
- **X-Content-Type-Options**: `nosniff` (prevents MIME sniffing)
- **Content-Security-Policy**: Strict CSP with allowed sources
- **X-XSS-Protection**: `1; mode=block` (XSS protection)
- **Strict-Transport-Security**: `max-age=31536000; includeSubDomains`
- **Referrer-Policy**: `strict-origin-when-cross-origin`
- **Permissions-Policy**: Restricts camera, microphone, geolocation

### 4. Rate Limiting
- **API Rate Limiting**: 100 requests per 15 minutes per IP
- **Strict Rate Limiting**: 10 requests per minute for sensitive endpoints
- **Automatic Cleanup**: Expired rate limit entries removed

### 5. Error Handling
- **Generic Error Messages**: No sensitive information in error responses
- **Proper HTTP Status Codes**: Appropriate status codes for different errors
- **Security Monitoring**: Suspicious activities logged

### 6. Data Protection
- **Environment Variables**: Secrets stored in environment variables
- **Input Sanitization**: All user inputs sanitized before storage
- **Local Storage Security**: Sensitive data not stored in localStorage
- **Session Security**: Secure session management

## Security Headers Configuration

```json
{
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co; frame-ancestors 'none';",
  "X-XSS-Protection": "1; mode=block",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()"
}
```

## HTML Sanitization Configuration

```typescript
{
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'blockquote', 'div', 'span'
  ],
  ALLOWED_ATTR: ['class', 'style'],
  ALLOW_DATA_ATTR: false,
  FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
  KEEP_CONTENT: true,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  RETURN_TRUSTED_TYPE: false
}
```

## Security Monitoring

### Events Tracked
- **Suspicious Activity**: Unusual user behavior
- **Authentication Failures**: Failed login attempts
- **Rate Limit Exceeded**: API abuse attempts
- **Input Validation Failures**: Malicious input attempts

### Monitoring Features
- **Event Logging**: All security events logged
- **Context Tracking**: Additional context for each event
- **IP Tracking**: Client IP addresses logged
- **User Tracking**: User IDs associated with events

## Database Security

### Row Level Security (RLS) Policies
- **Users Table**: Users can only access their own profile
- **Bulletins Table**: Users can only access their own bulletins
- **Tokens Table**: Users can only access their own tokens
- **Announcement Submissions**: Public insert, authenticated read/update/delete

### Data Isolation
- **User-Specific Data**: All data scoped to user ID
- **Profile Slug Isolation**: Users can only access their own profile slug
- **Bulletin Isolation**: Users can only manage their own bulletins

## API Security

### Rate Limiting
- **Default Limit**: 100 requests per 15 minutes per IP
- **Strict Limit**: 10 requests per minute for sensitive operations
- **Automatic Cleanup**: Expired entries removed every minute

### Input Validation
- **Profile Slug**: Must match `/^[a-z0-9-]+$/` pattern
- **Email Validation**: RFC-compliant email format
- **Length Limits**: Maximum input lengths enforced
- **Type Checking**: All inputs validated for correct type

### Error Handling
- **Generic Messages**: No sensitive information in error responses
- **Proper Status Codes**: Appropriate HTTP status codes
- **Security Logging**: All errors logged for monitoring

## Environment Variables

### Required Variables
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

### Optional Variables
```bash
VITE_FULL_DOMAIN=mywardbulletin.com
VITE_SHORT_DOMAIN=mwbltn.com
```

## Security Checklist

### Before Deployment
- [ ] All environment variables configured
- [ ] Security headers enabled
- [ ] Rate limiting configured
- [ ] Input validation implemented
- [ ] Error handling configured
- [ ] Security monitoring enabled
- [ ] Database RLS policies applied
- [ ] SSL/TLS enabled
- [ ] Debug logging removed from production

### Regular Security Tasks
- [ ] Monitor security events
- [ ] Review rate limit logs
- [ ] Update dependencies
- [ ] Review access logs
- [ ] Test security measures
- [ ] Backup security configurations

## Incident Response

### Security Event Response
1. **Immediate Action**: Block suspicious IPs if necessary
2. **Investigation**: Review security logs and context
3. **Containment**: Limit access to affected resources
4. **Recovery**: Restore normal operations
5. **Documentation**: Record incident details and lessons learned

### Contact Information
- **Security Issues**: Report via GitHub issues
- **Emergency Contact**: [Your contact information]

## Compliance

### Data Protection
- **User Data**: Only stored with user consent
- **Data Retention**: Automatic cleanup of old data
- **Data Access**: Users control their own data
- **Data Export**: Users can export their data

### Privacy
- **No Tracking**: No analytics or tracking cookies
- **Minimal Data**: Only necessary data collected
- **User Control**: Users can delete their data
- **Transparency**: Clear privacy policy

## Security Testing

### Recommended Tools
- **OWASP ZAP**: Web application security scanner
- **Snyk**: Dependency vulnerability scanning
- **Security Headers**: Browser security testing
- **CSP Evaluator**: Content Security Policy testing

### Testing Checklist
- [ ] XSS vulnerability testing
- [ ] CSRF protection testing
- [ ] SQL injection testing
- [ ] Authentication testing
- [ ] Authorization testing
- [ ] Rate limiting testing
- [ ] Input validation testing
- [ ] Error handling testing

## Updates and Maintenance

### Security Updates
- **Dependencies**: Regular updates of all dependencies
- **Security Patches**: Apply security patches promptly
- **Configuration**: Review and update security configurations
- **Monitoring**: Update security monitoring as needed

### Documentation Updates
- **Security Changes**: Document all security-related changes
- **Incident Reports**: Update based on security incidents
- **Best Practices**: Update based on new security recommendations 