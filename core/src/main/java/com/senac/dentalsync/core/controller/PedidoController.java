package com.senac.dentalsync.core.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.senac.dentalsync.core.persistency.model.Dentista;
import com.senac.dentalsync.core.persistency.model.Paciente;
import com.senac.dentalsync.core.persistency.model.Pedido;
import com.senac.dentalsync.core.persistency.model.Protetico;
import com.senac.dentalsync.core.service.BaseService;
import com.senac.dentalsync.core.service.DentistaService;
import com.senac.dentalsync.core.service.PacienteService;
import com.senac.dentalsync.core.service.PedidoService;
import com.senac.dentalsync.core.service.ProteticoService;
import com.senac.dentalsync.core.dto.AtualizarStatusPedidoDTO;

@RestController
@RequestMapping("/pedidos")
public class PedidoController extends BaseController<Pedido, Long> {

    @Autowired
    private PedidoService pedidoService;
    
    @Autowired
    private DentistaService dentistaService;
    
    @Autowired
    private PacienteService pacienteService;
    
    @Autowired
    private ProteticoService proteticoService;

    @Override
    protected BaseService<Pedido, Long> getService() {
        return pedidoService;
    }
    
    @GetMapping("/dentista/{id}")
    public ResponseEntity<List<Pedido>> findByDentista(@PathVariable Long id) {
        return dentistaService.findById(id)
                .map(dentista -> ResponseEntity.ok(pedidoService.findByDentista(dentista)))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/cliente/{id}")
    public ResponseEntity<List<Pedido>> findByCliente(@PathVariable Long id) {
        return pacienteService.findById(id)
                .map(cliente -> ResponseEntity.ok(pedidoService.findByCliente(cliente)))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/protetico/{id}")
    public ResponseEntity<List<Pedido>> findByProtetico(@PathVariable Long id) {
        return proteticoService.findById(id)
                .map(protetico -> ResponseEntity.ok(pedidoService.findByProtetico(protetico)))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/data-entrega")
    public ResponseEntity<List<Pedido>> findByDataEntrega(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataEntrega) {
        return ResponseEntity.ok(pedidoService.findByDataEntrega(dataEntrega));
    }
    
    @GetMapping("/prioridade/{prioridade}")
    public ResponseEntity<List<Pedido>> findByPrioridade(@PathVariable Pedido.Prioridade prioridade) {
        return ResponseEntity.ok(pedidoService.findByPrioridade(prioridade));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> atualizarStatus(@PathVariable Long id, @RequestBody AtualizarStatusPedidoDTO dto) {
        return getService().findById(id)
            .map(pedido -> {
                pedido.setStatus(dto.getStatus());
                getService().save(pedido);
                return ResponseEntity.ok().build();
            })
            .orElse(ResponseEntity.notFound().build());
    }
} 