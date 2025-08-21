# NextVibe OpenTelemetry Integration

## Overview

This implementation provides comprehensive observability, monitoring, and analytics for NextVibe using OpenTelemetry. It includes distributed tracing, custom metrics collection, real user monitoring (RUM), and integration with multiple monitoring services.

## Features

### ✅ Implemented Features

#### Core OpenTelemetry Integration
- **Distributed Tracing**: End-to-end request tracing across API calls, database operations, and AI features
- **Custom Metrics**: Business and technical metrics collection
- **Auto-Instrumentation**: Automatic HTTP, fetch, and database instrumentation
- **Multiple Exporters**: Support for DataDog, New Relic, Honeycomb, Vercel Analytics, and custom OTLP endpoints

#### NextVibe-Specific Instrumentation
- **Habit Tracking**: Trace habit creation, completion, and management operations
- **Mood Analytics**: Monitor mood entry patterns and analysis
- **AI Feature Monitoring**: Track Claude API usage, costs, and performance
- **User Journey Tracing**: Complete user interaction tracking
- **Component Performance**: React component render and interaction monitoring

#### Business Metrics
- Habit completion rates
- Mood entry frequency
- AI feature adoption rates  
- User retention metrics
- Feature usage distribution
- Error recovery rates

#### Technical Metrics
- API response times (P50, P90, P95, P99)
- Error rates and types
- Claude API costs and token usage
- Database query performance
- Memory and resource usage
- Cache hit rates

#### Real User Monitoring (RUM)
- Core Web Vitals (LCP, FID, CLS)
- Page load performance
- User interaction tracking
- JavaScript error monitoring
- Session analytics

#### Development Tools
- Console debugging commands
- Real-time telemetry monitoring
- Trace visualization
- Performance measurement tools
- Mock data generation for testing

## Architecture

### File Structure

```
lib/telemetry/
├── index.ts              # Core telemetry initialization
├── types.ts              # TypeScript definitions
├── tracing.ts            # Distributed tracing utilities
├── metrics.ts            # Custom metrics collection
├── instrumentation.ts    # NextVibe-specific instrumentation
├── exporters.ts          # Data export configuration
├── development.ts        # Development and debugging tools
└── client.ts             # Client-side telemetry and RUM

app/api/telemetry/
├── health/              # Telemetry health check endpoint
└── metrics/             # Metrics API endpoint

instrumentation.ts        # Next.js instrumentation hook
```

### Key Components

#### 1. Telemetry Initialization (`lib/telemetry/index.ts`)
- Configures OpenTelemetry SDK with Next.js
- Sets up auto-instrumentation for HTTP, fetch, and database calls
- Manages multiple exporters based on environment configuration
- Handles graceful shutdown and error recovery

#### 2. Distributed Tracing (`lib/telemetry/tracing.ts`)
- Provides high-level APIs for creating spans
- Implements NextVibe-specific span types (user journeys, API calls, AI operations)
- Automatic performance measurement and error tracking
- Context propagation across async operations

#### 3. Custom Metrics (`lib/telemetry/metrics.ts`)
- Business metrics collection (habit completion rates, user engagement)
- Technical metrics (API performance, error rates, resource usage)
- Custom metric creation and recording
- Integration with existing usage tracking system

#### 4. Client-Side Telemetry (`lib/telemetry/client.ts`)
- Real User Monitoring (RUM) data collection
- Web Vitals tracking (LCP, FID, CLS)
- User interaction and session analytics
- JavaScript error monitoring
- React component performance tracking

## Configuration

### Environment Variables

See `.env.example` for complete configuration options.

#### Core Configuration
```bash
# Enable/disable telemetry features
OTEL_ENABLE_TRACING=true
OTEL_ENABLE_METRICS=true
OTEL_SAMPLING_RATE=1.0  # 0.0 to 1.0

# Service identification
OTEL_SERVICE_NAME=nextvibe
OTEL_SERVICE_VERSION=1.0.0
```

#### Monitoring Service Integration
```bash
# DataDog
DD_API_KEY=your_datadog_api_key
DD_SITE=datadoghq.com

# New Relic
NEW_RELIC_LICENSE_KEY=your_newrelic_license_key

# Honeycomb
HONEYCOMB_API_KEY=your_honeycomb_api_key
HONEYCOMB_DATASET=nextvibe

# Custom OTLP Endpoint
OTEL_EXPORTER_OTLP_ENDPOINT=https://your-endpoint.com/v1/traces
OTEL_EXPORTER_OTLP_HEADERS={"authorization":"Bearer your_token"}
```

### Sampling Strategies

