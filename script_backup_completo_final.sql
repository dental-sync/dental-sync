-- ================================================================================================
-- SCRIPT COMPLETO DE BACKUP PARA DENTAL SYNC
-- Baseado na estrutura real dos modelos Java
-- ================================================================================================

USE dentalsyncdb;

-- Desabilitar safe mode e foreign key checks
SET SQL_SAFE_UPDATES = 0;
SET FOREIGN_KEY_CHECKS = 0;

-- ================================================================================================
-- PARTE 1: LIMPEZA COMPLETA - DROPA TUDO
-- ================================================================================================

SELECT '🗑️ REMOVENDO TUDO ANTERIOR...' as status;

-- Remover todos os triggers de backup
DROP TRIGGER IF EXISTS trigger_paciente_backup;
DROP TRIGGER IF EXISTS trigger_dentista_backup;
DROP TRIGGER IF EXISTS trigger_clinica_backup;
DROP TRIGGER IF EXISTS trigger_protetico_backup;
DROP TRIGGER IF EXISTS trigger_servicos_backup;
DROP TRIGGER IF EXISTS trigger_pedidos_backup;
DROP TRIGGER IF EXISTS trigger_pedido_servico_backup;
DROP TRIGGER IF EXISTS trigger_categoria_material_backup;
DROP TRIGGER IF EXISTS trigger_categoria_servico_backup;
DROP TRIGGER IF EXISTS trigger_material_backup;

-- Remover triggers de soft delete
DROP TRIGGER IF EXISTS trigger_paciente_soft_delete_backup;
DROP TRIGGER IF EXISTS trigger_dentista_soft_delete_backup;
DROP TRIGGER IF EXISTS trigger_clinica_soft_delete_backup;
DROP TRIGGER IF EXISTS trigger_protetico_soft_delete_backup;
DROP TRIGGER IF EXISTS trigger_servicos_soft_delete_backup;
DROP TRIGGER IF EXISTS trigger_pedidos_soft_delete_backup;
DROP TRIGGER IF EXISTS trigger_material_soft_delete_backup;

-- Remover tabelas de backup
DROP TABLE IF EXISTS paciente_backup;
DROP TABLE IF EXISTS dentista_backup;
DROP TABLE IF EXISTS clinica_backup;
DROP TABLE IF EXISTS protetico_backup;
DROP TABLE IF EXISTS servicos_backup;
DROP TABLE IF EXISTS pedidos_backup;
DROP TABLE IF EXISTS pedido_servico_backup;
DROP TABLE IF EXISTS categoria_material_backup;
DROP TABLE IF EXISTS categoria_servico_backup;
DROP TABLE IF EXISTS material_backup;

SELECT '✅ LIMPEZA COMPLETA REALIZADA!' as status;

-- ================================================================================================
-- PARTE 2: CRIAÇÃO DAS TABELAS DE BACKUP (BASEADAS NA ESTRUTURA REAL)
-- ================================================================================================

SELECT '📋 CRIANDO TABELAS DE BACKUP...' as status;

-- Tabela de backup para PACIENTE
CREATE TABLE paciente_backup (
    id BIGINT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(255),
    data_nascimento DATE,
    ultimo_pedido DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    backup_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    backup_reason VARCHAR(255) DEFAULT 'Backup automático'
);

-- Tabela de backup para DENTISTA
CREATE TABLE dentista_backup (
    id BIGINT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cro VARCHAR(50),
    telefone VARCHAR(20),
    email VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    backup_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    backup_reason VARCHAR(255) DEFAULT 'Backup automático'
);

-- Tabela de backup para CLINICA
CREATE TABLE clinica_backup (
    id BIGINT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18),
    telefone VARCHAR(20),
    email VARCHAR(255),
    endereco TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    backup_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    backup_reason VARCHAR(255) DEFAULT 'Backup automático'
);

