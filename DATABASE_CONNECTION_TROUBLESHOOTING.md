# Database Connection Troubleshooting Guide

## Overview
This guide helps resolve database connection issues in the HR Portal application, including timeouts, connection failures, and performance problems.

## Common Connection Issues

### 1. **Connection Timeout Errors**
```
Error: Connection terminated due to connection timeout
Error: Connection terminated unexpectedly
```

### 2. **Connection Pool Exhaustion**
```
Error: sorry, too many clients already
Error: remaining connection slots are reserved
```

### 3. **Network Connectivity Issues**
```
Error: connect ECONNREFUSED
Error: connect ETIMEDOUT
```

## Root Causes

### 1. **Network Connectivity Issues**
- Slow internet connection
- Network congestion
- Firewall blocking database connections
- VPN interference
- Geographic latency

### 2. **Database Server Issues**
- Neon database service overload
- Server maintenance
- Connection pool exhaustion
- Service quotas exceeded

### 3. **Application Configuration**
- Connection timeout too low
- Pool size too small
- Missing connection retry logic
- Inefficient query patterns

## Immediate Solutions

### Solution 1: Test Database Connection
Run the connection test script to diagnose the issue:

```bash
# Make sure you have Node.js installed
node scripts/test-database-connection.js
```

### Solution 2: Check Network Status
```bash
# Test basic connectivity to the database host
ping ep-solitary-sky-a1yx7747-pooler.ap-southeast-1.aws.neon.tech

# Test port connectivity
telnet ep-solitary-sky-a1yx7747-pooler.ap-southeast-1.aws.neon.tech 5432
```

### Solution 3: Verify Database Service
1. Check [Neon Status Page](https://status.neon.tech/)
2. Verify your database is active in Neon console
3. Check if you've hit any usage limits
4. Verify connection pool settings

## Code Improvements Applied

### 1. **Enhanced Error Handling**
- Connection testing before queries
- Automatic retry with exponential backoff
- Specific error messages for different failure types

### 2. **Better Connection Management**
- Increased connection timeout from 5s to 10s
- Increased query timeout from 15s to 30s
- Connection health checks
- Graceful error recovery

### 3. **Retry Logic**
- Up to 3 retry attempts for failed queries
- Exponential backoff between retries
- Connection validation before retry

## Configuration Changes Made

### Database Pool Settings
```typescript
{
  connectionTimeoutMillis: 10000,    // Increased from 5000ms
  query_timeout: 30000,              // Increased from 15000ms
  statement_timeout: 30000,          // Kept at 30000ms
  max: 20,                           // Maximum connections
  min: 2,                            // Minimum connections
  maxUses: 7500,                     // Recycle connections
  allowExitOnIdle: false             // Keep pool alive
}
```

### API Error Handling
```typescript
// Specific error messages for different failure types
if (error.message.includes('Connection terminated')) {
  errorMessage = 'Database connection timeout. Please try again.';
  statusCode = 503; // Service Unavailable
}
```

## Testing the Fix

### 1. **Test Database Connection**
```bash
node scripts/test-database-connection.js
```

### 2. **Monitor Application Logs**
- Look for connection retry attempts
- Check for improved error messages
- Monitor connection pool health

### 3. **Performance Testing**
- Test under load
- Monitor connection pool usage
- Check query execution times

## Long-term Solutions

### 1. **Database Optimization**
- Consider moving to a closer database region
- Implement connection pooling at load balancer level
- Use read replicas for heavy queries
- Optimize query patterns

### 2. **Application Architecture**
- Implement circuit breaker pattern
- Add health check endpoints
- Use connection pooling service
- Implement query caching

### 3. **Monitoring & Alerting**
- Set up database connection monitoring
- Alert on connection failures
- Track connection pool metrics
- Monitor query performance

## Common Neon Database Issues

### 1. **Connection Limits**
- Free tier: 1 connection
- Pro tier: 10 connections
- Check your current plan
- Monitor connection usage

### 2. **Geographic Latency**
- Your database is in `ap-southeast-1` (Singapore)
- Consider moving to closer region if available
- Use connection pooling to reduce latency impact

### 3. **Service Quotas**
- Check if you've hit connection limits
- Monitor usage in Neon console
- Consider upgrading plan if needed

## Emergency Workarounds

### 1. **Retry with Backoff**
- Wait 30 seconds before retrying
- Use exponential backoff (1s, 2s, 4s)
- Implement circuit breaker pattern

### 2. **Alternative Database**
- Consider temporary database switch
- Use local development database for testing
- Implement fallback mechanisms

### 3. **Graceful Degradation**
- Show appropriate error messages
- Implement offline mode where possible
- Cache critical data locally

## Prevention

### 1. **Regular Health Checks**
- Monitor database connection status
- Set up automated connection testing
- Alert on connection failures
- Track performance metrics

### 2. **Connection Pool Management**
- Monitor pool usage
- Adjust pool size based on load
- Implement connection recycling
- Set appropriate timeouts

### 3. **Error Handling**
- Always implement retry logic
- Use appropriate HTTP status codes
- Provide user-friendly error messages
- Log errors for debugging

## Support Resources

### 1. **Neon Documentation**
- [Connection Troubleshooting](https://neon.tech/docs/connect/connectivity-issues)
- [Performance Tuning](https://neon.tech/docs/guides/performance-tuning)
- [Connection Pooling](https://neon.tech/docs/connect/connection-pooling)

### 2. **Application Logs**
- Check server logs for detailed error information
- Monitor connection pool metrics
- Track retry attempts and success rates
- Analyze query performance

### 3. **Network Diagnostics**
- Use connection test script
- Check network latency
- Verify firewall settings
- Test from different locations

## Expected Results After Fix

✅ **Reduced Timeout Errors** - Better connection management  
✅ **Automatic Retries** - Failed queries retry automatically  
✅ **Better Error Messages** - Users know what went wrong  
✅ **Improved Reliability** - More stable database connections  
✅ **Graceful Degradation** - App works even with connection issues  
✅ **Better Performance** - Optimized connection handling  

## Next Steps

1. **Test the connection** using the provided script
2. **Monitor the application** for improved error handling
3. **Check Neon console** for any service issues
4. **Consider long-term solutions** if problems persist
5. **Implement monitoring** for proactive issue detection

The enhanced error handling and retry logic should significantly improve the reliability of your database connections!
