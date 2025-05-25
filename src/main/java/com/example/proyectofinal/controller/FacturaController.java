package com.example.proyectofinal.controller;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.proyectofinal.dto.FacturaDTO;
import com.example.proyectofinal.dto.FacturaDTO.DetalleFacturaDTO;
import com.example.proyectofinal.model.Carrito;
import com.example.proyectofinal.model.DetalleCarrito;
import com.example.proyectofinal.model.DetalleFactura;
import com.example.proyectofinal.model.Factura;
import com.example.proyectofinal.model.Perfume;
import com.example.proyectofinal.model.PerfumePersonalizado;
import com.example.proyectofinal.model.Usuario;
import com.example.proyectofinal.repository.CarritoRepository;
import com.example.proyectofinal.repository.PerfumePersonalizadoRepository;
import com.example.proyectofinal.repository.PerfumeRepository;
import com.example.proyectofinal.repository.UsuarioRepository;
import com.example.proyectofinal.service.FacturaService;

@RestController
@RequestMapping("/api/facturas")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175", 
                       "http://localhost:5176", "http://localhost:5177", "http://localhost:5178", 
                       "http://localhost:5179", "http://localhost:5180"}, 
            allowCredentials = "true")
public class FacturaController {

    @Autowired
    private FacturaService facturaService;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private CarritoRepository carritoRepository;
    
    @Autowired
    private PerfumeRepository perfumeRepository;
    
    @Autowired
    private PerfumePersonalizadoRepository perfumePersonalizadoRepository;
    
    // En una aplicación real, se obtendría el ID del usuario de la sesión
    private static final Long DEFAULT_USER_ID = 1L;
    
