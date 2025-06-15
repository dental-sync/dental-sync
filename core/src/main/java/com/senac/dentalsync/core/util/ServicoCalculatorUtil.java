package com.senac.dentalsync.core.util;

import java.math.BigDecimal;
import java.util.List;

import com.senac.dentalsync.core.persistency.model.Servico;
import com.senac.dentalsync.core.persistency.model.ServicoMaterial;

/**
 * Utilitário para cálculos relacionados aos valores de serviços
 */
public class ServicoCalculatorUtil {

    /**
     * Calcula o valor total dos materiais utilizados no serviço
     * @param materiais Lista de materiais do serviço
     * @return Valor total dos materiais
     */
    public static BigDecimal calcularValorMateriais(List<ServicoMaterial> materiais) {
        if (materiais == null || materiais.isEmpty()) {
            return BigDecimal.ZERO;
        }

        return materiais.stream()
                .filter(sm -> sm.getMaterial() != null && sm.getQuantidade() != null)
                .map(sm -> {
                    BigDecimal valorUnitario = sm.getMaterial().getValorUnitario();
                    BigDecimal quantidade = sm.getQuantidade();
                    
                    if (valorUnitario == null) valorUnitario = BigDecimal.ZERO;
                    if (quantidade == null) quantidade = BigDecimal.ZERO;
                    
                    return valorUnitario.multiply(quantidade);
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Calcula o valor total do serviço (mão de obra + materiais)
     * @param precoMaoDeObra Preço da mão de obra
     * @param valorMateriais Valor total dos materiais
     * @return Valor total do serviço
     */
    public static BigDecimal calcularValorTotal(BigDecimal precoMaoDeObra, BigDecimal valorMateriais) {
        BigDecimal preco = precoMaoDeObra != null ? precoMaoDeObra : BigDecimal.ZERO;
        BigDecimal materiais = valorMateriais != null ? valorMateriais : BigDecimal.ZERO;
        
        return preco.add(materiais);
    }

    /**
     * Atualiza os valores calculados do serviço
     * @param servico Serviço a ser atualizado
     */
    public static void atualizarValoresCalculados(Servico servico) {
        if (servico == null) return;

        BigDecimal valorMateriais = calcularValorMateriais(servico.getMateriais());
        BigDecimal valorTotal = calcularValorTotal(servico.getPreco(), valorMateriais);

        servico.setValorMateriais(valorMateriais);
        servico.setValorTotal(valorTotal);
    }
} 