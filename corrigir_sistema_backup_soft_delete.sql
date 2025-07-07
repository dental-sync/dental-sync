-- ================================================================================================
-- CORREÇÃO COMPLETA DO SISTEMA DE BACKUP - SOFT DELETE
-- Agora que o sistema usa SOFT DELETE, os triggers precisam ser ajustados
-- ================================================================================================

USE dentalsyncdb;

-- Desabilitar safe mode
SET SQL_SAFE_UPDATES = 0;

-- ================================================================================================
-- PARTE 1: LIMPEZA E PREPARAÇÃO
-- ================================================================================================

SELECT '🔧 CORRIGINDO SISTEMA DE BACKUP PARA SOFT DELETE...' as status;

-- Remover triggers antigos
DROP TRIGGER IF EXISTS trigger_paciente_backup;
DROP TRIGGER IF EXISTS trigger_dentista_backup;
DROP TRIGGER IF EXISTS trigger_clinica_backup;
DROP TRIGGER IF EXISTS trigger_protetico_backup;
DROP TRIGGER IF EXISTS trigger_servicos_backup;
DROP TRIGGER IF EXISTS trigger_pedidos_backup;
DROP TRIGGER IF EXISTS trigger_pedido_servico_backup;
DROP TRIGGER IF EXISTS trigger_material_backup;

-- Remover triggers de soft delete antigos
DROP TRIGGER IF EXISTS trigger_paciente_soft_delete_backup;
DROP TRIGGER IF EXISTS trigger_dentista_soft_delete_backup;
DROP TRIGGER IF EXISTS trigger_clinica_soft_delete_backup;
DROP TRIGGER IF EXISTS trigger_protetico_soft_delete_backup;
DROP TRIGGER IF EXISTS trigger_servicos_soft_delete_backup;
DROP TRIGGER IF EXISTS trigger_pedidos_soft_delete_backup;
DROP TRIGGER IF EXISTS trigger_material_soft_delete_backup;

-- ================================================================================================
-- PARTE 2: CRIAR TRIGGERS PRINCIPAIS PARA SOFT DELETE
-- ================================================================================================

SELECT '🔧 CRIANDO TRIGGERS PARA SOFT DELETE...' as status;

DELIMITER //

-- Trigger para PEDIDOS (SOFT DELETE) - PRINCIPAL
CREATE TRIGGER trigger_pedidos_soft_delete_backup
BEFORE UPDATE ON pedidos
FOR EACH ROW
BEGIN
    -- Só executa se mudou de ativo para inativo
    IF OLD.is_active = TRUE AND NEW.is_active = FALSE THEN
        -- Primeiro, faz backup dos serviços relacionados
        INSERT IGNORE INTO pedido_servico_backup (pedido_id, servico_id, backup_reason)
        SELECT OLD.id, servico_id, 'SOFT DELETE PEDIDO - Exclusão lógica'
        FROM pedido_servico 
        WHERE pedido_id = OLD.id;
        
        -- Depois, faz backup do pedido
        INSERT IGNORE INTO pedidos_backup (
            id, cliente_id, dentista_id, clinica_id, protetico_id, data_entrega, 
            prioridade, status, odontograma, observacao, is_active, created_at, 
            updated_at, created_by, updated_by, backup_reason
        ) VALUES (
            OLD.id, OLD.cliente_id, OLD.dentista_id, OLD.clinica_id, OLD.protetico_id, 
            OLD.data_entrega, OLD.prioridade, OLD.status, OLD.odontograma, OLD.observacao, 
            OLD.is_active, OLD.created_at, OLD.updated_at, OLD.created_by, OLD.updated_by,
            'SOFT DELETE - Exclusão lógica'
        );
    END IF;
END//

