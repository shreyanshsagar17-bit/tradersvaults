<div className="bg-gradient-to-r from-gold-500 to-gold-600 rounded-2xl p-8 max-w-2xl mx-auto">
  <h2 className="text-3xl font-bold text-primary-900 mb-4">
    Ready to Transform Your Trading?
  </h2>
  <p className="text-primary-800 mb-6">
    Join thousands of traders who trust Traders Vault for their trading journey
  </p>
  <button
    onClick={() => {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }
      navigate('/pay?plan=yearly');
    }}
    className="bg-primary-900 hover:bg-primary-800 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors"
  >
    Start Your Free Trial
  </button>
</div>