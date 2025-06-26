package com.senac.dentalsync.core.service;

import com.senac.dentalsync.core.persistency.model.Paciente;
import com.senac.dentalsync.core.persistency.model.Protetico;
import com.senac.dentalsync.core.persistency.repository.PacienteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
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
public class PacienteServiceTest {

    @Mock
    private PacienteRepository pacienteRepository;

    @InjectMocks
    private PacienteService pacienteService;

    private Paciente pacienteTeste;

    @BeforeEach
    void setUp() {
        // Configura o paciente de teste
        pacienteTeste = new Paciente();
        pacienteTeste.setId(1L);
        pacienteTeste.setNome("João da Silva Santos");
        pacienteTeste.setEmail("joao@email.com");
        pacienteTeste.setTelefone("(11) 99999-9999");
        pacienteTeste.setDataNascimento(LocalDate.of(1990, 1, 1));
        pacienteTeste.setIsActive(true);
    }

    @Test
    void deveSalvarPacienteNovo() {
        // given
        Paciente novoPaciente = new Paciente();
        novoPaciente.setNome("João da Silva Santos");
        novoPaciente.setEmail("joao@email.com");
        novoPaciente.setTelefone("(11) 99999-9999");
        novoPaciente.setDataNascimento(LocalDate.of(1990, 1, 1));

        when(pacienteRepository.findByEmail(novoPaciente.getEmail())).thenReturn(Optional.empty());
        when(pacienteRepository.findByTelefone(novoPaciente.getTelefone())).thenReturn(Optional.empty());
        when(pacienteRepository.save(any(Paciente.class))).thenReturn(pacienteTeste);

        // when
        Paciente pacienteSalvo = pacienteService.save(novoPaciente);

        // then
        assertThat(pacienteSalvo).isNotNull();
        assertThat(pacienteSalvo.getId()).isEqualTo(pacienteTeste.getId());
        verify(pacienteRepository, times(1)).save(any(Paciente.class));
    }

    @Test
    void naoDeveSalvarPacienteComEmailDuplicado() {
        // given
        Paciente novoPaciente = new Paciente();
        novoPaciente.setNome("Maria Silva");
        novoPaciente.setEmail("joao@email.com"); // mesmo email do pacienteTeste
        novoPaciente.setTelefone("(11) 88888-8888");
        novoPaciente.setDataNascimento(LocalDate.of(1995, 5, 5));

        when(pacienteRepository.findByEmail("joao@email.com")).thenReturn(Optional.of(pacienteTeste));

        // when/then
        assertThrows(ResponseStatusException.class, () -> {
            pacienteService.save(novoPaciente);
        });
    }

    @Test
    void deveBuscarPacientePorId() {
        // given
        when(pacienteRepository.findById(1L)).thenReturn(Optional.of(pacienteTeste));

        // when
        Optional<Paciente> pacienteEncontrado = pacienteService.findById(1L);

        // then
        assertThat(pacienteEncontrado).isPresent();
        assertThat(pacienteEncontrado.get().getNome()).isEqualTo(pacienteTeste.getNome());
        verify(pacienteRepository, times(1)).findById(1L);
    }

    @Test
    void deveListarTodosPacientes() {
        // given
        Paciente outroPaciente = new Paciente();
        outroPaciente.setId(2L);
        outroPaciente.setNome("Maria Silva Santos");
        outroPaciente.setEmail("maria@email.com");
        outroPaciente.setTelefone("(11) 98888-8888");
        outroPaciente.setDataNascimento(LocalDate.of(1995, 5, 5));
        outroPaciente.setIsActive(true);

        when(pacienteRepository.findAll()).thenReturn(Arrays.asList(pacienteTeste, outroPaciente));

        // when
        List<Paciente> pacientes = pacienteService.findAll();

        // then
        assertThat(pacientes).hasSize(2);
        verify(pacienteRepository, times(1)).findAll();
    }

    @Test
    void deveAtualizarPaciente() {
        // given
        String novoNome = "João da Silva Santos Atualizado";
        Paciente pacienteAtual = new Paciente();
        pacienteAtual.setId(1L);
        pacienteAtual.setNome(novoNome);
        pacienteAtual.setEmail("joao@email.com");
        pacienteAtual.setTelefone("(11) 99999-9999");
        
        when(pacienteRepository.save(any(Paciente.class))).thenReturn(pacienteAtual);

        // when
        Paciente pacienteAtualizado = pacienteService.save(pacienteAtual);

        // then
        assertThat(pacienteAtualizado.getNome()).isEqualTo(novoNome);
        verify(pacienteRepository, times(1)).save(any(Paciente.class));
    }

