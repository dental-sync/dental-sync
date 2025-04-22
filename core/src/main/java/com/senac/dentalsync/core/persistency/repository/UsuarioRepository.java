package com.senac.dentalsync.core.persistency.repository;

import java.util.Optional;

import com.senac.dentalsync.core.persistency.model.Usuario;
import org.springframework.stereotype.Repository;

@Repository
public interface UsuarioRepository extends BaseRepository<Usuario, Long> {
    Optional<Usuario> findByEmail(String email);
}
