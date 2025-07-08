package com.senac.dentalsync.core.repository;

import com.senac.dentalsync.core.persistency.model.Paciente;
import com.senac.dentalsync.core.persistency.repository.PacienteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
public class PacienteRepositoryTest {

    @Autowired
    private PacienteRepository pacienteRepository;

    private Paciente pacienteTeste;

    @BeforeEach
    void setUp() {
        // Limpa o banco antes de cada teste
        pacienteRepository.deleteAll();

        // Cria um paciente para teste
        pacienteTeste = new Paciente();
        pacienteTeste.setNome("João da Silva Santos");
        pacienteTeste.setEmail("joao@email.com");
        pacienteTeste.setTelefone("(11) 99999-9999");
        pacienteTeste.setDataNascimento(LocalDate.of(1990, 1, 1));
    }

    @Test
    void deveSalvarPaciente() {
        // when
        Paciente pacienteSalvo = pacienteRepository.save(pacienteTeste);

        // then
        assertThat(pacienteSalvo).isNotNull();
        assertThat(pacienteSalvo.getId()).isNotNull();
        assertThat(pacienteSalvo.getNome()).isEqualTo(pacienteTeste.getNome());
    }

    @Test
    void deveBuscarPacientePorId() {
        // given
        Paciente pacienteSalvo = pacienteRepository.save(pacienteTeste);

        // when
        Optional<Paciente> pacienteEncontrado = pacienteRepository.findById(pacienteSalvo.getId());

        // then
        assertThat(pacienteEncontrado).isPresent();
        assertThat(pacienteEncontrado.get().getNome()).isEqualTo(pacienteTeste.getNome());
    }

    @Test
    void deveListarTodosPacientes() {
        // given
        pacienteRepository.save(pacienteTeste);

        Paciente outroPaciente = new Paciente();
        outroPaciente.setNome("Maria Silva Santos");
        outroPaciente.setEmail("maria@email.com");
        outroPaciente.setTelefone("(11) 98888-8888");
        outroPaciente.setDataNascimento(LocalDate.of(1995, 5, 5));
        pacienteRepository.save(outroPaciente);

        // when
        List<Paciente> pacientes = pacienteRepository.findAll();

        // then
        assertThat(pacientes).hasSize(2);
    }

    @Test
    void deveAtualizarPaciente() {
        // given
        Paciente pacienteSalvo = pacienteRepository.save(pacienteTeste);
        String novoNome = "João da Silva Santos Atualizado";
        pacienteSalvo.setNome(novoNome);

        // when
        Paciente pacienteAtualizado = pacienteRepository.save(pacienteSalvo);

        // then
        assertThat(pacienteAtualizado.getNome()).isEqualTo(novoNome);
    }

    @Test
    void deveDeletarPaciente() {
        // given
        Paciente pacienteSalvo = pacienteRepository.save(pacienteTeste);

        // when
        pacienteRepository.deleteById(pacienteSalvo.getId());
        Optional<Paciente> pacienteDeletado = pacienteRepository.findById(pacienteSalvo.getId());

        // then
        assertThat(pacienteDeletado).isEmpty();
    }
} 