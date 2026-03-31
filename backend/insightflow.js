/**
 * InsightFlow Tracker
 * Paste this script in your website's <head> tag
 * Replace YOUR_API_KEY with your key from the InsightFlow dashboard
 */
(function() {
  const API_KEY  = 'YOUR_API_KEY'
  const BASE_URL = 'http://localhost:5000/api'

  // Track a user login or signup
  window.insightflow = {
    trackUser: function(userData) {
      fetch(BASE_URL + '/site-users', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey:    API_KEY,
          fullName:  userData.fullName  || '',
          username:  userData.username  || '',
          email:     userData.email,
          password:  userData.password  || '',
          role:      userData.role      || 'Member',
          ipAddress: userData.ip        || ''
        })
      }).catch(console.error)
    },

    submitFeedback: function(feedbackData) {
      fetch(BASE_URL + '/feedback', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey:        API_KEY,
          customerName:  feedbackData.name  || 'Anonymous',
          customerEmail: feedbackData.email || '',
          rating:        feedbackData.rating,
          feedbackText:  feedbackData.text
        })
      }).catch(console.error)
    }
  }
})()