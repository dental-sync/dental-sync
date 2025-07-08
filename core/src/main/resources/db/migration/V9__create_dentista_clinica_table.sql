-- Criação da tabela de relacionamento Many-to-Many entre Dentista e Clinica
CREATE TABLE IF NOT EXISTS dentista_clinica (
    dentista_id BIGINT NOT NULL,
    clinica_id BIGINT NOT NULL,
    PRIMARY KEY (dentista_id, clinica_id),
    FOREIGN KEY (dentista_id) REFERENCES dentista(id) ON DELETE CASCADE,
    FOREIGN KEY (clinica_id) REFERENCES clinica(id) ON DELETE CASCADE
);

-- Migração de dados existentes (se houver)
-- Inserir relacionamentos existentes da tabela de pedidos
INSERT IGNORE INTO dentista_clinica (dentista_id, clinica_id)
SELECT DISTINCT p.dentista_id, p.clinica_id
FROM pedidos p
WHERE p.dentista_id IS NOT NULL 
  AND p.clinica_id IS NOT NULL;

-- Criar índices para melhorar performance
CREATE INDEX idx_dentista_clinica_dentista_id ON dentista_clinica(dentista_id);
CREATE INDEX idx_dentista_clinica_clinica_id ON dentista_clinica(clinica_id); 