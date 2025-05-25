package com.example.proyectofinal.service;

import com.example.proyectofinal.model.DetalleFactura;
import com.example.proyectofinal.repository.DetalleFacturaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DetalleFacturaService {

    @Autowired
    private DetalleFacturaRepository detalleFacturaRepository;

    public List<DetalleFactura> findAll() {
        return detalleFacturaRepository.findAll();
    }

    public Optional<DetalleFactura> findById(Long id) {
        return detalleFacturaRepository.findById(id);
    }

    public List<DetalleFactura> findByFacturaId(Long facturaId) {
        return detalleFacturaRepository.findByFacturaId(facturaId);
    }

    public DetalleFactura save(DetalleFactura detalleFactura) {
        return detalleFacturaRepository.save(detalleFactura);
    }

    public DetalleFactura update(Long id, DetalleFactura detalleFactura) {
        return detalleFacturaRepository.findById(id)
                .map(existingDetalle -> {
                    existingDetalle.setCantidad(detalleFactura.getCantidad());
                    existingDetalle.setNombreProducto(detalleFactura.getNombreProducto());
                    existingDetalle.setPrecioUnitario(detalleFactura.getPrecioUnitario());
                    existingDetalle.setSubtotal(detalleFactura.getSubtotal());
                    return detalleFacturaRepository.save(existingDetalle);
                })
                .orElse(null);
    }

    public void deleteById(Long id) {
        detalleFacturaRepository.deleteById(id);
    }
} 