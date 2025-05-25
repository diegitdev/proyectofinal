package com.example.proyectofinal.controller;

import com.example.proyectofinal.model.DetalleFactura;
import com.example.proyectofinal.service.DetalleFacturaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/detalles-factura")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class DetalleFacturaController {

    @Autowired
    private DetalleFacturaService detalleFacturaService;

    @GetMapping
    public ResponseEntity<List<DetalleFactura>> getAllDetallesFactura() {
        return ResponseEntity.ok(detalleFacturaService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DetalleFactura> getDetalleFacturaById(@PathVariable Long id) {
        return detalleFacturaService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/factura/{facturaId}")
    public ResponseEntity<List<DetalleFactura>> getDetallesFacturaByFactura(@PathVariable Long facturaId) {
        return ResponseEntity.ok(detalleFacturaService.findByFacturaId(facturaId));
    }

    @PostMapping
    public ResponseEntity<DetalleFactura> createDetalleFactura(@RequestBody DetalleFactura detalleFactura) {
        return ResponseEntity.ok(detalleFacturaService.save(detalleFactura));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DetalleFactura> updateDetalleFactura(@PathVariable Long id, @RequestBody DetalleFactura detalleFactura) {
        DetalleFactura updatedDetalle = detalleFacturaService.update(id, detalleFactura);
        return updatedDetalle != null 
                ? ResponseEntity.ok(updatedDetalle) 
                : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDetalleFactura(@PathVariable Long id) {
        detalleFacturaService.deleteById(id);
        return ResponseEntity.ok().build();
    }
} 