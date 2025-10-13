package com.wokAsianF.demo.seguridad.jwt;

import com.wokAsianF.demo.service.JwtService; 
import com.wokAsianF.demo.service.UserDetailsServiceImpl; 
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    private final UserDetailsServiceImpl userDetailsService;
    private final JwtService jwtService;

    public JwtRequestFilter(UserDetailsServiceImpl userDetailsService, JwtService jwtService) {
        this.userDetailsService = userDetailsService;
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        final String authorizationHeader = request.getHeader("Authorization");

        System.out.println("===============================================");
        System.out.println("🔍 REQUEST: " + request.getMethod() + " " + request.getRequestURI());
        System.out.println("🔑 Authorization Header: " + (authorizationHeader != null ? "Presente" : "Ausente"));

        String username = null;
        String jwt = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            System.out.println("✅ Token extraído (primeros 30 chars): " + jwt.substring(0, Math.min(30, jwt.length())) + "...");
            
            try {
                username = jwtService.extractUsername(jwt);
                System.out.println("👤 Usuario del token: " + username);
            } catch (Exception e) {
                System.err.println("❌ Error al extraer username del token: " + e.getMessage());
            }
        } else {
            System.out.println("⚠️ NO se encontró Authorization header o no empieza con 'Bearer '");
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
            System.out.println("👤 Usuario cargado desde BD: " + userDetails.getUsername());

            if (jwtService.validateToken(jwt, userDetails)) {
                System.out.println("✅ Token VÁLIDO");
                
                // ✅ Usar el método helper simplificado
                String rol = jwtService.extractRol(jwt);
                System.out.println("🎭 Rol extraído del token: " + rol);
                
                // Agregar el prefijo ROLE_ si no lo tiene
                if (rol != null && !rol.startsWith("ROLE_")) {
                    rol = "ROLE_" + rol;
                }
                
                List<GrantedAuthority> authorities = new ArrayList<>();
                authorities.add(new SimpleGrantedAuthority(rol));
                
                System.out.println("🎭 Authorities creadas: " + authorities);
                
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, authorities);
                
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                
                SecurityContextHolder.getContext().setAuthentication(authToken);
                
                System.out.println("✅ Autenticación establecida en SecurityContext");
                System.out.println("✅ Usuario autenticado: " + SecurityContextHolder.getContext().getAuthentication().getName());
                System.out.println("✅ Authorities: " + SecurityContextHolder.getContext().getAuthentication().getAuthorities());
            } else {
                System.out.println("❌ Token INVÁLIDO");
            }
        } else if (username != null) {
            System.out.println("ℹ️ Usuario ya autenticado en SecurityContext");
        }
        
        System.out.println("===============================================");
        
        filterChain.doFilter(request, response);
    }
}