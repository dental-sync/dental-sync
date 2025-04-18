import React, { useState, useEffect } from 'react';
import './SearchBar.css';

const SearchBar = ({ placeholder, onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleChange = (e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    
    // Chama onSearch sempre que o usuário digitar
    if (onSearch) onSearch(newValue);
  };

  return (
    <div className="search-bar-container">
      <div className="search-input-wrapper">
        <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          type="text"
          value={searchTerm}
          onChange={handleChange}
          placeholder={placeholder || "Buscar..."}
          className="search-input"
        />
      </div>
    </div>
  );
};

export default SearchBar; 