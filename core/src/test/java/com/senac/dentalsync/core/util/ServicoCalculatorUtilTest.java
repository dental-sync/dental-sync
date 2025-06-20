package com.senac.dentalsync.core.util;

import com.senac.dentalsync.core.persistency.model.Material;
import com.senac.dentalsync.core.persistency.model.Servico;
import com.senac.dentalsync.core.persistency.model.ServicoMaterial;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

public class ServicoCalculatorUtilTest {

    private Material material1;
    private Material material2;
    private Material material3;
    private ServicoMaterial servicoMaterial1;
    private ServicoMaterial servicoMaterial2;
    private ServicoMaterial servicoMaterial3;

    @BeforeEach
    void setUp() {
        // Setup dos materiais
        material1 = new Material();
        material1.setValorUnitario(new BigDecimal("10.50"));

        material2 = new Material();
        material2.setValorUnitario(new BigDecimal("25.75"));

        material3 = new Material();
        material3.setValorUnitario(new BigDecimal("8.00"));

        // Setup dos serviços-materiais
        servicoMaterial1 = new ServicoMaterial();
        servicoMaterial1.setMaterial(material1);
        servicoMaterial1.setQuantidade(new BigDecimal("2"));

        servicoMaterial2 = new ServicoMaterial();
        servicoMaterial2.setMaterial(material2);
        servicoMaterial2.setQuantidade(new BigDecimal("1.5"));

        servicoMaterial3 = new ServicoMaterial();
        servicoMaterial3.setMaterial(material3);
        servicoMaterial3.setQuantidade(new BigDecimal("3"));
    }

    // Testes do método calcularValorMateriais
    @Test
    void deveCalcularValorMateriaisCorretamente() {
        // given
        List<ServicoMaterial> materiais = Arrays.asList(servicoMaterial1, servicoMaterial2, servicoMaterial3);
        // Cálculo esperado: (10.50 * 2) + (25.75 * 1.5) + (8.00 * 3) = 21 + 38.625 + 24 = 83.625

        // when
        BigDecimal resultado = ServicoCalculatorUtil.calcularValorMateriais(materiais);

        // then
        assertThat(resultado).isEqualByComparingTo(new BigDecimal("83.625"));
    }

