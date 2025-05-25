package com.example.proyectofinal.service;

import com.example.proyectofinal.model.Factura;
import com.example.proyectofinal.model.Usuario;
import com.example.proyectofinal.repository.FacturaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FacturaService {

    @Autowired
    private FacturaRepository facturaRepository;

    public List<Factura> findAll() {
        return facturaRepository.findAll();
    }

    public Optional<Factura> findById(Long id) {
        return facturaRepository.findById(id);
    }

    public List<Factura> findByUsuarioId(Long usuarioId) {
        return facturaRepository.findByUsuarioId(usuarioId);
    }

    public List<Factura> findByUsuario(Usuario usuario) {
        return findByUsuarioId(usuario.getId());
    }

    public Factura save(Factura factura) {
        return facturaRepository.save(factura);
    }

    public void deleteById(Long id) {
        facturaRepository.deleteById(id);
    }
} 