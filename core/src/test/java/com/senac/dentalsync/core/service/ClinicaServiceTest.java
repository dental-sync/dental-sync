package com.senac.dentalsync.core.service;

import com.senac.dentalsync.core.persistency.model.Clinica;
import com.senac.dentalsync.core.persistency.model.Dentista;
import com.senac.dentalsync.core.persistency.model.Protetico;
import com.senac.dentalsync.core.persistency.repository.ClinicaRepository;
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
import java.util.ArrayList;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.lenient;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
public class ClinicaServiceTest {

    @Mock
    private ClinicaRepository clinicaRepository;

    @Mock
    private DentistaRepository dentistaRepository;

    @InjectMocks
    private ClinicaService clinicaService;

    private Clinica clinicaTeste;

    @BeforeEach
    void setUp() {
        // Configura a clínica de teste
        clinicaTeste = new Clinica();
        clinicaTeste.setId(1L);
        clinicaTeste.setNome("Clínica Dental Santos");
        clinicaTeste.setCnpj("11.222.333/0001-81");
        clinicaTeste.setIsActive(true);
    }

    @Test
    void deveSalvarClinicaNova() {
        // given
        Clinica novaClinica = new Clinica();
        novaClinica.setNome("Clínica Dental Santos");
        novaClinica.setCnpj("11.222.333/0001-81"); // CNPJ válido

        when(clinicaRepository.findByCnpj(novaClinica.getCnpj())).thenReturn(Optional.empty());
        when(clinicaRepository.save(any(Clinica.class))).thenReturn(clinicaTeste);

        // when
        Clinica clinicaSalva = clinicaService.save(novaClinica);

        // then
        assertThat(clinicaSalva).isNotNull();
        assertThat(clinicaSalva.getId()).isEqualTo(clinicaTeste.getId());
        verify(clinicaRepository, times(1)).save(any(Clinica.class));
    }

    @Test
    void naoDeveSalvarClinicaComCnpjInvalido() {
        // given
        Clinica novaClinica = new Clinica();
        novaClinica.setNome("Clínica Dental Santos");
        novaClinica.setCnpj("12.345.678/0001-99"); // CNPJ inválido

        // when/then
        assertThrows(ResponseStatusException.class, () -> {
            clinicaService.save(novaClinica);
        });
    }

    @Test
    void naoDeveSalvarClinicaComCnpjDuplicado() {
        // given
        Clinica novaClinica = new Clinica();
        novaClinica.setNome("Outra Clínica");
        novaClinica.setCnpj("11.222.333/0001-81"); // mesmo CNPJ da clinicaTeste

        lenient().when(clinicaRepository.findByCnpj("11.222.333/0001-81")).thenReturn(Optional.of(clinicaTeste));

        // when/then
        assertThrows(ResponseStatusException.class, () -> {
            clinicaService.save(novaClinica);
        });
    }

    @Test
    void deveBuscarClinicaPorId() {
        // given
        when(clinicaRepository.findById(1L)).thenReturn(Optional.of(clinicaTeste));

        // when
        Optional<Clinica> clinicaEncontrada = clinicaService.findById(1L);

        // then
        assertThat(clinicaEncontrada).isPresent();
        assertThat(clinicaEncontrada.get().getNome()).isEqualTo(clinicaTeste.getNome());
        verify(clinicaRepository, times(1)).findById(1L);
    }

    @Test
    void deveBuscarClinicaPorNome() {
        // given
        when(clinicaRepository.findByNome("Clínica Dental Santos")).thenReturn(Optional.of(clinicaTeste));

        // when
        Optional<Clinica> clinicaEncontrada = clinicaService.findByNome("Clínica Dental Santos");

        // then
        assertThat(clinicaEncontrada).isPresent();
        assertThat(clinicaEncontrada.get().getNome()).isEqualTo("Clínica Dental Santos");
        verify(clinicaRepository, times(1)).findByNome("Clínica Dental Santos");
    }

