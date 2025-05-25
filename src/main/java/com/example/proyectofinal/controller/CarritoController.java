package com.example.proyectofinal.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.proyectofinal.model.Carrito;
import com.example.proyectofinal.model.DetalleCarrito;
import com.example.proyectofinal.model.Factura;
import com.example.proyectofinal.model.Usuario;
import com.example.proyectofinal.service.CarritoService;
import com.fasterxml.jackson.annotation.JsonView;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/carrito")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175", 
                       "http://localhost:5176", "http://localhost:5177", "http://localhost:5178", 
                       "http://localhost:5179", "http://localhost:5180"}, 
             allowCredentials = "true")
public class CarritoController {

    @Autowired
    private CarritoService carritoService;
    
    @GetMapping
    public ResponseEntity<?> getCarrito(@RequestParam Long usuarioId) {
        try {
            System.out.println("Obteniendo carrito para usuario ID: " + usuarioId);
            Carrito carrito = carritoService.getCarritoActivo(usuarioId);
            
            // Crear un mapa con los datos necesarios para evitar ciclos de referencia
            Map<String, Object> carritoResponse = new HashMap<>();
            carritoResponse.put("id", carrito.getId());
            
            // Crear un objeto simplificado de usuario para evitar ciclos
            Map<String, Object> usuarioSimple = new HashMap<>();
            Usuario usuario = carrito.getUsuario();
            usuarioSimple.put("id", usuario.getId());
            usuarioSimple.put("nombre", usuario.getNombre());
            usuarioSimple.put("correo", usuario.getCorreo());
            usuarioSimple.put("rol", usuario.getRol());
            carritoResponse.put("usuario", usuarioSimple);
            
            carritoResponse.put("fechaCreacion", carrito.getFechaCreacion());
            carritoResponse.put("estado", carrito.getEstado());
            
            // Añadir detalles sin ciclos de referencia
            if (carrito.getDetalles() != null) {
                carritoResponse.put("detalles", carrito.getDetalles());
            } else {
                carritoResponse.put("detalles", new ArrayList<>());
            }
            
            return ResponseEntity.ok(carritoResponse);
        } catch (Exception e) {
            System.err.println("Error al obtener carrito: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Error al obtener el carrito: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    @PostMapping("/items")
    public ResponseEntity<?> agregarItem(@RequestBody Map<String, Object> requestData) {
        try {
            Long usuarioId = Long.valueOf(requestData.get("usuarioId").toString());
            Long perfumeId = Long.valueOf(requestData.get("perfumeId").toString());
            Integer cantidad = Integer.valueOf(requestData.get("cantidad").toString());
            
            DetalleCarrito detalle = carritoService.agregarItem(usuarioId, perfumeId, cantidad);
            return ResponseEntity.ok(detalle);
        } catch (Exception e) {
            System.err.println("Error al agregar item al carrito: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Error al agregar item al carrito: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    @DeleteMapping("/items/{detalleId}")
    public ResponseEntity<?> eliminarItem(@PathVariable Long detalleId, @RequestParam Long usuarioId) {
        try {
            carritoService.eliminarItem(usuarioId, detalleId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            System.err.println("Error al eliminar item del carrito: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Error al eliminar item del carrito: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(@RequestBody Map<String, Object> requestData) {
        try {
            Long usuarioId = Long.valueOf(requestData.get("usuarioId").toString());
            String direccionEnvio = requestData.get("direccionEnvio").toString();
            String metodoPago = requestData.get("metodoPago").toString();
            
            System.out.println("Procesando checkout con datos: " + requestData);
            
            Factura factura = carritoService.checkout(usuarioId, direccionEnvio, metodoPago);
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", factura.getId());
            response.put("fechaEmision", factura.getFechaEmision());
            response.put("total", factura.getTotal());
            response.put("mensaje", "Compra procesada correctamente");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error al procesar checkout: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Error al procesar la compra: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    @PutMapping("/items/{detalleId}")
    public ResponseEntity<?> actualizarCantidadItem(@PathVariable Long detalleId, @RequestBody Map<String, Object> requestData) {
        try {
            System.out.println("Actualizando cantidad del ítem con ID: " + detalleId);
            System.out.println("Datos recibidos: " + requestData);
            
            // Validar datos
            if (!requestData.containsKey("cantidad")) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Falta el campo 'cantidad'");
                return ResponseEntity.badRequest().body(response);
            }
            
            Integer cantidad = Integer.valueOf(requestData.get("cantidad").toString());
            
            // Obtener el detalle del carrito
            DetalleCarrito detalle = carritoService.actualizarCantidadItem(detalleId, cantidad);
            
            return ResponseEntity.ok(detalle);
        } catch (Exception e) {
            System.err.println("Error al actualizar cantidad del ítem: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Error al actualizar cantidad del ítem: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
} 