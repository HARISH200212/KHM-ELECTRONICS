import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts';

const SalesChart = ({ data }) => {
    return (
        <div className="premium-chart-card">
            <div className="chart-header">
                <h3>Revenue Analytics</h3>
                <div className="chart-controls">
                    <select className="period-dropdown">
                        <option>Last 8 Days</option>
                    </select>
                </div>
            </div>
            
            <div className="chart-legend">
                <span className="legend-item"><span className="dot revenue"></span> Revenue</span>
                <span className="legend-item"><span className="dot order"></span> Order</span>
            </div>

            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <AreaChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#FF8C00" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#FF8C00" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#999', fontSize: 12 }} 
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#999', fontSize: 12 }}
                            tickFormatter={(value) => `${value > 1000 ? (value/1000).toFixed(0) + 'K' : value}`}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
                            cursor={{ stroke: '#FF8C00', strokeWidth: 1 }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="revenue" 
                            stroke="#FF8C00" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorRevenue)" 
                            name="Revenue" 
                        />
                        <Line 
                            type="monotone" 
                            dataKey="orders" 
                            stroke="#FF8C00" 
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={false}
                            name="Orders"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SalesChart;
