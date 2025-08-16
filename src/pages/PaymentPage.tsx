@@ .. @@
  const planCode = searchParams.get('plan') || 'monthly';

  useEffect(() => {
    loadPlan();
    loadRazorpayScript();
  }, [planCode]);

  const loadPlan = async () => {
    try {
      // Mock plans data since backend server may not be running
      const mockPlans = [
        {
          code: 'monthly',
          price_cents: 99900,
          currency: 'INR',
          interval_type: 'month'
        },
        {
          code: 'yearly',
          price_cents: 999900,
          currency: 'INR',
          interval_type: 'year'
        }
      ];
      
      const selectedPlan = mockPlans.find((p: Plan) => p.code === planCode);
      
      /*
      // Uncomment when backend is running
      const response = await fetch('http://localhost:3002/api/plans');
      const plans = await response.json();
      const selectedPlan = plans.find((p: Plan) => p.code === planCode);
      */
      
      if (!selectedPlan) {
        toast.error('Invalid plan selected');
        navigate('/pricing');
        return;
      }
      
      setPlan(selectedPlan);
    } catch (error) {
      console.error('Failed to load plan:', error);
      toast.error('Failed to load plan details');
      navigate('/pricing');
    } finally {
      setLoading(false);
    }
  };