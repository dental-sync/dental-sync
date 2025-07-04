import React, { useState, useEffect, useRef } from 'react';
import SearchBar from '../SearchBar/SearchBar';
import './Dropdown.css';

const Dropdown = ({
  // Dados e controle
  items = [],
  value = null,
  onChange = () => {},
  onSelectionConfirm = null, // Para modo de confirmação (modal-like)
  
  // Configurações de busca
  searchable = true,
  searchPlaceholder = "Buscar...",
  searchVariant = "default",
  searchBy = "nome", // propriedade para buscar nos itens
  
  // Configurações de exibição
  displayProperty = "nome", // propriedade para exibir
  valueProperty = "id", // propriedade para valor
  
  // Configurações do botão
  placeholder = "Selecionar...",
  buttonClassName = "",
  buttonStyle = {},
  showArrow = true,
  
  // Configurações da lista
  maxHeight = "200px",
  listClassName = "",
  itemClassName = "",
  
  // Configurações do modal/overlay
  asModal = false,
  modalTitle = "Selecionar",
  showConfirmButton = false,
  confirmButtonText = "Confirmar",
  cancelButtonText = "Cancelar",
  
  // Configurações visuais
  variant = "default", // default, outline, filled
  size = "medium", // small, medium, large
  
  // Estados
  disabled = false,
  loading = false,
  error = null,
  
  // Configurações avançadas
  allowMultiple = false,
  allowClear = false,
  showCheckbox = true, // mostrar checkbox quando allowMultiple=true
  showItemValue = false, // mostrar valor/preço à direita
  valueDisplayProperty = "preco", // propriedade para exibir valor
  valuePrefix = "R$ ", // prefixo para valor (ex: "R$ ", "$", "€")
  customRender = null, // função para renderizar item customizado
  emptyMessage = "Nenhum item encontrado",
  loadingMessage = "Carregando...",
  
  // Configurações do botão de adicionar
  showAddButton = false, // mostrar botão de adicionar
  addButtonText = "Adicionar",
  addButtonTitle = "Adicionar novo item",
  onAddClick = () => {},
  
  // Configurações dos botões de ação
  showActionButtons = false, // mostrar botões de ação (editar/excluir)
  onEditClick = () => {},
  onDeleteClick = () => {},
  
  // Eventos
  onOpen = () => {},
  onClose = () => {},
  onSearch = () => {},
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState(
    allowMultiple ? (Array.isArray(value) ? value : []) : []
  );
  const [singleValue, setSingleValue] = useState(
    allowMultiple ? null : value
  );
  
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  
  // Atualizar valores quando props mudam
  useEffect(() => {
    if (allowMultiple) {
      setSelectedItems(Array.isArray(value) ? value : []);
    } else {
      setSingleValue(value);
    }
  }, [value, allowMultiple]);
  
  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        handleClose();
      }
    };
    
    if (isOpen && !asModal) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, asModal]);
  
  // Filtrar itens baseado na busca
  const filteredItems = items.filter(item => {
    if (!searchTerm) return true;
    
    const searchValue = item[searchBy]?.toString().toLowerCase() || '';
    return searchValue.includes(searchTerm.toLowerCase());
  });
  
  const handleToggle = () => {
    if (disabled) return;
    if (isOpen) {
      handleClose();
    } else {
      setIsOpen(true);
      onOpen();
    }
  };

  const handleOpen = () => {
    if (disabled) return;
    setIsOpen(true);
    onOpen();
  };
  
  const handleClose = () => {
    setIsOpen(false);
    setSearchTerm('');
    onClose();
  };
  
  const handleItemClick = (item) => {
    if (allowMultiple) {
      const itemValue = item[valueProperty];
      const isSelected = selectedItems.some(selected => 
        selected[valueProperty] === itemValue
      );
      
      let newSelected;
      if (isSelected) {
        newSelected = selectedItems.filter(selected => 
          selected[valueProperty] !== itemValue
        );
      } else {
        newSelected = [...selectedItems, item];
      }
      
      setSelectedItems(newSelected);
      
      if (!showConfirmButton) {
        onChange(newSelected);
      }
    } else {
      setSingleValue(item);
      if (!showConfirmButton) {
        onChange(item);
        handleClose();
      }
    }
  };
  
  const handleConfirm = () => {
    if (allowMultiple) {
      onChange(selectedItems);
      if (onSelectionConfirm) {
        onSelectionConfirm(selectedItems);
      }
    } else {
      onChange(singleValue);
      if (onSelectionConfirm) {
        onSelectionConfirm(singleValue);
      }
    }
    handleClose();
  };
  
  const handleCancel = () => {
    // Resetar seleções temporárias
    if (allowMultiple) {
      setSelectedItems(Array.isArray(value) ? value : []);
    } else {
      setSingleValue(value);
    }
    handleClose();
  };
  
  const handleClear = () => {
    if (allowMultiple) {
      setSelectedItems([]);
      onChange([]);
    } else {
      setSingleValue(null);
      onChange(null);
    }
  };
  
  const handleSearch = (term) => {
    setSearchTerm(term);
    onSearch(term);
  };
  
  const isItemSelected = (item) => {
    if (allowMultiple) {
      return selectedItems.some(selected => 
        selected[valueProperty] === item[valueProperty]
      );
    } else {
      return singleValue && singleValue[valueProperty] === item[valueProperty];
    }
  };
  
  const getDisplayText = () => {
    if (allowMultiple) {
      if (selectedItems.length === 0) return placeholder;
      if (selectedItems.length === 1) return selectedItems[0][displayProperty];
      return `${selectedItems.length} selecionados`;
    } else {
      return singleValue ? singleValue[displayProperty] : placeholder;
    }
  };
  
  const renderItem = (item, index) => {
    const isSelected = isItemSelected(item);
    
    if (customRender) {
      return customRender(item, isSelected, () => handleItemClick(item));
    }
    
    const formatValue = (value) => {
      if (typeof value === 'number') {
        return value.toFixed(2).replace('.', ',');
      }
      return value || '0,00';
    };

    const handleEditClick = (e) => {
      e.stopPropagation();
      onEditClick(item);
    };

    const handleDeleteClick = (e) => {
      e.stopPropagation();
      onDeleteClick(item);
    };
    
    return (
      <div
        key={item[valueProperty] || index}
        className={`dropdown-item ${itemClassName} ${isSelected ? 'selected' : ''} ${showItemValue ? 'with-value' : ''} ${showActionButtons ? 'with-actions' : ''}`}
        onClick={() => handleItemClick(item)}
      >
        {allowMultiple && showCheckbox && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => {}} // Controlado pelo onClick do div
            className="dropdown-checkbox"
          />
        )}
        <span className="dropdown-item-text">
          {item[displayProperty]}
        </span>
        {showItemValue && (
          <span className="dropdown-item-value">
            {valuePrefix}{formatValue(item[valueDisplayProperty])}
          </span>
        )}
        {showActionButtons && (
          <div className="dropdown-item-actions">
            <button
              type="button"
              className="dropdown-action-btn edit-btn"
              onClick={handleEditClick}
              title="Editar categoria"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button
              type="button"
              className="dropdown-action-btn delete-btn"
              onClick={handleDeleteClick}
              title="Excluir categoria"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3,6 5,6 21,6"></polyline>
                <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
          </div>
        )}
      </div>
    );
  };
  
  const renderDropdownContent = () => (
    <div className={`dropdown-content ${listClassName}`}>
      {searchable && (
        <div className="dropdown-search">
          <SearchBar
            placeholder={searchPlaceholder}
            onSearch={handleSearch}
            variant={searchVariant}
          />
        </div>
      )}
      
      <div className="dropdown-list" style={{ maxHeight }}>
        {loading ? (
          <div className="dropdown-message">{loadingMessage}</div>
        ) : filteredItems.length === 0 ? (
          <div className="dropdown-message">{emptyMessage}</div>
        ) : (
          filteredItems.map((item, index) => renderItem(item, index))
        )}
      </div>
      
      {showConfirmButton && (
        <div className="dropdown-actions">
          <button
            type="button"
            className="dropdown-btn dropdown-btn-cancel"
            onClick={handleCancel}
          >
            {cancelButtonText}
          </button>
          <button
            type="button"
            className="dropdown-btn dropdown-btn-confirm"
            onClick={handleConfirm}
          >
            {confirmButtonText}
          </button>
        </div>
      )}
    </div>
  );
  
  if (asModal) {
    return (
      <>
        <button
          ref={buttonRef}
          type="button"
          className={`dropdown-trigger ${variant} ${size} ${buttonClassName} ${disabled ? 'disabled' : ''} ${(allowMultiple ? selectedItems.length > 0 : singleValue) ? 'has-value' : ''}`}
          style={buttonStyle}
          onClick={handleToggle}
          disabled={disabled}
        >
          <span className="dropdown-trigger-text">{getDisplayText()}</span>
          {showArrow && (
            <svg className="dropdown-arrow" width="12" height="12" viewBox="0 0 12 12">
              <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            </svg>
          )}
          {allowClear && (allowMultiple ? selectedItems.length > 0 : singleValue) && (
            <button
              type="button"
              className="dropdown-clear"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
            >
              ×
            </button>
          )}
        </button>
        
        {isOpen && (
          <div className="dropdown-modal-overlay">
            <div className="dropdown-modal">
              <h2 className="dropdown-modal-title">{modalTitle}</h2>
              {renderDropdownContent()}
            </div>
          </div>
        )}
      </>
    );
  }
  
  return (
    <div className={`dropdown ${variant} ${size}`} ref={dropdownRef}>
      <div className={`dropdown-container ${showAddButton ? 'with-add-button' : ''}`}>
        <button
          ref={buttonRef}
          type="button"
          className={`dropdown-trigger ${buttonClassName} ${disabled ? 'disabled' : ''} ${isOpen ? 'open' : ''} ${(allowMultiple ? selectedItems.length > 0 : singleValue) ? 'has-value' : ''}`}
          style={buttonStyle}
          onClick={handleToggle}
          disabled={disabled}
        >
          <span className="dropdown-trigger-text">{getDisplayText()}</span>
          {showArrow && (
            <svg className={`dropdown-arrow ${isOpen ? 'open' : ''}`} width="12" height="12" viewBox="0 0 12 12">
              <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            </svg>
          )}
          {allowClear && (allowMultiple ? selectedItems.length > 0 : singleValue) && (
            <button
              type="button"
              className="dropdown-clear"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
            >
              ×
            </button>
          )}
        </button>
        
        {showAddButton && (
          <button
            type="button"
            className="dropdown-add-button"
            onClick={onAddClick}
            title={addButtonTitle}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        )}
      </div>
      
      {isOpen && (
        <div className="dropdown-wrapper">
          {renderDropdownContent()}
        </div>
      )}
      
      {error && (
        <div className="dropdown-error">{error}</div>
      )}
    </div>
  );
};

export default Dropdown; 