-- Tabela de backup para PROTETICO
CREATE TABLE protetico_backup (
    id BIGINT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cro VARCHAR(50),
    telefone VARCHAR(20),
    email VARCHAR(255),
    senha VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    backup_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    backup_reason VARCHAR(255) DEFAULT 'Backup automático'
);

-- Tabela de backup para SERVICOS
CREATE TABLE servicos_backup (
    id BIGINT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    backup_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    backup_reason VARCHAR(255) DEFAULT 'Backup automático'
);

-- Tabela de backup para PEDIDOS
CREATE TABLE pedidos_backup (
    id BIGINT PRIMARY KEY,
    cliente_id BIGINT,
    dentista_id BIGINT,
    clinica_id BIGINT,
    protetico_id BIGINT,
    data_entrega DATE,
    prioridade ENUM('BAIXA', 'MEDIA', 'ALTA'),
    status ENUM('PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO'),
    odontograma TEXT,
    observacao TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    backup_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    backup_reason VARCHAR(255) DEFAULT 'Backup automático'
);

-- Tabela de backup para PEDIDO_SERVICO
CREATE TABLE pedido_servico_backup (
    pedido_id BIGINT,
    servico_id BIGINT,
    backup_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    backup_reason VARCHAR(255) DEFAULT 'Backup automático',
    PRIMARY KEY (pedido_id, servico_id)
);

-- Tabela de backup para MATERIAL
CREATE TABLE material_backup (
    id BIGINT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    quantidade DECIMAL(10,2),
    estoque_minimo DECIMAL(10,2),
    preco DECIMAL(10,2),
    categoria_material_id BIGINT,
    status ENUM('SEM_ESTOQUE', 'BAIXO_ESTOQUE', 'EM_ESTOQUE') DEFAULT 'EM_ESTOQUE',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    backup_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    backup_reason VARCHAR(255) DEFAULT 'Backup automático'
);

-- Tabela de backup para CATEGORIA_MATERIAL
CREATE TABLE categoria_material_backup (
    id BIGINT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    backup_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    backup_reason VARCHAR(255) DEFAULT 'Backup automático'
);

-- Tabela de backup para CATEGORIA_SERVICO
CREATE TABLE categoria_servico_backup (
    id BIGINT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    backup_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    backup_reason VARCHAR(255) DEFAULT 'Backup automático'
);

SELECT '✅ TABELAS DE BACKUP CRIADAS!' as status;

-- ================================================================================================
-- PARTE 3: TRIGGERS PARA DELETE REAL (EXCLUSÃO FÍSICA)
-- ================================================================================================

SELECT '🔧 CRIANDO TRIGGERS PARA DELETE REAL...' as status;

DELIMITER //

-- Trigger para PACIENTE (DELETE REAL)
CREATE TRIGGER trigger_paciente_backup
BEFORE DELETE ON paciente
FOR EACH ROW
BEGIN
    -- PRIMEIRO: Fazer backup de todos os pedidos associados
    INSERT IGNORE INTO pedidos_backup (
        id, cliente_id, dentista_id, clinica_id, protetico_id, data_entrega, 
        prioridade, status, odontograma, observacao, is_active, created_at, 
        updated_at, created_by, updated_by, backup_reason
    )
    SELECT 
        p.id, p.cliente_id, p.dentista_id, p.clinica_id, p.protetico_id, p.data_entrega, 
        p.prioridade, p.status, p.odontograma, p.observacao, p.is_active, p.created_at, 
        p.updated_at, p.created_by, p.updated_by, 'DELETE CASCADE - Paciente deletado'
    FROM pedidos p 
    WHERE p.cliente_id = OLD.id;
    
    -- SEGUNDO: Fazer backup das relações pedido_servico
    INSERT IGNORE INTO pedido_servico_backup (
        pedido_id, servico_id, backup_reason
    )
    SELECT 
        ps.pedido_id, ps.servico_id, 'DELETE CASCADE - Paciente deletado'
    FROM pedido_servico ps 
    INNER JOIN pedidos p ON ps.pedido_id = p.id
    WHERE p.cliente_id = OLD.id;
    
    -- TERCEIRO: Fazer backup do paciente
    INSERT IGNORE INTO paciente_backup (
        id, nome, telefone, email, data_nascimento, ultimo_pedido,
        is_active, created_at, updated_at, created_by, updated_by, backup_reason
    ) VALUES (
        OLD.id, OLD.nome, OLD.telefone, OLD.email, OLD.data_nascimento, OLD.ultimo_pedido,
        OLD.is_active, OLD.created_at, OLD.updated_at, OLD.created_by, OLD.updated_by,
        'DELETE REAL - Exclusão física'
    );