-- Trigger para PACIENTE (SOFT DELETE) - Com backup de pedidos relacionados
CREATE TRIGGER trigger_paciente_soft_delete_backup
BEFORE UPDATE ON paciente
FOR EACH ROW
BEGIN
    IF OLD.is_active = TRUE AND NEW.is_active = FALSE THEN
        -- Primeiro, faz backup dos pedidos relacionados
        INSERT IGNORE INTO pedido_servico_backup (pedido_id, servico_id, backup_reason)
        SELECT p.id, ps.servico_id, 'SOFT DELETE PACIENTE - Exclusão lógica'
        FROM pedidos p 
        JOIN pedido_servico ps ON p.id = ps.pedido_id
        WHERE p.cliente_id = OLD.id AND p.is_active = TRUE;
        
        INSERT IGNORE INTO pedidos_backup (
            id, cliente_id, dentista_id, clinica_id, protetico_id, data_entrega, 
            prioridade, status, odontograma, observacao, is_active, created_at, 
            updated_at, created_by, updated_by, backup_reason
        )
        SELECT 
            p.id, p.cliente_id, p.dentista_id, p.clinica_id, p.protetico_id, 
            p.data_entrega, p.prioridade, p.status, p.odontograma, p.observacao, 
            p.is_active, p.created_at, p.updated_at, p.created_by, p.updated_by,
            'SOFT DELETE PACIENTE - Exclusão lógica'
        FROM pedidos p 
        WHERE p.cliente_id = OLD.id AND p.is_active = TRUE;
        
        -- Depois, faz backup do paciente
        INSERT IGNORE INTO paciente_backup (
            id, nome, telefone, email, data_nascimento, ultimo_pedido,
            is_active, created_at, updated_at, created_by, updated_by, backup_reason
        ) VALUES (
            OLD.id, OLD.nome, OLD.telefone, OLD.email, OLD.data_nascimento, OLD.ultimo_pedido,
            OLD.is_active, OLD.created_at, OLD.updated_at, OLD.created_by, OLD.updated_by,
            'SOFT DELETE - Exclusão lógica'
        );
    END IF;
END//

-- Trigger para DENTISTA (SOFT DELETE) - Com backup de pedidos relacionados
CREATE TRIGGER trigger_dentista_soft_delete_backup
BEFORE UPDATE ON dentista
FOR EACH ROW
BEGIN
    IF OLD.is_active = TRUE AND NEW.is_active = FALSE THEN
        -- Primeiro, faz backup dos pedidos relacionados
        INSERT IGNORE INTO pedido_servico_backup (pedido_id, servico_id, backup_reason)
        SELECT p.id, ps.servico_id, 'SOFT DELETE DENTISTA - Exclusão lógica'
        FROM pedidos p 
        JOIN pedido_servico ps ON p.id = ps.pedido_id
        WHERE p.dentista_id = OLD.id AND p.is_active = TRUE;
        
        INSERT IGNORE INTO pedidos_backup (
            id, cliente_id, dentista_id, clinica_id, protetico_id, data_entrega, 
            prioridade, status, odontograma, observacao, is_active, created_at, 
            updated_at, created_by, updated_by, backup_reason
        )
        SELECT 
            p.id, p.cliente_id, p.dentista_id, p.clinica_id, p.protetico_id, 
            p.data_entrega, p.prioridade, p.status, p.odontograma, p.observacao, 
            p.is_active, p.created_at, p.updated_at, p.created_by, p.updated_by,
            'SOFT DELETE DENTISTA - Exclusão lógica'
        FROM pedidos p 
        WHERE p.dentista_id = OLD.id AND p.is_active = TRUE;
        
        -- Depois, faz backup do dentista
        INSERT IGNORE INTO dentista_backup (
            id, nome, cro, telefone, email, is_active, created_at, updated_at, created_by, updated_by, backup_reason
        ) VALUES (
            OLD.id, OLD.nome, OLD.cro, OLD.telefone, OLD.email, OLD.is_active, OLD.created_at, OLD.updated_at, OLD.created_by, OLD.updated_by,
            'SOFT DELETE - Exclusão lógica'
        );
    END IF;
END//