    @Test
    void deveRetornarZeroQuandoListaMateriaisENull() {
        // when
        BigDecimal resultado = ServicoCalculatorUtil.calcularValorMateriais(null);

        // then
        assertThat(resultado).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    void deveRetornarZeroQuandoListaMateriaisEVazia() {
        // when
        BigDecimal resultado = ServicoCalculatorUtil.calcularValorMateriais(Collections.emptyList());

        // then
        assertThat(resultado).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    void deveFiltrarMateriaisComMaterialNull() {
        // given
        ServicoMaterial servicoMaterialSemMaterial = new ServicoMaterial();
        servicoMaterialSemMaterial.setQuantidade(new BigDecimal("5"));
        
        List<ServicoMaterial> materiais = Arrays.asList(servicoMaterial1, servicoMaterialSemMaterial);

        // when
        BigDecimal resultado = ServicoCalculatorUtil.calcularValorMateriais(materiais);

        // then
        // Apenas servicoMaterial1 deve ser considerado: 10.50 * 2 = 21
        assertThat(resultado).isEqualByComparingTo(new BigDecimal("21.00"));
    }

    @Test
    void deveFiltrarMateriaisComQuantidadeNull() {
        // given
        ServicoMaterial servicoMaterialSemQuantidade = new ServicoMaterial();
        servicoMaterialSemQuantidade.setMaterial(material1);
        // quantidade fica null
        
        List<ServicoMaterial> materiais = Arrays.asList(servicoMaterial2, servicoMaterialSemQuantidade);

        // when
        BigDecimal resultado = ServicoCalculatorUtil.calcularValorMateriais(materiais);

        // then
        // Apenas servicoMaterial2 deve ser considerado: 25.75 * 1.5 = 38.625
        assertThat(resultado).isEqualByComparingTo(new BigDecimal("38.625"));
    }

    @Test
    void deveTratarValorUnitarioNullComoZero() {
        // given
        Material materialSemValor = new Material();
        // valorUnitario fica null
        
        ServicoMaterial servicoMaterialSemValor = new ServicoMaterial();
        servicoMaterialSemValor.setMaterial(materialSemValor);
        servicoMaterialSemValor.setQuantidade(new BigDecimal("10"));
        
        List<ServicoMaterial> materiais = Arrays.asList(servicoMaterial1, servicoMaterialSemValor);

        // when
        BigDecimal resultado = ServicoCalculatorUtil.calcularValorMateriais(materiais);

        // then
        // servicoMaterial1: 10.50 * 2 = 21, servicoMaterialSemValor: 0 * 10 = 0
        assertThat(resultado).isEqualByComparingTo(new BigDecimal("21.00"));
    }

    @Test
    void deveTratarQuantidadeNullComoZeroNoCálculo() {
        // given
        Material materialComValor = new Material();
        materialComValor.setValorUnitario(new BigDecimal("15.00"));
        
        ServicoMaterial servicoMaterialComQuantidadeNull = new ServicoMaterial();
        servicoMaterialComQuantidadeNull.setMaterial(materialComValor);
        // quantidade será tratada como null no filtro, então este item será ignorado
        
        List<ServicoMaterial> materiais = Arrays.asList(servicoMaterial1, servicoMaterialComQuantidadeNull);

        // when
        BigDecimal resultado = ServicoCalculatorUtil.calcularValorMateriais(materiais);

        // then
        // Apenas servicoMaterial1 é considerado: 10.50 * 2 = 21
        assertThat(resultado).isEqualByComparingTo(new BigDecimal("21.00"));
    }

    // Testes do método calcularValorTotal
    @Test
    void deveCalcularValorTotalCorretamente() {
        // given
        BigDecimal precoMaoDeObra = new BigDecimal("100.00");
        BigDecimal valorMateriais = new BigDecimal("50.75");

        // when
        BigDecimal resultado = ServicoCalculatorUtil.calcularValorTotal(precoMaoDeObra, valorMateriais);

        // then
        assertThat(resultado).isEqualByComparingTo(new BigDecimal("150.75"));
    }

    @Test
    void deveTratarPrecoMaoDeObraNullComoZero() {
        // given
        BigDecimal valorMateriais = new BigDecimal("50.75");

        // when
        BigDecimal resultado = ServicoCalculatorUtil.calcularValorTotal(null, valorMateriais);

        // then
        assertThat(resultado).isEqualByComparingTo(new BigDecimal("50.75"));
    }

    @Test
    void deveTratarValorMateriaisNullComoZero() {
        // given
        BigDecimal precoMaoDeObra = new BigDecimal("100.00");

        // when
        BigDecimal resultado = ServicoCalculatorUtil.calcularValorTotal(precoMaoDeObra, null);

        // then
        assertThat(resultado).isEqualByComparingTo(new BigDecimal("100.00"));
    }

    @Test
    void deveTratarAmbosValoresNullComoZero() {
        // when
        BigDecimal resultado = ServicoCalculatorUtil.calcularValorTotal(null, null);

        // then
        assertThat(resultado).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    void deveCalcularValorTotalComValoresZero() {
        // given
        BigDecimal precoMaoDeObra = BigDecimal.ZERO;
        BigDecimal valorMateriais = BigDecimal.ZERO;

        // when
        BigDecimal resultado = ServicoCalculatorUtil.calcularValorTotal(precoMaoDeObra, valorMateriais);

        // then
        assertThat(resultado).isEqualByComparingTo(BigDecimal.ZERO);
    }

    // Testes do método atualizarValoresCalculados
    @Test
    void deveAtualizarValoresCalculadosCorretamente() {
        // given
        Servico servico = new Servico();
        servico.setPreco(new BigDecimal("200.00"));
        servico.setMateriais(Arrays.asList(servicoMaterial1, servicoMaterial2));

        // when
        ServicoCalculatorUtil.atualizarValoresCalculados(servico);

        // then
        // Valor materiais: (10.50 * 2) + (25.75 * 1.5) = 21 + 38.625 = 59.625
        assertThat(servico.getValorMateriais()).isEqualByComparingTo(new BigDecimal("59.625"));
        // Valor total: 200.00 + 59.625 = 259.625
        assertThat(servico.getValorTotal()).isEqualByComparingTo(new BigDecimal("259.625"));
    }

    @Test
    void deveAtualizarValoresComServicoSemMateriais() {
        // given
        Servico servico = new Servico();
        servico.setPreco(new BigDecimal("150.00"));
        servico.setMateriais(Collections.emptyList());

        // when
        ServicoCalculatorUtil.atualizarValoresCalculados(servico);

        // then
        assertThat(servico.getValorMateriais()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(servico.getValorTotal()).isEqualByComparingTo(new BigDecimal("150.00"));
    }

    @Test
    void deveAtualizarValoresComServicoSemPreco() {
        // given
        Servico servico = new Servico();
        // preço fica null
        servico.setMateriais(Arrays.asList(servicoMaterial1));

        // when
        ServicoCalculatorUtil.atualizarValoresCalculados(servico);

        // then
        // Valor materiais: 10.50 * 2 = 21
        assertThat(servico.getValorMateriais()).isEqualByComparingTo(new BigDecimal("21.00"));
        // Valor total: 0 + 21 = 21
        assertThat(servico.getValorTotal()).isEqualByComparingTo(new BigDecimal("21.00"));
    }

    @Test
    void deveAtualizarValoresComServicoSemPrecoESemMateriais() {
        // given
        Servico servico = new Servico();
        // preço e materiais ficam null/vazios

        // when
        ServicoCalculatorUtil.atualizarValoresCalculados(servico);

        // then
        assertThat(servico.getValorMateriais()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(servico.getValorTotal()).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    void naoDeveAlterarNadaQuandoServicoENull() {
        // when/then - não deve lançar exceção
        ServicoCalculatorUtil.atualizarValoresCalculados(null);
        // Se chegou até aqui, o teste passou
    }

    @Test
    void deveAtualizarValoresComMateriaisComplexos() {
        // given
        Servico servico = new Servico();
        servico.setPreco(new BigDecimal("500.00"));
        
        // Criando cenário com diferentes tipos de materiais
        List<ServicoMaterial> materiaisComplexos = Arrays.asList(
            servicoMaterial1,  // 10.50 * 2 = 21
            servicoMaterial2,  // 25.75 * 1.5 = 38.625
            servicoMaterial3   // 8.00 * 3 = 24
        );
        servico.setMateriais(materiaisComplexos);

        // when
        ServicoCalculatorUtil.atualizarValoresCalculados(servico);

        // then
        // Valor materiais: 21 + 38.625 + 24 = 83.625
        assertThat(servico.getValorMateriais()).isEqualByComparingTo(new BigDecimal("83.625"));
        // Valor total: 500.00 + 83.625 = 583.625
        assertThat(servico.getValorTotal()).isEqualByComparingTo(new BigDecimal("583.625"));
    }

    @Test
    void deveManterPrecisaoEmCalculosComDecimais() {
        // given
        Material materialDecimal = new Material();
        materialDecimal.setValorUnitario(new BigDecimal("12.345"));
        
        ServicoMaterial servicoMaterialDecimal = new ServicoMaterial();
        servicoMaterialDecimal.setMaterial(materialDecimal);
        servicoMaterialDecimal.setQuantidade(new BigDecimal("2.5"));
        
        Servico servico = new Servico();
        servico.setPreco(new BigDecimal("99.99"));
        servico.setMateriais(Arrays.asList(servicoMaterialDecimal));

        // when
        ServicoCalculatorUtil.atualizarValoresCalculados(servico);

        // then
        // Valor materiais: 12.345 * 2.5 = 30.8625
        assertThat(servico.getValorMateriais()).isEqualByComparingTo(new BigDecimal("30.8625"));
        // Valor total: 99.99 + 30.8625 = 130.8525
        assertThat(servico.getValorTotal()).isEqualByComparingTo(new BigDecimal("130.8525"));
    }
} 