END//

-- Trigger para DENTISTA (DELETE REAL)
CREATE TRIGGER trigger_dentista_backup
BEFORE DELETE ON dentista
FOR EACH ROW
BEGIN
    -- PRIMEIRO: Fazer backup de todos os pedidos associados
    INSERT IGNORE INTO pedidos_backup (
        id, cliente_id, dentista_id, clinica_id, protetico_id, data_entrega, 
        prioridade, status, odontograma, observacao, is_active, created_at, 
        updated_at, created_by, updated_by, backup_reason
    )
    SELECT 
        p.id, p.cliente_id, p.dentista_id, p.clinica_id, p.protetico_id, p.data_entrega, 
        p.prioridade, p.status, p.odontograma, p.observacao, p.is_active, p.created_at, 
        p.updated_at, p.created_by, p.updated_by, 'DELETE CASCADE - Dentista deletado'
    FROM pedidos p 
    WHERE p.dentista_id = OLD.id;
    
    -- SEGUNDO: Fazer backup das relações pedido_servico
    INSERT IGNORE INTO pedido_servico_backup (
        pedido_id, servico_id, backup_reason
    )
    SELECT 
        ps.pedido_id, ps.servico_id, 'DELETE CASCADE - Dentista deletado'
    FROM pedido_servico ps 
    INNER JOIN pedidos p ON ps.pedido_id = p.id
    WHERE p.dentista_id = OLD.id;
    
    -- TERCEIRO: Fazer backup do dentista
    INSERT IGNORE INTO dentista_backup (
        id, nome, cro, telefone, email, is_active, created_at, updated_at, created_by, updated_by, backup_reason
    ) VALUES (
        OLD.id, OLD.nome, OLD.cro, OLD.telefone, OLD.email, OLD.is_active, OLD.created_at, OLD.updated_at, OLD.created_by, OLD.updated_by,
        'DELETE REAL - Exclusão física'
    );
END//

-- Trigger para CLINICA (DELETE REAL)
CREATE TRIGGER trigger_clinica_backup
BEFORE DELETE ON clinica
FOR EACH ROW
BEGIN
    -- PRIMEIRO: Fazer backup de todos os pedidos associados
    INSERT IGNORE INTO pedidos_backup (
        id, cliente_id, dentista_id, clinica_id, protetico_id, data_entrega, 
        prioridade, status, odontograma, observacao, is_active, created_at, 
        updated_at, created_by, updated_by, backup_reason
    )
    SELECT 
        p.id, p.cliente_id, p.dentista_id, p.clinica_id, p.protetico_id, p.data_entrega, 
        p.prioridade, p.status, p.odontograma, p.observacao, p.is_active, p.created_at, 
        p.updated_at, p.created_by, p.updated_by, 'DELETE CASCADE - Clínica deletada'
    FROM pedidos p 
    WHERE p.clinica_id = OLD.id;
    
    -- SEGUNDO: Fazer backup das relações pedido_servico
    INSERT IGNORE INTO pedido_servico_backup (
        pedido_id, servico_id, backup_reason
    )
    SELECT 
        ps.pedido_id, ps.servico_id, 'DELETE CASCADE - Clínica deletada'
    FROM pedido_servico ps 
    INNER JOIN pedidos p ON ps.pedido_id = p.id
    WHERE p.clinica_id = OLD.id;
    
    -- TERCEIRO: Fazer backup da clinica
    INSERT IGNORE INTO clinica_backup (
        id, nome, cnpj, telefone, email, endereco, is_active, created_at, updated_at, created_by, updated_by, backup_reason
    ) VALUES (
        OLD.id, OLD.nome, OLD.cnpj, OLD.telefone, OLD.email, OLD.endereco, OLD.is_active, OLD.created_at, OLD.updated_at, OLD.created_by, OLD.updated_by,
        'DELETE REAL - Exclusão física'
    );
