package com.senac.dentalsync.core.model;

import com.senac.dentalsync.core.persistency.model.ServicoMaterialId;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ServicoMaterialIdTest {

    @Test
    void deveCriarServicoMaterialIdValido() {
        ServicoMaterialId id = new ServicoMaterialId(1L, 2L);
        assertEquals(1L, id.getServicoId());
        assertEquals(2L, id.getMaterialId());
    }

    @Test
    void deveValidarConstrutorVazio() {
        ServicoMaterialId id = new ServicoMaterialId();
        assertNull(id.getServicoId());
        assertNull(id.getMaterialId());
    }

    @Test
    void deveValidarGettersESetters() {
        ServicoMaterialId id = new ServicoMaterialId();
        id.setServicoId(1L);
        id.setMaterialId(2L);

        assertEquals(1L, id.getServicoId());
        assertEquals(2L, id.getMaterialId());
    }

    @Test
    void deveValidarEqualsEHashCode() {
        ServicoMaterialId id1 = new ServicoMaterialId(1L, 2L);
        ServicoMaterialId id2 = new ServicoMaterialId(1L, 2L);
        ServicoMaterialId id3 = new ServicoMaterialId(2L, 2L);
        ServicoMaterialId id4 = new ServicoMaterialId(1L, 3L);

        // Teste equals
        assertEquals(id1, id2);
        assertNotEquals(id1, id3);
        assertNotEquals(id1, id4);
        assertNotEquals(id1, null);
        assertNotEquals(id1, new Object());

        // Teste hashCode
        assertEquals(id1.hashCode(), id2.hashCode());
        assertNotEquals(id1.hashCode(), id3.hashCode());
        assertNotEquals(id1.hashCode(), id4.hashCode());
    }

    @Test
    void deveValidarToString() {
        ServicoMaterialId id = new ServicoMaterialId(1L, 2L);
        String toString = id.toString();
        
        assertTrue(toString.contains("servicoId=1"));
        assertTrue(toString.contains("materialId=2"));
    }
} 