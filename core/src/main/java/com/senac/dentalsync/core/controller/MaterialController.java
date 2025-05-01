package com.senac.dentalsync.core.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.senac.dentalsync.core.persistency.model.Material;
import com.senac.dentalsync.core.service.BaseService;
import com.senac.dentalsync.core.service.MaterialService;

@RestController
@RequestMapping("/material")
public class MaterialController extends BaseController<Material, Long> {

    @Autowired
    private MaterialService materialService;

    @Override
    protected BaseService<Material, Long> getService() {
        return materialService;
    }
    
}