END//

-- Trigger para PROTETICO (DELETE REAL)
CREATE TRIGGER trigger_protetico_backup
BEFORE DELETE ON protetico
FOR EACH ROW
BEGIN
    -- PRIMEIRO: Fazer backup de todos os pedidos associados
    INSERT IGNORE INTO pedidos_backup (
        id, cliente_id, dentista_id, clinica_id, protetico_id, data_entrega, 
        prioridade, status, odontograma, observacao, is_active, created_at, 
        updated_at, created_by, updated_by, backup_reason
    )
    SELECT 
        p.id, p.cliente_id, p.dentista_id, p.clinica_id, p.protetico_id, p.data_entrega, 
        p.prioridade, p.status, p.odontograma, p.observacao, p.is_active, p.created_at, 
        p.updated_at, p.created_by, p.updated_by, 'DELETE CASCADE - Protético deletado'
    FROM pedidos p 
    WHERE p.protetico_id = OLD.id;
    
    -- SEGUNDO: Fazer backup das relações pedido_servico
    INSERT IGNORE INTO pedido_servico_backup (
        pedido_id, servico_id, backup_reason
    )
    SELECT 
        ps.pedido_id, ps.servico_id, 'DELETE CASCADE - Protético deletado'
    FROM pedido_servico ps 
    INNER JOIN pedidos p ON ps.pedido_id = p.id
    WHERE p.protetico_id = OLD.id;
    
    -- TERCEIRO: Fazer backup do protetico
    INSERT IGNORE INTO protetico_backup (
        id, nome, cro, telefone, email, senha, is_active, created_at, updated_at, created_by, updated_by, backup_reason
    ) VALUES (
        OLD.id, OLD.nome, OLD.cro, OLD.telefone, OLD.email, OLD.senha, OLD.is_active, OLD.created_at, OLD.updated_at, OLD.created_by, OLD.updated_by,
        'DELETE REAL - Exclusão física'
    );
END//

-- Trigger para SERVICOS (DELETE REAL)
CREATE TRIGGER trigger_servicos_backup
BEFORE DELETE ON servicos
FOR EACH ROW
BEGIN
    INSERT IGNORE INTO servicos_backup (
        id, nome, descricao, preco, is_active, created_at, updated_at, created_by, updated_by, backup_reason
    ) VALUES (
        OLD.id, OLD.nome, OLD.descricao, OLD.preco, OLD.is_active, OLD.created_at, OLD.updated_at, OLD.created_by, OLD.updated_by,
        'DELETE REAL - Exclusão física'
    );
END//

-- Trigger para PEDIDOS (DELETE REAL)
CREATE TRIGGER trigger_pedidos_backup
BEFORE DELETE ON pedidos
FOR EACH ROW
BEGIN
    INSERT IGNORE INTO pedidos_backup (
        id, cliente_id, dentista_id, clinica_id, protetico_id, data_entrega, 
        prioridade, status, odontograma, observacao, is_active, created_at, 
        updated_at, created_by, updated_by, backup_reason
    ) VALUES (
        OLD.id, OLD.cliente_id, OLD.dentista_id, OLD.clinica_id, OLD.protetico_id, 
        OLD.data_entrega, OLD.prioridade, OLD.status, OLD.odontograma, OLD.observacao, 
        OLD.is_active, OLD.created_at, OLD.updated_at, OLD.created_by, OLD.updated_by,
        'DELETE REAL - Exclusão física'
    );
END//

