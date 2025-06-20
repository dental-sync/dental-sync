package com.senac.dentalsync.core.service;

import com.senac.dentalsync.core.persistency.model.EnderecoLaboratorio;
import com.senac.dentalsync.core.persistency.model.Laboratorio;
import com.senac.dentalsync.core.persistency.model.Usuario;
import com.senac.dentalsync.core.persistency.repository.LaboratorioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.lenient;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
public class LaboratorioServiceTest {

    @Mock
    private LaboratorioRepository laboratorioRepository;

    @Mock
    private UsuarioService usuarioService;

    @InjectMocks
    private LaboratorioService laboratorioService;

    private Laboratorio laboratorioTeste;
    private EnderecoLaboratorio enderecoTeste;
    private Usuario usuarioLogado;

    @BeforeEach
    void setUp() {
        // Configura o usuário logado
        usuarioLogado = new Usuario();
        usuarioLogado.setId(1L);
        usuarioLogado.setName("Usuario Teste");
        usuarioLogado.setEmail("usuario@teste.com");
        
        // Configura o mock do usuarioService para sempre retornar o usuário logado
        lenient().when(usuarioService.getUsuarioLogado()).thenReturn(usuarioLogado);

        // Configura o endereço de teste
        enderecoTeste = new EnderecoLaboratorio();
        enderecoTeste.setId(1L);
        enderecoTeste.setCep("01234-567");
        enderecoTeste.setLogradouro("Rua das Flores");
        enderecoTeste.setNumero("123");
        enderecoTeste.setBairro("Centro");
        enderecoTeste.setCidade("São Paulo");
        enderecoTeste.setEstado("SP");

        // Configura o laboratório de teste
        laboratorioTeste = new Laboratorio();
        laboratorioTeste.setId(1L);
        laboratorioTeste.setNomeLaboratorio("Laboratório Dental Santos");
        laboratorioTeste.setCnpj("11.222.333/0001-81");
        laboratorioTeste.setEmailLaboratorio("lab@dental.com");
        laboratorioTeste.setTelefoneLaboratorio("(11) 99999-9999");
        laboratorioTeste.setEndereco(enderecoTeste);
        laboratorioTeste.setIsActive(true);
    }

    @Test
    void deveSalvarLaboratorioNovo() {
        // given
        Laboratorio novoLaboratorio = new Laboratorio();
        novoLaboratorio.setNomeLaboratorio("Laboratório Dental Santos");
        novoLaboratorio.setCnpj("11.222.333/0001-81");
        novoLaboratorio.setEmailLaboratorio("lab@dental.com");
        novoLaboratorio.setTelefoneLaboratorio("(11) 99999-9999");
        novoLaboratorio.setEndereco(enderecoTeste);

        when(laboratorioRepository.save(any(Laboratorio.class))).thenReturn(laboratorioTeste);

        // when
        Laboratorio laboratorioSalvo = laboratorioService.save(novoLaboratorio);

        // then
        assertThat(laboratorioSalvo).isNotNull();
        assertThat(laboratorioSalvo.getId()).isEqualTo(laboratorioTeste.getId());
        assertThat(laboratorioSalvo.getNomeLaboratorio()).isEqualTo(laboratorioTeste.getNomeLaboratorio());
        verify(laboratorioRepository, times(1)).save(any(Laboratorio.class));
        verify(usuarioService, atLeast(1)).getUsuarioLogado();
    }

    @Test
    void deveBuscarLaboratorioPorId() {
        // given
        when(laboratorioRepository.findById(1L)).thenReturn(Optional.of(laboratorioTeste));

        // when
        Optional<Laboratorio> laboratorioEncontrado = laboratorioService.findById(1L);

        // then
        assertThat(laboratorioEncontrado).isPresent();
        assertThat(laboratorioEncontrado.get().getNomeLaboratorio()).isEqualTo(laboratorioTeste.getNomeLaboratorio());
        verify(laboratorioRepository, times(1)).findById(1L);
    }

    @Test
    void deveRetornarVazioQuandoNaoEncontrarPorId() {
        // given
        when(laboratorioRepository.findById(999L)).thenReturn(Optional.empty());

        // when
        Optional<Laboratorio> laboratorioEncontrado = laboratorioService.findById(999L);

        // then
        assertThat(laboratorioEncontrado).isEmpty();
        verify(laboratorioRepository, times(1)).findById(999L);
    }

    @Test
    void deveListarTodosLaboratorios() {
        // given
        Laboratorio outroLaboratorio = new Laboratorio();
        outroLaboratorio.setId(2L);
        outroLaboratorio.setNomeLaboratorio("Laboratório Dental Silva");
        outroLaboratorio.setCnpj("22.333.444/0001-92");
        outroLaboratorio.setEmailLaboratorio("silva@dental.com");
        outroLaboratorio.setTelefoneLaboratorio("(11) 98888-8888");
        outroLaboratorio.setIsActive(true);

        when(laboratorioRepository.findAll()).thenReturn(Arrays.asList(laboratorioTeste, outroLaboratorio));

        // when
        List<Laboratorio> laboratorios = laboratorioService.findAll();

        // then
        assertThat(laboratorios).hasSize(2);
        assertThat(laboratorios).contains(laboratorioTeste, outroLaboratorio);
        verify(laboratorioRepository, times(1)).findAll();
    }

