/**
 * Formatadores de texto e dados para uso em toda a aplicação
 */

/**
 * Formata um ID numérico com prefixo e zeros à esquerda
 * Ex: formatId(1, 'PT', 3) -> PT001, formatId(12, 'CL', 4) -> CL0012
 * 
 * @param {number|string} id - ID numérico para formatação
 * @param {string} prefix - Prefixo a ser adicionado (ex: 'PT', 'CL', 'PC')
 * @param {number} digits - Número de dígitos do ID (padrão: 3)
 * @returns {string} ID formatado com prefixo
 */
export const formatId = (id, prefix, digits = 3) => {
  if (!id && id !== 0) return '-';
  
  const numericId = Number(id);
  if (isNaN(numericId)) return `${prefix}${id}`;
  
  return `${prefix}${numericId.toString().padStart(digits, '0')}`;
};

/**
 * Extrai o ID numérico de um ID formatado
 * Ex: extractId('PT001', 'PT') -> 1, extractId('CL0012', 'CL') -> 12
 * 
 * @param {string} formattedId - ID formatado (ex: PT001)
 * @param {string} prefix - Prefixo usado na formatação (ex: 'PT', 'CL')
 * @returns {number|null} ID numérico ou null se formato inválido
 */
export const extractId = (formattedId, prefix) => {
  if (!formattedId) return null;
  
  const regex = new RegExp(`^${prefix}0*(\\d+)$`, 'i');
  const match = formattedId.match(regex);
  if (!match) return null;
  
  return Number(match[1]);
};

// Formatadores específicos para cada tipo de entidade

/**
 * Formata o ID do protético com prefixo PT e zeros à esquerda
 * Ex: 1 -> PT001, 12 -> PT012, 123 -> PT123
 * 
 * @param {number|string} id - ID do protético
 * @param {number} digits - Número de dígitos do ID (padrão: 3)
 * @returns {string} ID formatado com prefixo PT
 */
export const formatProteticoId = (id, digits = 3) => {
  return formatId(id, 'PT', digits);
};

/**
 * Extrai o ID numérico de um ID formatado de protético
 * Ex: PT001 -> 1, PT012 -> 12
 * 
 * @param {string} formattedId - ID formatado (ex: PT001)
 * @returns {number|null} ID numérico ou null se formato inválido
 */
export const extractProteticoId = (formattedId) => {
  return extractId(formattedId, 'PT');
};

/**
 * Formata o ID do cliente com prefixo CL e zeros à esquerda
 * Ex: 1 -> CL001, 12 -> CL012, 123 -> CL123
 * 
 * @param {number|string} id - ID do cliente
 * @param {number} digits - Número de dígitos do ID (padrão: 3)
 * @returns {string} ID formatado com prefixo CL
 */
export const formatClienteId = (id, digits = 3) => {
  return formatId(id, 'CL', digits);
};

/**
 * Extrai o ID numérico de um ID formatado de cliente
 * Ex: CL001 -> 1, CL012 -> 12
 * 
 * @param {string} formattedId - ID formatado (ex: CL001)
 * @returns {number|null} ID numérico ou null se formato inválido
 */
export const extractClienteId = (formattedId) => {
  return extractId(formattedId, 'CL');
};

/**
 * Formata o ID do paciente com prefixo PC e zeros à esquerda
 * Ex: 1 -> PC001, 12 -> PC012, 123 -> PC123
 * 
 * @param {number|string} id - ID do paciente
 * @param {number} digits - Número de dígitos do ID (padrão: 3)
 * @returns {string} ID formatado com prefixo PC
 */
export const formatPacienteId = (id, digits = 3) => {
  return formatId(id, 'PC', digits);
};

/**
 * Extrai o ID numérico de um ID formatado de paciente
 * Ex: PC001 -> 1, PC012 -> 12
 * 
 * @param {string} formattedId - ID formatado (ex: PC001)
 * @returns {number|null} ID numérico ou null se formato inválido
 */
export const extractPacienteId = (formattedId) => {
  return extractId(formattedId, 'PC');
};

/**
 * Limita o texto a um número máximo de caracteres e adiciona reticências
 * @param {string} text - Texto original
 * @param {number} maxLength - Tamanho máximo permitido
 * @returns {string} Texto limitado com reticências se necessário
 */
export const limitText = (text, maxLength = 25) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}; 