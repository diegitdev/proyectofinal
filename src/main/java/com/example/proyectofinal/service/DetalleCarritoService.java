package com.example.proyectofinal.service;

import com.example.proyectofinal.model.DetalleCarrito;
import com.example.proyectofinal.repository.DetalleCarritoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DetalleCarritoService {

    @Autowired
    private DetalleCarritoRepository detalleCarritoRepository;

    public List<DetalleCarrito> findAll() {
        return detalleCarritoRepository.findAll();
    }

    public Optional<DetalleCarrito> findById(Long id) {
        return detalleCarritoRepository.findById(id);
    }

    public List<DetalleCarrito> findByCarritoId(Long carritoId) {
        return detalleCarritoRepository.findByCarritoId(carritoId);
    }

    public DetalleCarrito save(DetalleCarrito detalleCarrito) {
        return detalleCarritoRepository.save(detalleCarrito);
    }

    public DetalleCarrito update(Long id, DetalleCarrito detalleCarrito) {
        return detalleCarritoRepository.findById(id)
                .map(existingDetalle -> {
                    existingDetalle.setCantidad(detalleCarrito.getCantidad());
                    existingDetalle.setPrecioUnitario(detalleCarrito.getPrecioUnitario());
                    existingDetalle.setSubtotal(detalleCarrito.getSubtotal());
                    return detalleCarritoRepository.save(existingDetalle);
                })
                .orElse(null);
    }

    public void deleteById(Long id) {
        detalleCarritoRepository.deleteById(id);
    }
} 