-- Trigger para PEDIDO_SERVICO (DELETE REAL)
CREATE TRIGGER trigger_pedido_servico_backup
BEFORE DELETE ON pedido_servico
FOR EACH ROW
BEGIN
    INSERT IGNORE INTO pedido_servico_backup (
        pedido_id, servico_id, backup_reason
    ) VALUES (
        OLD.pedido_id, OLD.servico_id, 'DELETE REAL - Exclusão física'
    );
END//

-- Trigger para MATERIAL (DELETE REAL)
CREATE TRIGGER trigger_material_backup
BEFORE DELETE ON material
FOR EACH ROW
BEGIN
    INSERT IGNORE INTO material_backup (
        id, nome, descricao, quantidade, estoque_minimo, preco, categoria_material_id, status,
        is_active, created_at, updated_at, created_by, updated_by, backup_reason
    ) VALUES (
        OLD.id, OLD.nome, OLD.descricao, OLD.quantidade, OLD.estoque_minimo, OLD.preco, OLD.categoria_material_id, OLD.status,
        OLD.is_active, OLD.created_at, OLD.updated_at, OLD.created_by, OLD.updated_by,
        'DELETE REAL - Exclusão física'
    );
END//

DELIMITER ;

SELECT '✅ TRIGGERS PARA DELETE REAL CRIADOS!' as status;

-- ================================================================================================
-- PARTE 4: TRIGGERS PARA SOFT DELETE (EXCLUSÃO LÓGICA)
-- ================================================================================================

SELECT '🔧 CRIANDO TRIGGERS PARA SOFT DELETE...' as status;

DELIMITER //

-- Trigger para PACIENTE (SOFT DELETE)
CREATE TRIGGER trigger_paciente_soft_delete_backup
BEFORE UPDATE ON paciente
FOR EACH ROW
BEGIN
    IF OLD.is_active = TRUE AND NEW.is_active = FALSE THEN
        -- PRIMEIRO: Fazer backup de todos os pedidos associados
        INSERT IGNORE INTO pedidos_backup (
            id, cliente_id, dentista_id, clinica_id, protetico_id, data_entrega, 
            prioridade, status, odontograma, observacao, is_active, created_at, 
            updated_at, created_by, updated_by, backup_reason
        )
        SELECT 
            p.id, p.cliente_id, p.dentista_id, p.clinica_id, p.protetico_id, p.data_entrega, 
            p.prioridade, p.status, p.odontograma, p.observacao, p.is_active, p.created_at, 
            p.updated_at, p.created_by, p.updated_by, 'SOFT DELETE CASCADE - Paciente desativado'
        FROM pedidos p 
        WHERE p.cliente_id = OLD.id AND p.is_active = TRUE;
        
        -- SEGUNDO: Fazer backup das relações pedido_servico
        INSERT IGNORE INTO pedido_servico_backup (
            pedido_id, servico_id, backup_reason
        )
        SELECT 
            ps.pedido_id, ps.servico_id, 'SOFT DELETE CASCADE - Paciente desativado'
        FROM pedido_servico ps 
        INNER JOIN pedidos p ON ps.pedido_id = p.id
        WHERE p.cliente_id = OLD.id AND p.is_active = TRUE;
        
        -- TERCEIRO: Fazer backup do paciente
        INSERT IGNORE INTO paciente_backup (
            id, nome, telefone, email, data_nascimento, ultimo_pedido,
            is_active, created_at, updated_at, created_by, updated_by, backup_reason
        ) VALUES (
            OLD.id, OLD.nome, OLD.telefone, OLD.email, OLD.data_nascimento, OLD.ultimo_pedido,
            OLD.is_active, OLD.created_at, OLD.updated_at, OLD.created_by, OLD.updated_by,
            'SOFT DELETE - Exclusão lógica'
        );
        
        -- QUARTO: Desativar todos os pedidos associados
        UPDATE pedidos SET is_active = FALSE WHERE cliente_id = OLD.id AND is_active = TRUE;
    END IF;
