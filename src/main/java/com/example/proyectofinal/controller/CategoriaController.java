package com.example.proyectofinal.controller;

import com.example.proyectofinal.model.Categoria;
import com.example.proyectofinal.service.CategoriaService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categorias")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175", 
                        "http://localhost:5176", "http://localhost:5177", "http://localhost:5178", 
                        "http://localhost:5179", "http://localhost:5180"}, 
             allowCredentials = "true")
public class CategoriaController {

    @Autowired
    private CategoriaService categoriaService;
    
    @Autowired
    private ObjectMapper objectMapper;

    @GetMapping
    public ResponseEntity<?> getAllCategorias() {
        try {
            List<Categoria> categorias = categoriaService.findAll();
            
            if (categorias == null) {
                categorias = new ArrayList<>();
            }
            
            // Simplificar la respuesta para evitar recursión
            List<Map<String, Object>> simplifiedCategorias = categorias.stream()
                .map(cat -> {
                    Map<String, Object> simplifiedCat = new HashMap<>();
                    simplifiedCat.put("id", cat.getId());
                    simplifiedCat.put("nombre", cat.getNombre());
                    return simplifiedCat;
                })
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(simplifiedCategorias);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Error al obtener categorías: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCategoriaById(@PathVariable Long id) {
        try {
            Optional<Categoria> optCategoria = categoriaService.findById(id);
            
            if (optCategoria.isPresent()) {
                Categoria categoria = optCategoria.get();
                
                // Simplificar la respuesta para evitar recursión
                Map<String, Object> simplifiedCat = new HashMap<>();
                simplifiedCat.put("id", categoria.getId());
                simplifiedCat.put("nombre", categoria.getNombre());
                
                return ResponseEntity.ok(simplifiedCat);
            } else {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Categoría no encontrada con ID: " + id);
                return ResponseEntity.status(404).body(response);
            }
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Error al buscar categoría: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping
    public ResponseEntity<?> createCategoria(@RequestBody Categoria categoria) {
        try {
            Categoria nuevaCategoria = categoriaService.save(categoria);
            
            // Simplificar la respuesta
            Map<String, Object> simplifiedCat = new HashMap<>();
            simplifiedCat.put("id", nuevaCategoria.getId());
            simplifiedCat.put("nombre", nuevaCategoria.getNombre());
            
            return ResponseEntity.ok(simplifiedCat);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Error al crear categoría: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategoria(@PathVariable Long id, @RequestBody Categoria categoria) {
        try {
            System.out.println("Actualizando categoría con ID: " + id);
            Categoria updatedCategoria = categoriaService.update(id, categoria);
            
            if (updatedCategoria != null) {
                System.out.println("Categoría actualizada: " + updatedCategoria.getNombre());
                
                // Simplificar la respuesta
                Map<String, Object> simplifiedCat = new HashMap<>();
                simplifiedCat.put("id", updatedCategoria.getId());
                simplifiedCat.put("nombre", updatedCategoria.getNombre());
                
                return ResponseEntity.ok(simplifiedCat);
            } else {
                System.out.println("Categoría con ID " + id + " no encontrada para actualizar");
                Map<String, String> response = new HashMap<>();
                response.put("message", "Categoría no encontrada con ID: " + id);
                return ResponseEntity.status(404).body(response);
            }
        } catch (Exception e) {
            System.err.println("Error al actualizar categoría: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Error al actualizar categoría: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategoria(@PathVariable Long id) {
        try {
            categoriaService.deleteById(id);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Categoría eliminada correctamente");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Error al eliminar categoría: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
} 