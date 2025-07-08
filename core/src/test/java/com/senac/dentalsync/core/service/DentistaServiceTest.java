package com.senac.dentalsync.core.service;

import com.senac.dentalsync.core.persistency.model.Dentista;
import com.senac.dentalsync.core.persistency.model.Protetico;
import com.senac.dentalsync.core.persistency.repository.DentistaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.lenient;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
public class DentistaServiceTest {

    @Mock
    private DentistaRepository dentistaRepository;

    @InjectMocks
    private DentistaService dentistaService;

    private Dentista dentistaTeste;

    @BeforeEach
    void setUp() {
        // Configura o dentista de teste
        dentistaTeste = new Dentista();
        dentistaTeste.setId(1L);
        dentistaTeste.setNome("Dr. João Silva Santos");
        dentistaTeste.setEmail("dentista@email.com");
        dentistaTeste.setTelefone("(11) 99999-9999");
        dentistaTeste.setCro("CRO-SP 12345");
        dentistaTeste.setIsActive(true);
    }

    @Test
    void deveSalvarDentistaNovo() {
        // given
        Dentista novoDentista = new Dentista();
        novoDentista.setNome("Dr. João Silva Santos");
        novoDentista.setEmail("dentista@email.com");
        novoDentista.setTelefone("(11) 99999-9999");
        novoDentista.setCro("CRO-SP 12345");

        when(dentistaRepository.findByEmail(novoDentista.getEmail())).thenReturn(Optional.empty());
        when(dentistaRepository.findByTelefone(novoDentista.getTelefone())).thenReturn(Optional.empty());
        when(dentistaRepository.findByCro(novoDentista.getCro())).thenReturn(Optional.empty());
        when(dentistaRepository.save(any(Dentista.class))).thenReturn(dentistaTeste);

        // when
        Dentista dentistaSalvo = dentistaService.save(novoDentista);

        // then
        assertThat(dentistaSalvo).isNotNull();
        assertThat(dentistaSalvo.getId()).isEqualTo(dentistaTeste.getId());
        verify(dentistaRepository, times(1)).save(any(Dentista.class));
    }

    @Test
    void naoDeveSalvarDentistaComNomeComNumeros() {
        // given
        Dentista novoDentista = new Dentista();
        novoDentista.setNome("Dr. João123 Silva");
        novoDentista.setEmail("dentista@email.com");
        novoDentista.setTelefone("(11) 99999-9999");
        novoDentista.setCro("CRO-SP 12345");

        // when/then
        assertThrows(ResponseStatusException.class, () -> {
            dentistaService.save(novoDentista);
        });
    }

    @Test
    void naoDeveSalvarDentistaComCroDuplicado() {
        // given
        Dentista novoDentista = new Dentista();
        novoDentista.setNome("Dr. Maria Silva");
        novoDentista.setEmail("maria@email.com");
        novoDentista.setTelefone("(11) 88888-8888");
        novoDentista.setCro("CRO-SP 12345"); // mesmo CRO do dentistaTeste

        when(dentistaRepository.findByCro("CRO-SP 12345")).thenReturn(Optional.of(dentistaTeste));

        // when/then
        assertThrows(ResponseStatusException.class, () -> {
            dentistaService.save(novoDentista);
        });
    }

    @Test
    void naoDeveSalvarDentistaComEmailDuplicado() {
        // given
        Dentista novoDentista = new Dentista();
        novoDentista.setNome("Dr. Maria Silva");
        novoDentista.setEmail("dentista@email.com"); // mesmo email do dentistaTeste
        novoDentista.setTelefone("(11) 88888-8888");
        novoDentista.setCro("CRO-SP 67890");

        when(dentistaRepository.findByEmail("dentista@email.com")).thenReturn(Optional.of(dentistaTeste));

        // when/then
        assertThrows(ResponseStatusException.class, () -> {
            dentistaService.save(novoDentista);
        });
    }

    @Test
    void naoDeveSalvarDentistaComTelefoneDuplicado() {
        // given
        Dentista novoDentista = new Dentista();
        novoDentista.setNome("Dr. Maria Silva");
        novoDentista.setEmail("maria@email.com");
        novoDentista.setTelefone("(11) 99999-9999"); // mesmo telefone do dentistaTeste
        novoDentista.setCro("CRO-SP 67890");

        when(dentistaRepository.findByEmail("maria@email.com")).thenReturn(Optional.empty());
        when(dentistaRepository.findByCro("CRO-SP 67890")).thenReturn(Optional.empty());
        when(dentistaRepository.findByTelefone("(11) 99999-9999")).thenReturn(Optional.of(dentistaTeste));

        // when/then
        assertThrows(ResponseStatusException.class, () -> {
            dentistaService.save(novoDentista);
        });
    }

