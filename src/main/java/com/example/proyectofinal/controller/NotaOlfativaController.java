package com.example.proyectofinal.controller;

import com.example.proyectofinal.model.NotaOlfativa;
import com.example.proyectofinal.service.NotaOlfativaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notas-olfativas")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175", 
                        "http://localhost:5176", "http://localhost:5177", "http://localhost:5178", 
                        "http://localhost:5179", "http://localhost:5180"}, 
             allowCredentials = "true")
public class NotaOlfativaController {

    @Autowired
    private NotaOlfativaService notaOlfativaService;

    @GetMapping
    public ResponseEntity<?> getAllNotasOlfativas() {
        try {
            List<NotaOlfativa> notas = notaOlfativaService.findAll();
            if (notas == null) {
                notas = new ArrayList<>();
            }
            return ResponseEntity.ok(notas);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Error al obtener notas olfativas: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getNotaOlfativaById(@PathVariable Long id) {
        try {
            return notaOlfativaService.findById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Error al buscar nota olfativa: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/descripcion/{descripcion}")
    public ResponseEntity<?> getNotasOlfativasByDescripcion(@PathVariable String descripcion) {
        try {
            List<NotaOlfativa> notas = notaOlfativaService.findByDescripcion(descripcion);
            if (notas == null) {
                notas = new ArrayList<>();
            }
            return ResponseEntity.ok(notas);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Error al buscar notas olfativas por descripción: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping
    public ResponseEntity<?> createNotaOlfativa(@RequestBody NotaOlfativa notaOlfativa) {
        try {
            NotaOlfativa savedNota = notaOlfativaService.save(notaOlfativa);
            return ResponseEntity.ok(savedNota);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Error al crear nota olfativa: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateNotaOlfativa(@PathVariable Long id, @RequestBody NotaOlfativa notaOlfativa) {
        try {
            NotaOlfativa updatedNota = notaOlfativaService.update(id, notaOlfativa);
            return updatedNota != null ? ResponseEntity.ok(updatedNota) : ResponseEntity.notFound().build();
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Error al actualizar nota olfativa: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotaOlfativa(@PathVariable Long id) {
        try {
            notaOlfativaService.deleteById(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Nota olfativa eliminada correctamente");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Error al eliminar nota olfativa: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
} 