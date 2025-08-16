@@ .. @@
   const getBrokerLogo = (brokerId: string) => {
     const broker = BROKERS.find(b => b.id === brokerId);
     return broker?.logo || `https://ui-avatars.com/api/?name=${broker?.displayName || 'Broker'}&background=1e293b&color=ffffff&size=24`;
   };
+  
   const themeOptions = [
     { id: 'green', name: 'Green', color: '#28a745' },
     { id: 'purple', name: 'Purple', color: '#6f42c1' },
     { id: 'blue', name: 'Blue', color: '#007bff' },
     { id: 'white', name: 'White', color: '#ffffff' },
   ];