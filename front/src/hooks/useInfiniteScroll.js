import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Hook para implementar paginação infinita com IntersectionObserver
 * 
 * @param {Function} fetchData - Função que busca os dados da API
 * @param {Object} options - Opções de configuração
 * @param {number} options.initialPage - Página inicial (padrão: 0)
 * @param {number} options.pageSize - Tamanho da página (padrão: 20)
 * @param {number} options.threshold - Limiar para acionar a próxima página (padrão: 0.8)
 * @param {any} options.dependencies - Dependências adicionais para recarregar os dados
 * @returns {Object} - Objeto com os dados necessários para a paginação infinita
 */
const useInfiniteScroll = (fetchData, options = {}) => {
  const {
    initialPage = 0,
    pageSize = 20,
    threshold = 0.8,
    dependencies = []
  } = options;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [error, setError] = useState(null);
  const [refreshFlag, setRefreshFlag] = useState(0);

  const observer = useRef();

  // Função para carregar mais itens (próxima página)
  const loadMore = async () => {
    if (!hasMore || loadingMore) return;
    
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      await fetchItems(nextPage);
      setPage(nextPage);
    } catch (err) {
      console.error('Erro ao carregar mais itens:', err);
      setError(err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Buscar itens da API
  const fetchItems = async (pageNum = initialPage) => {
    try {
      if (pageNum === initialPage) {
        setLoading(true);
        setData([]);
      }
      
      const result = await fetchData(pageNum, pageSize);
      
      if (result) {
        // Atualizar lista de itens (adicionar à lista existente se não for a primeira página)
        setData(prev => pageNum === initialPage ? result.content : [...prev, ...result.content]);
        
        // Atualizar informações de paginação
        setTotalElements(result.totalElements);
        setHasMore(!result.last);
        setError(null);
      }
    } catch (err) {
      console.error('Erro ao buscar itens:', err);
      setError(err);
      if (pageNum === initialPage) {
        setData([]);
      }
    } finally {
      if (pageNum === initialPage) {
        setLoading(false);
      }
    }
  };
  
  // Forçar atualização dos dados
  const refresh = () => {
    setPage(initialPage);
    setRefreshFlag(prev => prev + 1);
  };
  
  // Efeito para carregar a primeira página quando as dependências mudam
  useEffect(() => {
    setPage(initialPage);
    fetchItems(initialPage);
  }, [refreshFlag, ...dependencies]);
  
  // Referência para o último elemento (para observação de interseção)
  const lastElementRef = useCallback(node => {
    if (loading || loadingMore) return;
    
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    }, { threshold });
    
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore]);
  
  return {
    data,
    loading,
    loadingMore,
    hasMore,
    totalElements,
    error,
    lastElementRef,
    refresh,
    page
  };
};

export default useInfiniteScroll; 