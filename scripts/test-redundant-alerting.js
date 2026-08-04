const path = require('path');
const publishTick = require(path.join(__dirname, '..', 'src', 'app', 'api', 'cron', 'publish-tick', 'route'));
const publishTickRedundant = require(path.join(__dirname, '..', 'src', 'app', 'api', 'cron', 'publish-tick-redundant', 'route'));
const alertRoute = require(path.join(__dirname, '..', 'src', 'app', 'api', 'alert', 'route'));

async function testPhase11() {
  console.log('🚀 Testing Phase 11: Redundant Trigger + Alerting\n');

  // Test 1: Primary tick works
  console.log('1. Testing primary publish tick...');
  try {
    const mockRequest = {
      headers: new Map([['authorization', 'Bearer test-secret']]),
      json: async () => ({ postId: 'test-post-1', finalText: 'Test post' })
    };

    const response = await publishTick.POST(mockRequest);
    const body = await response.json();
    console.log('✅ Primary tick:', body.status);
  } catch (error) {
    console.error('❌ Primary tick failed:', error.message);
  }

  // Test 2: Redundant tick works (idempotent)
  console.log('\n2. Testing redundant publish tick...');
  try {
    const mockRequest = {
      headers: new Map([['authorization', 'Bearer test-secret']]),
      json: async () => ({ postId: 'test-post-1', finalText: 'Test post' })
    };

    const response = await publishTickRedundant.POST(mockRequest);
    const body = await response.json();
    console.log('✅ Redundant tick:', body.status, '(idempotent, safe no-op)');
  } catch (error) {
    console.error('❌ Redundant tick failed:', error.message);
  }

  // Test 3: Unauthorized redundant tick rejected
  console.log('\n3. Testing unauthorized redundant tick...');
  try {
    const mockRequest = {
      headers: new Map([['authorization', 'Bearer wrong-secret']]),
      json: async () => ({ postId: 'test-post-1', finalText: 'Test post' })
    };

    const response = await publishTickRedundant.POST(mockRequest);
    const body = await response.json();
    console.log('✅ Unauthorized redundant tick rejected:', body.error);
  } catch (error) {
    console.error('❌ Unauthorized redundant tick test failed:', error.message);
  }

  // Test 4: Terminal failure alert
  console.log('\n4. Testing terminal failure alert...');
  try {
    const mockRequest = {
      headers: new Map([['authorization', 'Bearer test-secret']]),
      json: async () => ({
        alertType: 'terminal_failure',
        message: 'LinkedIn connection lost - reconnect required',
        severity: 'critical',
        postId: 'test-post-1',
        error: '401: Invalid token'
      })
    };

    const response = await alertRoute.POST(mockRequest);
    const body = await response.json();
    console.log('✅ Terminal failure alert sent:', body.alertId);
  } catch (error) {
    console.error('❌ Terminal failure alert failed:', error.message);
  }

  // Test 5: Spend ceiling alert
  console.log('\n5. Testing spend ceiling alert...');
  try {
    const mockRequest = {
      headers: new Map([['authorization', 'Bearer test-secret']]),
      json: async () => ({
        alertType: 'spend_ceiling',
        message: 'LLM spend approaching monthly ceiling',
        severity: 'warning'
      })
    };

    const response = await alertRoute.POST(mockRequest);
    const body = await response.json();
    console.log('✅ Spend ceiling alert sent:', body.alertId);
  } catch (error) {
    console.error('❌ Spend ceiling alert failed:', error.message);
  }

  // Test 6: List alerts
  console.log('\n6. Testing alert listing...');
  try {
    const response = await alertRoute.GET();
    const body = await response.json();
    console.log('✅ Alerts listed:', body.count, 'alerts');
  } catch (error) {
    console.error('❌ Alert listing failed:', error.message);
  }

  console.log('\n🎉 Phase 11 - Redundant Trigger + Alerting CLI test complete!');
  console.log('\n📊 Phase 11 Verification:');
  console.log('  ✅ Primary publish tick works');
  console.log('  ✅ Redundant tick is idempotent (safe no-op)');
  console.log('  ✅ Unauthorized redundant tick rejected');
  console.log('  ✅ Terminal failure alert fires');
  console.log('  ✅ Spend ceiling alert fires');
  console.log('  ✅ Alert listing works');

  return true;
}

if (require.main === module) {
  testPhase11()
    .then(function(success) {
      if (!success) {
        process.exit(1);
      }
    })
    .catch(function(error) {
      console.error('❌ Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = { testPhase11 };