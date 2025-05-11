import React, { useRef, useEffect } from 'react';
import './ExportDropdown.css';
import ActionButton from '../ActionButton/ActionButton';
import useExportCsv from '../../hooks/useExportCsv';

const ExportDropdown = ({ 
  data, 
  headers, 
  fields, 
  filename, 
  isOpen, 
  toggleExport,
  onCloseDropdown,
  title
}) => {
  const { exportData } = useExportCsv();
  const exportRef = useRef(null);

  // Fechar o dropdown ao clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportRef.current && !exportRef.current.contains(event.target)) {
        onCloseDropdown();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onCloseDropdown]);

  // Função para exportar dados
  const handleExportar = (format) => {
    // Chamar a função de exportação do hook com o formato especificado
    exportData(data, headers, fields, filename, format, title);
    
    // Fechar o dropdown de exportação
    onCloseDropdown();
  };

  return (
    <div className="export-container" ref={exportRef}>
      <ActionButton 
        label="Exportar" 
        icon="export"
        onClick={toggleExport}
        active={isOpen}
      />
      
      {isOpen && (
        <div className="export-dropdown">
          <h3>Exportar como</h3>
          <div className="export-options">
            <button 
              className="export-option"
              onClick={() => handleExportar('csv')}
            >
              CSV (.csv)
            </button>
            <button 
              className="export-option"
              onClick={() => handleExportar('excel')}
            >
              Excel (.xls)
            </button>
            <button 
              className="export-option"
              onClick={() => handleExportar('pdf')}
            >
              PDF (.pdf)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportDropdown; 