import React from 'react';

function FilterBar({ categories, activeFilter, onSelectCategory, onClearFilter }) {
  return (
    <div className="minimal-filter-bar">
      <span 
        className={`filter-tab ${activeFilter === null ? 'active' : ''}`} 
        onClick={onClearFilter}
      >
        All Posts
      </span>
      {categories.map(cat => (
        <span 
          key={cat.id}
          className={`filter-tab ${activeFilter === cat.category_name ? 'active' : ''}`}
          onClick={() => onSelectCategory(cat.category_name)}
        >
          {cat.category_name}
        </span>
      ))}
    </div>
  );
}

export default FilterBar;