    @Test
    void deveBuscarDentistaPorId() {
        // given
        when(dentistaRepository.findById(1L)).thenReturn(Optional.of(dentistaTeste));

        // when
        Optional<Dentista> dentistaEncontrado = dentistaService.findById(1L);

        // then
        assertThat(dentistaEncontrado).isPresent();
        assertThat(dentistaEncontrado.get().getNome()).isEqualTo(dentistaTeste.getNome());
        verify(dentistaRepository, times(1)).findById(1L);
    }

    @Test
    void deveBuscarDentistaPorEmail() {
        // given
        when(dentistaRepository.findByEmail("dentista@email.com")).thenReturn(Optional.of(dentistaTeste));

        // when
        Optional<Dentista> dentistaEncontrado = dentistaService.findByEmail("dentista@email.com");

        // then
        assertThat(dentistaEncontrado).isPresent();
        assertThat(dentistaEncontrado.get().getEmail()).isEqualTo("dentista@email.com");
        verify(dentistaRepository, times(1)).findByEmail("dentista@email.com");
    }

    @Test
    void deveBuscarDentistaPorCro() {
        // given
        when(dentistaRepository.findByCro("CRO-SP 12345")).thenReturn(Optional.of(dentistaTeste));

        // when
        Optional<Dentista> dentistaEncontrado = dentistaService.findByCro("CRO-SP 12345");

        // then
        assertThat(dentistaEncontrado).isPresent();
        assertThat(dentistaEncontrado.get().getCro()).isEqualTo("CRO-SP 12345");
        verify(dentistaRepository, times(1)).findByCro("CRO-SP 12345");
    }

    @Test
    void deveBuscarDentistaPorTelefone() {
        // given
        when(dentistaRepository.findByTelefone("(11) 99999-9999")).thenReturn(Optional.of(dentistaTeste));

        // when
        Optional<Dentista> dentistaEncontrado = dentistaService.findByTelefone("(11) 99999-9999");

        // then
        assertThat(dentistaEncontrado).isPresent();
        assertThat(dentistaEncontrado.get().getTelefone()).isEqualTo("(11) 99999-9999");
        verify(dentistaRepository, times(1)).findByTelefone("(11) 99999-9999");
    }

    @Test
    void deveBuscarDentistasPorCroContaining() {
        // given
        Dentista outroDentista = new Dentista();
        outroDentista.setId(2L);
        outroDentista.setCro("CRO-SP 67890");
        
        when(dentistaRepository.findByCroContaining("CRO-SP")).thenReturn(Arrays.asList(dentistaTeste, outroDentista));

        // when
        List<Dentista> dentistas = dentistaService.findByCroContaining("CRO-SP");

        // then
        assertThat(dentistas).hasSize(2);
        verify(dentistaRepository, times(1)).findByCroContaining("CRO-SP");
    }

    @Test
    void deveListarTodosDentistas() {
        // given
        Dentista outroDentista = new Dentista();
        outroDentista.setId(2L);
        outroDentista.setNome("Dr. Maria Silva Santos");
        outroDentista.setEmail("maria@email.com");
        outroDentista.setTelefone("(11) 98888-8888");
        outroDentista.setCro("CRO-SP 67890");
        outroDentista.setIsActive(true);

        when(dentistaRepository.findAll()).thenReturn(Arrays.asList(dentistaTeste, outroDentista));

        // when
        List<Dentista> dentistas = dentistaService.findAll();

        // then
        assertThat(dentistas).hasSize(2);
        verify(dentistaRepository, times(1)).findAll();
    }

    @Test
    void deveAtualizarStatusDentista() {
        // given
        when(dentistaRepository.findById(1L)).thenReturn(Optional.of(dentistaTeste));
        when(dentistaRepository.save(any(Dentista.class))).thenReturn(dentistaTeste);

        // when
        Dentista dentistaAtualizado = dentistaService.updateStatus(1L, false);

        // then
        assertThat(dentistaAtualizado).isNotNull();
        verify(dentistaRepository, times(1)).findById(1L);
        verify(dentistaRepository, times(1)).save(any(Dentista.class));
    }

    @Test
    void naoDeveAtualizarStatusDentistaInexistente() {
        // given
        when(dentistaRepository.findById(999L)).thenReturn(Optional.empty());

        // when/then
        assertThrows(RuntimeException.class, () -> {
            dentistaService.updateStatus(999L, false);
        });
    }

    @Test
    void deveDeletarDentista() {
        // when
        dentistaService.delete(1L);

        // then
        verify(dentistaRepository, times(1)).deleteById(1L);
    }