END//

-- Trigger para DENTISTA (SOFT DELETE)
CREATE TRIGGER trigger_dentista_soft_delete_backup
BEFORE UPDATE ON dentista
FOR EACH ROW
BEGIN
    IF OLD.is_active = TRUE AND NEW.is_active = FALSE THEN
        -- PRIMEIRO: Fazer backup de todos os pedidos associados
        INSERT IGNORE INTO pedidos_backup (
            id, cliente_id, dentista_id, clinica_id, protetico_id, data_entrega, 
            prioridade, status, odontograma, observacao, is_active, created_at, 
            updated_at, created_by, updated_by, backup_reason
        )
        SELECT 
            p.id, p.cliente_id, p.dentista_id, p.clinica_id, p.protetico_id, p.data_entrega, 
            p.prioridade, p.status, p.odontograma, p.observacao, p.is_active, p.created_at, 
            p.updated_at, p.created_by, p.updated_by, 'SOFT DELETE CASCADE - Dentista desativado'
        FROM pedidos p 
        WHERE p.dentista_id = OLD.id AND p.is_active = TRUE;
        
        -- SEGUNDO: Fazer backup das relações pedido_servico
        INSERT IGNORE INTO pedido_servico_backup (
            pedido_id, servico_id, backup_reason
        )
        SELECT 
            ps.pedido_id, ps.servico_id, 'SOFT DELETE CASCADE - Dentista desativado'
        FROM pedido_servico ps 
        INNER JOIN pedidos p ON ps.pedido_id = p.id
        WHERE p.dentista_id = OLD.id AND p.is_active = TRUE;
        
        -- TERCEIRO: Fazer backup do dentista
        INSERT IGNORE INTO dentista_backup (
            id, nome, cro, telefone, email, is_active, created_at, updated_at, created_by, updated_by, backup_reason
        ) VALUES (
            OLD.id, OLD.nome, OLD.cro, OLD.telefone, OLD.email, OLD.is_active, OLD.created_at, OLD.updated_at, OLD.created_by, OLD.updated_by,
            'SOFT DELETE - Exclusão lógica'
        );
        
        -- QUARTO: Desativar todos os pedidos associados
        UPDATE pedidos SET is_active = FALSE WHERE dentista_id = OLD.id AND is_active = TRUE;
    END IF;
END//

-- Trigger para CLINICA (SOFT DELETE)
CREATE TRIGGER trigger_clinica_soft_delete_backup
BEFORE UPDATE ON clinica
FOR EACH ROW
BEGIN
    IF OLD.is_active = TRUE AND NEW.is_active = FALSE THEN
        -- PRIMEIRO: Fazer backup de todos os pedidos associados
        INSERT IGNORE INTO pedidos_backup (
            id, cliente_id, dentista_id, clinica_id, protetico_id, data_entrega, 
            prioridade, status, odontograma, observacao, is_active, created_at, 
            updated_at, created_by, updated_by, backup_reason
        )
        SELECT 
            p.id, p.cliente_id, p.dentista_id, p.clinica_id, p.protetico_id, p.data_entrega, 
            p.prioridade, p.status, p.odontograma, p.observacao, p.is_active, p.created_at, 
            p.updated_at, p.created_by, p.updated_by, 'SOFT DELETE CASCADE - Clínica desativada'
        FROM pedidos p 
        WHERE p.clinica_id = OLD.id AND p.is_active = TRUE;
        
        -- SEGUNDO: Fazer backup das relações pedido_servico
        INSERT IGNORE INTO pedido_servico_backup (
            pedido_id, servico_id, backup_reason
        )
        SELECT 
            ps.pedido_id, ps.servico_id, 'SOFT DELETE CASCADE - Clínica desativada'
        FROM pedido_servico ps 
        INNER JOIN pedidos p ON ps.pedido_id = p.id
        WHERE p.clinica_id = OLD.id AND p.is_active = TRUE;
        
        -- TERCEIRO: Fazer backup da clinica
        INSERT IGNORE INTO clinica_backup (
            id, nome, cnpj, telefone, email, endereco, is_active, created_at, updated_at, created_by, updated_by, backup_reason
        ) VALUES (
            OLD.id, OLD.nome, OLD.cnpj, OLD.telefone, OLD.email, OLD.endereco, OLD.is_active, OLD.created_at, OLD.updated_at, OLD.created_by, OLD.updated_by,
            'SOFT DELETE - Exclusão lógica'
        );
        
        -- QUARTO: Desativar todos os pedidos associados
        UPDATE pedidos SET is_active = FALSE WHERE clinica_id = OLD.id AND is_active = TRUE;
    END IF;
