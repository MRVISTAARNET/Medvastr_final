package com.medvastr.backend.config;

import com.medvastr.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {
    private final UserRepository userRepo;

    @Override
    public UserDetails loadUserByUsername(String emailOrPhone) throws UsernameNotFoundException {
        com.medvastr.backend.model.User u;
        if (emailOrPhone.contains("@")) {
            u = userRepo.findByEmail(emailOrPhone)
                    .orElseThrow(() -> new UsernameNotFoundException("Not found: " + emailOrPhone));
        } else {
            String cleanPhone = emailOrPhone.replaceAll("[^0-9]", "");
            String suffix = cleanPhone.length() > 10 
                    ? cleanPhone.substring(cleanPhone.length() - 10) 
                    : cleanPhone;
            u = userRepo.findByPhoneSuffix(suffix)
                    .orElseThrow(() -> new UsernameNotFoundException("Not found: " + emailOrPhone));
        }
        
        String username = u.getEmail() != null && !u.getEmail().isBlank() ? u.getEmail() : u.getPhone();
        return new org.springframework.security.core.userdetails.User(
            username,
            u.getPassword(),
            List.of(new SimpleGrantedAuthority("ROLE_" + u.getRole().name()))
        );
    }
}