    @GetMapping
    public ResponseEntity<?> getAllFacturas() {
        try {
            List<Factura> facturas = facturaService.findAll();
            List<FacturaDTO> facturasDTO = facturas.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(facturasDTO);
        } catch (Exception e) {
            System.err.println("Error al obtener facturas: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error al obtener facturas: " + e.getMessage());
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getFacturaById(@PathVariable Long id) {
        try {
            return facturaService.findById(id)
                    .map(factura -> ResponseEntity.ok(convertToDTO(factura)))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            System.err.println("Error al obtener factura por ID: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error al obtener factura: " + e.getMessage());
        }
    }
    
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<?> getFacturasByUsuario(@PathVariable Long usuarioId) {
        try {
            List<Factura> facturas = facturaService.findByUsuarioId(usuarioId);
            List<FacturaDTO> facturasDTO = facturas.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(facturasDTO);
        } catch (Exception e) {
            System.err.println("Error al obtener facturas por usuario: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error al obtener facturas: " + e.getMessage());
        }
    }
    
    @PostMapping
    public ResponseEntity<?> createFactura(@RequestBody Factura factura) {
        try {
            Factura savedFactura = facturaService.save(factura);
            return ResponseEntity.ok(convertToDTO(savedFactura));
        } catch (Exception e) {
            System.err.println("Error al crear factura: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error al crear factura: " + e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFactura(@PathVariable Long id) {
        try {
            facturaService.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            System.err.println("Error al eliminar factura: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
    
    @GetMapping("/mis-facturas")
    public ResponseEntity<?> getMisFacturas() {
        try {
            Usuario usuario = usuarioRepository.findById(DEFAULT_USER_ID).orElse(null);
            if (usuario == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuario no encontrado");
            }
            
            List<Factura> facturas = facturaService.findByUsuario(usuario);
            List<FacturaDTO> facturasDTO = facturas.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(facturasDTO);
        } catch (Exception e) {
            System.err.println("Error al obtener facturas del usuario: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error al obtener facturas: " + e.getMessage());
        }
    }
    
    @PostMapping("/procesar-compra")
    public ResponseEntity<?> procesarCompra(@RequestBody Map<String, Object> data) {
        try {
            if (!data.containsKey("metodoPago") || !data.containsKey("direccionEnvio")) {
                return ResponseEntity.badRequest().body("Faltan datos requeridos");
            }
            
            String metodoPago = data.get("metodoPago").toString();
            String direccionEnvio = data.get("direccionEnvio").toString();
            
            // Obtener el usuario
            Usuario usuario = usuarioRepository.findById(DEFAULT_USER_ID).orElse(null);
            if (usuario == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuario no encontrado");
            }
            
            // Obtener el carrito del usuario
            Optional<Carrito> optionalCarrito = carritoRepository.findByUsuarioAndEstado(usuario, "ACTIVO");
            if (!optionalCarrito.isPresent() || optionalCarrito.get().getDetalles().isEmpty()) {
                return ResponseEntity.badRequest().body("El carrito está vacío");
            }
            
            Carrito carrito = optionalCarrito.get();
            
            // Crear la factura
            Factura factura = new Factura();
            factura.setUsuario(usuario);
            factura.setFechaEmision(LocalDateTime.now());
            factura.setMetodoPago(metodoPago);
            factura.setDireccionEnvio(direccionEnvio);
            factura.setTotal(0.0); // Se calculará a continuación
            
            List<DetalleFactura> detallesFactura = new ArrayList<>();
            double total = 0.0;
            
            // Convertir detalles del carrito a detalles de factura
            for (DetalleCarrito detalleCarrito : carrito.getDetalles()) {
                DetalleFactura detalleFactura = new DetalleFactura();
                detalleFactura.setFactura(factura);
                detalleFactura.setCantidad(detalleCarrito.getCantidad());
                detalleFactura.setPrecioUnitario(detalleCarrito.getPrecioUnitario());
                detalleFactura.setSubtotal(detalleCarrito.getSubtotal());
                
                // Asignar perfume o perfume personalizado según corresponda
                if (detalleCarrito.getPerfume() != null) {
                    Perfume perfume = detalleCarrito.getPerfume();
                    detalleFactura.setPerfume(perfume);
                    detalleFactura.setNombreProducto(perfume.getNombre());
                } else if (detalleCarrito.getPerfumePersonalizado() != null) {
                    PerfumePersonalizado perfumePersonalizado = detalleCarrito.getPerfumePersonalizado();
                    detalleFactura.setPerfumePersonalizado(perfumePersonalizado);
                    detalleFactura.setNombreProducto(perfumePersonalizado.getNombre() + " (Personalizado)");
                }
                
                detallesFactura.add(detalleFactura);
                total += detalleFactura.getSubtotal();
            }
            
            factura.setDetalles(detallesFactura);
            factura.setTotal(total);
            
            // Guardar la factura
            Factura facturaGuardada = facturaService.save(factura);
            
            // Vaciar el carrito
            carrito.getDetalles().clear();
            carritoRepository.save(carrito);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(facturaGuardada));
        } catch (Exception e) {
            System.err.println("Error al procesar la compra: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al procesar la compra: " + e.getMessage());
        }
    }
    
    /**
     * Convierte una entidad Factura a su representación DTO
     */
    private FacturaDTO convertToDTO(Factura factura) {
        FacturaDTO dto = new FacturaDTO();
        dto.setId(factura.getId());
        dto.setFechaEmision(factura.getFechaEmision());
        dto.setMetodoPago(factura.getMetodoPago());
        dto.setDireccionEnvio(factura.getDireccionEnvio());
        dto.setTotal(factura.getTotal());
        
        // Datos del usuario
        if (factura.getUsuario() != null) {
            dto.setUsuarioId(factura.getUsuario().getId());
            dto.setUsuarioNombre(factura.getUsuario().getNombre());
            dto.setUsuarioCorreo(factura.getUsuario().getCorreo());
        }
        
        // Detalles
        if (factura.getDetalles() != null) {
            List<DetalleFacturaDTO> detallesDTO = factura.getDetalles().stream()
                .map(detalle -> {
                    DetalleFacturaDTO detalleDTO = new DetalleFacturaDTO();
                    detalleDTO.setId(detalle.getId());
                    detalleDTO.setNombreProducto(detalle.getNombreProducto());
                    detalleDTO.setCantidad(detalle.getCantidad());
                    detalleDTO.setPrecioUnitario(detalle.getPrecioUnitario());
                    detalleDTO.setSubtotal(detalle.getSubtotal());
                    
                    if (detalle.getPerfume() != null) {
                        detalleDTO.setPerfumeId(detalle.getPerfume().getId());
                    }
                    
                    if (detalle.getPerfumePersonalizado() != null) {
                        detalleDTO.setPerfumePersonalizadoId(detalle.getPerfumePersonalizado().getId());
                    }
                    
                    return detalleDTO;
                })
                .collect(Collectors.toList());
            
            dto.setDetalles(detallesDTO);
        }
        
        return dto;
    }
} 