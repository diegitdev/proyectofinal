package com.example.proyectofinal.controller;

import com.example.proyectofinal.model.DetalleCarrito;
import com.example.proyectofinal.service.DetalleCarritoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/detalles-carrito")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class DetalleCarritoController {

    @Autowired
    private DetalleCarritoService detalleCarritoService;

    @GetMapping
    public ResponseEntity<List<DetalleCarrito>> getAllDetallesCarrito() {
        return ResponseEntity.ok(detalleCarritoService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DetalleCarrito> getDetalleCarritoById(@PathVariable Long id) {
        return detalleCarritoService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/carrito/{carritoId}")
    public ResponseEntity<List<DetalleCarrito>> getDetallesCarritoByCarrito(@PathVariable Long carritoId) {
        return ResponseEntity.ok(detalleCarritoService.findByCarritoId(carritoId));
    }

    @PostMapping
    public ResponseEntity<DetalleCarrito> createDetalleCarrito(@RequestBody DetalleCarrito detalleCarrito) {
        return ResponseEntity.ok(detalleCarritoService.save(detalleCarrito));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DetalleCarrito> updateDetalleCarrito(@PathVariable Long id, @RequestBody DetalleCarrito detalleCarrito) {
        DetalleCarrito updatedDetalle = detalleCarritoService.update(id, detalleCarrito);
        return updatedDetalle != null 
                ? ResponseEntity.ok(updatedDetalle) 
                : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDetalleCarrito(@PathVariable Long id) {
        detalleCarritoService.deleteById(id);
        return ResponseEntity.ok().build();
    }
} 