END//

-- Trigger para PROTETICO (SOFT DELETE)
CREATE TRIGGER trigger_protetico_soft_delete_backup
BEFORE UPDATE ON protetico
FOR EACH ROW
BEGIN
    IF OLD.is_active = TRUE AND NEW.is_active = FALSE THEN
        -- PRIMEIRO: Fazer backup de todos os pedidos associados
        INSERT IGNORE INTO pedidos_backup (
            id, cliente_id, dentista_id, clinica_id, protetico_id, data_entrega, 
            prioridade, status, odontograma, observacao, is_active, created_at, 
            updated_at, created_by, updated_by, backup_reason
        )
        SELECT 
            p.id, p.cliente_id, p.dentista_id, p.clinica_id, p.protetico_id, p.data_entrega, 
            p.prioridade, p.status, p.odontograma, p.observacao, p.is_active, p.created_at, 
            p.updated_at, p.created_by, p.updated_by, 'SOFT DELETE CASCADE - Protético desativado'
        FROM pedidos p 
        WHERE p.protetico_id = OLD.id AND p.is_active = TRUE;
        
        -- SEGUNDO: Fazer backup das relações pedido_servico
        INSERT IGNORE INTO pedido_servico_backup (
            pedido_id, servico_id, backup_reason
        )
        SELECT 
            ps.pedido_id, ps.servico_id, 'SOFT DELETE CASCADE - Protético desativado'
        FROM pedido_servico ps 
        INNER JOIN pedidos p ON ps.pedido_id = p.id
        WHERE p.protetico_id = OLD.id AND p.is_active = TRUE;
        
        -- TERCEIRO: Fazer backup do protetico
        INSERT IGNORE INTO protetico_backup (
            id, nome, cro, telefone, email, senha, is_active, created_at, updated_at, created_by, updated_by, backup_reason
        ) VALUES (
            OLD.id, OLD.nome, OLD.cro, OLD.telefone, OLD.email, OLD.senha, OLD.is_active, OLD.created_at, OLD.updated_at, OLD.created_by, OLD.updated_by,
            'SOFT DELETE - Exclusão lógica'
        );
        
        -- QUARTO: Desativar todos os pedidos associados
        UPDATE pedidos SET is_active = FALSE WHERE protetico_id = OLD.id AND is_active = TRUE;
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

-- Trigger para PEDIDOS (SOFT DELETE)
CREATE TRIGGER trigger_pedidos_soft_delete_backup
BEFORE UPDATE ON pedidos
FOR EACH ROW
BEGIN
    IF OLD.is_active = TRUE AND NEW.is_active = FALSE THEN
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

-- Trigger para MATERIAL (SOFT DELETE)
CREATE TRIGGER trigger_material_soft_delete_backup
BEFORE UPDATE ON material
FOR EACH ROW
BEGIN
    IF OLD.is_active = TRUE AND NEW.is_active = FALSE THEN
        INSERT IGNORE INTO material_backup (
            id, nome, descricao, quantidade, estoque_minimo, preco, categoria_material_id, status,
            is_active, created_at, updated_at, created_by, updated_by, backup_reason
        ) VALUES (
            OLD.id, OLD.nome, OLD.descricao, OLD.quantidade, OLD.estoque_minimo, OLD.preco, OLD.categoria_material_id, OLD.status,
            OLD.is_active, OLD.created_at, OLD.updated_at, OLD.created_by, OLD.updated_by,
            'SOFT DELETE - Exclusão lógica'
        );
    END IF;
