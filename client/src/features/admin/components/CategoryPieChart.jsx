import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const COLORS = ['#FF8C00', '#FFB366', '#FFD8B1', '#FFF5E6', '#f3ebe3', '#e0e0e0'];

const CategoryPieChart = ({ data }) => {
    const totalValue = data.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="donut-chart-container">
            <div className="donut-header">
                <h3>Top Categories</h3>
                <button className="see-all">See All</button>
            </div>
            
            <div className="donut-visual">
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie
                            data={data}
                            innerRadius={70}
                            outerRadius={95}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
                <div className="donut-center">
                    <span className="label">Total Sales</span>
                    <span className="value">₹{totalValue.toLocaleString()}</span>
                </div>
            </div>

            <div className="donut-legend">
                {data.slice(0, 4).map((item, index) => (
                    <div key={item.name} className="legend-row">
                        <span className="dot" style={{ background: COLORS[index % COLORS.length] }}></span>
                        <span className="name">{item.name}</span>
                        <span className="val">₹{item.value.toLocaleString()}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategoryPieChart;
