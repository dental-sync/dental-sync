-- ================================================================================================
-- SCRIPT GENÉRICO PARA RECUPERAR QUALQUER PEDIDO DO BACKUP
-- Dental Sync - Sistema de Backup
-- ================================================================================================

USE dentalsyncdb;

-- ⚠️ ALTERE ESTE VALOR PARA O ID DO PEDIDO QUE DESEJA RECUPERAR
SET @PEDIDO_ID = 19; -- 👈 MUDE AQUI O ID DO PEDIDO

-- Desabilitar safe mode
SET SQL_SAFE_UPDATES = 0;

-- ================================================================================================
-- PARTE 1: VERIFICAR PEDIDO NO BACKUP
-- ================================================================================================

SELECT CONCAT('🔍 VERIFICANDO PEDIDO ', @PEDIDO_ID, ' NO BACKUP...') as status;

-- Verificar se o pedido existe no backup
SELECT 
    'PEDIDO ENCONTRADO NO BACKUP:' as info,
    pb.id,
    pb.cliente_id,
    pb.dentista_id, 
    pb.clinica_id,
    pb.protetico_id,
    pb.data_entrega,
    pb.prioridade,
    pb.status,
    pb.backup_reason,
    pb.backup_date
FROM pedidos_backup pb 
WHERE pb.id = @PEDIDO_ID;

-- Verificar serviços associados no backup
SELECT 
    'SERVIÇOS DO PEDIDO NO BACKUP:' as info,
    psb.pedido_id,
    psb.servico_id,
    s.nome as servico_nome,
    psb.backup_reason
FROM pedido_servico_backup psb
LEFT JOIN servicos s ON s.id = psb.servico_id
WHERE psb.pedido_id = @PEDIDO_ID;

-- ================================================================================================
-- PARTE 2: RECUPERAÇÃO AUTOMÁTICA
-- ================================================================================================

SELECT '🚀 INICIANDO RECUPERAÇÃO AUTOMÁTICA...' as status;

-- Procedure genérica para recuperar pedido
DELIMITER //

CREATE PROCEDURE RecuperarPedidoGenerico(IN pedido_id INT)
BEGIN
    DECLARE v_cliente_exists INT DEFAULT 0;
    DECLARE v_dentista_exists INT DEFAULT 0;
    DECLARE v_clinica_exists INT DEFAULT 0;
    DECLARE v_protetico_exists INT DEFAULT 0;
    DECLARE v_pedido_exists INT DEFAULT 0;
    DECLARE v_backup_exists INT DEFAULT 0;
    DECLARE v_can_recover INT DEFAULT 1;
    DECLARE v_error_msg VARCHAR(1000) DEFAULT '';
    
    -- Verificar se pedido existe no backup
    SELECT COUNT(*) INTO v_backup_exists FROM pedidos_backup WHERE id = pedido_id;
    
    IF v_backup_exists = 0 THEN
        SELECT CONCAT('❌ ERRO: Pedido ', pedido_id, ' não foi encontrado no backup!') as resultado;
    ELSE
        -- Verificar se pedido já existe na tabela principal
        SELECT COUNT(*) INTO v_pedido_exists FROM pedidos WHERE id = pedido_id;
        
        IF v_pedido_exists > 0 THEN
            SELECT CONCAT('⚠️ AVISO: Pedido ', pedido_id, ' já existe na tabela principal!') as resultado;
        ELSE
            -- Verificar entidades relacionadas
            SELECT COUNT(*) INTO v_cliente_exists 
            FROM pedidos_backup pb 
            INNER JOIN paciente p ON p.id = pb.cliente_id 
            WHERE pb.id = pedido_id;
            
            SELECT COUNT(*) INTO v_dentista_exists 
            FROM pedidos_backup pb 
            INNER JOIN dentista d ON d.id = pb.dentista_id 
            WHERE pb.id = pedido_id;
            
            SELECT COUNT(*) INTO v_clinica_exists 
            FROM pedidos_backup pb 
            INNER JOIN clinica c ON c.id = pb.clinica_id 
            WHERE pb.id = pedido_id;
            
            SELECT COUNT(*) INTO v_protetico_exists 
            FROM pedidos_backup pb 
            INNER JOIN protetico pr ON pr.id = pb.protetico_id 
            WHERE pb.id = pedido_id;
            
            -- Verificar se todas as entidades existem
            IF v_cliente_exists = 0 THEN
                SET v_error_msg = CONCAT(v_error_msg, 'Paciente não existe. ');
                SET v_can_recover = 0;
            END IF;
            
            IF v_dentista_exists = 0 THEN
                SET v_error_msg = CONCAT(v_error_msg, 'Dentista não existe. ');
                SET v_can_recover = 0;
            END IF;
            
            IF v_clinica_exists = 0 THEN
                SET v_error_msg = CONCAT(v_error_msg, 'Clínica não existe. ');
                SET v_can_recover = 0;
            END IF;
            
            IF v_protetico_exists = 0 THEN
                SET v_error_msg = CONCAT(v_error_msg, 'Protético não existe. ');
                SET v_can_recover = 0;
            END IF;
            
            IF v_can_recover = 1 THEN
                -- RECUPERAR PEDIDO
                INSERT INTO pedidos (
                    id, cliente_id, dentista_id, clinica_id, protetico_id, 
                    data_entrega, prioridade, status, odontograma, observacao,
                    is_active, created_at, updated_at, created_by, updated_by
                )
                SELECT 
                    id, cliente_id, dentista_id, clinica_id, protetico_id,
                    data_entrega, prioridade, status, odontograma, observacao,
                    TRUE, created_at, NOW(), created_by, updated_by
                FROM pedidos_backup 
                WHERE id = pedido_id;
                
                -- RECUPERAR RELAÇÕES PEDIDO_SERVICO
                INSERT INTO pedido_servico (pedido_id, servico_id)
                SELECT DISTINCT pedido_id, servico_id
                FROM pedido_servico_backup 
                WHERE pedido_id = pedido_id
                AND servico_id IN (SELECT id FROM servicos);
                
                SELECT CONCAT('✅ PEDIDO ', pedido_id, ' RECUPERADO COM SUCESSO!') as resultado;
                
                -- Mostrar detalhes do pedido recuperado
                SELECT 
                    'PEDIDO RECUPERADO:' as info,
                    p.id,
                    pac.nome as paciente,
                    d.nome as dentista,
                    c.nome as clinica,
                    pr.nome as protetico,
                    p.data_entrega,
                    p.prioridade,
                    p.status
                FROM pedidos p
                LEFT JOIN paciente pac ON pac.id = p.cliente_id
                LEFT JOIN dentista d ON d.id = p.dentista_id  
                LEFT JOIN clinica c ON c.id = p.clinica_id
                LEFT JOIN protetico pr ON pr.id = p.protetico_id
                WHERE p.id = pedido_id;
                
            ELSE
                SELECT CONCAT('❌ ERRO: Não é possível recuperar o pedido ', pedido_id, '. ', v_error_msg) as resultado;
                SELECT 'Para recuperar as entidades relacionadas, use:' as dica;
                
                -- Mostrar comandos para recuperar entidades relacionadas
                SELECT CONCAT(
                    'COMANDOS PARA RECUPERAR ENTIDADES RELACIONADAS:',
                    CHAR(10), '-- Paciente: INSERT INTO paciente SELECT * FROM paciente_backup WHERE id = ', pb.cliente_id, ';',
                    CHAR(10), '-- Dentista: INSERT INTO dentista SELECT * FROM dentista_backup WHERE id = ', pb.dentista_id, ';',
                    CHAR(10), '-- Clínica: INSERT INTO clinica SELECT * FROM clinica_backup WHERE id = ', pb.clinica_id, ';',
                    CHAR(10), '-- Protético: INSERT INTO protetico SELECT * FROM protetico_backup WHERE id = ', pb.protetico_id, ';'
                ) as comandos_recuperacao
                FROM pedidos_backup pb 
                WHERE pb.id = pedido_id;
            END IF;
        END IF;
    END IF;
