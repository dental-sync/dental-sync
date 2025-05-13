package com.senac.dentalsync.core.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.senac.dentalsync.core.persistency.model.CategoriaMaterial;
import com.senac.dentalsync.core.service.BaseService;
import com.senac.dentalsync.core.service.CategoriaMaterialService;

@RestController
@RequestMapping("/categoria-material")
public class CategoriaMaterialController extends BaseController<CategoriaMaterial, Long>{

    @Autowired
    private CategoriaMaterialService categoriaMaterialService;

    @Override
    protected BaseService<CategoriaMaterial, Long> getService() {
        return categoriaMaterialService;
    }
    
}
