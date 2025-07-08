package com.senac.dentalsync.core.model;

import com.senac.dentalsync.core.persistency.model.ServicoMaterialId;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ServicoMaterialIdTest {

    @Test
    void deveCriarServicoMaterialIdValido() {
        // Act
        ServicoMaterialId id = new ServicoMaterialId(1L, 2L);

        // Assert
        assertEquals(1L, id.getServicoId());
        assertEquals(2L, id.getMaterialId());
    }

    @Test
    void deveValidarConstrutorVazio() {
        // Act
        ServicoMaterialId id = new ServicoMaterialId();

        // Assert
        assertNull(id.getServicoId());
        assertNull(id.getMaterialId());
    }

    @Test
    void deveAceitarIdsNulos() {
        // Arrange & Act
        ServicoMaterialId id = new ServicoMaterialId(null, null);

        // Assert
        assertNull(id.getServicoId());
        assertNull(id.getMaterialId());
    }

    @Test
    void deveAceitarServicoIdNulo() {
        // Arrange & Act
        ServicoMaterialId id = new ServicoMaterialId(null, 2L);

        // Assert
        assertNull(id.getServicoId());
        assertEquals(2L, id.getMaterialId());
    }

    @Test
    void deveAceitarMaterialIdNulo() {
        // Arrange & Act
        ServicoMaterialId id = new ServicoMaterialId(1L, null);

        // Assert
        assertEquals(1L, id.getServicoId());
        assertNull(id.getMaterialId());
    }

    @Test
    void deveAceitarIdsZero() {
        // Arrange & Act
        ServicoMaterialId id = new ServicoMaterialId(0L, 0L);

        // Assert
        assertEquals(0L, id.getServicoId());
        assertEquals(0L, id.getMaterialId());
    }

    @Test
    void deveAceitarIdsNegativos() {
        // Arrange & Act
        ServicoMaterialId id = new ServicoMaterialId(-1L, -2L);

        // Assert
        assertEquals(-1L, id.getServicoId());
        assertEquals(-2L, id.getMaterialId());
    }

    @Test
    void deveValidarGettersESetters() {
        // Arrange
        ServicoMaterialId id = new ServicoMaterialId();

        // Act
        id.setServicoId(1L);
        id.setMaterialId(2L);

        // Assert
        assertEquals(1L, id.getServicoId());
        assertEquals(2L, id.getMaterialId());
    }

    @Test
    void deveValidarSettersComValoresNulos() {
        // Arrange
        ServicoMaterialId id = new ServicoMaterialId(1L, 2L);

        // Act
        id.setServicoId(null);
        id.setMaterialId(null);

        // Assert
        assertNull(id.getServicoId());
        assertNull(id.getMaterialId());
    }

    @Test
    void deveValidarEqualsComObjetosIguais() {
        // Arrange
        ServicoMaterialId id1 = new ServicoMaterialId(1L, 2L);
        ServicoMaterialId id2 = new ServicoMaterialId(1L, 2L);

        // Act & Assert
        assertEquals(id1, id2);
        assertEquals(id2, id1); // Teste de simetria
    }

    @Test
    void deveValidarEqualsComObjetosDiferentes() {
        // Arrange
        ServicoMaterialId id1 = new ServicoMaterialId(1L, 2L);
        ServicoMaterialId id2 = new ServicoMaterialId(2L, 2L);
        ServicoMaterialId id3 = new ServicoMaterialId(1L, 3L);

        // Act & Assert
        assertNotEquals(id1, id2);
        assertNotEquals(id1, id3);
        assertNotEquals(id2, id3);
    }

    @Test
    void deveValidarEqualsComNull() {
        // Arrange
        ServicoMaterialId id = new ServicoMaterialId(1L, 2L);

        // Act & Assert
        assertNotEquals(id, null);
    }

    @Test
    void deveValidarEqualsComOutroTipoDeObjeto() {
        // Arrange
        ServicoMaterialId id = new ServicoMaterialId(1L, 2L);

        // Act & Assert
        assertNotEquals(id, new Object());
        assertNotEquals(id, "string");
        assertNotEquals(id, 123);
    }

    @Test
    void deveValidarEqualsComCamposNulos() {
        // Arrange
        ServicoMaterialId id1 = new ServicoMaterialId(null, null);
        ServicoMaterialId id2 = new ServicoMaterialId(null, null);
        ServicoMaterialId id3 = new ServicoMaterialId(1L, null);

        // Act & Assert
        assertEquals(id1, id2);
        assertNotEquals(id1, id3);
    }

    @Test
    void deveValidarHashCodeComObjetosIguais() {
        // Arrange
        ServicoMaterialId id1 = new ServicoMaterialId(1L, 2L);
        ServicoMaterialId id2 = new ServicoMaterialId(1L, 2L);

        // Act & Assert
        assertEquals(id1.hashCode(), id2.hashCode());
    }

    @Test
    void deveValidarHashCodeComObjetosDiferentes() {
        // Arrange
        ServicoMaterialId id1 = new ServicoMaterialId(1L, 2L);
        ServicoMaterialId id2 = new ServicoMaterialId(2L, 2L);
        ServicoMaterialId id3 = new ServicoMaterialId(1L, 3L);

        // Act & Assert
        assertNotEquals(id1.hashCode(), id2.hashCode());
        assertNotEquals(id1.hashCode(), id3.hashCode());
    }

    @Test
    void deveValidarToString() {
        // Arrange
        ServicoMaterialId id = new ServicoMaterialId(1L, 2L);

        // Act
        String toString = id.toString();

        // Assert
        assertTrue(toString.contains("servicoId=1"));
        assertTrue(toString.contains("materialId=2"));
        assertTrue(toString.contains("ServicoMaterialId"));
    }

    @Test
    void deveValidarToStringComValoresNulos() {
        // Arrange
        ServicoMaterialId id = new ServicoMaterialId(null, null);

        // Act
        String toString = id.toString();

        // Assert
        assertTrue(toString.contains("servicoId=null"));
        assertTrue(toString.contains("materialId=null"));
        assertTrue(toString.contains("ServicoMaterialId"));
    }

    @Test
    void deveValidarReflexividadeEquals() {
        // Arrange
        ServicoMaterialId id = new ServicoMaterialId(1L, 2L);

        // Act & Assert
        assertEquals(id, id);
    }

    @Test
    void deveValidarTransitividadeEquals() {
        // Arrange
        ServicoMaterialId id1 = new ServicoMaterialId(1L, 2L);
        ServicoMaterialId id2 = new ServicoMaterialId(1L, 2L);
        ServicoMaterialId id3 = new ServicoMaterialId(1L, 2L);

        // Act & Assert
        assertEquals(id1, id2);
        assertEquals(id2, id3);
        assertEquals(id1, id3); // Transitividade
    }
} 