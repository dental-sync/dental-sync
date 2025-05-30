package com.senac.dentalsync.core.service;

import java.math.BigDecimal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.senac.dentalsync.core.persistency.model.Material;
import com.senac.dentalsync.core.persistency.model.Servico;
import com.senac.dentalsync.core.persistency.model.ServicoMaterial;
import com.senac.dentalsync.core.persistency.model.Usuario;
import com.senac.dentalsync.core.persistency.repository.BaseRepository;
import com.senac.dentalsync.core.persistency.repository.ServicoRepository;

@Service
public class ServicoService extends BaseService<Servico, Long> {

    @Autowired
    private ServicoRepository servicoRepository;

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private MaterialService materialService;

    @Override
    protected BaseRepository<Servico, Long> getRepository() {
        return servicoRepository;
    }

    @Override
    protected Usuario getUsuarioLogado() {
        return usuarioService.getUsuarioLogado();
    }

    @Override
    public Servico save(Servico servico) {
        // Atualiza o estoque dos materiais (via ServicoMaterial)
        if (servico.getMateriais() != null) {
            for (ServicoMaterial sm : servico.getMateriais()) {
                Material material = materialService.getRepository().findById(sm.getMaterial().getId())
                        .orElseThrow(() -> new RuntimeException("Material não encontrado"));
                BigDecimal qtd = sm.getQuantidade();
                if (qtd == null) {
                    throw new RuntimeException("Quantidade não informada para o material: " + material.getNome());
                }
                if (material.getQuantidade().compareTo(qtd) < 0) {
                    throw new RuntimeException("Estoque insuficiente para o material: " + material.getNome());
                }
                material.setQuantidade(material.getQuantidade().subtract(qtd));
                materialService.save(material);
            }
        }
        // Salva o serviço (que, por cascade, salva os ServicoMaterial)
        return super.save(servico);
    }

    public Servico updateServico(Servico servicoEditado, Long idServico) {
        
        // Busca o serviço antigo (com seus ServicoMaterial)
        Servico servicoAntigo = getRepository().findById(idServico)
                .orElseThrow(() -> new RuntimeException("Serviço não encontrado para edição"));

        // Mapear materiais antigos (via ServicoMaterial) e novos (via ServicoMaterial) por ID do material
        java.util.Map<Long, ServicoMaterial> antigos = new java.util.HashMap<>();
        if (servicoAntigo.getMateriais() != null) {
            for (ServicoMaterial sm : servicoAntigo.getMateriais()) {
                 antigos.put(sm.getMaterial().getId(), sm);
            }
        }
        java.util.Map<Long, ServicoMaterial> novos = new java.util.HashMap<>();
        if (servicoEditado.getMateriais() != null) {
            for (ServicoMaterial sm : servicoEditado.getMateriais()) {
                 novos.put(sm.getMaterial().getId(), sm);
            }
        }

        // 1. Devolver estoque dos removidos (materiais que não estão mais na lista de novos)
        for (Long idAntigo : antigos.keySet()) {
            if (!novos.containsKey(idAntigo)) {
                 Material material = materialService.getRepository().findById(idAntigo)
                         .orElseThrow(() -> new RuntimeException("Material não encontrado"));
                 ServicoMaterial smAntigo = antigos.get(idAntigo);
                 java.math.BigDecimal qtdAntiga = smAntigo.getQuantidade();
                 if (qtdAntiga != null) {
                     material.setQuantidade(material.getQuantidade().add(qtdAntiga));
                     materialService.save(material);
                 }
            }
        }

        // 2. Ajustar diferença de quantidade dos mantidos (materiais que estão em ambos)
        for (Long id : antigos.keySet()) {
            if (novos.containsKey(id)) {
                 Material material = materialService.getRepository().findById(id)
                         .orElseThrow(() -> new RuntimeException("Material não encontrado"));
                 ServicoMaterial smAntigo = antigos.get(id);
                 ServicoMaterial smNovo = novos.get(id);
                 java.math.BigDecimal qtdAntiga = smAntigo.getQuantidade() != null ? smAntigo.getQuantidade() : java.math.BigDecimal.ZERO;
                 java.math.BigDecimal qtdNova = smNovo.getQuantidade() != null ? smNovo.getQuantidade() : java.math.BigDecimal.ZERO;
                 java.math.BigDecimal diferenca = qtdNova.subtract(qtdAntiga);
                 if (diferenca.compareTo(java.math.BigDecimal.ZERO) != 0) {
                     if (diferenca.compareTo(java.math.BigDecimal.ZERO) > 0) {
                         // Vai consumir mais
                         if (material.getQuantidade().compareTo(diferenca) < 0) {
                             throw new RuntimeException("Estoque insuficiente para o material: " + material.getNome());
                         }
                         material.setQuantidade(material.getQuantidade().subtract(diferenca));
                     } else {
                         // Vai devolver
                         material.setQuantidade(material.getQuantidade().add(diferenca.abs()));
                     }
                     materialService.save(material);
                 }
            }
        }

        // 3. Subtrair estoque dos novos (materiais que não estavam na lista antiga)
        for (Long idNovo : novos.keySet()) {
            if (!antigos.containsKey(idNovo)) {
                 Material material = materialService.getRepository().findById(idNovo)
                         .orElseThrow(() -> new RuntimeException("Material não encontrado"));
                 ServicoMaterial smNovo = novos.get(idNovo);
                 java.math.BigDecimal qtdNova = smNovo.getQuantidade();
                 if (qtdNova == null) {
                     throw new RuntimeException("Quantidade não informada para o material: " + material.getNome());
                 }
                 if (material.getQuantidade().compareTo(qtdNova) < 0) {
                     throw new RuntimeException("Estoque insuficiente para o material: " + material.getNome());
                 }
                 material.setQuantidade(material.getQuantidade().subtract(qtdNova));
                 materialService.save(material);
             }
        }

        // Salva o serviço editado (que, por cascade, salva os ServicoMaterial)
        return super.save(servicoEditado);
    }

}
