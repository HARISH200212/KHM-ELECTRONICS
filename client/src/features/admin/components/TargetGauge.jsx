import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const TargetGauge = ({ value = 85, target = 600000, current = 510000 }) => {
    const data = [
        { name: 'Progress', value: value },
        { name: 'Remaining', value: 100 - value },
    ];

    const COLORS = ['#FF8C00', '#F3EBE3'];

    return (
        <div className="gauge-container">
            <div className="gauge-header">
                <h3>Monthly Target</h3>
                <div className="gauge-options">...</div>
            </div>
            
            <div className="gauge-visual">
                <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="100%"
                            startAngle={180}
                            endAngle={0}
                            innerRadius={70}
                            outerRadius={90}
                            paddingAngle={0}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="gauge-center-text">
                    <span className="percentage">{value}%</span>
                    <span className="trend">+8.02% from last month</span>
                </div>
            </div>

            <div className="gauge-stats">
                <div className="stat-box">
                    <span className="label">Target</span>
                    <span className="value">₹{target.toLocaleString()}</span>
                </div>
                <div className="divider"></div>
                <div className="stat-box">
                    <span className="label">Revenue</span>
                    <span className="value">₹{current.toLocaleString()}</span>
                </div>
            </div>

            <div className="gauge-footer">
                <p>Great Progress! 🎉</p>
                <span className="hint">Our achievement increased by ₹200,000; let's reach 100% next month.</span>
            </div>
        </div>
    );
};

export default TargetGauge;
