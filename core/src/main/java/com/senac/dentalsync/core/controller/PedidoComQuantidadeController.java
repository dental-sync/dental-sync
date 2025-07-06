package com.senac.dentalsync.core.controller;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.senac.dentalsync.core.dto.PedidoDTO;
import com.senac.dentalsync.core.persistency.model.Clinica;
import com.senac.dentalsync.core.persistency.model.Dentista;
import com.senac.dentalsync.core.persistency.model.Paciente;
import com.senac.dentalsync.core.persistency.model.Pedido;
import com.senac.dentalsync.core.persistency.model.PedidoServico;
import com.senac.dentalsync.core.persistency.model.Protetico;
import com.senac.dentalsync.core.persistency.model.Servico;
import com.senac.dentalsync.core.persistency.repository.PedidoServicoRepository;
import com.senac.dentalsync.core.service.ClinicaService;
import com.senac.dentalsync.core.service.DentistaService;
import com.senac.dentalsync.core.service.PacienteService;
import com.senac.dentalsync.core.service.PedidoService;
import com.senac.dentalsync.core.service.ProteticoService;
import com.senac.dentalsync.core.service.ServicoService;

@RestController
@RequestMapping("/pedidos-com-quantidade")
public class PedidoComQuantidadeController {

    @Autowired
    private PedidoService pedidoService;
    
    @Autowired
    private PacienteService pacienteService;
    
    @Autowired
    private DentistaService dentistaService;
    
    @Autowired
    private ClinicaService clinicaService;
    
    @Autowired
    private ProteticoService proteticoService;
    
    @Autowired
    private ServicoService servicoService;
    
    @Autowired
    private PedidoServicoRepository pedidoServicoRepository;

    @PostMapping
    @Transactional
    public ResponseEntity<?> criarPedidoComQuantidade(@RequestBody PedidoDTO pedidoDTO) {
        try {
            // Criar o pedido principal
            Pedido pedido = new Pedido();
            
            // Setar os dados básicos
            if (pedidoDTO.getCliente() != null) {
                Paciente cliente = pacienteService.findById(pedidoDTO.getCliente().getId())
                    .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));
                pedido.setCliente(cliente);
            }
            
            if (pedidoDTO.getDentista() != null) {
                Dentista dentista = dentistaService.findById(pedidoDTO.getDentista().getId())
                    .orElseThrow(() -> new RuntimeException("Dentista não encontrado"));
                pedido.setDentista(dentista);
            }
            
            if (pedidoDTO.getClinica() != null) {
                Clinica clinica = clinicaService.findById(pedidoDTO.getClinica().getId())
                    .orElseThrow(() -> new RuntimeException("Clínica não encontrada"));
                pedido.setClinica(clinica);
            }
            
            if (pedidoDTO.getProtetico() != null) {
                Protetico protetico = proteticoService.findById(pedidoDTO.getProtetico().getId())
                    .orElseThrow(() -> new RuntimeException("Protético não encontrado"));
                pedido.setProtetico(protetico);
            }
            
            pedido.setDataEntrega(pedidoDTO.getDataEntrega());
            pedido.setPrioridade(pedidoDTO.getPrioridade());
            pedido.setStatus(pedidoDTO.getStatus() != null ? pedidoDTO.getStatus() : Pedido.Status.PENDENTE);
            pedido.setOdontograma(pedidoDTO.getOdontograma());
            pedido.setObservacao(pedidoDTO.getObservacao());
            
            // Preparar lista de serviços únicos para o relacionamento ManyToMany existente
            List<Servico> servicos = new ArrayList<>();
            for (PedidoDTO.ServicoComQuantidadeDTO servicoDTO : pedidoDTO.getServicos()) {
                Servico servico = servicoService.findById(servicoDTO.getId())
                    .orElseThrow(() -> new RuntimeException("Serviço não encontrado"));
                // Adicionar apenas uma vez cada serviço único
                if (!servicos.contains(servico)) {
                    servicos.add(servico);
                }
            }
            pedido.setServicos(servicos);
            
            // Salvar o pedido
            pedido = pedidoService.save(pedido);
            
