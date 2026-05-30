package com.medvastr.backend.service;

import com.medvastr.backend.dto.AddressDTO;
import com.medvastr.backend.dto.AddressRequest;
import com.medvastr.backend.dto.ChangePasswordRequest;
import com.medvastr.backend.dto.ProductDTO;
import com.medvastr.backend.dto.UpdateProfileRequest;
import com.medvastr.backend.dto.UserDTO;
import com.medvastr.backend.model.Address;
import com.medvastr.backend.model.User;
import com.medvastr.backend.model.WishlistItem;
import com.medvastr.backend.repository.ProductRepository;
import com.medvastr.backend.repository.UserRepository;
import com.medvastr.backend.repository.WishlistItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {
    private final UserRepository userRepo;
    private final PasswordEncoder encoder;
    private final WishlistItemRepository wishRepo;
    private final ProductRepository productRepo;
    private final AuthService authService;

    private User me() {
        return userRepo.findByEmail(SecurityContextHolder.getContext().getAuthentication().getName()).orElseThrow();
    }

    public UserDTO getProfile() {
        return authService.toDTO(me());
    }

    public User getByEmail(String email) {
        return userRepo.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    }

    public UserDTO updateProfile(UpdateProfileRequest r) {
        User u = me();
        u.setFirstName(r.getFirstName());
        u.setLastName(r.getLastName());
        u.setPhone(r.getPhone());
        return authService.toDTO(userRepo.save(u));
    }

    public void changePassword(ChangePasswordRequest r) {
        User u = me();
        if (!encoder.matches(r.getCurrentPassword(), u.getPassword()))
            throw new RuntimeException("Current password incorrect");
        u.setPassword(encoder.encode(r.getNewPassword()));
        userRepo.save(u);
    }

    public List<AddressDTO> getAddresses() {
        return me().getAddresses().stream()
                .map(a -> AddressDTO.builder()
                        .id(a.getId())
                        .fullName(a.getFullName())
                        .phone(a.getPhone())
                        .addressLine1(a.getAddressLine1())
                        .addressLine2(a.getAddressLine2())
                        .city(a.getCity())
                        .state(a.getState())
                        .pincode(a.getPincode())
                        .country(a.getCountry())
                        .type(a.getType().name())
                        .isDefault(a.isDefault())
                        .build())
                .collect(Collectors.toList());
    }

    public AddressDTO addAddress(AddressRequest r) {
        User u = me();
        Address a = Address.builder()
                .user(u)
                .fullName(r.getFullName())
                .phone(r.getPhone())
                .addressLine1(r.getAddressLine1())
                .addressLine2(r.getAddressLine2())
                .city(r.getCity())
                .state(r.getState())
                .pincode(r.getPincode())
                .type(Address.AddressType.valueOf(r.getType() != null ? r.getType() : "HOME"))
                .isDefault(r.isDefault())
                .build();
        u.getAddresses().add(a);
        userRepo.save(u);
        return AddressDTO.builder().fullName(a.getFullName()).city(a.getCity()).build();
    }

    public void toggleWishlist(Long pid) {
        User u = me();
        wishRepo.findByUserIdAndProductId(u.getId(), pid).ifPresentOrElse(
                wishRepo::delete,
                () -> productRepo.findById(pid)
                        .ifPresent(p -> wishRepo.save(WishlistItem.builder().user(u).product(p).build())));
    }

    public List<ProductDTO> getWishlist() {
        ProductService ps = new ProductService(productRepo, null, null);
        return wishRepo.findByUserId(me().getId()).stream().map(w -> ps.toDTO(w.getProduct()))
                .collect(Collectors.toList());
    }

    public Page<UserDTO> getAll(Pageable p) {
        return userRepo.findByActiveTrueOrderByCreatedAtDesc(p).map(authService::toDTO);
    }
}