-- Trigger para PROTETICO (SOFT DELETE) - Com backup de pedidos relacionados
CREATE TRIGGER trigger_protetico_soft_delete_backup
BEFORE UPDATE ON protetico
FOR EACH ROW
BEGIN
    IF OLD.is_active = TRUE AND NEW.is_active = FALSE THEN
        -- Primeiro, faz backup dos pedidos relacionados
        INSERT IGNORE INTO pedido_servico_backup (pedido_id, servico_id, backup_reason)
        SELECT p.id, ps.servico_id, 'SOFT DELETE PROTETICO - Exclusão lógica'
        FROM pedidos p 
        JOIN pedido_servico ps ON p.id = ps.pedido_id
        WHERE p.protetico_id = OLD.id AND p.is_active = TRUE;
        
        INSERT IGNORE INTO pedidos_backup (
            id, cliente_id, dentista_id, clinica_id, protetico_id, data_entrega, 
            prioridade, status, odontograma, observacao, is_active, created_at, 
            updated_at, created_by, updated_by, backup_reason
        )
        SELECT 
            p.id, p.cliente_id, p.dentista_id, p.clinica_id, p.protetico_id, 
            p.data_entrega, p.prioridade, p.status, p.odontograma, p.observacao, 
            p.is_active, p.created_at, p.updated_at, p.created_by, p.updated_by,
            'SOFT DELETE PROTETICO - Exclusão lógica'
        FROM pedidos p 
        WHERE p.protetico_id = OLD.id AND p.is_active = TRUE;
        
        -- Depois, faz backup do protético
        INSERT IGNORE INTO protetico_backup (
            id, nome, cro, telefone, email, senha, is_active, created_at, updated_at, created_by, updated_by, backup_reason
        ) VALUES (
            OLD.id, OLD.nome, OLD.cro, OLD.telefone, OLD.email, OLD.senha, OLD.is_active, OLD.created_at, OLD.updated_at, OLD.created_by, OLD.updated_by,
            'SOFT DELETE - Exclusão lógica'
        );
    END IF;
END//

-- Trigger para CLINICA (SOFT DELETE) - Com backup de pedidos relacionados
CREATE TRIGGER trigger_clinica_soft_delete_backup
BEFORE UPDATE ON clinica
FOR EACH ROW
BEGIN
    IF OLD.is_active = TRUE AND NEW.is_active = FALSE THEN
        -- Primeiro, faz backup dos pedidos relacionados
        INSERT IGNORE INTO pedido_servico_backup (pedido_id, servico_id, backup_reason)
        SELECT p.id, ps.servico_id, 'SOFT DELETE CLINICA - Exclusão lógica'
        FROM pedidos p 
        JOIN pedido_servico ps ON p.id = ps.pedido_id
        WHERE p.clinica_id = OLD.id AND p.is_active = TRUE;
        
        INSERT IGNORE INTO pedidos_backup (
            id, cliente_id, dentista_id, clinica_id, protetico_id, data_entrega, 
            prioridade, status, odontograma, observacao, is_active, created_at, 
            updated_at, created_by, updated_by, backup_reason
        )
        SELECT 
            p.id, p.cliente_id, p.dentista_id, p.clinica_id, p.protetico_id, 
            p.data_entrega, p.prioridade, p.status, p.odontograma, p.observacao, 
            p.is_active, p.created_at, p.updated_at, p.created_by, p.updated_by,
            'SOFT DELETE CLINICA - Exclusão lógica'
        FROM pedidos p 
        WHERE p.clinica_id = OLD.id AND p.is_active = TRUE;
        
        -- Depois, faz backup da clínica
        INSERT IGNORE INTO clinica_backup (
            id, nome, cnpj, telefone, email, endereco, is_active, created_at, updated_at, created_by, updated_by, backup_reason
        ) VALUES (
            OLD.id, OLD.nome, OLD.cnpj, OLD.telefone, OLD.email, OLD.endereco, OLD.is_active, OLD.created_at, OLD.updated_at, OLD.created_by, OLD.updated_by,
            'SOFT DELETE - Exclusão lógica'
        );
    END IF;
END//

-- Trigger para SERVICOS (SOFT DELETE)
CREATE TRIGGER trigger_servicos_soft_delete_backup
BEFORE UPDATE ON servicos
FOR EACH ROW
BEGIN
    IF OLD.is_active = TRUE AND NEW.is_active = FALSE THEN
        INSERT IGNORE INTO servicos_backup (
            id, nome, descricao, preco, is_active, created_at, updated_at, created_by, updated_by, backup_reason
        ) VALUES (
            OLD.id, OLD.nome, OLD.descricao, OLD.preco, OLD.is_active, OLD.created_at, OLD.updated_at, OLD.created_by, OLD.updated_by,
            'SOFT DELETE - Exclusão lógica'
        );
    END IF;
END//

-- Trigger para MATERIAL (SOFT DELETE)
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

CREATE PROCEDURE inserir_pedido(
    IN p_paciente_id INT,
    IN p_dentista_id INT,
    IN p_clinica_id INT,
    IN p_protetico_id INT,
    IN p_servico_id INT
)
BEGIN
    IF p_dentista_id IS NOT NULL AND p_clinica_id IS NOT NULL AND p_protetico_id IS NOT NULL AND p_servico_id IS NOT NULL THEN
        INSERT INTO pedidos (
            cliente_id, 
            dentista_id, 
            clinica_id, 
            protetico_id, 
            data_entrega, 
            prioridade, 
            status, 
            is_active, 
            created_at, 
            updated_at
        )
        VALUES (
            p_paciente_id, 
            p_dentista_id, 
            p_clinica_id, 
            p_protetico_id, 
            DATE_ADD(CURDATE(), INTERVAL 7 DAY), 
            'MEDIA', 
            'PENDENTE', 
            TRUE, 
            NOW(), 
            NOW()
        );
    END IF;
