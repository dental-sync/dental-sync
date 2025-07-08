-- CORREÇÃO URGENTE DOS TRIGGERS DE MATERIAL
-- Baseado na estrutura real do modelo Material.java

USE dentalsyncdb;

-- Desabilitar safe mode
SET SQL_SAFE_UPDATES = 0;

-- ================================================================================================
-- PARTE 1: REMOVER TRIGGERS INCORRETOS DO MATERIAL
-- ================================================================================================

SELECT '🔧 REMOVENDO TRIGGERS INCORRETOS DO MATERIAL...' as status;

-- Remover triggers antigos do material
DROP TRIGGER IF EXISTS trigger_material_backup;
DROP TRIGGER IF EXISTS trigger_material_soft_delete_backup;

-- ================================================================================================
-- PARTE 2: RECRIAR TABELA DE BACKUP DO MATERIAL COM ESTRUTURA CORRETA
-- ================================================================================================

SELECT '📋 RECRIANDO TABELA DE BACKUP DO MATERIAL...' as status;

-- Remover tabela antiga
DROP TABLE IF EXISTS material_backup;

-- Criar tabela com estrutura correta baseada no Material.java
CREATE TABLE material_backup (
    id BIGINT PRIMARY KEY,
    nome VARCHAR(255),
    categoria_material_id BIGINT,  -- CORRETO: categoria_material_id (não categoria_id)
    quantidade DECIMAL(10,2),
    unidade_medida VARCHAR(50),    -- NOVO: unidadeMedida
    valor_unitario DECIMAL(10,2),  -- CORRETO: valorUnitario (não preco)
    estoque_minimo DECIMAL(10,2),  -- CORRETO: estoqueMinimo
    status ENUM('SEM_ESTOQUE', 'BAIXO_ESTOQUE', 'EM_ESTOQUE') DEFAULT 'EM_ESTOQUE',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    backup_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    backup_reason VARCHAR(255) DEFAULT 'Backup automático'
);

SELECT '✅ TABELA MATERIAL_BACKUP RECRIADA COM ESTRUTURA CORRETA!' as status;

-- ================================================================================================
-- PARTE 3: RECRIAR TRIGGERS DO MATERIAL COM CAMPOS CORRETOS
-- ================================================================================================

SELECT '🔧 CRIANDO TRIGGERS CORRETOS DO MATERIAL...' as status;

DELIMITER //

-- Trigger para MATERIAL (DELETE REAL) - CORRIGIDO
CREATE TRIGGER trigger_material_backup
BEFORE DELETE ON material
FOR EACH ROW
BEGIN
    INSERT IGNORE INTO material_backup (
        id, nome, categoria_material_id, quantidade, unidade_medida, valor_unitario, estoque_minimo, status,
        is_active, created_at, updated_at, created_by, updated_by, backup_reason
    ) VALUES (
        OLD.id, OLD.nome, OLD.categoria_material_id, OLD.quantidade, OLD.unidade_medida, OLD.valor_unitario, OLD.estoque_minimo, OLD.status,
        OLD.is_active, OLD.created_at, OLD.updated_at, OLD.created_by, OLD.updated_by,
        'DELETE REAL - Exclusão física'
    );
END//

-- Trigger para MATERIAL (SOFT DELETE) - CORRIGIDO
CREATE TRIGGER trigger_material_soft_delete_backup
BEFORE UPDATE ON material
FOR EACH ROW
BEGIN
    IF OLD.is_active = TRUE AND NEW.is_active = FALSE THEN
        INSERT IGNORE INTO material_backup (
            id, nome, categoria_material_id, quantidade, unidade_medida, valor_unitario, estoque_minimo, status,
            is_active, created_at, updated_at, created_by, updated_by, backup_reason
        ) VALUES (
            OLD.id, OLD.nome, OLD.categoria_material_id, OLD.quantidade, OLD.unidade_medida, OLD.valor_unitario, OLD.estoque_minimo, OLD.status,
            OLD.is_active, OLD.created_at, OLD.updated_at, OLD.created_by, OLD.updated_by,
            'SOFT DELETE - Exclusão lógica'
        );
    END IF;
END//

DELIMITER ;

SELECT '✅ TRIGGERS DO MATERIAL CRIADOS COM SUCESSO!' as status;

-- ================================================================================================
-- PARTE 4: VERIFICAR SE OS TRIGGERS FORAM CRIADOS CORRETAMENTE
-- ================================================================================================

SELECT '🔍 VERIFICANDO TRIGGERS DO MATERIAL...' as status;

-- Verificar se os triggers foram criados
SELECT 
    TRIGGER_NAME,
    EVENT_OBJECT_TABLE,
    EVENT_MANIPULATION,
    ACTION_TIMING
FROM information_schema.triggers 
WHERE trigger_schema = 'dentalsyncdb' 
AND trigger_name LIKE '%material%'
ORDER BY TRIGGER_NAME;

-- ================================================================================================
-- PARTE 5: TESTE RÁPIDO COM MATERIAL
-- ================================================================================================

SELECT '🧪 TESTANDO BACKUP DO MATERIAL...' as status;

-- Verificar se existe categoria_material
SET @categoria_id = (SELECT MIN(id) FROM categoria_material WHERE is_active = 1);

-- Se não existir, criar uma
INSERT INTO categoria_material (nome, is_active, created_at, updated_at)
SELECT 'Categoria Teste', TRUE, NOW(), NOW()
WHERE @categoria_id IS NULL;

-- Pegar ID da categoria válida
SET @categoria_id = (SELECT MIN(id) FROM categoria_material WHERE is_active = 1);

-- Inserir material de teste
INSERT INTO material (nome, categoria_material_id, quantidade, unidade_medida, valor_unitario, estoque_minimo, status, is_active, created_at, updated_at) 
VALUES ('Material Teste Backup', @categoria_id, 10.00, 'unidade', 25.50, 5.00, 'EM_ESTOQUE', TRUE, NOW(), NOW());

SET @material_id = LAST_INSERT_ID();

-- Contar backups antes
SELECT 'BACKUPS ANTES:' as momento, COUNT(*) as total FROM material_backup;

-- Fazer SOFT DELETE
UPDATE material SET is_active = FALSE WHERE id = @material_id;

-- Contar backups depois
SELECT 'BACKUPS DEPOIS SOFT DELETE:' as momento, COUNT(*) as total FROM material_backup;

-- Mostrar backup criado
SELECT 'BACKUP CRIADO:' as info, nome, categoria_material_id, valor_unitario, backup_reason 
FROM material_backup 
WHERE id = @material_id;

-- Inserir outro material para teste DELETE REAL
INSERT INTO material (nome, categoria_material_id, quantidade, unidade_medida, valor_unitario, estoque_minimo, status, is_active, created_at, updated_at) 
VALUES ('Material Teste Delete Real', @categoria_id, 20.00, 'unidade', 30.00, 10.00, 'EM_ESTOQUE', TRUE, NOW(), NOW());

SET @material_delete_id = LAST_INSERT_ID();

-- Fazer DELETE REAL
DELETE FROM material WHERE id = @material_delete_id;

-- Verificar backup do DELETE REAL
SELECT 'BACKUP DELETE REAL:' as info, COUNT(*) as total 
FROM material_backup 
WHERE backup_reason = 'DELETE REAL - Exclusão física';

-- Reabilitar safe mode
SET SQL_SAFE_UPDATES = 1;

SELECT '🎉 CORREÇÃO DOS TRIGGERS DO MATERIAL CONCLUÍDA!' as status;
SELECT '✅ Agora continue executando o script principal!' as instrucao; 