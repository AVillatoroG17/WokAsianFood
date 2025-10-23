package com.wokAsianF.demo.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String SECRET; 

    private final long JWT_EXPIRATION_MS = 1000 * 60 * 60 * 24; // 24 horas

    /**
     * Genera un token JWT con la información del usuario
     */
public String generateToken(Integer userId, String username, String nombreCompleto, String rol) {
    Map<String, Object> claims = new HashMap<>();
    claims.put("userId", userId);
    claims.put("nombreCompleto", nombreCompleto);
    // ✅ AGREGAR EL PREFIJO ROLE_ AL GUARDAR EN EL TOKEN
    claims.put("rol", rol.startsWith("ROLE_") ? rol : "ROLE_" + rol);

    return Jwts.builder()
            .setClaims(claims) 
            .setSubject(username) 
            .setIssuedAt(new Date(System.currentTimeMillis())) 
            .setExpiration(new Date(System.currentTimeMillis() + JWT_EXPIRATION_MS)) 
            .signWith(getSignKey(), SignatureAlgorithm.HS256) 
            .compact();
}

    private Key getSignKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Extrae el username del token
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Valida que el token sea válido para el usuario dado
     */
    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }
    
    /**
     * ✅ PÚBLICO - Extrae un claim específico del token
     * Usado por JwtRequestFilter para extraer el rol
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }
    
    /**
     * Extrae todos los claims del token
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                   .setSigningKey(getSignKey())
                   .build()
                   .parseClaimsJws(token)
                   .getBody();
    }
    
    /**
     * Extrae la fecha de expiración del token
     */
    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Verifica si el token ha expirado
     */
    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }
    
    /**
     * ✅ NUEVO - Extrae el rol del usuario desde el token
     */
    public String extractRol(String token) {
        return extractClaim(token, claims -> claims.get("rol", String.class));
    }
    
    /**
     * ✅ NUEVO - Extrae el userId desde el token
     */
    public Integer extractUserId(String token) {
        return extractClaim(token, claims -> claims.get("userId", Integer.class));
    }
    
    /**
     * ✅ NUEVO - Extrae el nombre completo desde el token
     */
    public String extractNombreCompleto(String token) {
        return extractClaim(token, claims -> claims.get("nombreCompleto", String.class));
    }
}