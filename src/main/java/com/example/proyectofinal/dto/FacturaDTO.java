package com.example.proyectofinal.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para la representación simplificada de una Factura
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FacturaDTO {
    
    private Long id;
    private Long usuarioId;
    private String usuarioNombre;
    private String usuarioCorreo;
    private LocalDateTime fechaEmision;
    private String metodoPago;
    private String direccionEnvio;
    private Double total;
    private List<DetalleFacturaDTO> detalles = new ArrayList<>();
    
    /**
     * DTO para la representación simplificada de un DetalleFactura
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DetalleFacturaDTO {
        private Long id;
        private String nombreProducto;
        private Integer cantidad;
        private Double precioUnitario;
        private Double subtotal;
        private Long perfumeId;
        private Long perfumePersonalizadoId;
    }
} 