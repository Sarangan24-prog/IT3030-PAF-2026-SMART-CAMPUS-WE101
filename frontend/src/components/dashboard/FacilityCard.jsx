const FacilityCard = ({ facility }) => {
  return (
    <div className="facility-card">
      <div className="facility-header">
         <div className="facility-avatar">
            {facility.name?.charAt(0)}
         </div>
      </div>
      <div className="facility-body">
         <h4>{facility.name}</h4>
         <span className="facility-type">{facility.type || 'Resource'}</span>
         
         <div className="facility-stats">
            <div className="f-stat">
               <span className="f-val">{facility.capacity || 'N/A'}</span>
               <span className="f-lbl">Capacity</span>
            </div>
            <div className="f-stat">
               <span className="f-val">{facility.location || 'Main'}</span>
               <span className="f-lbl">Location</span>
            </div>
            <div className="f-stat">
               <span className="f-val">4.8</span>
               <span className="f-lbl">Rating</span>
            </div>
         </div>
      </div>
    </div>
  );
};

export default FacilityCard;
