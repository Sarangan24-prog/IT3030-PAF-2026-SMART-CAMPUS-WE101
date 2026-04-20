const CircularProgress = ({ percentage, color }) => {
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="circular-progress-wrap">
      <svg width="100" height="100">
        <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#e2e8f0" strokeWidth="8" />
        <circle 
          cx="50" cy="50" r={radius} fill="transparent" 
          stroke={color} strokeWidth="8" 
          strokeDasharray={circumference} 
          strokeDashoffset={offset} 
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div className="progress-text">
        <span className="percentage">{percentage}%</span>
      </div>
    </div>
  );
};

const ProgressSection = ({ userProgress, teamProgress }) => {
  return (
    <div className="progress-section">
      <div className="your-progress-card">
         <h3>Your Progress</h3>
         <CircularProgress percentage={userProgress} color="#77A365" />
      </div>
      
      <div className="team-progress-card">
        <h3>Campus Activity</h3>
        {teamProgress.map(item => (
          <div key={item.name} className="team-bar-row">
             <div className="bar-info">
                <span>{item.name}</span>
                <span>{item.percentage}%</span>
             </div>
             <div className="bar-bg">
                <div 
                  className="bar-fill" 
                  style={{ width: `${item.percentage}%`, backgroundColor: item.color }} 
                />
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressSection;