    @Test
    void deveAtualizarDentistaExistente() {
        // given
        dentistaTeste.setId(1L); // Simula dentista existente
        String novoNome = "Dr. João Silva Santos Atualizado";
        dentistaTeste.setNome(novoNome);
        
        when(dentistaRepository.findByEmail(dentistaTeste.getEmail())).thenReturn(Optional.of(dentistaTeste));
        when(dentistaRepository.findByTelefone(dentistaTeste.getTelefone())).thenReturn(Optional.of(dentistaTeste));
        when(dentistaRepository.findByCro(dentistaTeste.getCro())).thenReturn(Optional.of(dentistaTeste));
        when(dentistaRepository.save(any(Dentista.class))).thenReturn(dentistaTeste);

        // when
        Dentista dentistaAtualizado = dentistaService.save(dentistaTeste);

        // then
        assertThat(dentistaAtualizado.getNome()).isEqualTo(novoNome);
        verify(dentistaRepository, times(1)).save(any(Dentista.class));
    }

    @Test
    void devePermitirAtualizarDentistaMesmoComEmailIgual() {
        // given - Simula atualização do mesmo dentista
        dentistaTeste.setId(1L);
        String novoNome = "Dr. João Silva Santos Editado";
        dentistaTeste.setNome(novoNome);
        
        // Retorna o mesmo dentista para todas as validações (simula que é o mesmo registro)
        when(dentistaRepository.findByEmail(dentistaTeste.getEmail())).thenReturn(Optional.of(dentistaTeste));
        when(dentistaRepository.findByTelefone(dentistaTeste.getTelefone())).thenReturn(Optional.of(dentistaTeste));
        when(dentistaRepository.findByCro(dentistaTeste.getCro())).thenReturn(Optional.of(dentistaTeste));
        when(dentistaRepository.save(any(Dentista.class))).thenReturn(dentistaTeste);

        // when
        Dentista dentistaAtualizado = dentistaService.save(dentistaTeste);

        // then
        assertThat(dentistaAtualizado).isNotNull();
        assertThat(dentistaAtualizado.getNome()).isEqualTo(novoNome);
        verify(dentistaRepository, times(1)).save(any(Dentista.class));
    }

    @Test
    void deveLancarExcecaoQuandoOcorrerErroNoSave() {
        // given
        Dentista novoDentista = new Dentista();
        novoDentista.setNome("Dr. João Silva Santos");
        novoDentista.setEmail("dentista@email.com");
        novoDentista.setTelefone("(11) 99999-9999");
        novoDentista.setCro("CRO-SP 12345");

        when(dentistaRepository.findByEmail(novoDentista.getEmail())).thenReturn(Optional.empty());
        when(dentistaRepository.findByTelefone(novoDentista.getTelefone())).thenReturn(Optional.empty());
        when(dentistaRepository.findByCro(novoDentista.getCro())).thenReturn(Optional.empty());
        
        // Simula erro no super.save()
        when(dentistaRepository.save(any(Dentista.class))).thenThrow(new RuntimeException("Erro no banco"));

        // when/then
        assertThrows(ResponseStatusException.class, () -> {
            dentistaService.save(novoDentista);
        });
    }

    @Test
    void deveBuscarDentistasComCroVazio() {
        // given
        when(dentistaRepository.findByCroContaining("")).thenReturn(Arrays.asList());

        // when
        List<Dentista> dentistas = dentistaService.findByCroContaining("");

        // then
        assertThat(dentistas).isEmpty();
        verify(dentistaRepository, times(1)).findByCroContaining("");
    }

    @Test
    void deveRetornarVazioQuandoNaoEncontrarPorEmail() {
        // given
        when(dentistaRepository.findByEmail("inexistente@email.com")).thenReturn(Optional.empty());

        // when
        Optional<Dentista> dentistaEncontrado = dentistaService.findByEmail("inexistente@email.com");

        // then
        assertThat(dentistaEncontrado).isEmpty();
        verify(dentistaRepository, times(1)).findByEmail("inexistente@email.com");
    }

    @Test
    void deveRetornarVazioQuandoNaoEncontrarPorCro() {
        // given
        when(dentistaRepository.findByCro("CRO-SP 99999")).thenReturn(Optional.empty());

        // when
        Optional<Dentista> dentistaEncontrado = dentistaService.findByCro("CRO-SP 99999");

        // then
        assertThat(dentistaEncontrado).isEmpty();
        verify(dentistaRepository, times(1)).findByCro("CRO-SP 99999");
    }

    @Test
    void deveRetornarVazioQuandoNaoEncontrarPorTelefone() {
        // given
        when(dentistaRepository.findByTelefone("(11) 00000-0000")).thenReturn(Optional.empty());

        // when
        Optional<Dentista> dentistaEncontrado = dentistaService.findByTelefone("(11) 00000-0000");

        // then
        assertThat(dentistaEncontrado).isEmpty();
        verify(dentistaRepository, times(1)).findByTelefone("(11) 00000-0000");
    }
} 