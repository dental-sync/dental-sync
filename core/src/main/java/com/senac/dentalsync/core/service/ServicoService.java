package com.senac.dentalsync.core.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.senac.dentalsync.core.persistency.model.Material;
import com.senac.dentalsync.core.persistency.model.Servico;
import com.senac.dentalsync.core.persistency.model.ServicoMaterial;
import com.senac.dentalsync.core.persistency.model.ServicoMaterialId;
import com.senac.dentalsync.core.persistency.model.Protetico;
import com.senac.dentalsync.core.persistency.repository.BaseRepository;
import com.senac.dentalsync.core.persistency.repository.ServicoRepository;
import com.senac.dentalsync.core.persistency.repository.ServicoMaterialRepository;
import com.senac.dentalsync.core.util.ServicoCalculatorUtil;

import jakarta.persistence.EntityManager;

@Service
public class ServicoService extends BaseService<Servico, Long> {

    private static final Logger logger = LoggerFactory.getLogger(ServicoService.class);

    @Autowired
    private ServicoRepository servicoRepository;

    @Autowired
    private MaterialService materialService;

    @Autowired
    private EntityManager entityManager;

    @Autowired
    private ServicoMaterialRepository servicoMaterialRepository;

    @Override
    protected BaseRepository<Servico, Long> getRepository() {
        return servicoRepository;
    }

    @Override
    protected Protetico getUsuarioLogado() {
        return null;
    }

    @Override
    @Transactional
    public Servico save(Servico servico) {
        logger.debug("Salvando novo serviço: {}", servico.getNome());
        
        // Processa e salva o serviço com seus materiais
        Servico servicoSalvo = processarServicoComMateriais(servico, null);
        
        logger.info("Serviço salvo com sucesso: {} (ID: {})", servicoSalvo.getNome(), servicoSalvo.getId());
        return servicoSalvo;
    }

    @Transactional
    public Servico updateServico(Servico servicoEditado, Long idServico) {
        logger.debug("Atualizando serviço ID: {}", idServico);
        
        // Valida se o serviço existe
        Servico servicoAntigo = getRepository().findById(idServico)
                .orElseThrow(() -> new RuntimeException("Serviço não encontrado para edição"));

        logger.debug("Serviço encontrado: {}", servicoAntigo.getNome());

        // Define o ID do serviço editado
        servicoEditado.setId(idServico);
        
        // Processa e salva o serviço com seus materiais
        Servico servicoSalvo = processarServicoComMateriais(servicoEditado, idServico);
        
        logger.info("Serviço atualizado com sucesso: {} (ID: {})", servicoSalvo.getNome(), servicoSalvo.getId());
        return servicoSalvo;
    }

    /**
     * Processa um serviço salvando seus dados básicos e materiais associados
     * @param servico Serviço a ser processado
     * @param idServicoExistente ID do serviço existente (para updates) ou null (para novos)
     * @return Serviço processado e salvo
     */
    private Servico processarServicoComMateriais(Servico servico, Long idServicoExistente) {
        // Remove materiais antigos se for um update
        if (idServicoExistente != null) {
            removerMateriaisAntigos(idServicoExistente);
        }

        // Guarda a lista de materiais e limpa a lista do serviço para evitar cascade
        List<ServicoMaterial> materiais = servico.getMateriais();
        servico.setMateriais(new ArrayList<>());
        
        // Salva o serviço primeiro (dados básicos)
        Servico servicoSalvo = super.save(servico);
        
        // Processa e salva os materiais
        List<ServicoMaterial> materiaisSalvos = processarMateriais(servicoSalvo, materiais);
        servicoSalvo.setMateriais(materiaisSalvos);
        
        // Calcula e atualiza os valores automaticamente
        ServicoCalculatorUtil.atualizarValoresCalculados(servicoSalvo);
        
        // Salva novamente com os valores calculados
        return super.save(servicoSalvo);
    }

    /**
     * Remove todos os materiais associados a um serviço
     * @param servicoId ID do serviço
     */
    private void removerMateriaisAntigos(Long servicoId) {
        List<ServicoMaterial> materiaisAntigos = servicoMaterialRepository.findByServicoId(servicoId);
        
        if (!materiaisAntigos.isEmpty()) {
            logger.debug("Removendo {} materiais antigos do serviço ID: {}", materiaisAntigos.size(), servicoId);
            
            for (ServicoMaterial materialAntigo : materiaisAntigos) {
                servicoMaterialRepository.delete(materialAntigo);
            }
            
            // Força a sincronização com o banco
            entityManager.flush();
        }
    }