END //

DELIMITER ;

-- Executar recuperação
CALL RecuperarPedidoGenerico(@PEDIDO_ID);

-- Limpar procedure
DROP PROCEDURE RecuperarPedidoGenerico;

-- ================================================================================================
-- VERIFICAÇÃO FINAL
-- ================================================================================================

SELECT CONCAT('🔍 VERIFICAÇÃO FINAL PARA PEDIDO ', @PEDIDO_ID, '...') as status;

-- Verificar se pedido foi recuperado
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN CONCAT('✅ PEDIDO ', @PEDIDO_ID, ' RECUPERADO COM SUCESSO!')
        ELSE CONCAT('❌ PEDIDO ', @PEDIDO_ID, ' NÃO FOI RECUPERADO')
    END as resultado_final
FROM pedidos 
WHERE id = @PEDIDO_ID;

-- Mostrar serviços recuperados
SELECT 
    'SERVIÇOS RECUPERADOS:' as info,
    ps.pedido_id,
    ps.servico_id,
    s.nome as servico_nome
FROM pedido_servico ps
LEFT JOIN servicos s ON s.id = ps.servico_id
WHERE ps.pedido_id = @PEDIDO_ID;

-- Reabilitar safe mode
SET SQL_SAFE_UPDATES = 1;

SELECT '🎯 RECUPERAÇÃO CONCLUÍDA!' as status;

-- ================================================================================================
-- COMO USAR ESTE SCRIPT:
-- ================================================================================================
-- 1. Altere a linha 8: SET @PEDIDO_ID = [ID_DO_PEDIDO];
-- 2. Execute o script completo
-- 3. O script irá automaticamente:
--    - Verificar se o pedido existe no backup
--    - Verificar se todas as entidades relacionadas existem
--    - Recuperar o pedido automaticamente (se possível)
--    - Mostrar instruções manuais (se necessário)
-- ================================================================================================

-- ================================================================================================
-- COMANDOS ÚTEIS PARA CONSULTAR BACKUPS:
-- ================================================================================================

-- Ver todos os pedidos no backup:
-- SELECT * FROM pedidos_backup ORDER BY backup_date DESC;

-- Ver pedidos por motivo de backup:
-- SELECT * FROM pedidos_backup WHERE backup_reason LIKE '%CASCADE%';

-- Ver pedidos de um paciente específico:
-- SELECT * FROM pedidos_backup WHERE cliente_id = [ID_PACIENTE];

-- Ver pedidos deletados hoje:
-- SELECT * FROM pedidos_backup WHERE DATE(backup_date) = CURDATE();

-- ================================================================================================ 