            // Salvar as quantidades originais na tabela pedido_servico
            for (PedidoDTO.ServicoComQuantidadeDTO servicoDTO : pedidoDTO.getServicos()) {
                Servico servico = servicoService.findById(servicoDTO.getId())
                    .orElseThrow(() -> new RuntimeException("Serviço não encontrado"));
                
                // Validar quantidade do serviço
                if (servicoDTO.getQuantidade() == null || servicoDTO.getQuantidade() <= 0) {
                    throw new RuntimeException("Quantidade do serviço deve ser maior que zero: " + servico.getNome());
                }
                
                PedidoServico pedidoServico = new PedidoServico(pedido, servico, new BigDecimal(servicoDTO.getQuantidade()));
                pedidoServicoRepository.save(pedidoServico);
            }
            
            // AGORA descontar o estoque usando as quantidades corretas
            pedidoService.descontarEstoqueNovoPedido(pedido.getId(), pedidoDTO.getServicos());
            
            return ResponseEntity.ok(pedido);
        } catch (jakarta.validation.ConstraintViolationException e) {
            System.err.println("Erro de validação: " + e.getMessage());
            return ResponseEntity.badRequest().body(null);
        } catch (Exception e) {
            System.err.println("Erro ao criar pedido com quantidade: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(null);
        }
    }
    
    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<?> atualizarPedidoComQuantidade(@PathVariable Long id, @RequestBody PedidoDTO pedidoDTO) {
        try {
            Pedido pedido = pedidoService.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));
            
            // PRIMEIRO ajustar estoque baseado nas diferenças
            pedidoService.ajustarEstoquePedidoEditado(id, pedidoDTO.getServicos());
            
            // Atualizar dados básicos
            if (pedidoDTO.getCliente() != null) {
                Paciente cliente = pacienteService.findById(pedidoDTO.getCliente().getId())
                    .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));
                pedido.setCliente(cliente);
            }
            
            if (pedidoDTO.getDentista() != null) {
                Dentista dentista = dentistaService.findById(pedidoDTO.getDentista().getId())
                    .orElseThrow(() -> new RuntimeException("Dentista não encontrado"));
                pedido.setDentista(dentista);
            }
            
            if (pedidoDTO.getClinica() != null) {
                Clinica clinica = clinicaService.findById(pedidoDTO.getClinica().getId())
                    .orElseThrow(() -> new RuntimeException("Clínica não encontrada"));
                pedido.setClinica(clinica);
            }
            
            if (pedidoDTO.getProtetico() != null) {
                Protetico protetico = proteticoService.findById(pedidoDTO.getProtetico().getId())
                    .orElseThrow(() -> new RuntimeException("Protético não encontrado"));
                pedido.setProtetico(protetico);
            }
            
            pedido.setDataEntrega(pedidoDTO.getDataEntrega());
            pedido.setPrioridade(pedidoDTO.getPrioridade());
            pedido.setStatus(pedidoDTO.getStatus());
            pedido.setOdontograma(pedidoDTO.getOdontograma());
            pedido.setObservacao(pedidoDTO.getObservacao());
            
            // Atualizar serviços únicos
            List<Servico> servicos = new ArrayList<>();
            for (PedidoDTO.ServicoComQuantidadeDTO servicoDTO : pedidoDTO.getServicos()) {
                Servico servico = servicoService.findById(servicoDTO.getId())
                    .orElseThrow(() -> new RuntimeException("Serviço não encontrado"));
                if (!servicos.contains(servico)) {
                    servicos.add(servico);
                }
            }
            pedido.setServicos(servicos);
            
            // Remover quantidades antigas e adicionar novas
            pedidoServicoRepository.deleteByPedidoId(id);
            for (PedidoDTO.ServicoComQuantidadeDTO servicoDTO : pedidoDTO.getServicos()) {
                Servico servico = servicoService.findById(servicoDTO.getId())
                    .orElseThrow(() -> new RuntimeException("Serviço não encontrado"));
                
                // Validar quantidade do serviço
                if (servicoDTO.getQuantidade() == null || servicoDTO.getQuantidade() <= 0) {
                    throw new RuntimeException("Quantidade do serviço deve ser maior que zero: " + servico.getNome());
                }
                
                PedidoServico pedidoServico = new PedidoServico(pedido, servico, new BigDecimal(servicoDTO.getQuantidade()));
                pedidoServicoRepository.save(pedidoServico);
            }
            
            // Salvar pedido atualizado
            pedido = pedidoService.save(pedido);
            
            return ResponseEntity.ok(pedido);
        } catch (jakarta.validation.ConstraintViolationException e) {
            System.err.println("Erro de validação na atualização: " + e.getMessage());
            return ResponseEntity.badRequest().body(null);
        } catch (Exception e) {
            System.err.println("Erro ao atualizar pedido com quantidade: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(null);
        }
    }
}