END //

DELIMITER ;

SELECT '✅ TRIGGERS PARA SOFT DELETE CRIADOS!' as status;

-- ================================================================================================
-- PARTE 3: VERIFICAÇÃO DOS TRIGGERS
-- ================================================================================================

SELECT '🔍 VERIFICANDO TRIGGERS CRIADOS...' as status;

SELECT 
    TRIGGER_NAME,
    EVENT_OBJECT_TABLE,
    EVENT_MANIPULATION,
    ACTION_TIMING
FROM information_schema.triggers 
WHERE trigger_schema = 'dentalsyncdb' 
AND trigger_name LIKE '%backup%'
ORDER BY EVENT_OBJECT_TABLE, EVENT_MANIPULATION;

-- ================================================================================================
-- PARTE 4: TESTE DO SISTEMA
-- ================================================================================================

SELECT '🧪 TESTANDO SISTEMA DE BACKUP...' as status;

-- Contar backups antes dos testes
SELECT 'BACKUPS ANTES DOS TESTES:' as momento;
SELECT 'Pacientes:', COUNT(*) as total FROM paciente_backup;
SELECT 'Dentistas:', COUNT(*) as total FROM dentista_backup;
SELECT 'Pedidos:', COUNT(*) as total FROM pedidos_backup;
SELECT 'Pedido-Servico:', COUNT(*) as total FROM pedido_servico_backup;

-- Teste: Criar dados para testar
START TRANSACTION;

-- Inserir dados de teste
INSERT INTO paciente (nome, telefone, email, data_nascimento, is_active, created_at, updated_at) 
VALUES ('Teste Backup Sistema', '(11) 99999-9999', 'teste@backup.com', '1990-01-01', TRUE, NOW(), NOW());
SET @paciente_id = LAST_INSERT_ID();

-- Criar pedido relacionado (se houver dentista, clinica, protetico e serviço)
SET @dentista_id = (SELECT MIN(id) FROM dentista WHERE is_active = TRUE);
SET @clinica_id = (SELECT MIN(id) FROM clinica WHERE is_active = TRUE);
SET @protetico_id = (SELECT MIN(id) FROM protetico WHERE is_active = TRUE);
SET @servico_id = (SELECT MIN(id) FROM servicos WHERE is_active = TRUE);

-- Só cria pedido se tiver todos os dados necessários
CALL inserir_pedido(@paciente_id, @dentista_id, @clinica_id, @protetico_id, @servico_id);

-- Fazer SOFT DELETE no paciente
UPDATE paciente SET is_active = FALSE WHERE id = @paciente_id;

COMMIT;

-- Contar backups depois dos testes
SELECT 'BACKUPS DEPOIS DOS TESTES:' as momento;
SELECT 'Pacientes:', COUNT(*) as total FROM paciente_backup;
SELECT 'Dentistas:', COUNT(*) as total FROM dentista_backup;
SELECT 'Pedidos:', COUNT(*) as total FROM pedidos_backup;
SELECT 'Pedido-Servico:', COUNT(*) as total FROM pedido_servico_backup;

-- Mostrar últimos backups criados
SELECT 'ÚLTIMOS BACKUPS CRIADOS:' as info;
SELECT 'Paciente:', nome, backup_reason FROM paciente_backup ORDER BY backup_date DESC LIMIT 1;
SELECT 'Pedido:', id, status, backup_reason FROM pedidos_backup ORDER BY backup_date DESC LIMIT 1;

-- Reabilitar safe mode
SET SQL_SAFE_UPDATES = 1;

-- ================================================================================================
-- PARTE 5: RESULTADO FINAL
-- ================================================================================================

SELECT '🎉 SISTEMA DE BACKUP CORRIGIDO PARA SOFT DELETE!' as status;
SELECT '✅ Agora quando você excluir no frontend, os backups serão criados automaticamente!' as resultado;
SELECT '📊 Use: SELECT * FROM [tabela]_backup; para ver os backups' as instrucao; 