import React from 'react';

const topicStyles = [
  { bg: 'bg-tech', icon: 'bi-cpu-fill', fire: '8.5k' },
  { bg: 'bg-data', icon: 'bi-database-fill', fire: '5.2k' },
  { bg: 'bg-dev', icon: 'bi-braces', fire: '3.1k' }
];

function HotTopics({ categories }) {
  const displayCategories = categories.slice(0, 3);

  if (displayCategories.length === 0) return null;

  return (
    <div className="row g-3 mb-5">
      {displayCategories.map((cat, index) => {
        const style = topicStyles[index % topicStyles.length];
        
        return (
          <div className="col-md-4" key={cat.id}>
            <div className="topic-grid-card">
              <div className="d-flex justify-content-between align-items-start">
                <div className={`topic-icon-box ${style.bg}`}>
                  <i className={`bi ${style.icon}`}></i>
                </div>
                <span className="topic-stats">
                  <i className="bi bi-fire text-danger"></i> {style.fire}
                </span>
              </div>
              <h6 className="fw-bold text-dark mb-1">{cat.category_name}</h6>
              <p className="text-muted small mb-0" style={{ lineHeight: '1.4' }}>
                Explore the latest insights in {cat.category_name}.
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default HotTopics;