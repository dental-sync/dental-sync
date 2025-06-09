package com.senac.dentalsync.core.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.senac.dentalsync.core.persistency.model.Material;
import com.senac.dentalsync.core.persistency.model.Servico;
import com.senac.dentalsync.core.persistency.model.ServicoMaterial;
import com.senac.dentalsync.core.persistency.model.ServicoMaterialId;
import com.senac.dentalsync.core.persistency.model.Usuario;
import com.senac.dentalsync.core.persistency.repository.BaseRepository;
import com.senac.dentalsync.core.persistency.repository.ServicoRepository;

import jakarta.persistence.EntityManager;

@Service
public class ServicoService extends BaseService<Servico, Long> {

    @Autowired
    private ServicoRepository servicoRepository;

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private MaterialService materialService;

    @Autowired
    private EntityManager entityManager;

    @Override
    protected BaseRepository<Servico, Long> getRepository() {
        return servicoRepository;
    }

    @Override
    protected Usuario getUsuarioLogado() {
        return usuarioService.getUsuarioLogado();
    }

    @Override
    @Transactional
    public Servico save(Servico servico) {
        // Guarda a lista de materiais e limpa a lista do serviço para evitar o cascade
        List<ServicoMaterial> materiais = servico.getMateriais();
        servico.setMateriais(new ArrayList<>());
        
        // Salva o serviço primeiro
        Servico servicoSalvo = super.save(servico);
        
        // Depois salva os materiais manualmente (SEM descontar estoque)
        if (materiais != null) {
            List<ServicoMaterial> materiaisSalvos = new ArrayList<>();
            
            for (ServicoMaterial sm : materiais) {
                Material material = materialService.getRepository().findById(sm.getMaterial().getId())
                        .orElseThrow(() -> new RuntimeException("Material não encontrado"));
                
                // Cria um novo ServicoMaterial com os IDs corretos
                ServicoMaterial novoSm = new ServicoMaterial();
                novoSm.setServico(servicoSalvo);
                novoSm.setMaterial(material);
                novoSm.setQuantidade(sm.getQuantidade());
                novoSm.setId(new ServicoMaterialId(servicoSalvo.getId(), material.getId()));
                
                BigDecimal qtd = novoSm.getQuantidade();
                if (qtd == null) {
                    throw new RuntimeException("Quantidade não informada para o material: " + material.getNome());
                }
                
                // Apenas valida se há estoque suficiente para orientação, mas NÃO desconta
                // O desconto será feito apenas quando o pedido for criado
                if (material.getQuantidade().compareTo(qtd) < 0) {
                    System.out.println("Aviso: Estoque pode ser insuficiente para o material: " + material.getNome() 
                        + " (Disponível: " + material.getQuantidade() + ", Necessário: " + qtd + ")");
                }
                
                // Persiste o ServicoMaterial manualmente
                entityManager.persist(novoSm);
                materiaisSalvos.add(novoSm);
            }
            
            // Atualiza a lista de materiais do serviço
            servicoSalvo.setMateriais(materiaisSalvos);
            return servicoSalvo;
        }
        
        return servicoSalvo;
    }

    @Transactional
    public Servico updateServico(Servico servicoEditado, Long idServico) {
        
        // Busca o serviço antigo para validação
        Servico servicoAntigo = getRepository().findById(idServico)
                .orElseThrow(() -> new RuntimeException("Serviço não encontrado para edição"));

        // Define o ID do serviço editado
        servicoEditado.setId(idServico);
        
        // Salva o serviço editado (que, por cascade, salva os ServicoMaterial)
        return super.save(servicoEditado);
    }

}
