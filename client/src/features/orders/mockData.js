export const generateMockOrderHistory = () => {
    const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    const categories = ['Electronics', 'Audio', 'Computers', 'Smartphones', 'Gaming', 'Accessories', 'Smart Home', 'Cameras', 'Drones'];
    const names = ['Rahul S.', 'Priya K.', 'Amit V.', 'Sneha M.', 'Vikram R.', 'Anjali P.', 'Karthik N.', 'Deepa B.', 'Suresh G.', 'Meera T.'];
    
    const orders = [];
    const now = new Date();
    
    // Generate 50 mock orders over the last 30 days
    for (let i = 0; i < 50; i++) {
        const daysAgo = Math.floor(Math.random() * 30);
        const orderDate = new Date(now);
        orderDate.setDate(now.getDate() - daysAgo);
        
        const category = categories[Math.floor(Math.random() * categories.length)];
        const total = Math.floor(Math.random() * 50000) + 1000;
        
        orders.push({
            id: `ORD-MOCK-${1000 + i}`,
            date: orderDate.toISOString(),
            status: statuses[Math.floor(Math.random() * statuses.length)],
            total: total,
            customer: {
                name: names[Math.floor(Math.random() * names.length)],
                email: 'customer@example.com'
            },
            items: [{
                name: `${category} Item`,
                price: total,
                quantity: 1,
                category: category,
                image: 'https://placehold.co/100x100/1a1a1a/FFF?text=Mock'
            }],
            invoiceNumber: `INV-${Date.now()}-${i}`
        });
    }
    
    return orders.sort((a, b) => new Date(b.date) - new Date(a.date));
};
