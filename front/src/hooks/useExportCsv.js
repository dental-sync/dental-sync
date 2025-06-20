import { toast } from 'react-toastify';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Hook para exportar dados para formato CSV
 * @returns {Object} Funções para exportação de dados para CSV
 */
const useExportCsv = () => {
  /**
   * Limita o texto a um número máximo de caracteres
   * @param {string} text - Texto a ser limitado
   * @param {number} maxLength - Tamanho máximo do texto
   * @returns {string} Texto limitado
   */
  const limitText = (text, maxLength = 20) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  /**
   * Gera um conteúdo CSV a partir de um array de objetos
   * @param {Array} data - Array de objetos a serem exportados
   * @param {Array} headers - Array com os cabeçalhos das colunas
   * @param {Array} fields - Array com os campos a serem exportados
   * @param {Function} formatIdFn - Função opcional para formatar o ID
   * @returns {string} Conteúdo CSV formatado
   */
  const generateCsvContent = (data, headers, fields, formatIdFn) => {
    if (!data || data.length === 0) {
      return '';
    }

    // Converter cabeçalhos para CSV (sem aspas)
    const headerRow = headers.join(';');
    
    // Converter linhas de dados para CSV usando ponto e vírgula como separador
    const rows = data.map(item => {
      return fields.map(field => {
        let value = item[field] !== undefined && item[field] !== null ? item[field] : '';
        // Formatar ID se a função fornecida e o campo for 'id'
        if (field === 'id' && formatIdFn) {
          value = formatIdFn(value);
        }
        // Remover aspas duplas para evitar problemas
        return String(value).replace(/"/g, '');
      }).join(';');
    });

    // Juntar cabeçalhos e linhas com quebras de linha
    return headerRow + '\r\n' + rows.join('\r\n');
  };

  /**
   * Gera um conteúdo para Excel
   * @param {Array} data - Array de objetos a serem exportados
   * @param {Array} headers - Array com os cabeçalhos das colunas
   * @param {Array} fields - Array com os campos a serem exportados
   * @param {Function} formatIdFn - Função opcional para formatar o ID
   * @returns {string} Conteúdo formatado para Excel
   */
  const generateExcelContent = (data, headers, fields, formatIdFn) => {
    if (!data || data.length === 0) {
      return '';
    }

    // Para Excel, usar ponto e vírgula como separador (padrão para Excel em pt-BR)
    // Cabeçalhos
    const headerRow = headers.join(';');
    
    // Linhas de dados
    const rows = data.map(item => {
      return fields.map(field => {
        let value = item[field] !== undefined && item[field] !== null ? item[field] : '';
        // Formatar ID se a função fornecida e o campo for 'id'
        if (field === 'id' && formatIdFn) {
          value = formatIdFn(value);
        }
        // Substituir aspas para evitar problemas
        const stringValue = String(value).replace(/"/g, '');
        return stringValue;
      }).join(';');
    });

    // Juntar tudo
    return headerRow + '\r\n' + rows.join('\r\n');
  };

  /**
   * Gera um PDF a partir de dados tabulares
   * @param {Array} data - Array de objetos a serem exportados
   * @param {Array} headers - Array com os cabeçalhos das colunas
   * @param {Array} fields - Array com os campos a serem exportados
   * @param {string} title - Título do documento PDF
   * @param {Function} formatIdFn - Função opcional para formatar o ID
   * @returns {jsPDF} Documento PDF gerado
   */
  const generatePdfContent = (data, headers, fields, title = 'Relatório', formatIdFn) => {
    if (!data || data.length === 0) {
      return null;
    }

    try {
      // Criar uma nova instância do jsPDF
      const doc = new jsPDF();
      
      // Preparar dados no formato para autoTable
      const tableData = data.map(item => {
        return fields.map(field => {
          let value = item[field] !== undefined && item[field] !== null ? item[field] : '';
          // Formatar ID se a função fornecida e o campo for 'id'
          if (field === 'id' && formatIdFn) {
            value = formatIdFn(value);
          }
          // Limitar texto para campos específicos apenas no PDF
          if (['nome', 'email', 'telefone', 'cro', 'descricao'].includes(field)) {
            value = limitText(String(value));
          }
          return value;
        });
      });
      
      // Adicionar título ao documento
      doc.text(title, 14, 15);
      
      // Usar o autoTable como função importada diretamente
      autoTable(doc, {
        head: [headers],
        body: tableData,
        startY: 20,
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [66, 139, 202], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 245, 245] }
      });
      
      return doc;
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar PDF. Verifique o console para mais detalhes.');
      return null;
    }
  };

  /**
   * Faz o download de um arquivo
   * @param {string} content - Conteúdo do arquivo
   * @param {string} filename - Nome do arquivo a ser baixado
   * @param {string} format - Formato do arquivo ('csv', 'excel', 'pdf')
   */
  const downloadFile = (content, filename, format) => {
    try {
      // Adicionar BOM (Byte Order Mark) para caracteres UTF-8
      const BOM = '\uFEFF';
      let blob;
      let fullFilename = filename;

      switch (format) {
        case 'pdf':
          // Para PDF, o content é um objeto jsPDF
          if (content) {
            content.save(`${filename}.pdf`);
            toast.success(`Arquivo PDF exportado com sucesso!`);
          } else {
            toast.error('Não foi possível gerar o arquivo PDF.');
          }
          return; // Retorna pois o jsPDF já faz o download
        case 'excel':
          // Usar ponto e vírgula como separador para Excel
          blob = new Blob([BOM + content], { type: 'application/vnd.ms-excel;charset=utf-8' });
          fullFilename += '.xls';
          break;
        case 'csv':
        default:
          // Usar ponto e vírgula como separador para CSV
          blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8' });
          fullFilename += '.csv';
          break;
      }

      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', fullFilename);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Arquivo ${format.toUpperCase()} exportado com sucesso!`);
    } catch (error) {
      console.error('Erro ao fazer download do arquivo:', error);
      toast.error('Erro ao exportar arquivo. Tente novamente.');
    }
  };

  /**
   * Exporta dados para um arquivo
   * @param {Array} data - Dados a serem exportados
   * @param {Array} headers - Cabeçalhos das colunas
   * @param {Array} fields - Campos dos objetos a serem exportados
   * @param {string} filename - Nome base do arquivo (sem extensão)
   * @param {string} format - Formato de exportação ('csv', 'excel', 'pdf')
   * @param {string} title - Título do documento PDF
   * @param {Function} formatIdFn - Função opcional para formatar o ID
   */
  const exportData = (data, headers, fields, filename, format = 'csv', title, formatIdFn) => {
    if (!data || data.length === 0) {
      toast.warning('Não há dados para exportar.');
      return;
    }

    try {
      // Adicionar data ao nome do arquivo
      const date = new Date();
      const formattedDate = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
      const filenameWithDate = `${filename}_${formattedDate}`;
      
      let content;
      
      // Gerar conteúdo de acordo com o formato
      switch (format) {
        case 'pdf':
          content = generatePdfContent(data, headers, fields, title, formatIdFn);
          break;
        case 'excel':
          content = generateExcelContent(data, headers, fields, formatIdFn);
          break;
        case 'csv':
        default:
          content = generateCsvContent(data, headers, fields, formatIdFn);
          break;
      }
      
      // Fazer download
      downloadFile(content, filenameWithDate, format);
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      toast.error('Erro ao exportar dados. Tente novamente.');
    }
  };

  return {
    exportData
  };
};

export default useExportCsv; 