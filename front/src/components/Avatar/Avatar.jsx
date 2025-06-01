import React from 'react';
import './Avatar.css';

const Avatar = ({ name, email, size = 40 }) => {
  // Função para extrair iniciais do nome
  const getInitials = (name) => {
    if (!name) return '?';
    
    const names = name.split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  // Função para gerar cor baseada no nome
  const getColorFromName = (name) => {
    if (!name) return '#6B7280';
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const colors = [
      '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
      '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
      '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF',
      '#EC4899', '#F43F5E'
    ];
    
    return colors[Math.abs(hash) % colors.length];
  };

  const initials = getInitials(name || email);
  const backgroundColor = getColorFromName(name || email);

  return (
    <div 
      className="avatar"
      style={{
        width: size,
        height: size,
        backgroundColor,
        fontSize: size * 0.4,
        lineHeight: `${size}px`
      }}
      title={name || email}
    >
      {initials}
    </div>
  );
};

export default Avatar; 