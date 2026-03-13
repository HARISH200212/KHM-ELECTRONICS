import { BarChart, Bar, Cell, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

const ConversionChart = ({ data = [
    { name: 'Product Views', value: 25000, trend: '+9%' },
    { name: 'Add to Cart', value: 12000, trend: '+6%' },
    { name: 'Proceed to Checkout', value: 8500, trend: '+4%' },
    { name: 'Completed Purchases', value: 6200, trend: '+7%' },
    { name: 'Abandoned Carts', value: 3000, trend: '-5%' },
] }) => {
    return (
        <div className="conversion-container">
            <div className="conversion-header">
                <h3>Conversion Rate</h3>
                <select className="period-select">
                    <option>This Week</option>
                </select>
            </div>

            <div className="conversion-grid">
                {data.map((item, index) => (
                    <div key={item.name} className="conversion-col">
                        <span className="col-label">{item.name}</span>
                        <span className="col-value">{item.value.toLocaleString()}</span>
                        <span className={`col-trend ${item.trend.startsWith('+') ? 'up' : 'down'}`}>
                            {item.trend}
                        </span>
                    </div>
                ))}
            </div>

            <div className="conversion-visual">
                <ResponsiveContainer width="100%" height={150}>
                    <BarChart data={data}>
                        <XAxis dataKey="name" hide />
                        <Tooltip 
                            cursor={{ fill: 'transparent' }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="custom-tooltip">
                                            <p className="label">{`${payload[0].payload.name}`}</p>
                                            <p className="intro">{`${payload[0].value.toLocaleString()}`}</p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Bar dataKey="value" radius={[8, 8, 8, 8]}>
                            {data.map((entry, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={entry.name === 'Abandoned Carts' ? '#FF8C00' : '#FFE4C4'} 
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <style>{`
                .conversion-container {
                    padding: 1.5rem;
                    background: white;
                    border-radius: 16px;
                }
                .conversion-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }
                .conversion-header h3 {
                    font-size: 1.1rem;
                    color: #1a1a1a;
                }
                .period-select {
                    padding: 6px 12px;
                    border-radius: 8px;
                    border: 1px solid #eee;
                    background: #FF8C00;
                    color: white;
                    font-size: 0.9rem;
                    font-weight: 500;
                }
                .conversion-grid {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }
                .conversion-col {
                    display: flex;
                    flex-direction: column;
                }
                .col-label {
                    font-size: 0.75rem;
                    color: #777;
                    margin-bottom: 0.5rem;
                    height: 2rem;
                }
                .col-value {
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: #1a1a1a;
                }
                .col-trend {
                    font-size: 0.8rem;
                    font-weight: 600;
                    margin-top: 0.2rem;
                }
                .col-trend.up { color: #48bb78; }
                .col-trend.down { color: #ff4d4d; }
                
                .custom-tooltip {
                    background: white;
                    padding: 8px 12px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    border: 1px solid #eee;
                }
            `}</style>
        </div>
    );
};

export default ConversionChart;
