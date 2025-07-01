package com.senac.dentalsync.core.service;

import com.senac.dentalsync.core.persistency.model.Laboratorio;
import com.senac.dentalsync.core.persistency.model.Protetico;
import com.senac.dentalsync.core.persistency.repository.ProteticoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationContext;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.lenient;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
public class ProteticoServiceTest {

    @Mock
    private ProteticoRepository proteticoRepository;

    @Mock
    private ApplicationContext applicationContext;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private ProteticoService proteticoService;

    private Protetico proteticoTeste;
    private Protetico proteticoLogado;
    private Laboratorio laboratorioTeste;

    @BeforeEach
    void setUp() {
        // Configura o protético logado
        proteticoLogado = new Protetico();
        proteticoLogado.setId(1L);
        proteticoLogado.setNome("Admin");

        // Configura o laboratório de teste
        laboratorioTeste = new Laboratorio();
        laboratorioTeste.setId(1L);
        laboratorioTeste.setNomeLaboratorio("Laboratório Teste");
        laboratorioTeste.setCnpj("11.222.333/0001-81");
        laboratorioTeste.setEmailLaboratorio("lab@teste.com");

        // Configura o protético de teste
        proteticoTeste = new Protetico();
        proteticoTeste.setId(1L);
        proteticoTeste.setNome("Dr. João Silva Santos");
        proteticoTeste.setEmail("protetico@email.com");
        proteticoTeste.setTelefone("(11) 99999-9999");
        proteticoTeste.setCro("CRO-SP-12345");
        proteticoTeste.setSenha("$2a$10$hashedPassword"); // Senha já criptografada
        proteticoTeste.setIsActive(true);
        proteticoTeste.setLaboratorio(laboratorioTeste); // Adicionar laboratório

        // Configura mocks para ApplicationContext e PasswordEncoder
        lenient().when(applicationContext.getBean(PasswordEncoder.class)).thenReturn(passwordEncoder);
        lenient().when(passwordEncoder.encode(anyString())).thenReturn("$2a$10$hashedPassword");
        lenient().when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);
    }

 
    @Test
    void devePermitirAtualizarProteticoMesmoComEmailIgual() {
        // given - Simula atualização do mesmo protético
        proteticoTeste.setId(1L);
        String novoNome = "Dr. João Silva Santos Editado";
        proteticoTeste.setNome(novoNome);
        
        // Retorna o mesmo protético para todas as validações (simula que é o mesmo registro)
        when(proteticoRepository.findByEmail(proteticoTeste.getEmail())).thenReturn(Optional.of(proteticoTeste));
        when(proteticoRepository.findFirstByTelefone(proteticoTeste.getTelefone())).thenReturn(Optional.of(proteticoTeste));
        when(proteticoRepository.findFirstByCro(proteticoTeste.getCro())).thenReturn(Optional.of(proteticoTeste));
        when(proteticoRepository.findById(1L)).thenReturn(Optional.of(proteticoTeste));
        when(proteticoRepository.save(any(Protetico.class))).thenReturn(proteticoTeste);

        // when
        Protetico proteticoAtualizado = proteticoService.save(proteticoTeste);

        // then
        assertThat(proteticoAtualizado).isNotNull();
        assertThat(proteticoAtualizado.getNome()).isEqualTo(novoNome);
        verify(proteticoRepository, times(1)).save(any(Protetico.class));
    }


    @Test
    void naoDeveAtualizarStatusProteticoInexistente() {
        // given
        when(proteticoRepository.findById(999L)).thenReturn(Optional.empty());

        // when/then
        assertThrows(ResponseStatusException.class, () -> {
            proteticoService.updateStatus(999L, false);
        });
    }

       @Test
    void deveSalvarProteticoNovo() {
        // given
        Protetico novoProtetico = new Protetico();
        novoProtetico.setNome("Dr. João Silva Santos");
        novoProtetico.setEmail("protetico@email.com");
        novoProtetico.setTelefone("(11) 99999-9999");
        novoProtetico.setCro("CRO-SP-12345");
        novoProtetico.setSenha("senhaPlana");
        novoProtetico.setIsAdmin(false);

        when(proteticoRepository.findByEmail(novoProtetico.getEmail())).thenReturn(Optional.empty());
        when(proteticoRepository.findFirstByCro(novoProtetico.getCro())).thenReturn(Optional.empty());
        when(proteticoRepository.findFirstByTelefone(novoProtetico.getTelefone())).thenReturn(Optional.empty());
        when(proteticoRepository.save(any(Protetico.class))).thenReturn(proteticoTeste);

        // when
        Protetico proteticoSalvo = proteticoService.save(novoProtetico);

        // then
        assertThat(proteticoSalvo).isNotNull();
        assertThat(proteticoSalvo.getId()).isEqualTo(proteticoTeste.getId());
        verify(proteticoRepository, times(1)).save(any(Protetico.class));
        verify(passwordEncoder, times(1)).encode("senhaPlana");
    }

    @Test
    void naoDeveSalvarProteticoComEmailDuplicado() {
        // given
        Protetico novoProtetico = new Protetico();
        novoProtetico.setNome("Dr. Maria Silva");
        novoProtetico.setEmail("protetico@email.com"); // mesmo email do proteticoTeste
        novoProtetico.setTelefone("(11) 88888-8888");
        novoProtetico.setCro("CRO-SP-67890");
        novoProtetico.setSenha("senhaPlana");

        when(proteticoRepository.findByEmail("protetico@email.com")).thenReturn(Optional.of(proteticoTeste));

        // when/then
        assertThrows(ResponseStatusException.class, () -> {
            proteticoService.save(novoProtetico);
        });
    }

    @Test
    void naoDeveSalvarProteticoComCroDuplicado() {
        // given
        Protetico novoProtetico = new Protetico();
        novoProtetico.setNome("Dr. Maria Silva");
        novoProtetico.setEmail("maria@email.com");
        novoProtetico.setTelefone("(11) 88888-8888");
        novoProtetico.setCro("CRO-SP-12345"); // mesmo CRO do proteticoTeste
        novoProtetico.setSenha("senhaPlana");

        when(proteticoRepository.findFirstByCro("CRO-SP-12345")).thenReturn(Optional.of(proteticoTeste));

        // when/then
        assertThrows(ResponseStatusException.class, () -> {
            proteticoService.save(novoProtetico);
        });
    }

    @Test
    void naoDeveSalvarProteticoComTelefoneDuplicado() {
        // given
        Protetico novoProtetico = new Protetico();
        novoProtetico.setNome("Dr. Maria Silva");
        novoProtetico.setEmail("maria@email.com");
        novoProtetico.setTelefone("(11) 99999-9999"); // mesmo telefone do proteticoTeste
        novoProtetico.setCro("CRO-SP-67890");
        novoProtetico.setSenha("senhaPlana");

        when(proteticoRepository.findByEmail("maria@email.com")).thenReturn(Optional.empty());
        when(proteticoRepository.findFirstByCro("CRO-SP-67890")).thenReturn(Optional.empty());
        when(proteticoRepository.findFirstByTelefone("(11) 99999-9999")).thenReturn(Optional.of(proteticoTeste));

        // when/then
        assertThrows(ResponseStatusException.class, () -> {
            proteticoService.save(novoProtetico);
        });
    }

    @Test
    void deveBuscarProteticoPorId() {
        // given
        when(proteticoRepository.findById(1L)).thenReturn(Optional.of(proteticoTeste));

        // when
        Optional<Protetico> proteticoEncontrado = proteticoService.findById(1L);

        // then
        assertThat(proteticoEncontrado).isPresent();
        assertThat(proteticoEncontrado.get().getNome()).isEqualTo(proteticoTeste.getNome());
        verify(proteticoRepository, times(1)).findById(1L);
    }

    @Test
    void deveBuscarProteticoPorEmail() {
        // given
        when(proteticoRepository.findByEmail("protetico@email.com")).thenReturn(Optional.of(proteticoTeste));

        // when
        Optional<Protetico> proteticoEncontrado = proteticoService.findByEmail("protetico@email.com");

        // then
        assertThat(proteticoEncontrado).isPresent();
        assertThat(proteticoEncontrado.get().getEmail()).isEqualTo("protetico@email.com");
        verify(proteticoRepository, times(1)).findByEmail("protetico@email.com");
    }

    @Test
    void deveBuscarProteticoPorCro() {
        // given
        when(proteticoRepository.findFirstByCro("CRO-SP-12345")).thenReturn(Optional.of(proteticoTeste));

        // when
        Optional<Protetico> proteticoEncontrado = proteticoService.findByCro("CRO-SP-12345");

        // then
        assertThat(proteticoEncontrado).isPresent();
        assertThat(proteticoEncontrado.get().getCro()).isEqualTo("CRO-SP-12345");
        verify(proteticoRepository, times(1)).findFirstByCro("CRO-SP-12345");
    }

    @Test
    void deveBuscarProteticoPorTelefone() {
        // given
        when(proteticoRepository.findFirstByTelefone("(11) 99999-9999")).thenReturn(Optional.of(proteticoTeste));

        // when
        Optional<Protetico> proteticoEncontrado = proteticoService.findByTelefone("(11) 99999-9999");

        // then
        assertThat(proteticoEncontrado).isPresent();
        assertThat(proteticoEncontrado.get().getTelefone()).isEqualTo("(11) 99999-9999");
        verify(proteticoRepository, times(1)).findFirstByTelefone("(11) 99999-9999");
    }

    @Test
    void deveBuscarProteticosPorCroContaining() {
        // given
        Protetico outroProtetico = new Protetico();
        outroProtetico.setId(2L);
        outroProtetico.setCro("CRO-SP-67890");
        
        when(proteticoRepository.findByCroContaining("CRO-SP")).thenReturn(Arrays.asList(proteticoTeste, outroProtetico));

        // when
        List<Protetico> proteticos = proteticoService.findByCroContaining("CRO-SP");

        // then
        assertThat(proteticos).hasSize(2);
        verify(proteticoRepository, times(1)).findByCroContaining("CRO-SP");
    }

    @Test
    void deveListarTodosProteticos() {
        // given
        Protetico outroProtetico = new Protetico();
        outroProtetico.setId(2L);
        outroProtetico.setNome("Dr. Maria Silva Santos");
        outroProtetico.setEmail("maria@email.com");
        outroProtetico.setTelefone("(11) 98888-8888");
        outroProtetico.setCro("CRO-SP-67890");
        outroProtetico.setIsActive(true);

        when(proteticoRepository.findAll()).thenReturn(Arrays.asList(proteticoTeste, outroProtetico));

        // when
        List<Protetico> proteticos = proteticoService.findAll();

        // then
        assertThat(proteticos).hasSize(2);
        verify(proteticoRepository, times(1)).findAll();
    }

    @Test
    void deveAtualizarStatusProtetico() {
        // given
        when(proteticoRepository.findById(1L)).thenReturn(Optional.of(proteticoTeste));
        when(proteticoRepository.save(any(Protetico.class))).thenReturn(proteticoTeste);

        // when
        Protetico proteticoAtualizado = proteticoService.updateStatus(1L, false);

        // then
        assertThat(proteticoAtualizado).isNotNull();
        // findById é chamado 2 vezes: uma no updateStatus e outra no isSenhaAlterada dentro do save
        verify(proteticoRepository, times(2)).findById(1L);
        verify(proteticoRepository, atLeast(1)).save(any(Protetico.class));
    }

   
    @Test
    void deveDeletarProteticoInativo() {
        // given
        proteticoTeste.setIsActive(false);
        when(proteticoRepository.findById(1L)).thenReturn(Optional.of(proteticoTeste));

        // when
        proteticoService.deleteProtetico(1L);

        // then
        verify(proteticoRepository, times(1)).deleteById(1L);
    }

    @Test
    void naoDeveDeletarProteticoAtivo() {
        // given
        proteticoTeste.setIsActive(true);
        when(proteticoRepository.findById(1L)).thenReturn(Optional.of(proteticoTeste));

        // when/then
        assertThrows(ResponseStatusException.class, () -> {
            proteticoService.deleteProtetico(1L);
        });
    }

    @Test
    void naoDeveDeletarProteticoInexistente() {
        // given
        when(proteticoRepository.findById(999L)).thenReturn(Optional.empty());

        // when/then
        assertThrows(ResponseStatusException.class, () -> {
            proteticoService.deleteProtetico(999L);
        });
    }

    @Test
    void deveCarregarUsuarioPorEmail() {
        // given
        when(proteticoRepository.findByEmail("protetico@email.com")).thenReturn(Optional.of(proteticoTeste));

        // when
        UserDetails userDetails = proteticoService.loadUserByUsername("protetico@email.com");

        // then
        assertThat(userDetails).isNotNull();
        assertThat(userDetails.getUsername()).isEqualTo("protetico@email.com");
        assertThat(userDetails.getPassword()).isEqualTo("$2a$10$hashedPassword");
        verify(proteticoRepository, times(1)).findByEmail("protetico@email.com");
    }

    @Test
    void deveLancarExcecaoQuandoUsuarioNaoEncontrado() {
        // given
        when(proteticoRepository.findByEmail("inexistente@email.com")).thenReturn(Optional.empty());

        // when/then
        assertThrows(UsernameNotFoundException.class, () -> {
            proteticoService.loadUserByUsername("inexistente@email.com");
        });
    }

    @Test
    void deveBuscarLaboratorioPorEmail() {
        // given
        when(proteticoRepository.findByEmail("protetico@email.com")).thenReturn(Optional.of(proteticoTeste));

        // when
        Optional<Laboratorio> laboratorioEncontrado = proteticoService.findLaboratorioByEmail("protetico@email.com");

        // then
        assertThat(laboratorioEncontrado).isPresent();
        assertThat(laboratorioEncontrado.get()).isEqualTo(laboratorioTeste);
        verify(proteticoRepository, times(1)).findByEmail("protetico@email.com");
    }

    @Test
    void deveRetornarVazioQuandoProteticoNaoTemLaboratorio() {
        // given
        proteticoTeste.setLaboratorio(null);
        when(proteticoRepository.findByEmail("protetico@email.com")).thenReturn(Optional.of(proteticoTeste));

        // when
        Optional<Laboratorio> laboratorioEncontrado = proteticoService.findLaboratorioByEmail("protetico@email.com");

        // then
        assertThat(laboratorioEncontrado).isEmpty();
        verify(proteticoRepository, times(1)).findByEmail("protetico@email.com");
    }

   

    @Test
    void deveSalvarSemAlterarSenhaQuandoSenhaJaCriptografada() {
        // given
        Protetico proteticoExistente = new Protetico();
        proteticoExistente.setId(1L);
        proteticoExistente.setNome("Dr. João Silva");
        proteticoExistente.setEmail("protetico@email.com");
        proteticoExistente.setSenha("$2a$10$hashedPassword"); // Senha já criptografada
        proteticoExistente.setCro("CRO-SP-12345");
        proteticoExistente.setTelefone("(11) 99999-9999");

        // Criar protético existente para busca por ID (com mesma senha criptografada)
        Protetico proteticoExistenteDB = new Protetico();
        proteticoExistenteDB.setId(1L);
        proteticoExistenteDB.setSenha("$2a$10$hashedPassword");

        when(proteticoRepository.findByEmail(proteticoExistente.getEmail())).thenReturn(Optional.of(proteticoExistente));
        when(proteticoRepository.findFirstByCro(proteticoExistente.getCro())).thenReturn(Optional.of(proteticoExistente));
        when(proteticoRepository.findFirstByTelefone(proteticoExistente.getTelefone())).thenReturn(Optional.of(proteticoExistente));
        when(proteticoRepository.findById(1L)).thenReturn(Optional.of(proteticoExistenteDB));
        when(proteticoRepository.save(any(Protetico.class))).thenReturn(proteticoExistente);

        // when
        Protetico proteticoSalvo = proteticoService.save(proteticoExistente);

        // then
        assertThat(proteticoSalvo).isNotNull();
        verify(proteticoRepository, times(1)).save(any(Protetico.class));
        // A senha não deve ser re-criptografada pois já está criptografada e é igual
        verify(passwordEncoder, never()).encode(anyString());
    }

    @Test
    void deveSalvarSemAlterarSenhaUsandoSaveWithoutPasswordChange() {
        // given
        when(proteticoRepository.findByEmail(proteticoTeste.getEmail())).thenReturn(Optional.of(proteticoTeste));
        when(proteticoRepository.findFirstByCro(proteticoTeste.getCro())).thenReturn(Optional.of(proteticoTeste));
        when(proteticoRepository.findFirstByTelefone(proteticoTeste.getTelefone())).thenReturn(Optional.of(proteticoTeste));
        when(proteticoRepository.save(any(Protetico.class))).thenReturn(proteticoTeste);

        // when
        Protetico proteticoSalvo = proteticoService.saveWithoutPasswordChange(proteticoTeste);

        // then
        assertThat(proteticoSalvo).isNotNull();
        verify(proteticoRepository, times(1)).save(any(Protetico.class));
        // Verifica que o passwordEncoder não foi usado
        verify(passwordEncoder, never()).encode(anyString());
    }

    @Test
    void deveRetornarVazioQuandoNaoEncontrarPorEmail() {
        // given
        when(proteticoRepository.findByEmail("inexistente@email.com")).thenReturn(Optional.empty());

        // when
        Optional<Protetico> proteticoEncontrado = proteticoService.findByEmail("inexistente@email.com");

        // then
        assertThat(proteticoEncontrado).isEmpty();
        verify(proteticoRepository, times(1)).findByEmail("inexistente@email.com");
    }

    @Test
    void deveRetornarVazioQuandoNaoEncontrarPorCro() {
        // given
        when(proteticoRepository.findFirstByCro("CRO-SP-99999")).thenReturn(Optional.empty());

        // when
        Optional<Protetico> proteticoEncontrado = proteticoService.findByCro("CRO-SP-99999");

        // then
        assertThat(proteticoEncontrado).isEmpty();
        verify(proteticoRepository, times(1)).findFirstByCro("CRO-SP-99999");
    }

    @Test
    void deveRetornarVazioQuandoNaoEncontrarPorTelefone() {
        // given
        when(proteticoRepository.findFirstByTelefone("(11) 00000-0000")).thenReturn(Optional.empty());

        // when
        Optional<Protetico> proteticoEncontrado = proteticoService.findByTelefone("(11) 00000-0000");

        // then
        assertThat(proteticoEncontrado).isEmpty();
        verify(proteticoRepository, times(1)).findFirstByTelefone("(11) 00000-0000");
    }

    @Test
    void deveBuscarProteticosComCroVazio() {
        // given
        when(proteticoRepository.findByCroContaining("")).thenReturn(Arrays.asList());

        // when
        List<Protetico> proteticos = proteticoService.findByCroContaining("");

        // then
        assertThat(proteticos).isEmpty();
        verify(proteticoRepository, times(1)).findByCroContaining("");
    }

    @Test
    void deveDeletarProteticoComIsActiveNull() {
        // given
        proteticoTeste.setIsActive(null); // Simula campo null
        when(proteticoRepository.findById(1L)).thenReturn(Optional.of(proteticoTeste));

        // when
        proteticoService.deleteProtetico(1L);

        // then
        verify(proteticoRepository, times(1)).deleteById(1L);
    }

    @Test
    void deveLancarExcecaoQuandoOcorrerErroNaDelecao() {
        // given
        proteticoTeste.setIsActive(false);
        when(proteticoRepository.findById(1L)).thenReturn(Optional.of(proteticoTeste));
        doThrow(new RuntimeException("Erro no banco")).when(proteticoRepository).deleteById(1L);

        // when/then
        assertThrows(ResponseStatusException.class, () -> {
            proteticoService.deleteProtetico(1L);
        });
    }

    @Test
    void deveAssociarLaboratorioAutomaticamenteParaNovoProtetico() {
        // given
        Protetico novoProtetico = new Protetico();
        novoProtetico.setNome("Dr. Novo Protetico");
        novoProtetico.setEmail("novo@email.com");
        novoProtetico.setTelefone("(11) 97777-7777");
        novoProtetico.setCro("CRO-SP-99999");
        novoProtetico.setSenha("senhaPlana");
        novoProtetico.setLaboratorio(null); // Sem laboratório inicialmente

        // Mock do SecurityContext
        SecurityContextHolder.setContext(securityContext);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("protetico@email.com");

        when(proteticoRepository.findByEmail("novo@email.com")).thenReturn(Optional.empty());
        when(proteticoRepository.findFirstByCro("CRO-SP-99999")).thenReturn(Optional.empty());
        when(proteticoRepository.findFirstByTelefone("(11) 97777-7777")).thenReturn(Optional.empty());
        when(proteticoRepository.findByEmail("protetico@email.com")).thenReturn(Optional.of(proteticoTeste));
        when(proteticoRepository.save(any(Protetico.class))).thenReturn(novoProtetico);

        // when
        Protetico proteticoSalvo = proteticoService.save(novoProtetico);

        // then
        assertThat(proteticoSalvo).isNotNull();
        verify(proteticoRepository, times(1)).save(any(Protetico.class));
        verify(proteticoRepository, times(1)).findByEmail("protetico@email.com");
    }
} 