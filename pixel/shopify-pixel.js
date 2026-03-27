/**
 * Shopify Pixel — lightweight browser-side tracker
 *
 * Deploy this as a Shopify Custom Pixel or load it via a Script Tag.
 * Replace TRACKING_API_URL and TENANT_ID with your actual values.
 */
(function () {
  'use strict';

  var TRACKING_API_URL = 'https://your-api.example.com/api/events';
  var TENANT_ID = '__TENANT_ID__';

  /**
   * Generate a UUID v4 (for event IDs).
   */
  function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      var v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Read a cookie value by name.
   */
  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : undefined;
  }

  /**
   * Set a first-party cookie.
   */
  function setCookie(name, value, days) {
    var expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/; SameSite=Lax';
  }

  /**
   * Ensure a stable first-party user ID exists in a cookie.
   */
  function getOrCreateUserId() {
    var id = getCookie('_scapi_uid');
    if (!id) {
      id = uuidv4();
      setCookie('_scapi_uid', id, 365);
    }
    return id;
  }

  /**
   * Collect base user data from the browser.
   */
  function collectUserData() {
    return {
      externalId: getOrCreateUserId(),
      clientUserAgent: navigator.userAgent,
      fbp: getCookie('_fbp'),
      fbc: getCookie('_fbc'),
    };
  }

  /**
   * Extract Shopify market context from the page meta tags or window.Shopify.
   */
  function getMarketContext() {
    var shopify = window.Shopify || {};
    return {
      country: shopify.country || undefined,
      currency: shopify.currency && shopify.currency.active,
      locale: shopify.locale || document.documentElement.lang || undefined,
    };
  }

  /**
   * Send an event to the tracking API.
   */
  function sendEvent(eventName, customData) {
    var payload = Object.assign(
      {
        eventName: eventName,
        eventId: uuidv4(),
        eventSourceUrl: window.location.href,
        eventTime: Math.floor(Date.now() / 1000),
        domain: window.location.hostname,
        userData: collectUserData(),
        market: getMarketContext(),
      },
      customData || {}
    );

    if (typeof fetch !== 'undefined') {
      fetch(TRACKING_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + TENANT_ID,
        },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(function () {/* silent fail */});
    } else {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', TRACKING_API_URL, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Authorization', 'Bearer ' + TENANT_ID);
      xhr.send(JSON.stringify(payload));
    }
  }

  /**
   * Track a PageView event.
   */
  function trackPageView() {
    sendEvent('PageView');
  }

  /**
   * Track an AddToCart event.
   * @param {Object} product - { id, title, price, currency, quantity }
   */
  function trackAddToCart(product) {
    sendEvent('AddToCart', {
      products: [product],
      currency: product.currency,
      orderValue: (product.price || 0) * (product.quantity || 1),
    });
  }

  /**
   * Track an InitiateCheckout event.
   * @param {Object} cartData - { products, orderValue, currency }
   */
  function trackInitiateCheckout(cartData) {
    sendEvent('InitiateCheckout', cartData);
  }

  /**
   * Track a Purchase event.
   * @param {Object} orderData - { orderId, products, orderValue, currency }
   */
  function trackPurchase(orderData) {
    sendEvent('Purchase', orderData);
  }

  /**
   * Track a ViewContent (product page view) event.
   * @param {Object} product - { id, title, price, currency }
   */
  function trackViewContent(product) {
    sendEvent('ViewContent', {
      products: [product],
      currency: product.currency,
    });
  }

  // Auto-track page views
  trackPageView();

  // Expose public API
  window.ShopifyPixelCAPI = {
    trackPageView: trackPageView,
    trackAddToCart: trackAddToCart,
    trackInitiateCheckout: trackInitiateCheckout,
    trackPurchase: trackPurchase,
    trackViewContent: trackViewContent,
  };
})();