    @Test
    void deveBuscarClinicaPorCnpj() {
        // given
        when(clinicaRepository.findByCnpj("11.222.333/0001-81")).thenReturn(Optional.of(clinicaTeste));

        // when
        Optional<Clinica> clinicaEncontrada = clinicaService.findByCnpj("11.222.333/0001-81");

        // then
        assertThat(clinicaEncontrada).isPresent();
        assertThat(clinicaEncontrada.get().getCnpj()).isEqualTo("11.222.333/0001-81");
        verify(clinicaRepository, times(1)).findByCnpj("11.222.333/0001-81");
    }

    @Test
    void deveBuscarClinicasPorNomeContaining() {
        // given
        Clinica outraClinica = new Clinica();
        outraClinica.setId(2L);
        outraClinica.setNome("Clínica Dental Silva");
        
        when(clinicaRepository.findByNomeContaining("Dental")).thenReturn(Arrays.asList(clinicaTeste, outraClinica));

        // when
        List<Clinica> clinicas = clinicaService.findByNomeContaining("Dental");

        // then
        assertThat(clinicas).hasSize(2);
        verify(clinicaRepository, times(1)).findByNomeContaining("Dental");
    }

    @Test
    void deveListarTodasClinicas() {
        // given
        Clinica outraClinica = new Clinica();
        outraClinica.setId(2L);
        outraClinica.setNome("Clínica Dental Silva");
        outraClinica.setCnpj("11.444.777/0001-61"); // CNPJ válido
        outraClinica.setIsActive(true);

        when(clinicaRepository.findAll()).thenReturn(Arrays.asList(clinicaTeste, outraClinica));

        // when
        List<Clinica> clinicas = clinicaService.findAll();

        // then
        assertThat(clinicas).hasSize(2);
        verify(clinicaRepository, times(1)).findAll();
    }

    @Test
    void deveBuscarDentistasPorClinicaId() {
        // given
        Dentista dentista1 = new Dentista();
        dentista1.setId(1L);
        dentista1.setNome("Dr. João Silva");
        
        Dentista dentista2 = new Dentista();
        dentista2.setId(2L);
        dentista2.setNome("Dr. Maria Santos");

        when(dentistaRepository.findByClinicas_Id(1L)).thenReturn(Arrays.asList(dentista1, dentista2));

        // when
        List<Dentista> dentistas = clinicaService.findDentistasByClinicaId(1L);

        // then
        assertThat(dentistas).hasSize(2);
        verify(dentistaRepository, times(1)).findByClinicas_Id(1L);
    }

    @Test
    void deveDeletarClinicaERemoverVinculoComDentistas() {
        // given
        Dentista dentista = new Dentista();
        dentista.setId(1L);
        dentista.setNome("Dr. João Silva");
        dentista.setClinicas(new ArrayList<>());
        dentista.getClinicas().add(clinicaTeste);

        when(dentistaRepository.findByClinicas_Id(1L)).thenReturn(Arrays.asList(dentista));
        when(dentistaRepository.save(any(Dentista.class))).thenReturn(dentista);

        // when
        clinicaService.delete(1L);

        // then
        verify(dentistaRepository, times(1)).findByClinicas_Id(1L);
        verify(dentistaRepository, times(1)).save(any(Dentista.class));
        verify(clinicaRepository, times(1)).deleteById(1L);
    }

    @Test
    void deveAtualizarClinicaExistente() {
        // given
        clinicaTeste.setId(1L); // Simula clínica existente
        String novoNome = "Clínica Dental Santos Atualizada";
        clinicaTeste.setNome(novoNome);
        
        when(clinicaRepository.findByCnpj(clinicaTeste.getCnpj())).thenReturn(Optional.of(clinicaTeste));
        when(clinicaRepository.save(any(Clinica.class))).thenReturn(clinicaTeste);

        // when
        Clinica clinicaAtualizada = clinicaService.save(clinicaTeste);

        // then
        assertThat(clinicaAtualizada.getNome()).isEqualTo(novoNome);
        verify(clinicaRepository, times(1)).save(any(Clinica.class));
    }