#### Development (Maximum Observability)
```bash
OTEL_SAMPLING_RATE=1.0    # 100% sampling
OTEL_LOG_LEVEL=debug
```

#### Production (Performance Optimized)
```bash
OTEL_SAMPLING_RATE=0.1    # 10% sampling
OTEL_LOG_LEVEL=info
```

#### High-Traffic Production
```bash
OTEL_SAMPLING_RATE=0.05   # 5% sampling
OTEL_LOG_LEVEL=warn
```

## Usage

### API Integration

The main API endpoints are already instrumented with telemetry:

```typescript
// Example: Enhanced habit API endpoint
export async function POST(req: NextRequest) {
  return await tracing.withApi('enhance-habit', 'POST', async (span) => {
    // API logic with automatic tracing
    span.setAttributes({
      'user.id': userId,
      'habit.name': habitName,
      'ai.feature': 'enhance-habit'
    });
    
    // AI operation tracing
    const result = await instrumentationHelpers.instrumentAIOperation(
      'enhance-habit',
      async () => {
        // Claude API call
      },
      { 'user.id': userId }
    );
    
    // Metrics recording
    metrics?.recordAIFeatureUsage('enhance-habit');
    
    return result;
  });
}
```

### Component Integration

#### React Components with Telemetry

```typescript
import { useComponentTelemetry, withTelemetry } from '@/lib/telemetry/client';

function HabitCard({ habit }: { habit: Habit }) {
  const { trackEvent, trackMount, trackUnmount } = useComponentTelemetry('HabitCard');
  
  React.useEffect(() => {
    trackMount({ 'habit.id': habit.id });
    return () => trackUnmount();
  }, []);
  
  const handleComplete = () => {
    trackEvent('habit.completed', { 
      'habit.id': habit.id,
      'habit.category': habit.category 
    });
    // Handle completion logic
  };
  
  return <div onClick={handleComplete}>...</div>;
}

// Or use HOC for automatic instrumentation
export default withTelemetry(HabitCard, 'HabitCard');
```

#### Client-Side Event Tracking

```typescript
import { clientTelemetry } from '@/lib/telemetry/client';

// Track user events
clientTelemetry.trackPageView('/dashboard');
clientTelemetry.trackHabit('complete', habitId);
clientTelemetry.trackMood(8);
clientTelemetry.trackAI('enhancement_generated');
```

### Custom Metrics

```typescript
import { getMetrics } from '@/lib/telemetry/metrics';

const metrics = getMetrics();

// Record business metrics
metrics?.recordHabitCompletion({ 'user.id': userId });
metrics?.recordMoodEntry(rating);
metrics?.recordAIFeatureUsage('habit-enhancement');

// Record technical metrics
metrics?.recordApiRequest('/api/habits', 'POST', 200, 150);
metrics?.recordDatabaseQuery('read', 'habits', 45, true);
metrics?.recordCacheOperation(true, 'get');
```

### Manual Instrumentation

```typescript
import { tracing } from '@/lib/telemetry/tracing';

// Create custom spans
const span = tracing.startUserJourney('onboarding', userId);

// Execute with automatic tracing
await tracing.withDatabase('create', 'users', async (span) => {
  const user = await createUser(userData);
  span.setAttributes({ 'user.id': user.id });
  return user;
});

// Measure performance
const { result, measurement } = await tracing.measurePerformance(
  'complex_calculation',
  async () => {
    return performComplexCalculation();
  }
);
```

## Monitoring & Alerting

### Health Check Endpoint

```bash
GET /api/telemetry/health
```

Returns telemetry system status, configuration, and basic metrics.

### Metrics Endpoint

```bash
# JSON format
GET /api/telemetry/metrics

# Prometheus format
GET /api/telemetry/metrics?format=prometheus

# Filter by category
GET /api/telemetry/metrics?category=business
GET /api/telemetry/metrics?category=technical
GET /api/telemetry/metrics?category=ux
```

### Development Console

In development mode, access telemetry debugging commands:

```javascript
// Browser console commands
window.telemetry.getTraceLog()         // View all traces
window.telemetry.getActiveTrace()      // Current trace context
window.telemetry.printTraceTree()      // Visual trace tree
window.telemetry.getMetrics()          // Current metrics
window.telemetry.startTrace('test')    // Manual trace
```

### Key Metrics to Monitor

#### Business Metrics
- `habit_completion_rate` - Daily habit completion percentage
- `mood_entries_per_day` - Average mood entries per user
- `ai_feature_adoption` - Percentage of users using AI features
- `user_retention_rate` - Weekly/monthly active users