    @Test
    void deveDeletarPacienteInativo() {
        // given
        pacienteTeste.setIsActive(false);
        when(pacienteRepository.findById(1L)).thenReturn(Optional.of(pacienteTeste));

        // when
        pacienteService.deletePaciente(1L);

        // then
        verify(pacienteRepository, times(1)).deleteById(1L);
    }

    @Test
    void naoDeveDeletarPacienteAtivo() {
        // given
        pacienteTeste.setIsActive(true);
        when(pacienteRepository.findById(1L)).thenReturn(Optional.of(pacienteTeste));

        // when/then
        assertThrows(ResponseStatusException.class, () -> {
            pacienteService.deletePaciente(1L);
        });
    }

    @Test
    void deveBuscarPacientePorEmail() {
        // given
        when(pacienteRepository.findByEmail("joao@email.com")).thenReturn(Optional.of(pacienteTeste));

        // when
        Optional<Paciente> pacienteEncontrado = pacienteService.findByEmail("joao@email.com");

        // then
        assertThat(pacienteEncontrado).isPresent();
        assertThat(pacienteEncontrado.get().getEmail()).isEqualTo("joao@email.com");
        verify(pacienteRepository, times(1)).findByEmail("joao@email.com");
    }

    @Test
    void deveBuscarPacientePorNome() {
        // given
        when(pacienteRepository.findByNome("João da Silva Santos")).thenReturn(Optional.of(pacienteTeste));

        // when
        Optional<Paciente> pacienteEncontrado = pacienteService.findByNome("João da Silva Santos");

        // then
        assertThat(pacienteEncontrado).isPresent();
        assertThat(pacienteEncontrado.get().getNome()).isEqualTo("João da Silva Santos");
        verify(pacienteRepository, times(1)).findByNome("João da Silva Santos");
    }

    @Test
    void deveBuscarPacientePorTelefone() {
        // given
        when(pacienteRepository.findByTelefone("(11) 99999-9999")).thenReturn(Optional.of(pacienteTeste));

        // when
        Optional<Paciente> pacienteEncontrado = pacienteService.findByTelefone("(11) 99999-9999");

        // then
        assertThat(pacienteEncontrado).isPresent();
        assertThat(pacienteEncontrado.get().getTelefone()).isEqualTo("(11) 99999-9999");
        verify(pacienteRepository, times(1)).findByTelefone("(11) 99999-9999");
    }

    @Test
    void naoDeveSalvarPacienteComTelefoneDuplicado() {
        // given
        Paciente novoPaciente = new Paciente();
        novoPaciente.setNome("Maria Silva");
        novoPaciente.setEmail("maria@email.com");
        novoPaciente.setTelefone("(11) 99999-9999"); // mesmo telefone do pacienteTeste
        novoPaciente.setDataNascimento(LocalDate.of(1995, 5, 5));

        when(pacienteRepository.findByEmail("maria@email.com")).thenReturn(Optional.empty());
        when(pacienteRepository.findByTelefone("(11) 99999-9999")).thenReturn(Optional.of(pacienteTeste));

        // when/then
        assertThrows(ResponseStatusException.class, () -> {
            pacienteService.save(novoPaciente);
        });
    }

    @Test
    void deveAtualizarStatusPaciente() {
        // given
        when(pacienteRepository.findById(1L)).thenReturn(Optional.of(pacienteTeste));
        when(pacienteRepository.save(any(Paciente.class))).thenReturn(pacienteTeste);

        // when
        Paciente pacienteAtualizado = pacienteService.updateStatus(1L, false);

        // then
        assertThat(pacienteAtualizado).isNotNull();
        verify(pacienteRepository, times(1)).findById(1L);
        verify(pacienteRepository, times(1)).save(any(Paciente.class));
    }

    @Test
    void naoDeveAtualizarStatusPacienteInexistente() {
        // given
        when(pacienteRepository.findById(999L)).thenReturn(Optional.empty());

        // when/then
        assertThrows(ResponseStatusException.class, () -> {
            pacienteService.updateStatus(999L, false);
        });
    }