    @Test
    void deveAtualizarLaboratorioExistente() {
        // given
        laboratorioTeste.setId(1L); // Simula laboratório existente
        String novoNome = "Laboratório Dental Santos Atualizado";
        laboratorioTeste.setNomeLaboratorio(novoNome);
        
        when(laboratorioRepository.save(any(Laboratorio.class))).thenReturn(laboratorioTeste);

        // when
        Laboratorio laboratorioAtualizado = laboratorioService.save(laboratorioTeste);

        // then
        assertThat(laboratorioAtualizado.getNomeLaboratorio()).isEqualTo(novoNome);
        verify(laboratorioRepository, times(1)).save(any(Laboratorio.class));
        verify(usuarioService, atLeast(1)).getUsuarioLogado();
    }

    @Test
    void deveDeletarLaboratorio() {
        // given
        when(laboratorioRepository.findById(1L)).thenReturn(Optional.of(laboratorioTeste));

        // when
        laboratorioService.delete(1L);

        // then
        verify(laboratorioRepository, times(1)).findById(1L);
        verify(laboratorioRepository, times(1)).delete(laboratorioTeste);
    }

    @Test
    void deveListarLaboratoriosAtivos() {
        // given
        Laboratorio laboratorioAtivo = new Laboratorio();
        laboratorioAtivo.setId(2L);
        laboratorioAtivo.setNomeLaboratorio("Laboratório Ativo");
        laboratorioAtivo.setIsActive(true);

        when(laboratorioRepository.findAllByIsActiveTrue()).thenReturn(Arrays.asList(laboratorioTeste, laboratorioAtivo));

        // when
        List<Laboratorio> laboratoriosAtivos = laboratorioRepository.findAllByIsActiveTrue();

        // then
        assertThat(laboratoriosAtivos).hasSize(2);
        assertThat(laboratoriosAtivos).allMatch(lab -> lab.getIsActive() == true);
        verify(laboratorioRepository, times(1)).findAllByIsActiveTrue();
    }

    @Test
    void deveSalvarLaboratorioComEndereco() {
        // given
        Laboratorio novoLaboratorio = new Laboratorio();
        novoLaboratorio.setNomeLaboratorio("Laboratório com Endereço");
        novoLaboratorio.setCnpj("33.444.555/0001-03");
        novoLaboratorio.setEmailLaboratorio("endereco@dental.com");
        novoLaboratorio.setTelefoneLaboratorio("(11) 97777-7777");
        novoLaboratorio.setEndereco(enderecoTeste);

        when(laboratorioRepository.save(any(Laboratorio.class))).thenReturn(laboratorioTeste);

        // when
        Laboratorio laboratorioSalvo = laboratorioService.save(novoLaboratorio);

        // then
        assertThat(laboratorioSalvo).isNotNull();
        assertThat(laboratorioSalvo.getEndereco()).isNotNull();
        assertThat(laboratorioSalvo.getEndereco().getCep()).isEqualTo(enderecoTeste.getCep());
        verify(laboratorioRepository, times(1)).save(any(Laboratorio.class));
    }

    @Test
    void deveSalvarLaboratorioSemEndereco() {
        // given
        Laboratorio novoLaboratorio = new Laboratorio();
        novoLaboratorio.setNomeLaboratorio("Laboratório sem Endereço");
        novoLaboratorio.setCnpj("44.555.666/0001-14");
        novoLaboratorio.setEmailLaboratorio("semendereco@dental.com");
        novoLaboratorio.setTelefoneLaboratorio("(11) 96666-6666");
        novoLaboratorio.setEndereco(null);

        Laboratorio laboratorioSemEndereco = new Laboratorio();
        laboratorioSemEndereco.setId(2L);
        laboratorioSemEndereco.setNomeLaboratorio("Laboratório sem Endereço");
        laboratorioSemEndereco.setEndereco(null);

        when(laboratorioRepository.save(any(Laboratorio.class))).thenReturn(laboratorioSemEndereco);

        // when
        Laboratorio laboratorioSalvo = laboratorioService.save(novoLaboratorio);

        // then
        assertThat(laboratorioSalvo).isNotNull();
        assertThat(laboratorioSalvo.getEndereco()).isNull();
        verify(laboratorioRepository, times(1)).save(any(Laboratorio.class));
    }

    @Test
    void deveRetornarListaVaziaQuandoNaoHouverLaboratorios() {
        // given
        when(laboratorioRepository.findAll()).thenReturn(Arrays.asList());

        // when
        List<Laboratorio> laboratorios = laboratorioService.findAll();

        // then
        assertThat(laboratorios).isEmpty();
        verify(laboratorioRepository, times(1)).findAll();
    }

    @Test
    void deveRetornarListaVaziaQuandoNaoHouverLaboratoriosAtivos() {
        // given
        when(laboratorioRepository.findAllByIsActiveTrue()).thenReturn(Arrays.asList());

        // when
        List<Laboratorio> laboratoriosAtivos = laboratorioRepository.findAllByIsActiveTrue();

        // then
        assertThat(laboratoriosAtivos).isEmpty();
        verify(laboratorioRepository, times(1)).findAllByIsActiveTrue();
    }
} 