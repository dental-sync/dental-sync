/**
 * Utilitários para formatação e limitação de texto nas tabelas
 */

/**
 * Limita o texto a um número específico de caracteres
 * @param {string} text - Texto a ser limitado
 * @param {number} maxLength - Número máximo de caracteres
 * @param {string} suffix - Sufixo a ser adicionado (padrão: "...")
 * @returns {string} Texto limitado
 */
export const limitText = (text, maxLength = 30, suffix = '...') => {
  if (!text || typeof text !== 'string') return text || '';
  
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + suffix;
};

/**
 * Formata nome completo limitando o texto
 * @param {string} nome - Nome completo
 * @param {number} maxLength - Número máximo de caracteres (padrão: 25)
 * @returns {string} Nome formatado
 */
export const formatNome = (nome, maxLength = 25) => {
  return limitText(nome, maxLength);
};

/**
 * Formata email limitando o texto
 * @param {string} email - Email
 * @param {number} maxLength - Número máximo de caracteres (padrão: 30)
 * @returns {string} Email formatado
 */
export const formatEmail = (email, maxLength = 30) => {
  return limitText(email, maxLength);
};

/**
 * Formata telefone mantendo formato mas limitando se necessário
 * @param {string} telefone - Telefone
 * @param {number} maxLength - Número máximo de caracteres (padrão: 20)
 * @returns {string} Telefone formatado
 */
export const formatTelefone = (telefone, maxLength = 20) => {
  return limitText(telefone, maxLength);
};

/**
 * Formata endereço limitando o texto
 * @param {string} endereco - Endereço
 * @param {number} maxLength - Número máximo de caracteres (padrão: 35)
 * @returns {string} Endereço formatado
 */
export const formatEndereco = (endereco, maxLength = 35) => {
  return limitText(endereco, maxLength);
};

/**
 * Formata descrição limitando o texto
 * @param {string} descricao - Descrição
 * @param {number} maxLength - Número máximo de caracteres (padrão: 40)
 * @returns {string} Descrição formatada
 */
export const formatDescricao = (descricao, maxLength = 40) => {
  return limitText(descricao, maxLength);
};

/**
 * Formata CNPJ/CPF limitando se necessário
 * @param {string} documento - CNPJ ou CPF
 * @param {number} maxLength - Número máximo de caracteres (padrão: 20)
 * @returns {string} Documento formatado
 */
export const formatDocumento = (documento, maxLength = 20) => {
  return limitText(documento, maxLength);
};

/**
 * Formata categoria limitando o texto
 * @param {string} categoria - Nome da categoria
 * @param {number} maxLength - Número máximo de caracteres (padrão: 20)
 * @returns {string} Categoria formatada
 */
export const formatCategoria = (categoria, maxLength = 20) => {
  return limitText(categoria, maxLength);
};

/**
 * Formata observações limitando o texto
 * @param {string} observacao - Observação
 * @param {number} maxLength - Número máximo de caracteres (padrão: 50)
 * @returns {string} Observação formatada
 */
export const formatObservacao = (observacao, maxLength = 50) => {
  return limitText(observacao, maxLength);
};

/**
 * Formata lista de itens (ex: materiais, serviços) com limitação
 * @param {Array} items - Array de itens
 * @param {string} nameProperty - Propriedade que contém o nome do item
 * @param {number} maxItems - Número máximo de itens a mostrar (padrão: 2)
 * @param {number} maxItemLength - Tamanho máximo de cada item (padrão: 25)
 * @returns {string} Lista formatada
 */
export const formatItemList = (items, nameProperty = 'nome', maxItems = 2, maxItemLength = 25) => {
  if (!items || !Array.isArray(items) || items.length === 0) return 'N/A';
  
  const formattedItems = items.slice(0, maxItems).map(item => {
    const name = item[nameProperty] || item.toString();
    return limitText(name, maxItemLength);
  });
  
  const remaining = items.length - maxItems;
  
  if (remaining > 0) {
    return `${formattedItems.join(', ')} +${remaining} mais`;
  }
  
  return formattedItems.join(', ');
}; 