    @Test
    void naoDeveDeletarPacienteInexistente() {
        // given
        when(pacienteRepository.findById(999L)).thenReturn(Optional.empty());

        // when/then
        assertThrows(ResponseStatusException.class, () -> {
            pacienteService.deletePaciente(999L);
        });
    }

    @Test
    void devePermitirAtualizarPacienteMesmoComEmailIgual() {
        // given - Simula atualização do mesmo paciente
        pacienteTeste.setId(1L);
        String novoNome = "João da Silva Santos Editado";
        pacienteTeste.setNome(novoNome);
        
        when(pacienteRepository.save(any(Paciente.class))).thenReturn(pacienteTeste);

        // when
        Paciente pacienteAtualizado = pacienteService.save(pacienteTeste);

        // then
        assertThat(pacienteAtualizado).isNotNull();
        assertThat(pacienteAtualizado.getNome()).isEqualTo(novoNome);
        verify(pacienteRepository, times(1)).save(any(Paciente.class));
    }

    @Test
    void deveLancarExcecaoQuandoOcorrerErroNoSave() {
        // given
        Paciente novoPaciente = new Paciente();
        novoPaciente.setNome("João da Silva Santos");
        novoPaciente.setEmail("joao@email.com");
        novoPaciente.setTelefone("(11) 99999-9999");
        novoPaciente.setDataNascimento(LocalDate.of(1990, 1, 1));

        when(pacienteRepository.findByEmail(novoPaciente.getEmail())).thenReturn(Optional.empty());
        when(pacienteRepository.findByTelefone(novoPaciente.getTelefone())).thenReturn(Optional.empty());
        
        // Simula erro no super.save()
        when(pacienteRepository.save(any(Paciente.class))).thenThrow(new RuntimeException("Erro no banco"));

        // when/then
        assertThrows(ResponseStatusException.class, () -> {
            pacienteService.save(novoPaciente);
        });
    }

    @Test
    void deveRetornarVazioQuandoNaoEncontrarPorEmail() {
        // given
        when(pacienteRepository.findByEmail("inexistente@email.com")).thenReturn(Optional.empty());

        // when
        Optional<Paciente> pacienteEncontrado = pacienteService.findByEmail("inexistente@email.com");

        // then
        assertThat(pacienteEncontrado).isEmpty();
        verify(pacienteRepository, times(1)).findByEmail("inexistente@email.com");
    }

    @Test
    void deveRetornarVazioQuandoNaoEncontrarPorNome() {
        // given
        when(pacienteRepository.findByNome("Nome Inexistente")).thenReturn(Optional.empty());

        // when
        Optional<Paciente> pacienteEncontrado = pacienteService.findByNome("Nome Inexistente");

        // then
        assertThat(pacienteEncontrado).isEmpty();
        verify(pacienteRepository, times(1)).findByNome("Nome Inexistente");
    }

    @Test
    void deveRetornarVazioQuandoNaoEncontrarPorTelefone() {
        // given
        when(pacienteRepository.findByTelefone("(11) 00000-0000")).thenReturn(Optional.empty());

        // when
        Optional<Paciente> pacienteEncontrado = pacienteService.findByTelefone("(11) 00000-0000");

        // then
        assertThat(pacienteEncontrado).isEmpty();
        verify(pacienteRepository, times(1)).findByTelefone("(11) 00000-0000");
    }

    @Test
    void deveDeletarPacienteComIsActiveNull() {
        // given
        pacienteTeste.setIsActive(null); // Simula campo null
        when(pacienteRepository.findById(1L)).thenReturn(Optional.of(pacienteTeste));

        // when
        pacienteService.deletePaciente(1L);

        // then
        verify(pacienteRepository, times(1)).deleteById(1L);
    }

    @Test
    void deveRetornarVazioQuandoNaoEncontrarPorId() {
        // given
        when(pacienteRepository.findById(999L)).thenReturn(Optional.empty());

        // when
        Optional<Paciente> pacienteEncontrado = pacienteService.findById(999L);

        // then
        assertThat(pacienteEncontrado).isEmpty();
        verify(pacienteRepository, times(1)).findById(999L);
    }
}