    /**
     * Processa e salva os materiais de um serviço
     * @param servico Serviço ao qual os materiais pertencem
     * @param materiais Lista de materiais a serem processados
     * @return Lista de materiais salvos
     */
    private List<ServicoMaterial> processarMateriais(Servico servico, List<ServicoMaterial> materiais) {
        List<ServicoMaterial> materiaisSalvos = new ArrayList<>();
        
        if (materiais == null || materiais.isEmpty()) {
            return materiaisSalvos;
        }

        logger.debug("Processando {} materiais para o serviço: {}", materiais.size(), servico.getNome());
        
        for (ServicoMaterial sm : materiais) {
            ServicoMaterial novoSm = criarServicoMaterial(servico, sm);
            entityManager.persist(novoSm);
            materiaisSalvos.add(novoSm);
        }
        
        return materiaisSalvos;
    }

    /**
     * Cria um novo ServicoMaterial com os dados corretos
     * @param servico Serviço associado
     * @param servicoMaterialOriginal ServicoMaterial original com os dados
     * @return Novo ServicoMaterial configurado
     */
    private ServicoMaterial criarServicoMaterial(Servico servico, ServicoMaterial servicoMaterialOriginal) {
        Material material = materialService.getRepository()
                .findById(servicoMaterialOriginal.getMaterial().getId())
                .orElseThrow(() -> new RuntimeException("Material não encontrado"));
        
        // Valida a quantidade
        BigDecimal quantidade = servicoMaterialOriginal.getQuantidade();
        if (quantidade == null || quantidade.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Quantidade deve ser maior que zero para o material: " + material.getNome());
        }
        
        // Valida estoque disponível (apenas aviso, não bloqueia)
        validarEstoqueDisponivel(material, quantidade);
        
        // Cria o novo ServicoMaterial
        ServicoMaterial novoSm = new ServicoMaterial();
        novoSm.setServico(servico);
        novoSm.setMaterial(material);
        novoSm.setQuantidade(quantidade);
        novoSm.setId(new ServicoMaterialId(servico.getId(), material.getId()));
        
        return novoSm;
    }

    /**
     * Valida se há estoque suficiente para o material (apenas aviso)
     * @param material Material a ser validado
     * @param quantidadeNecessaria Quantidade necessária
     */
    private void validarEstoqueDisponivel(Material material, BigDecimal quantidadeNecessaria) {
        if (material.getQuantidade() != null && 
            material.getQuantidade().compareTo(quantidadeNecessaria) < 0) {
            
            logger.warn("Estoque pode ser insuficiente para o material: {} " +
                       "(Disponível: {}, Necessário: {})", 
                       material.getNome(), material.getQuantidade(), quantidadeNecessaria);
        }
    }

    /**
     * Recalcula os valores de um serviço específico
     * @param servicoId ID do serviço
     * @return Serviço com valores atualizados
     */
    @Transactional
    public Servico recalcularValores(Long servicoId) {
        logger.debug("Recalculando valores do serviço ID: {}", servicoId);
        
        Servico servico = getRepository().findById(servicoId)
                .orElseThrow(() -> new RuntimeException("Serviço não encontrado"));
        
        ServicoCalculatorUtil.atualizarValoresCalculados(servico);
        Servico servicoAtualizado = super.save(servico);
        
        logger.info("Valores recalculados para o serviço: {} (ID: {})", 
                   servicoAtualizado.getNome(), servicoAtualizado.getId());
        
        return servicoAtualizado;
    }

    /**
     * Recalcula os valores de todos os serviços
     * Útil para migração ou correção de dados
     */
    @Transactional
    public void recalcularTodosOsValores() {
        logger.info("Iniciando recálculo de valores para todos os serviços");
        
        List<Servico> servicos = getRepository().findAll();
        int processados = 0;
        
        for (Servico servico : servicos) {
            ServicoCalculatorUtil.atualizarValoresCalculados(servico);
            super.save(servico);
            processados++;
        }
        
        logger.info("Recálculo concluído. {} serviços processados", processados);
    }
}
