const StatCard = ({ icon: Icon, label, value, color }) => {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ backgroundColor: color + '15', color: color }}>
        <Icon size={24} />
      </div>
      <div className="stat-text">
        <span className="stat-label">{label}</span>
        <h2 className="stat-value">{value}</h2>
      </div>
    </div>
  );
};

export default StatCard;