#### Technical Metrics
- `api_response_time` - API endpoint performance (P95 < 500ms)
- `error_rate` - Overall error rate (< 2%)
- `claude_api_cost` - Daily AI API costs
- `memory_usage` - Application memory consumption

#### User Experience Metrics
- `page_load_time` - Core Web Vitals (LCP < 2.5s)
- `time_to_interactive` - Page interactivity (< 3s)
- `feature_completion_rate` - Successful user flows (> 90%)

### Recommended Alerts

1. **API Response Time > 2s** - Performance degradation
2. **Error Rate > 5%** - System reliability issues
3. **Claude API Cost > Daily Budget** - Cost management
4. **Memory Usage > 80%** - Resource constraints
5. **Core Web Vitals > Thresholds** - User experience impact

## Integration Examples

### DataDog Dashboard

Create custom dashboards with these queries:

```
# API Performance
avg:nextvibe.api_response_time_ms{endpoint:/api/claude/enhance-habit}

# Error Rate
sum:nextvibe.errors_total{*}.as_rate()

# Business Metrics
avg:nextvibe.habit_completion_rate{*}
```

### New Relic Queries

```sql
-- API Performance
SELECT average(duration) FROM Span WHERE service.name = 'nextvibe' AND name LIKE 'api.%'

-- AI Feature Usage
SELECT count(*) FROM Span WHERE ai.feature IS NOT NULL FACET ai.feature
```

### Grafana Queries

```promql
# API Response Time P95
histogram_quantile(0.95, nextvibe_api_response_time_ms_bucket)

# Error Rate
rate(nextvibe_errors_total[5m])
```

## Performance Considerations

### Resource Usage
- **Memory Overhead**: < 50MB additional memory usage
- **CPU Impact**: < 1% performance overhead with 10% sampling
- **Network**: Batched exports minimize network impact

### Sampling Strategies
- **Development**: 100% sampling for complete visibility
- **Staging**: 50% sampling for thorough testing
- **Production**: 10-20% sampling for performance balance
- **High-Traffic**: 1-5% sampling for minimal overhead

### Optimization Tips
1. Use appropriate sampling rates for environment
2. Batch telemetry data exports
3. Disable verbose instrumentation in production
4. Monitor telemetry system resource usage
5. Implement circuit breakers for external exporters

## Troubleshooting

### Common Issues

#### 1. Telemetry Not Initializing
- Check OpenTelemetry dependencies are installed
- Verify environment variables are set correctly
- Check browser/Node.js console for error messages

#### 2. Missing Traces
- Verify sampling rate configuration
- Check if instrumentation is enabled for target operations
- Ensure proper span context propagation

#### 3. High Memory Usage
- Reduce sampling rate
- Check for memory leaks in custom instrumentation
- Verify telemetry data is being exported properly

#### 4. Performance Impact
- Lower sampling rate in production
- Disable unnecessary instrumentations
- Use async export to avoid blocking operations

### Debug Mode

Enable detailed logging:

```bash
OTEL_LOG_LEVEL=debug
TELEMETRY_CONSOLE_OUTPUT=true
```

## Security & Compliance

### Data Privacy
- PII scrubbing enabled by default
- User data anonymization options
- Configurable data retention policies
- Opt-out mechanisms for user tracking

### Security Headers
- Custom telemetry headers for service identification
- Secure export endpoints with authentication
- Rate limiting on telemetry APIs
- Input validation and sanitization

## Roadmap

### Future Enhancements
- [ ] Advanced anomaly detection
- [ ] Automated alerting rules
- [ ] Custom dashboard generation
- [ ] ML-powered performance insights
- [ ] Enhanced RUM capabilities
- [ ] Mobile app telemetry integration

### Monitoring Service Integrations
- [ ] Grafana Cloud integration
- [ ] Elasticsearch/Kibana support
- [ ] AWS CloudWatch integration
- [ ] Azure Monitor support
- [ ] Google Cloud Monitoring

## Contributing

When adding new telemetry:

1. **Define Custom Attributes**: Use the `NextVibeSpanAttributes` interface
2. **Create Specific Spans**: Use appropriate span types (API, database, AI, etc.)
3. **Record Business Metrics**: Update relevant business metrics
4. **Add Error Handling**: Ensure errors are properly traced
5. **Test Thoroughly**: Verify telemetry works in dev/staging environments
6. **Document Changes**: Update this README with new metrics or features

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review console logs for telemetry errors
3. Use development debugging tools
4. Test with mock data to isolate issues
5. Verify configuration against `.env.example`

---

**Generated with comprehensive OpenTelemetry integration for production-grade observability and monitoring.**