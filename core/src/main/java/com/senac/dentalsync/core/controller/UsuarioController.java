package com.senac.dentalsync.core.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.senac.dentalsync.core.persistency.model.Usuario;
import com.senac.dentalsync.core.service.BaseService;
import com.senac.dentalsync.core.service.UsuarioService;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController extends BaseController<Usuario, Long>{

    @Autowired
    private UsuarioService usuarioService;

    @Override
    protected BaseService<Usuario, Long> getService() {
        return usuarioService;
    }

}