END//

DELIMITER ;

SELECT '✅ TRIGGERS PARA SOFT DELETE CRIADOS!' as status;

-- ================================================================================================
-- PARTE 6: VERIFICAÇÃO E TESTE BÁSICO
-- ================================================================================================

SELECT '🧪 VERIFICAÇÃO DOS TRIGGERS...' as status;

-- Verificar se todas as tabelas foram criadas
SELECT 'TABELAS DE BACKUP CRIADAS:' as info;
SELECT TABLE_NAME, TABLE_ROWS 
FROM information_schema.tables 
WHERE table_schema = 'dentalsyncdb' 
AND table_name LIKE '%_backup' 
ORDER BY table_name;

-- Verificar se todos os triggers foram criados
SELECT 'TRIGGERS CRIADOS:' as info;
SELECT TRIGGER_NAME, EVENT_OBJECT_TABLE, EVENT_MANIPULATION, ACTION_TIMING
FROM information_schema.triggers 
WHERE trigger_schema = 'dentalsyncdb' 
AND trigger_name LIKE '%backup%'
ORDER BY EVENT_OBJECT_TABLE, EVENT_MANIPULATION;

-- Reabilitar configurações
SET FOREIGN_KEY_CHECKS = 1;
SET SQL_SAFE_UPDATES = 1;

-- ================================================================================================
-- RESULTADO FINAL
-- ================================================================================================

SELECT '🏆 SISTEMA DE BACKUP CONFIGURADO COM SUCESSO!' as status;
SELECT '✅ Triggers CASCADE implementados para todas as entidades!' as resultado;
SELECT '📋 Execute: SELECT * FROM [tabela]_backup; para ver os backups criados.' as consulta;

-- ================================================================================================
-- MELHORIAS IMPLEMENTADAS:
-- ================================================================================================
-- 1. BACKUP CASCADE INTELIGENTE:
--    - Quando deletar paciente, dentista, clinica ou protetico, o sistema agora:
--      a) Primeiro faz backup de todos os pedidos associados
--      b) Depois faz backup das relações pedido_servico
--      c) Depois faz backup da entidade principal
--      d) Depois deleta (permitindo cascade no banco)
--
-- 2. SOFT DELETE CASCADE:
--    - No SOFT DELETE, o sistema também desativa todos os pedidos relacionados
--    - Backup completo antes de desativar
--
-- 3. TRIGGERS MELHORADOS:
--    - trigger_paciente_backup (DELETE REAL + CASCADE)
--    - trigger_paciente_soft_delete_backup (SOFT DELETE + CASCADE)
--    - trigger_dentista_backup (DELETE REAL + CASCADE)
--    - trigger_dentista_soft_delete_backup (SOFT DELETE + CASCADE)
--    - trigger_protetico_backup (DELETE REAL + CASCADE)
--    - trigger_protetico_soft_delete_backup (SOFT DELETE + CASCADE)
--    - trigger_clinica_backup (DELETE REAL + CASCADE)
--    - trigger_clinica_soft_delete_backup (SOFT DELETE + CASCADE)
--
-- 4. BACKUP REASONS ESPECÍFICOS:
--    - 'DELETE CASCADE - [Entidade] deletado' para DELETE REAL
--    - 'SOFT DELETE CASCADE - [Entidade] desativado' para SOFT DELETE
--
-- ================================================================================================
-- TESTE O SISTEMA:
-- ================================================================================================
-- DELETE REAL: DELETE FROM paciente WHERE id = X;
-- SOFT DELETE: UPDATE paciente SET is_active = FALSE WHERE id = X;
-- VERIFICAR: SELECT * FROM pedidos_backup WHERE backup_reason LIKE '%CASCADE%';
-- ================================================================================================ 