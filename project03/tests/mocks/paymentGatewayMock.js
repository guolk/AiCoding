const nock = require('nock');

class PaymentGatewayMock {
  constructor(baseUrl = 'https://api.payment-gateway-test.com') {
    this.baseUrl = baseUrl;
  }

  mockSuccessResponse(delay = 0) {
    return nock(this.baseUrl)
      .post('/pay')
      .delay(delay)
      .reply(200, (uri, requestBody) => ({
        success: true,
        transactionId: requestBody.transactionId,
        amount: requestBody.amount,
        orderId: requestBody.orderId,
        timestamp: Date.now()
      }));
  }

  mockFailureResponse(errorCode = 500, errorMessage = 'Payment processing failed') {
    return nock(this.baseUrl)
      .post('/pay')
      .reply(errorCode, {
        success: false,
        error: errorMessage,
        timestamp: Date.now()
      });
  }

  mockTimeoutResponse(timeoutMs = 15000) {
    return nock(this.baseUrl)
      .post('/pay')
      .delay(timeoutMs)
      .reply(200, {
        success: true,
        transactionId: 'timeout-transaction',
        timestamp: Date.now()
      });
  }

  mockNetworkError(errorType = 'ECONNREFUSED') {
    return nock(this.baseUrl)
      .post('/pay')
      .replyWithError(errorType);
  }

  mockRateLimitResponse() {
    return nock(this.baseUrl)
      .post('/pay')
      .reply(429, {
        success: false,
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: 60
      });
  }

  mockBadRequestResponse(message = 'Invalid payment parameters') {
    return nock(this.baseUrl)
      .post('/pay')
      .reply(400, {
        success: false,
        error: 'Bad Request',
        message
      });
  }

  mockServerErrorResponse() {
    return nock(this.baseUrl)
      .post('/pay')
      .reply(500, {
        success: false,
        error: 'Internal Server Error',
        message: 'An unexpected error occurred while processing payment'
      });
  }

  mockServiceUnavailableResponse() {
    return nock(this.baseUrl)
      .post('/pay')
      .reply(503, {
        success: false,
        error: 'Service Unavailable',
        message: 'Payment gateway is temporarily unavailable'
      });
  }

  mockMalformedResponse() {
    return nock(this.baseUrl)
      .post('/pay')
      .reply(200, '{invalid json response', { 'Content-Type': 'application/json' });
  }

  mockEmptyResponse() {
    return nock(this.baseUrl)
      .post('/pay')
      .reply(200, '');
  }

  mockPartialSuccessResponse() {
    return nock(this.baseUrl)
      .post('/pay')
      .reply(200, {
        success: true,
        transactionId: 'partial-transaction',
        warnings: ['Payment processing delayed', 'Manual verification required']
      });
  }

  mockConditionalResponse(conditionFn, successResponse, failureResponse) {
    return nock(this.baseUrl)
      .post('/pay')
      .reply((uri, requestBody) => {
        if (conditionFn(requestBody)) {
          return [200, { ...successResponse, transactionId: requestBody.transactionId }];
        }
        return [400, failureResponse];
      });
  }

  reset() {
    nock.cleanAll();
  }

  enableNetConnect() {
    nock.enableNetConnect();
  }

  disableNetConnect() {
    nock.disableNetConnect();
  }
}

module.exports = new PaymentGatewayMock();
