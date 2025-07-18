package com.senac.dentalsync.core.model;

import com.senac.dentalsync.core.persistency.model.*;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class PedidoTest {

    private Validator validator;
    private Pedido pedido;
    private Paciente cliente;
    private Dentista dentista;
    private Protetico protetico;
    private List<Servico> servicos;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
        pedido = new Pedido();
        
        // Configurando objetos necessários
        cliente = new Paciente();
        cliente.setNome("Cliente Teste");
        
        dentista = new Dentista();
        dentista.setNome("Dentista Teste");
        
        protetico = new Protetico();
        protetico.setNome("Protetico Teste");
        
        servicos = new ArrayList<>();
        Servico servico = new Servico();
        servico.setNome("Serviço Teste");
        servicos.add(servico);
    }

    
    @Test
    void deveAtualizarObservacaoDoPedido() {        
        configurarPedidoValido();
        pedido.setObservacao("Observação original");
        
        pedido.setObservacao("Prótese Total Superior Atualizada");
        
        var violations = validator.validate(pedido);
        assertTrue(violations.isEmpty());
        assertEquals("Prótese Total Superior Atualizada", pedido.getObservacao());
    }

    @Test
    void deveAtualizarStatusDoPedido() {
        configurarPedidoValido();
        pedido.setStatus(Pedido.Status.PENDENTE);
        
        pedido.setStatus(Pedido.Status.EM_ANDAMENTO);
        
        var violations = validator.validate(pedido);
        assertTrue(violations.isEmpty());
        assertEquals(Pedido.Status.EM_ANDAMENTO, pedido.getStatus());
    }

    @Test
    void deveAtualizarPrioridadeDoPedido() {
        configurarPedidoValido();
        pedido.setPrioridade(Pedido.Prioridade.BAIXA);
        
        pedido.setPrioridade(Pedido.Prioridade.ALTA);
        
        var violations = validator.validate(pedido);
        assertTrue(violations.isEmpty());
        assertEquals(Pedido.Prioridade.ALTA, pedido.getPrioridade());
    }

    @Test
    void deveAtualizarDataEntregaDoPedido() {
        configurarPedidoValido();
        LocalDate dataAnterior = LocalDate.now().plusDays(5);
        pedido.setDataEntrega(dataAnterior);
        
        LocalDate novaData = LocalDate.now().plusDays(10);
        pedido.setDataEntrega(novaData);
        
        var violations = validator.validate(pedido);
        assertTrue(violations.isEmpty());
        assertEquals(novaData, pedido.getDataEntrega());
    }

    @Test
    void deveManterValidacaoAoAtualizarPedidoComDadosInvalidos() {
        configurarPedidoValido();
        
        pedido.setDataEntrega(LocalDate.now().minusDays(1));
        pedido.setStatus(null);
        
        var violations = validator.validate(pedido);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("data de entrega deve ser uma data futura")));
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("status é obrigatório")));
    }

    // ========== TESTES DE CRIAÇÃO DE PEDIDO ==========

 /*    @Test
    void deveCriarPedidoValido() {     
        configurarPedidoValido();
        
        var violations = validator.validate(pedido);
      
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveRetornarErrosQuandoCamposObrigatoriosAusentes() {
        
        var violations = validator.validate(pedido);
        
        assertEquals(7, violations.size());
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("cliente é obrigatório")));
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("dentista é obrigatório")));
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("protético é obrigatório")));
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("serviço")));
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("data de entrega é obrigatória")));
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("prioridade é obrigatória")));
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("status é obrigatório")));
    }

    @Test
    void deveAceitarCamposBaseEntityPreenchidos() {        
        configurarPedidoValido();
        
        Protetico protetico = new Protetico();
        protetico.setId(1L);
        protetico.setNome("Admin");
        
        pedido.setId(1L);
        pedido.setCreatedAt(LocalDateTime.now());
        pedido.setUpdatedAt(LocalDateTime.now());
        pedido.setIsActive(true);
        pedido.setUpdatedBy(protetico);

        var violations = validator.validate(pedido);
        
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveValidarCamposOpcionais() {       
        configurarPedidoValido();
        
        String odontograma = "Odontograma de teste";
        String observacao = "Observação de teste";
        
        pedido.setOdontograma(odontograma);
        pedido.setObservacao(observacao);
       
        var violations = validator.validate(pedido);
        
        assertEquals(odontograma, pedido.getOdontograma());
        assertEquals(observacao, pedido.getObservacao());
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveRetornarErroQuandoDataEntregaNoPasado() {       
        configurarPedidoValido();
        pedido.setDataEntrega(LocalDate.now().minusDays(1));         
        
        var violations = validator.validate(pedido);
        
        // Assert
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("data de entrega deve ser uma data futura")));
    }

    // ========== OUTROS TESTES DE VALIDAÇÃO ==========

    @Test
    void deveAceitarCamposBaseEntityNulos() {
        pedido.setId(null);
        pedido.setCreatedAt(null);
        pedido.setUpdatedAt(null);
        pedido.setIsActive(null);
        pedido.setCreatedBy(null);
        pedido.setUpdatedBy(null);

        configurarPedidoValido(); // Necessário para evitar violações dos campos obrigatórios
        var violations = validator.validate(pedido);
        assertTrue(violations.isEmpty());
    }

    @Test
    void deveValidarEnumPrioridade() {
        configurarPedidoValido();
        
        pedido.setPrioridade(Pedido.Prioridade.BAIXA);
        assertEquals(Pedido.Prioridade.BAIXA, pedido.getPrioridade());
        
        pedido.setPrioridade(Pedido.Prioridade.MEDIA);
        assertEquals(Pedido.Prioridade.MEDIA, pedido.getPrioridade());
        
        pedido.setPrioridade(Pedido.Prioridade.ALTA);
        assertEquals(Pedido.Prioridade.ALTA, pedido.getPrioridade());
        
        pedido.setPrioridade(Pedido.Prioridade.ALTA);
        assertEquals(Pedido.Prioridade.ALTA, pedido.getPrioridade());
    }

    @Test
    void deveValidarEnumStatus() {
        configurarPedidoValido();
        
        pedido.setStatus(Pedido.Status.PENDENTE);
        assertEquals(Pedido.Status.PENDENTE, pedido.getStatus());
        
        pedido.setStatus(Pedido.Status.EM_ANDAMENTO);
        assertEquals(Pedido.Status.EM_ANDAMENTO, pedido.getStatus());
        
        pedido.setStatus(Pedido.Status.CONCLUIDO);
        assertEquals(Pedido.Status.CONCLUIDO, pedido.getStatus());
        
        pedido.setStatus(Pedido.Status.CANCELADO);
        assertEquals(Pedido.Status.CANCELADO, pedido.getStatus());
    }

    @Test
    void deveValidarRelacionamentos() {
        configurarPedidoValido();
        
        assertNotNull(pedido.getCliente());
        assertNotNull(pedido.getDentista());
        assertNotNull(pedido.getProtetico());
        assertFalse(pedido.getServicos().isEmpty());
        
        assertEquals(cliente, pedido.getCliente());
        assertEquals(dentista, pedido.getDentista());
        assertEquals(protetico, pedido.getProtetico());
        assertEquals(servicos, pedido.getServicos());
    }

    @Test
    void deveRetornarErroQuandoServicoNulo() {
        configurarPedidoValido();
        pedido.setServicos(null);
        
        var violations = validator.validate(pedido);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("serviço")));
    }

    @Test
    void deveValidarTamanhoMaximoCamposTexto() {
        configurarPedidoValido();
        
        String textoLongo = "a".repeat(10000); // Texto longo para campos TEXT
        pedido.setOdontograma(textoLongo);
        pedido.setObservacao(textoLongo);
        
        var violations = validator.validate(pedido);
        assertTrue(violations.isEmpty(), "Campos TEXT devem aceitar textos longos");
    }
 */
    private void configurarPedidoValido() {
        pedido.setCliente(cliente);
        pedido.setDentista(dentista);
        pedido.setProtetico(protetico);
        pedido.setServicos(servicos);
        pedido.setDataEntrega(LocalDate.now().plusDays(7));
        pedido.setPrioridade(Pedido.Prioridade.MEDIA);
        pedido.setStatus(Pedido.Status.PENDENTE);
    } 
} 