    @Test
    void devePermitirAtualizarClinicaMesmaComCnpjIgual() {
        // given - Simula atualização da mesma clínica
        clinicaTeste.setId(1L);
        String novoNome = "Clínica Dental Santos Editada";
        clinicaTeste.setNome(novoNome);
        
        // Retorna a mesma clínica para validação (simula que é o mesmo registro)
        when(clinicaRepository.findByCnpj(clinicaTeste.getCnpj())).thenReturn(Optional.of(clinicaTeste));
        when(clinicaRepository.save(any(Clinica.class))).thenReturn(clinicaTeste);

        // when
        Clinica clinicaAtualizada = clinicaService.save(clinicaTeste);

        // then
        assertThat(clinicaAtualizada).isNotNull();
        assertThat(clinicaAtualizada.getNome()).isEqualTo(novoNome);
        verify(clinicaRepository, times(1)).save(any(Clinica.class));
    }

    @Test
    void deveLancarExcecaoQuandoOcorrerErroNoSave() {
        // given
        Clinica novaClinica = new Clinica();
        novaClinica.setNome("Clínica Dental Santos");
        novaClinica.setCnpj("11.222.333/0001-81"); // CNPJ válido

        when(clinicaRepository.findByCnpj(novaClinica.getCnpj())).thenReturn(Optional.empty());
        
        // Simula erro no super.save()
        when(clinicaRepository.save(any(Clinica.class))).thenThrow(new RuntimeException("Erro no banco"));

        // when/then
        assertThrows(ResponseStatusException.class, () -> {
            clinicaService.save(novaClinica);
        });
    }

    @Test
    void deveRetornarVazioQuandoNaoEncontrarPorNome() {
        // given
        when(clinicaRepository.findByNome("Clínica Inexistente")).thenReturn(Optional.empty());

        // when
        Optional<Clinica> clinicaEncontrada = clinicaService.findByNome("Clínica Inexistente");

        // then
        assertThat(clinicaEncontrada).isEmpty();
        verify(clinicaRepository, times(1)).findByNome("Clínica Inexistente");
    }

    @Test
    void deveRetornarVazioQuandoNaoEncontrarPorCnpj() {
        // given
        when(clinicaRepository.findByCnpj("99.999.999/0001-99")).thenReturn(Optional.empty());

        // when
        Optional<Clinica> clinicaEncontrada = clinicaService.findByCnpj("99.999.999/0001-99");

        // then
        assertThat(clinicaEncontrada).isEmpty();
        verify(clinicaRepository, times(1)).findByCnpj("99.999.999/0001-99");
    }

    @Test
    void deveBuscarClinicasComNomeVazio() {
        // given
        when(clinicaRepository.findByNomeContaining("")).thenReturn(Arrays.asList());

        // when
        List<Clinica> clinicas = clinicaService.findByNomeContaining("");

        // then
        assertThat(clinicas).isEmpty();
        verify(clinicaRepository, times(1)).findByNomeContaining("");
    }

    @Test
    void deveRetornarListaVaziaQuandoClinicaNaoTemDentistas() {
        // given
        when(dentistaRepository.findByClinicas_Id(999L)).thenReturn(Arrays.asList());

        // when
        List<Dentista> dentistas = clinicaService.findDentistasByClinicaId(999L);

        // then
        assertThat(dentistas).isEmpty();
        verify(dentistaRepository, times(1)).findByClinicas_Id(999L);
    }

    @Test
    void deveDeletarClinicaSemDentistasVinculados() {
        // given
        when(dentistaRepository.findByClinicas_Id(1L)).thenReturn(Arrays.asList());

        // when
        clinicaService.delete(1L);

        // then
        verify(dentistaRepository, times(1)).findByClinicas_Id(1L);
        verify(dentistaRepository, never()).save(any(Dentista.class));
        verify(clinicaRepository, times(1)).deleteById(1L);
    }

    @Test
    void deveValidarCnpjComFormatacaoDiferente() {
        // given
        Clinica novaClinica = new Clinica();
        novaClinica.setNome("Clínica Dental Santos");
        novaClinica.setCnpj("11222333000181"); // CNPJ sem formatação

        when(clinicaRepository.findByCnpj(novaClinica.getCnpj())).thenReturn(Optional.empty());
        when(clinicaRepository.save(any(Clinica.class))).thenReturn(clinicaTeste);

        // when
        Clinica clinicaSalva = clinicaService.save(novaClinica);

        // then
        assertThat(clinicaSalva).isNotNull();
        verify(clinicaRepository, times(1)).save(any(Clinica.class));
    }
} 