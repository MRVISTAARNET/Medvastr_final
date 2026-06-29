package com.medvastr.backend.service;

import com.medvastr.backend.dto.AddressDTO;
import com.medvastr.backend.dto.AddressRequest;
import com.medvastr.backend.dto.ChangePasswordRequest;
import com.medvastr.backend.dto.ProductDTO;
import com.medvastr.backend.dto.UpdateProfileRequest;
import com.medvastr.backend.dto.UserDTO;
import com.medvastr.backend.dto.WishlistResponseDTO;
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
    private final ProductService productService;
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

    public boolean verifyPassword(String email, String rawPassword) {
        if (rawPassword == null || rawPassword.isEmpty()) return false;
        User u = getByEmail(email);
        return encoder.matches(rawPassword, u.getPassword());
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
        return me().getAddresses().stream().map(this::toAddressDTO).collect(Collectors.toList());
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
        if (r.isDefault()) {
            u.getAddresses().forEach(addr -> addr.setDefault(false));
        }
        u.getAddresses().add(a);
        userRepo.save(u);
        return toAddressDTO(a);
    }

    public AddressDTO updateAddress(Long id, AddressRequest r) {
        User u = me();
        Address a = u.getAddresses().stream()
                .filter(addr -> addr.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Address not found"));
        a.setFullName(r.getFullName());
        a.setPhone(r.getPhone());
        a.setAddressLine1(r.getAddressLine1());
        a.setAddressLine2(r.getAddressLine2());
        a.setCity(r.getCity());
        a.setState(r.getState());
        a.setPincode(r.getPincode());
        if (r.getType() != null)
            a.setType(Address.AddressType.valueOf(r.getType()));
        if (r.isDefault()) {
            u.getAddresses().forEach(addr -> addr.setDefault(addr.getId().equals(id)));
        }
        userRepo.save(u);
        return toAddressDTO(a);
    }

    public void deleteAddress(Long id) {
        User u = me();
        Address a = u.getAddresses().stream()
                .filter(addr -> addr.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Address not found"));
        u.getAddresses().remove(a);
        userRepo.save(u);
    }

    private AddressDTO toAddressDTO(Address a) {
        return AddressDTO.builder()
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
                .build();
    }

    public void toggleWishlist(Long pid, String variantId) {
        User u = me();
        String vId = (variantId == null || variantId.isEmpty()) ? "default" : variantId;
        wishRepo.findByUserIdAndProductIdAndVariantId(u.getId(), pid, vId).ifPresentOrElse(
                wishRepo::delete,
                () -> productRepo.findById(pid)
                        .ifPresent(
                                p -> wishRepo.save(WishlistItem.builder().user(u).product(p).variantId(vId).build())));
    }

    public List<WishlistResponseDTO> getWishlist() {
        return wishRepo.findByUserId(me().getId()).stream()
                .map(w -> WishlistResponseDTO.builder()
                        .productId(w.getProduct().getId())
                        .variantId(w.getVariantId())
                        .product(productService.toDTO(w.getProduct()))
                        .build())
                .collect(Collectors.toList());
    }

    public Page<UserDTO> getAll(Pageable p) {
        return userRepo.findByActiveTrueOrderByCreatedAtDesc(p).map(authService::toDTO);
    }
}
